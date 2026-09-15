import pg from 'pg';

const { Pool } = pg;

export interface DbConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  ssl?: boolean;
}

export interface ConnectionDiagnostic {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error';
  source: string;
  user: string;
  host: string;
  database: string;
  port: number;
  ssl: boolean;
  lastChecked: string;
  errorType?: 
    | 'MISSING_CREDENTIALS'
    | 'HOST_UNREACHABLE'
    | 'PORT_INCORRECT'
    | 'USER_INCORRECT'
    | 'PASSWORD_INCORRECT'
    | 'SSL_INCOMPATIBLE'
    | 'INSUFFICIENT_PERMISSIONS'
    | 'TABLE_NOT_FOUND'
    | 'COLUMN_NOT_FOUND'
    | 'QUERY_ERROR'
    | null;
  errorMessage?: string;
  tablesVerified: {
    users: boolean;
    motos: boolean;
    apartados: boolean;
    offers: boolean;
    operation_tracking: boolean;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __pulsePgPool: pg.Pool | undefined;
}

function safeDecode(val: string): string {
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

/**
 * Extracts and validates connection string exclusively from DATABASE_URL or POSTGRES_URL.
 * Rejects invalid non-URI strings.
 */
function getValidConnectionString(): string | null {
  const candidates = [process.env.DATABASE_URL, process.env.POSTGRES_URL];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if ((trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) && trimmed.includes('@')) {
        return trimmed;
      }
    }
  }

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) {
        return trimmed;
      }
    }
  }

  return null;
}

export function getDbConfig(): DbConfig {
  const connectionString = getValidConnectionString();

  if (!connectionString) {
    return {
      user: 'pulse_readonly',
      host: 'No configurado',
      port: 5432,
      database: 'postgres',
      ssl: false,
    };
  }

  let host = 'PostgreSQL Host';
  let port = 5432;
  let database = 'postgres';
  let user = 'pulse_readonly';

  try {
    const parsed = new URL(connectionString);
    host = parsed.hostname || host;
    port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : 'postgres';
    if (parsed.username) {
      user = safeDecode(parsed.username);
    }
  } catch {
    // If URL parsing fails, retain defaults
  }

  const isSslDisabled = connectionString.toLowerCase().includes('sslmode=disable');

  return {
    connectionString,
    host,
    port,
    database,
    user,
    ssl: !isSslDisabled,
  };
}

/**
 * Custom PostgreSQL client that ensures Supabase Pooler SSL negotiation
 * is accepted with rejectUnauthorized: false even when connectionString has sslmode=require.
 */
class SupabaseClient extends pg.Client {
  constructor(config?: any) {
    super(config);
    if ((this as any).ssl !== false && (this as any).connectionParameters?.ssl !== false) {
      if (this.connection) {
        (this.connection as any).ssl = { rejectUnauthorized: false };
      }
      (this as any).ssl = { rejectUnauthorized: false };
    }
  }
}

/**
 * Serverless-adapted PostgreSQL Pool for Vercel.
 * Preserves a single pool instance across warm invocations via globalThis.
 * Direct connection using connectionString with serverless limits (max: 1).
 */
export function getPool(): pg.Pool | null {
  const config = getDbConfig();

  if (!config.connectionString) {
    return null;
  }

  if (globalThis.__pulsePgPool) {
    return globalThis.__pulsePgPool;
  }

  const poolInstance = new Pool({
    connectionString: config.connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1, // Serverless-optimized: 1 connection per instance
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    Client: SupabaseClient,
  });

  poolInstance.on('error', (err) => {
    console.error('[PULSE DB] Unexpected idle client error:', err);
    try {
      poolInstance.end().catch(() => {});
    } catch {}
    globalThis.__pulsePgPool = undefined;
  });

  globalThis.__pulsePgPool = poolInstance;
  return poolInstance;
}

export function classifyPgError(err: any): { type: ConnectionDiagnostic['errorType']; message: string } {
  const code = err?.code || '';
  const msg = err?.message || String(err);

  if (code === 'ENOTFOUND' || msg.includes('getaddrinfo ENOTFOUND')) {
    return {
      type: 'HOST_UNREACHABLE',
      message: 'Host inaccesible: no se pudo resolver el host de la base de datos.',
    };
  }

  if (code === 'ECONNREFUSED' || msg.includes('ECONNREFUSED')) {
    return {
      type: 'PORT_INCORRECT',
      message: 'Puerto o host incorrecto: conexión rechazada en el servidor PostgreSQL.',
    };
  }

  if (code === 'ETIMEDOUT' || msg.includes('timeout') || msg.includes('ETIMEDOUT')) {
    return {
      type: 'HOST_UNREACHABLE',
      message: 'Tiempo de espera agotado al conectar al servidor PostgreSQL.',
    };
  }

  if (code === '28P01' || msg.includes('password authentication failed')) {
    return {
      type: 'PASSWORD_INCORRECT',
      message: 'Autenticación fallida: usuario o contraseña incorrectos para el usuario pulse_readonly.',
    };
  }

  if (code === '28000' || (msg.includes('role') && msg.includes('does not exist'))) {
    return {
      type: 'USER_INCORRECT',
      message: 'Usuario incorrecto: el rol de PostgreSQL especificado no existe.',
    };
  }

  if (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    msg.includes('SSL') ||
    msg.includes('ssl') ||
    msg.includes('certificate') ||
    code?.startsWith('ERR_SSL_')
  ) {
    return {
      type: 'SSL_INCOMPATIBLE',
      message: 'SSL incompatible: error en la negociación SSL con el servidor PostgreSQL.',
    };
  }

  if (code === '42501' || msg.includes('permission denied')) {
    return {
      type: 'INSUFFICIENT_PERMISSIONS',
      message: `Permisos insuficientes (INSUFFICIENT_PERMISSIONS): ${msg}`,
    };
  }

  if (code === '42P01' || (msg.includes('does not exist') && msg.includes('relation'))) {
    return {
      type: 'TABLE_NOT_FOUND',
      message: `Tabla inexistente: ${msg}`,
    };
  }

  if (code === '42703' || (msg.includes('column') && msg.includes('does not exist'))) {
    return {
      type: 'COLUMN_NOT_FOUND',
      message: `Columna inexistente: ${msg}`,
    };
  }

  return {
    type: 'QUERY_ERROR',
    message: msg,
  };
}

/**
 * Executes a strictly read-only query.
 * Verifies that query is purely SELECT and does not contain write operations.
 * Avoids introspecting metadata, schemas, or running transaction commands.
 */
export async function executeReadOnlyQuery<T = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const normalized = text.trim().toUpperCase();
  const prohibitedKeywords = [
    'INSERT ',
    'UPDATE ',
    'DELETE ',
    'DROP ',
    'ALTER ',
    'CREATE ',
    'TRUNCATE ',
    'GRANT ',
    'REVOKE ',
  ];

  for (const kw of prohibitedKeywords) {
    if (normalized.startsWith(kw) || normalized.includes(` ${kw}`)) {
      throw new Error(`Operación de escritura no autorizada detectada: ${kw}. Conexión de solo lectura.`);
    }
  }

  const clientPool = getPool();
  if (!clientPool) {
    throw new Error('No hay conexión configurada con la base de datos PostgreSQL (DATABASE_URL o POSTGRES_URL no configuradas).');
  }

  try {
    // Execute purely the SELECT statement directly without session or transaction mutations
    const res = await clientPool.query(text, params);
    return res.rows;
  } catch (err: any) {
    const msg = err?.message || '';
    if (
      msg.includes('Connection terminated') ||
      msg.includes('Client has encountered a connection error') ||
      err?.code === '57P01' ||
      err?.code === 'ECONNRESET'
    ) {
      try {
        clientPool.end().catch(() => {});
      } catch {}
      globalThis.__pulsePgPool = undefined;
    }
    throw err;
  }
}
