import express from 'express';
import { fetchDashboardMetrics } from './analytics.js';
import { getDbConfig, classifyPgError, executeReadOnlyQuery } from './db.js';

export function createExpressApp() {
  const app = express();

  app.use(express.json());

  // Permissive CORS for diagnostics and API consumers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health / Service check
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'PULSE Motoluv Analytics Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Connection diagnostics (Direct isolated SELECT on authorized tables)
  app.get(['/api/connection', '/connection'], async (req, res) => {
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

  // Main Dashboard Metrics endpoint (supports /api/dashboard-metrics, /dashboard-metrics, and common aliases)
  const dashboardRoutes = [
    '/api/dashboard-metrics',
    '/dashboard-metrics',
    '/api/dashboard_metrics',
    '/dashboard_metrics',
    '/api/metrics',
    '/metrics',
  ];

  const handleDashboardMetrics = async (req: express.Request, res: express.Response) => {
    try {
      const filters = {
        period: typeof req.query.period === 'string' ? req.query.period : typeof req.body?.period === 'string' ? req.body.period : undefined,
        brand: typeof req.query.brand === 'string' ? req.query.brand : typeof req.body?.brand === 'string' ? req.body.brand : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : typeof req.body?.status === 'string' ? req.body.status : undefined,
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
  };

  app.get(dashboardRoutes, handleDashboardMetrics);
  app.post(dashboardRoutes, handleDashboardMetrics);

  return app;
}
