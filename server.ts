import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchDashboardMetrics } from './server/analytics.js';
import { getDbConfig, classifyPgError, executeReadOnlyQuery } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // Health / Service check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PULSE Motoluv Analytics Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Connection diagnostics (Querying authorized tables directly, avoiding metadata/information_schema)
  app.get('/api/connection', async (req, res) => {
    const config = getDbConfig();
    const hasHost = Boolean(config.host || config.connectionString);
    const hasPassword = Boolean(config.password || config.connectionString);

    const tablesVerified = {
      users: false,
      motos: false,
      apartados: false,
      offers: false,
      operation_tracking: false,
    };

    if (!hasHost || !hasPassword) {
      return res.json({
        connected: false,
        status: 'disconnected',
        source: 'Supabase PostgreSQL',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'aws-0-us-east-1.pooler.supabase.com',
        port: config.port || 5432,
        ssl: Boolean(config.ssl),
        lastChecked: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
        errorType: 'MISSING_CREDENTIALS',
        errorMessage: 'Faltan credenciales de conexión en variables de entorno (PULSE_DB_HOST, PULSE_DB_PASSWORD).',
        tablesVerified,
      });
    }

    try {
      // Test isolated SELECT on each authorized table directly
      try {
        await executeReadOnlyQuery('SELECT 1 FROM public.users LIMIT 1;');
        tablesVerified.users = true;
      } catch {}

      try {
        await executeReadOnlyQuery('SELECT 1 FROM public.motos LIMIT 1;');
        tablesVerified.motos = true;
      } catch {}

      try {
        await executeReadOnlyQuery('SELECT 1 FROM public.apartados LIMIT 1;');
        tablesVerified.apartados = true;
      } catch {}

      try {
        await executeReadOnlyQuery('SELECT 1 FROM public.offers LIMIT 1;');
        tablesVerified.offers = true;
      } catch {}

      try {
        await executeReadOnlyQuery('SELECT 1 FROM public.operation_tracking LIMIT 1;');
        tablesVerified.operation_tracking = true;
      } catch {}

      const atLeastOne = Object.values(tablesVerified).some(Boolean);

      res.json({
        connected: atLeastOne,
        status: atLeastOne ? 'connected' : 'error',
        source: 'Supabase PostgreSQL',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'aws-0-us-east-1.pooler.supabase.com',
        port: config.port || 5432,
        ssl: Boolean(config.ssl),
        lastChecked: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
        errorType: atLeastOne ? null : 'INSUFFICIENT_PERMISSIONS',
        errorMessage: atLeastOne
          ? null
          : 'No se pudo leer ninguna de las tablas autorizadas con el usuario pulse_readonly.',
        tablesVerified,
      });
    } catch (err: any) {
      const errorInfo = classifyPgError(err);
      res.json({
        connected: false,
        status: 'error',
        source: 'Supabase PostgreSQL',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'aws-0-us-east-1.pooler.supabase.com',
        port: config.port || 5432,
        ssl: Boolean(config.ssl),
        lastChecked: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
        errorType: errorInfo.type,
        errorMessage: errorInfo.message,
        tablesVerified,
      });
    }
  });

  // Main Dashboard Metrics endpoint
  app.get('/api/dashboard-metrics', async (req, res) => {
    try {
      const filters = {
        period: typeof req.query.period === 'string' ? req.query.period : undefined,
        brand: typeof req.query.brand === 'string' ? req.query.brand : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
      };
      const metrics = await fetchDashboardMetrics(filters);
      res.json(metrics);
    } catch (err: any) {
      console.error('Error computing dashboard metrics:', err);
      const classified = classifyPgError(err);
      res.status(500).json({
        error: classified.message,
        errorType: classified.type,
      });
    }
  });

  // ----------------------------------------------------
  // Vite Middleware / Static Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PULSE] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[PULSE] Failed to start server:', err);
  process.exit(1);
});
