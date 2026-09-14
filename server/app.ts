import express from 'express';
import { fetchDashboardMetrics } from './analytics.js';
import { getDbConfig, classifyPgError, executeReadOnlyQuery } from './db.js';

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  // Health / Service check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PULSE Motoluv Analytics Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Connection diagnostics (Direct isolated SELECT on authorized tables)
  app.get('/api/connection', async (req, res) => {
    const config = getDbConfig();
    const hasConnectionString = Boolean(config.connectionString);

    const tablesVerified = {
      users: false,
      motos: false,
      apartados: false,
      offers: false,
      operation_tracking: false,
    };

    if (!hasConnectionString) {
      return res.json({
        connected: false,
        status: 'disconnected',
        source: 'PostgreSQL DB',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'No configurado',
        port: config.port || 5432,
        ssl: Boolean(config.ssl),
        lastChecked: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
        errorType: 'MISSING_CREDENTIALS',
        errorMessage: 'Faltan credenciales de conexión en variables de entorno (DATABASE_URL o POSTGRES_URL).',
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
        source: 'PostgreSQL DB',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'PostgreSQL Host',
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
        source: 'PostgreSQL DB',
        user: config.user || 'pulse_readonly',
        database: config.database || 'postgres',
        host: config.host || 'PostgreSQL Host',
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

  return app;
}
