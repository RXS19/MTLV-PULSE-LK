import { executeReadOnlyQuery, classifyPgError, getPool, getDbConfig } from './db.js';

export interface DashboardMetricsResult {
  connection: {
    connected: boolean;
    status: 'connected' | 'disconnected' | 'error';
    source: string;
    user: string;
    database: string;
    host: string;
    port: number;
    ssl: boolean;
    lastUpdated: string;
    errorType?: string | null;
    errorMessage?: string;
    tablesStatus: {
      users: { success: boolean; rowCount?: number; error?: string; details?: string };
      motos: { success: boolean; rowCount?: number; error?: string; details?: string };
      apartados: { success: boolean; rowCount?: number; error?: string; details?: string };
      offers: { success: boolean; rowCount?: number; error?: string; details?: string };
      operation_tracking: { success: boolean; rowCount?: number; error?: string; details?: string };
    };
    queryFailures: Array<{ metric: string; table: string; error: string }>;
  };
  inventoryBlock: {
    totalUniqueMotos: number;
    statusSlices: Array<{
      status: string;
      count: number;
      percentage: number;
      color: string;
    }>;
    motosPublicadas: {
      count: number;
      isAvailable: boolean;
      unavailableMessage?: string;
      queryDetails?: string;
    };
    motosConOferta: {
      count: number;
      isAvailable: boolean;
      unavailableMessage?: string;
      queryDetails?: string;
    };
    motosApartadas: {
      count: number;
      isAvailable: boolean;
      unavailableMessage?: string;
      queryDetails?: string;
    };
    motosVcDocumental?: {
      count: number;
      isAvailable: boolean;
      unavailableMessage?: string;
      queryDetails?: string;
    };
    appliedFilters?: {
      period?: string;
      brand?: string;
      status?: string;
    };
  };
  kpis: {
    users: {
      total: number;
      previousPeriodTotal: number;
      changePercent: number | null;
      trend: 'up' | 'down' | 'neutral' | 'na';
      isAvailable: boolean;
      unavailableMessage?: string;
    };
    inventory: {
      total: number;
      previousPeriodTotal: number;
      changePercent: number | null;
      trend: 'up' | 'down' | 'neutral' | 'na';
      isAvailable: boolean;
      unavailableMessage?: string;
    };
    apartados: {
      total: number;
      previousPeriodTotal: number;
      changePercent: number | null;
      trend: 'up' | 'down' | 'neutral' | 'na';
      isAvailable: boolean;
      unavailableMessage?: string;
    };
    offers: {
      total: number;
      previousPeriodTotal: number;
      changePercent: number | null;
      trend: 'up' | 'down' | 'neutral' | 'na';
      isAvailable: boolean;
      unavailableMessage?: string;
    };
    deliveries: {
      total: number;
      previousPeriodTotal: number;
      changePercent: number | null;
      trend: 'up' | 'down' | 'neutral' | 'na';
      isAvailable: boolean;
      unavailableMessage?: string;
    };
  };
  userGrowth: Array<{
    date: string;
    displayDate: string;
    newUsers: number;
    cumulativeUsers: number;
  }>;
  userGrowthError?: string;
  inventoryDistribution: {
    items: Array<{
      status: string;
      count: number;
      percentage: number;
      color: string;
    }>;
    totalActiveInventory: number;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  funnel: {
    stages: Array<{
      name: string;
      count: number;
      percentageOfUsers: number | null;
      isAvailable: boolean;
    }>;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  popularMotos: {
    items: Array<{
      id: string | number;
      make: string;
      model: string;
      year?: string | number;
      metricCount: number;
      metricLabel: string;
      imageUrl?: string | null;
    }>;
    criterion: string;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  activeOperations: {
    items: Array<{
      id: string | number;
      moto: string;
      currentStage: string;
      date: string;
      daysElapsed: number;
      deliveryStatus: string;
    }>;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  filterDimensions: {
    brands: string[];
    statuses: string[];
    channels: string[];
    hasBrandField: boolean;
    hasStatusField: boolean;
    hasChannelField: boolean;
  };
}

export function calculatePercentageChange(current: number, previous: number): {
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral' | 'na';
} {
  if (previous === 0) {
    if (current === 0) {
      return { changePercent: 0, trend: 'neutral' };
    }
    return { changePercent: 100, trend: 'up' };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;

  if (rounded > 0) return { changePercent: rounded, trend: 'up' };
  if (rounded < 0) return { changePercent: rounded, trend: 'down' };
  return { changePercent: 0, trend: 'neutral' };
}

export interface AnalyticsFilters {
  period?: string;
  brand?: string;
  status?: string;
}

export async function fetchDashboardMetrics(filters: AnalyticsFilters = {}): Promise<DashboardMetricsResult> {
  const config = getDbConfig();
  const pool = getPool();

  const now = new Date();
  const lastUpdated = now.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const baseResult: DashboardMetricsResult = {
    connection: {
      connected: false,
      status: 'disconnected',
      source: 'Supabase PostgreSQL',
      user: config.user || 'pulse_readonly',
      database: config.database || 'postgres',
      host: config.host || 'PostgreSQL Host',
      port: config.port || 5432,
      ssl: Boolean(config.ssl),
      lastUpdated,
      errorType: 'MISSING_CREDENTIALS',
      errorMessage: 'Credenciales de base de datos no configuradas en variables de entorno (DATABASE_URL o POSTGRES_URL).',
      tablesStatus: {
        users: { success: false, rowCount: 0 },
        motos: { success: false, rowCount: 0 },
        apartados: { success: false, rowCount: 0 },
        offers: { success: false, rowCount: 0 },
        operation_tracking: { success: false, rowCount: 0 },
      },
      queryFailures: [],
    },
    inventoryBlock: {
      totalUniqueMotos: 0,
      statusSlices: [],
      motosPublicadas: {
        count: 0,
        isAvailable: false,
        unavailableMessage: 'Pendiente de consulta en public.motos',
      },
      motosConOferta: {
        count: 0,
        isAvailable: false,
        unavailableMessage: 'Pendiente de consulta en public.offers',
      },
      motosApartadas: {
        count: 0,
        isAvailable: false,
        unavailableMessage: 'Pendiente de consulta en public.apartados',
      },
      motosVcDocumental: {
        count: 0,
        isAvailable: false,
        unavailableMessage: 'Pendiente de consulta en public.motos',
      },
      appliedFilters: {
        period: filters.period || 'all',
        brand: filters.brand || 'all',
        status: filters.status || 'all',
      },
    },
    kpis: {
      users: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
      inventory: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
      apartados: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
      offers: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
      deliveries: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
    },
    userGrowth: [],
    inventoryDistribution: { items: [], totalActiveInventory: 0, isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
    funnel: { stages: [], isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
    popularMotos: { items: [], criterion: '', isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
    activeOperations: { items: [], isAvailable: false, unavailableMessage: 'Pendiente de conexión con Supabase' },
    filterDimensions: { brands: [], statuses: [], channels: [], hasBrandField: false, hasStatusField: false, hasChannelField: false },
  };

  if (!pool) {
    return baseResult;
  }

  // At least one table query will determine connection state
  let atLeastOneQuerySucceeded = false;
  let connectionFatalError: any = null;

  // Helper to record query failure
  const recordQueryFailure = (metric: string, table: string, error: string) => {
    baseResult.connection.queryFailures.push({ metric, table, error });
  };

  // ----------------------------------------------------
  // 1. PUBLIC.USERS (Isolated Query)
  // Known columns: created_at
  // ----------------------------------------------------
  try {
    const totalUsersRes = await executeReadOnlyQuery<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM public.users;'
    );
    const totalUsers = parseInt(totalUsersRes[0]?.count || '0', 10);

    // Weekly comparison
    let currentPeriodUsers = totalUsers;
    let prevPeriodUsers = 0;
    try {
      const weeklyUsersRes = await executeReadOnlyQuery<{ current_week: string; prev_week: string }>(`
        SELECT 
          COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as current_week,
          COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City' - INTERVAL '1 week')
                      AND (created_at AT TIME ZONE 'America/Mexico_City') < date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as prev_week
        FROM public.users;
      `);
      currentPeriodUsers = parseInt(weeklyUsersRes[0]?.current_week || '0', 10);
      prevPeriodUsers = parseInt(weeklyUsersRes[0]?.prev_week || '0', 10);
    } catch (weeklyUsersErr: any) {
      console.error('[PULSE Analytics] Error en comparativa semanal de public.users:', weeklyUsersErr?.message || weeklyUsersErr);
      recordQueryFailure('usersWeeklyTrend', 'public.users', weeklyUsersErr?.message || String(weeklyUsersErr));
    }

    const usersChange = calculatePercentageChange(currentPeriodUsers, prevPeriodUsers);
    baseResult.kpis.users = {
      total: totalUsers,
      previousPeriodTotal: prevPeriodUsers,
      changePercent: usersChange.changePercent,
      trend: usersChange.trend,
      isAvailable: true,
    };

    // User growth series starting from 13 de septiembre de 2026
    try {
      const baseBeforeSep13Res = await executeReadOnlyQuery<{ count: string }>(`
        SELECT COUNT(*)::text as count
        FROM public.users
        WHERE (created_at AT TIME ZONE 'America/Mexico_City') < '2026-09-13 00:00:00'::timestamp;
      `);
      let runningCumulative = parseInt(baseBeforeSep13Res[0]?.count || '0', 10);

      const dailyGrowthRes = await executeReadOnlyQuery<{ day_str: string; new_users: string }>(`
        SELECT 
          TO_CHAR((created_at AT TIME ZONE 'America/Mexico_City')::date, 'YYYY-MM-DD') as day_str,
          COUNT(*)::text as new_users
        FROM public.users
        WHERE (created_at AT TIME ZONE 'America/Mexico_City') >= '2026-09-13 00:00:00'::timestamp
        GROUP BY (created_at AT TIME ZONE 'America/Mexico_City')::date
        ORDER BY (created_at AT TIME ZONE 'America/Mexico_City')::date ASC;
      `);

      baseResult.userGrowth = dailyGrowthRes.map((row) => {
        const newCount = parseInt(row.new_users, 10);
        runningCumulative += newCount;
        const [yr, mo, dy] = row.day_str.split('-');
        return {
          date: row.day_str,
          displayDate: `${parseInt(dy, 10)} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][parseInt(mo, 10) - 1]}`,
          newUsers: newCount,
          cumulativeUsers: runningCumulative,
        };
      });
    } catch (growthErr: any) {
      console.error('[PULSE Analytics] Error en consulta de crecimiento de usuarios (userGrowth):', growthErr?.message || growthErr);
      recordQueryFailure('userGrowth', 'public.users', growthErr?.message || String(growthErr));
      baseResult.userGrowthError = growthErr?.message || String(growthErr);
    }

    baseResult.connection.tablesStatus.users = { 
      success: true,
      rowCount: totalUsers,
      details: totalUsers === 0 ? 'Consulta exitosa. Retornó 0 filas debido a políticas RLS del usuario de lectura.' : undefined
    };
    atLeastOneQuerySucceeded = true;
  } catch (err: any) {
    const classified = classifyPgError(err);
    console.error('[PULSE Analytics] Error al consultar public.users:', err?.message || err);
    recordQueryFailure('users', 'public.users', classified.message);
    connectionFatalError = connectionFatalError || classified;
    baseResult.connection.tablesStatus.users = { success: false, rowCount: 0, error: classified.message };
    baseResult.kpis.users = {
      total: 0,
      previousPeriodTotal: 0,
      changePercent: null,
      trend: 'na',
      isAvailable: false,
      unavailableMessage: `Error al consultar public.users: ${classified.message}`,
    };
  }

  // ----------------------------------------------------
  // 2. PUBLIC.MOTOS (Isolated Query for "Motos en inventario")
  // Requirements:
  // - Direct SELECT on public.motos
  // - Only known existing columns (status, created_at, brand)
  // - Include status = 'PUBLICADA'
  // - Exclude status IN ('ENTREGADA', 'EN REVISIÓN', 'RECHAZADA')
  // - No apartado_status, no custom functions, no moto_has_accepted_offer
  // ----------------------------------------------------
  let totalPublicada = 0;
  try {
    const totalMotosInTableRes = await executeReadOnlyQuery<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM public.motos;'
    );
    const totalMotosInTable = parseInt(totalMotosInTableRes[0]?.count || '0', 10);

    let publicadasWhere = "WHERE status = 'PUBLICADA' AND status NOT IN ('ENTREGADA', 'EN REVISIÓN', 'RECHAZADA')";
    if (filters.brand && filters.brand !== 'all') {
      publicadasWhere += ` AND brand = '${filters.brand.replace(/'/g, "''")}'`;
    }
    if (filters.period && filters.period !== 'all') {
      if (filters.period === '7d') publicadasWhere += " AND created_at >= NOW() - INTERVAL '7 days'";
      else if (filters.period === '30d') publicadasWhere += " AND created_at >= NOW() - INTERVAL '30 days'";
      else if (filters.period === 'month') publicadasWhere += " AND created_at >= date_trunc('month', NOW())";
    }
    if (filters.status && filters.status !== 'all') {
      if (filters.status !== 'PUBLICADA') {
        publicadasWhere += ` AND status = '${filters.status.replace(/'/g, "''")}'`;
      }
    }

    const inventoryRes = await executeReadOnlyQuery<{ count: string }>(`
      SELECT COUNT(*)::text as count
      FROM public.motos
      ${publicadasWhere};
    `);

    totalPublicada = parseInt(inventoryRes[0]?.count || '0', 10);

    baseResult.inventoryBlock.motosPublicadas = {
      count: totalPublicada,
      isAvailable: true,
      queryDetails: "Tabla: public.motos | Condición: status = 'PUBLICADA' AND status NOT IN ('ENTREGADA', 'EN REVISIÓN', 'RECHAZADA')",
    };

    let currentMotos = totalPublicada;
    let prevMotos = 0;
    try {
      const weeklyMotosRes = await executeReadOnlyQuery<{ current_week: string; prev_week: string }>(`
        SELECT 
          COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as current_week,
          COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City' - INTERVAL '1 week')
                      AND (created_at AT TIME ZONE 'America/Mexico_City') < date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as prev_week
        FROM public.motos
        WHERE status = 'PUBLICADA' AND status NOT IN ('ENTREGADA', 'EN REVISIÓN', 'RECHAZADA');
      `);
      currentMotos = parseInt(weeklyMotosRes[0]?.current_week || '0', 10);
      prevMotos = parseInt(weeklyMotosRes[0]?.prev_week || '0', 10);
    } catch (weeklyMotosErr: any) {
      console.error('[PULSE Analytics] Error en comparativa semanal de public.motos:', weeklyMotosErr?.message || weeklyMotosErr);
      recordQueryFailure('motosWeeklyTrend', 'public.motos', weeklyMotosErr?.message || String(weeklyMotosErr));
    }

    const motoChange = calculatePercentageChange(currentMotos, prevMotos);

    baseResult.kpis.inventory = {
      total: totalPublicada,
      previousPeriodTotal: prevMotos,
      changePercent: motoChange.changePercent,
      trend: motoChange.trend,
      isAvailable: true,
    };

    // Load available brands from public.motos
    try {
      const brandRows = await executeReadOnlyQuery<{ brand: string }>(`
        SELECT DISTINCT brand FROM public.motos WHERE brand IS NOT NULL AND TRIM(brand) != '' ORDER BY brand;
      `);
      baseResult.filterDimensions.brands = brandRows.map(r => r.brand);
      baseResult.filterDimensions.hasBrandField = brandRows.length > 0;
    } catch (brandErr: any) {
      console.error('[PULSE Analytics] Error al consultar marcas en public.motos:', brandErr?.message || brandErr);
      recordQueryFailure('brands', 'public.motos', brandErr?.message || String(brandErr));
    }

    baseResult.filterDimensions.statuses = ['PUBLICADA', 'EN REVISIÓN', 'VC DOCUMENTAL', 'RECHAZADA', 'ENTREGADA'];
    baseResult.filterDimensions.hasStatusField = true;

    // Guaranteed unique non-duplicated motorcycle inventory queries
    let totalUniqueMotos = 0;
    try {
      let motosBrandWhere = "";
      if (filters.brand && filters.brand !== 'all') {
        motosBrandWhere = `WHERE brand = '${filters.brand.replace(/'/g, "''")}'`;
      }
      const uniqueRes = await executeReadOnlyQuery<{ count: string }>(`
        SELECT COUNT(DISTINCT id)::text as count
        FROM public.motos
        ${motosBrandWhere};
      `);
      totalUniqueMotos = parseInt(uniqueRes[0]?.count || '0', 10);
    } catch (uniqErr: any) {
      console.error('[PULSE Analytics] Error al consultar conteo único en public.motos:', uniqErr?.message || uniqErr);
      recordQueryFailure('totalUniqueMotos', 'public.motos', uniqErr?.message || String(uniqErr));
      totalUniqueMotos = totalPublicada;
    }

    // Inventory status distribution query (100% mutually exclusive, no duplicates)
    try {
      let motosBrandWhere = "";
      if (filters.brand && filters.brand !== 'all') {
        motosBrandWhere = `WHERE brand = '${filters.brand.replace(/'/g, "''")}'`;
      }
      const statusCounts = await executeReadOnlyQuery<{ status: string | null; count: string }>(`
        SELECT 
          COALESCE(NULLIF(TRIM(status::text), ''), 'SIN_ESTADO') as status, 
          COUNT(DISTINCT id)::text as count
        FROM public.motos
        ${motosBrandWhere}
        GROUP BY COALESCE(NULLIF(TRIM(status::text), ''), 'SIN_ESTADO')
        ORDER BY count DESC;
      `);

      const getStatusColor = (st: string, idx: number) => {
        const s = st.toUpperCase().trim();
        if (s === 'PUBLICADA') return '#ff1e27';
        if (s === 'EN REVISIÓN' || s === 'EN REVISION') return '#f59e0b';
        if (s === 'RECHAZADA') return '#71717a';
        if (s === 'ENTREGADA') return '#3b82f6';
        if (s === 'APARTADA') return '#a855f7';
        if (s === 'VENDIDA') return '#10b981';
        const palette = ['#ff1e27', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#06b6d4', '#ec4899', '#71717a'];
        return palette[idx % palette.length];
      };

      let sumOfStatusCounts = 0;
      for (const row of statusCounts) {
        sumOfStatusCounts += parseInt(row.count, 10);
      }
      const effectiveTotal = totalUniqueMotos > 0 ? totalUniqueMotos : sumOfStatusCounts;

      const distributionItems = statusCounts.map((row, idx) => {
        const count = parseInt(row.count, 10);
        return {
          status: row.status || 'SIN_ESTADO',
          count,
          percentage: effectiveTotal > 0 ? Math.round((count / effectiveTotal) * 1000) / 10 : 0,
          color: getStatusColor(row.status || '', idx),
        };
      });

      baseResult.inventoryBlock.totalUniqueMotos = effectiveTotal;
      baseResult.inventoryBlock.statusSlices = distributionItems;

      baseResult.inventoryDistribution = {
        items: distributionItems,
        totalActiveInventory: effectiveTotal,
        isAvailable: true,
      };

      // Query specifically for "VC Documental" (Validation / Certification Documental)
      try {
        let vcWhere = "WHERE status = 'EN REVISIÓN' OR UPPER(COALESCE(certification_status::text, '')) LIKE '%DOC%'";
        if (filters.brand && filters.brand !== 'all') {
          vcWhere += ` AND brand = '${filters.brand.replace(/'/g, "''")}'`;
        }
        const vcRes = await executeReadOnlyQuery<{ count: string }>(`
          SELECT COUNT(DISTINCT id)::text as count
          FROM public.motos
          ${vcWhere};
        `);
        const totalVc = parseInt(vcRes[0]?.count || '0', 10);
        baseResult.inventoryBlock.motosVcDocumental = {
          count: totalVc,
          isAvailable: true,
          queryDetails: "Tabla: public.motos | Condición: status = 'EN REVISIÓN' OR certification_status LIKE '%DOC%'",
        };
      } catch (vcErr: any) {
        console.error('[PULSE Analytics] Error al consultar motos en VC Documental:', vcErr?.message || vcErr);
        recordQueryFailure('motosVcDocumental', 'public.motos', vcErr?.message || String(vcErr));
        baseResult.inventoryBlock.motosVcDocumental = {
          count: 0,
          isAvailable: false,
          unavailableMessage: `Error al consultar VC Documental: ${vcErr?.message || String(vcErr)}`,
        };
      }
    } catch (distErr: any) {
      console.error('[PULSE Analytics] Error en distribución de inventario por estado:', distErr?.message || distErr);
      recordQueryFailure('inventoryDistribution', 'public.motos', distErr?.message || String(distErr));
      baseResult.inventoryBlock.totalUniqueMotos = totalPublicada;
      baseResult.inventoryBlock.statusSlices = [
        { status: 'PUBLICADA', count: totalPublicada, percentage: 100, color: '#ff1e27' }
      ];
      baseResult.inventoryDistribution = {
        items: [
          { status: 'PUBLICADA', count: totalPublicada, percentage: 100, color: '#ff1e27' }
        ],
        totalActiveInventory: totalPublicada,
        isAvailable: totalPublicada > 0,
        unavailableMessage: `Error al consultar distribución por estado: ${distErr?.message || String(distErr)}`,
      };
    }

    baseResult.connection.tablesStatus.motos = { 
      success: true,
      rowCount: totalMotosInTable,
      details: totalMotosInTable === 0 ? 'Consulta exitosa. Retornó 0 filas debido a políticas RLS del usuario de lectura.' : undefined
    };
    atLeastOneQuerySucceeded = true;
  } catch (err: any) {
    const classified = classifyPgError(err);
    console.error('[PULSE Analytics] Error al consultar public.motos:', err?.message || err);
    recordQueryFailure('motos', 'public.motos', classified.message);
    connectionFatalError = connectionFatalError || classified;
    baseResult.connection.tablesStatus.motos = { success: false, rowCount: 0, error: classified.message };
    baseResult.inventoryBlock.motosPublicadas = {
      count: 0,
      isAvailable: false,
      unavailableMessage: `Error al consultar public.motos: ${classified.message}`,
    };
    baseResult.kpis.inventory = {
      total: 0,
      previousPeriodTotal: 0,
      changePercent: null,
      trend: 'na',
      isAvailable: false,
      unavailableMessage: `Error al consultar public.motos: ${classified.message}`,
    };
    baseResult.inventoryDistribution = {
      items: [],
      totalActiveInventory: 0,
      isAvailable: false,
      unavailableMessage: `Error al consultar public.motos: ${classified.message}`,
    };
  }

  // ----------------------------------------------------
  // 3. PUBLIC.APARTADOS (Isolated Query for "Motos apartadas")
  // Requirements:
  // - Direct SELECT on public.apartados
  // - Count DISTINCT motorcycles (COUNT(DISTINCT moto_id))
  // - Verified relation column: moto_id
  // - Active reservation condition: status = 'REALIZADO' AND (expires_at IS NULL OR expires_at > NOW()) AND cancellation_requested_at IS NULL
  // - Exclude expired, cancelled, released, or non-active
  // ----------------------------------------------------
  try {
    const totalApartadosInTableRes = await executeReadOnlyQuery<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM public.apartados;'
    );
    const totalApartadosInTable = parseInt(totalApartadosInTableRes[0]?.count || '0', 10);

    let apartadosWhere = "WHERE moto_id IS NOT NULL AND status = 'REALIZADO' AND (expires_at IS NULL OR expires_at > NOW()) AND cancellation_requested_at IS NULL";
    if (filters.brand && filters.brand !== 'all') {
      apartadosWhere += ` AND moto_id IN (SELECT id FROM public.motos WHERE brand = '${filters.brand.replace(/'/g, "''")}')`;
    }
    if (filters.period && filters.period !== 'all') {
      if (filters.period === '7d') apartadosWhere += " AND created_at >= NOW() - INTERVAL '7 days'";
      else if (filters.period === '30d') apartadosWhere += " AND created_at >= NOW() - INTERVAL '30 days'";
      else if (filters.period === 'month') apartadosWhere += " AND created_at >= date_trunc('month', NOW())";
    }

    const apartadosRes = await executeReadOnlyQuery<{ count: string }>(`
      SELECT COUNT(DISTINCT moto_id)::text as count
      FROM public.apartados
      ${apartadosWhere};
    `);

    const totalApartadas = parseInt(apartadosRes[0]?.count || '0', 10);

    baseResult.inventoryBlock.motosApartadas = {
      count: totalApartadas,
      isAvailable: true,
      queryDetails: "Tabla: public.apartados | Relación: moto_id | Cálculo: COUNT(DISTINCT moto_id) | Vigencia: status = 'REALIZADO' AND (expires_at IS NULL OR expires_at > NOW()) AND cancellation_requested_at IS NULL",
    };

    let currentApartados = totalApartadas;
    let prevApartados = 0;
    try {
      const weeklyAptRes = await executeReadOnlyQuery<{ current_week: string; prev_week: string }>(`
        SELECT 
          COUNT(DISTINCT CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN moto_id END)::text as current_week,
          COUNT(DISTINCT CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City' - INTERVAL '1 week')
                      AND (created_at AT TIME ZONE 'America/Mexico_City') < date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN moto_id END)::text as prev_week
        FROM public.apartados
        ${apartadosWhere};
      `);
      currentApartados = parseInt(weeklyAptRes[0]?.current_week || '0', 10);
      prevApartados = parseInt(weeklyAptRes[0]?.prev_week || '0', 10);
    } catch (weeklyAptErr: any) {
      console.error('[PULSE Analytics] Error en comparativa semanal de public.apartados:', weeklyAptErr?.message || weeklyAptErr);
      recordQueryFailure('apartadosWeeklyTrend', 'public.apartados', weeklyAptErr?.message || String(weeklyAptErr));
    }

    const aptChange = calculatePercentageChange(currentApartados, prevApartados);

    baseResult.kpis.apartados = {
      total: totalApartadas,
      previousPeriodTotal: prevApartados,
      changePercent: aptChange.changePercent,
      trend: aptChange.trend,
      isAvailable: true,
    };

    baseResult.connection.tablesStatus.apartados = { 
      success: true,
      rowCount: totalApartadosInTable,
      details: totalApartadosInTable === 0 ? 'Consulta exitosa. Retornó 0 filas.' : undefined
    };
    atLeastOneQuerySucceeded = true;
  } catch (err: any) {
    const classified = classifyPgError(err);
    console.error('[PULSE Analytics] Error al consultar public.apartados:', err?.message || err);
    recordQueryFailure('apartados', 'public.apartados', classified.message);
    connectionFatalError = connectionFatalError || classified;
    baseResult.connection.tablesStatus.apartados = { success: false, rowCount: 0, error: classified.message };
    baseResult.inventoryBlock.motosApartadas = {
      count: 0,
      isAvailable: false,
      unavailableMessage: `Error al consultar public.apartados: ${classified.message}`,
    };
    baseResult.kpis.apartados = {
      total: 0,
      previousPeriodTotal: 0,
      changePercent: null,
      trend: 'na',
      isAvailable: false,
      unavailableMessage: `Error al consultar public.apartados: ${classified.message}`,
    };
  }

  // ----------------------------------------------------
  // 4. PUBLIC.OFFERS (Isolated Query for "Motos con oferta")
  // Requirements:
  // - Direct SELECT on public.offers
  // - Count DISTINCT motorcycles (COUNT(DISTINCT moto_id))
  // - If a motorcycle has multiple offers, counted once
  // - Verified relation column: moto_id
  // ----------------------------------------------------
  let acceptedOffersCount = 0;
  let hasAcceptedOffers = false;

  try {
    const totalOffersInTableRes = await executeReadOnlyQuery<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM public.offers;'
    );
    const totalOffersInTable = parseInt(totalOffersInTableRes[0]?.count || '0', 10);

    let offersWhere = "WHERE moto_id IS NOT NULL";
    if (filters.brand && filters.brand !== 'all') {
      offersWhere += ` AND moto_id IN (SELECT id FROM public.motos WHERE brand = '${filters.brand.replace(/'/g, "''")}')`;
    }
    if (filters.period && filters.period !== 'all') {
      if (filters.period === '7d') offersWhere += " AND created_at >= NOW() - INTERVAL '7 days'";
      else if (filters.period === '30d') offersWhere += " AND created_at >= NOW() - INTERVAL '30 days'";
      else if (filters.period === 'month') offersWhere += " AND created_at >= date_trunc('month', NOW())";
    }

    const offersDistinctMotosRes = await executeReadOnlyQuery<{ count: string }>(`
      SELECT COUNT(DISTINCT moto_id)::text as count
      FROM public.offers
      ${offersWhere};
    `);

    const totalMotosConOferta = parseInt(offersDistinctMotosRes[0]?.count || '0', 10);

    baseResult.inventoryBlock.motosConOferta = {
      count: totalMotosConOferta,
      isAvailable: true,
      queryDetails: "Tabla: public.offers | Relación: moto_id | Cálculo: COUNT(DISTINCT moto_id)",
    };

    let currentOffers = totalMotosConOferta;
    let prevOffers = 0;
    try {
      const weeklyOffersRes = await executeReadOnlyQuery<{ current_week: string; prev_week: string }>(`
        SELECT 
          COUNT(DISTINCT CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN moto_id END)::text as current_week,
          COUNT(DISTINCT CASE WHEN (created_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City' - INTERVAL '1 week')
                      AND (created_at AT TIME ZONE 'America/Mexico_City') < date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN moto_id END)::text as prev_week
        FROM public.offers
        ${offersWhere};
      `);
      currentOffers = parseInt(weeklyOffersRes[0]?.current_week || '0', 10);
      prevOffers = parseInt(weeklyOffersRes[0]?.prev_week || '0', 10);
    } catch (weeklyOffErr: any) {
      console.error('[PULSE Analytics] Error en comparativa semanal de public.offers:', weeklyOffErr?.message || weeklyOffErr);
      recordQueryFailure('offersWeeklyTrend', 'public.offers', weeklyOffErr?.message || String(weeklyOffErr));
    }

    const offChange = calculatePercentageChange(currentOffers, prevOffers);

    baseResult.kpis.offers = {
      total: totalMotosConOferta,
      previousPeriodTotal: prevOffers,
      changePercent: offChange.changePercent,
      trend: offChange.trend,
      isAvailable: true,
    };

    // Accepted offers count (for funnel / operations)
    try {
      const acceptedRes = await executeReadOnlyQuery<{ count: string }>(`
        SELECT COUNT(*)::text as count
        FROM public.offers
        WHERE UPPER(status::text) = 'ACEPTADA';
      `);
      acceptedOffersCount = parseInt(acceptedRes[0]?.count || '0', 10);
      hasAcceptedOffers = true;
    } catch (acceptedErr: any) {
      console.error('[PULSE Analytics] Error al consultar ofertas aceptadas:', acceptedErr?.message || acceptedErr);
      recordQueryFailure('acceptedOffers', 'public.offers', acceptedErr?.message || String(acceptedErr));
    }

    baseResult.connection.tablesStatus.offers = { 
      success: true,
      rowCount: totalOffersInTable,
      details: totalOffersInTable === 0 ? 'Consulta exitosa. Retornó 0 filas.' : undefined
    };
    atLeastOneQuerySucceeded = true;
  } catch (err: any) {
    const classified = classifyPgError(err);
    console.error('[PULSE Analytics] Error al consultar public.offers:', err?.message || err);
    recordQueryFailure('offers', 'public.offers', classified.message);
    connectionFatalError = connectionFatalError || classified;
    baseResult.connection.tablesStatus.offers = { success: false, rowCount: 0, error: classified.message };
    baseResult.inventoryBlock.motosConOferta = {
      count: 0,
      isAvailable: false,
      unavailableMessage: `Error al consultar public.offers: ${classified.message}`,
    };
    baseResult.kpis.offers = {
      total: 0,
      previousPeriodTotal: 0,
      changePercent: null,
      trend: 'na',
      isAvailable: false,
      unavailableMessage: `Error al consultar public.offers: ${classified.message}`,
    };
  }

  // ----------------------------------------------------
  // 5. PUBLIC.OPERATION_TRACKING (Isolated Query)
  // Known columns: id, delivery_status, delivery_completed_at, current_stage, created_at
  // ----------------------------------------------------
  try {
    const totalOpsInTableRes = await executeReadOnlyQuery<{ count: string }>(
      'SELECT COUNT(*)::text as count FROM public.operation_tracking;'
    );
    const totalOpsInTable = parseInt(totalOpsInTableRes[0]?.count || '0', 10);

    const totalDeliveriesRes = await executeReadOnlyQuery<{ count: string }>(`
      SELECT COUNT(*)::text as count 
      FROM public.operation_tracking
      WHERE UPPER(delivery_status::text) = 'COMPLETADA';
    `);
    const totalDeliveries = parseInt(totalDeliveriesRes[0]?.count || '0', 10);

    let currentDeliveries = totalDeliveries;
    let prevDeliveries = 0;
    try {
      const weeklyRes = await executeReadOnlyQuery<{ current_week: string; prev_week: string }>(`
        SELECT 
          COUNT(CASE WHEN (delivery_completed_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as current_week,
          COUNT(CASE WHEN (delivery_completed_at AT TIME ZONE 'America/Mexico_City') >= date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City' - INTERVAL '1 week')
                      AND (delivery_completed_at AT TIME ZONE 'America/Mexico_City') < date_trunc('week', NOW() AT TIME ZONE 'America/Mexico_City') THEN 1 END)::text as prev_week
        FROM public.operation_tracking
        WHERE UPPER(delivery_status::text) = 'COMPLETADA';
      `);
      currentDeliveries = parseInt(weeklyRes[0]?.current_week || '0', 10);
      prevDeliveries = parseInt(weeklyRes[0]?.prev_week || '0', 10);
    } catch (weeklyDelivErr: any) {
      console.error('[PULSE Analytics] Error en comparativa semanal de public.operation_tracking:', weeklyDelivErr?.message || weeklyDelivErr);
      recordQueryFailure('deliveriesWeeklyTrend', 'public.operation_tracking', weeklyDelivErr?.message || String(weeklyDelivErr));
    }

    const deliveryChange = calculatePercentageChange(currentDeliveries, prevDeliveries);
    baseResult.kpis.deliveries = {
      total: totalDeliveries,
      previousPeriodTotal: prevDeliveries,
      changePercent: deliveryChange.changePercent,
      trend: deliveryChange.trend,
      isAvailable: true,
    };

    // Active operations query
    try {
      const activeOpsRes = await executeReadOnlyQuery<{
        row_data: any;
      }>(`
        SELECT 
          to_jsonb(t) as row_data
        FROM public.operation_tracking t
        WHERE UPPER(COALESCE(delivery_status::text, '')) != 'COMPLETADA'
          AND UPPER(COALESCE(delivery_status::text, '')) != 'CANCELADA'
        LIMIT 10;
      `);

      baseResult.activeOperations = {
        items: activeOpsRes.map((row) => {
          const d = row.row_data || {};
          const rawId = String(d.id || d.operation_id || d.tracking_id || '1');
          const currentStage = String(d.current_stage || d.stage || 'En Proceso');
          const deliveryStatus = String(d.delivery_status || 'EN_PROCESO');
          const createdAt = d.created_at || d.updated_at;

          let daysElapsed = 0;
          let formattedDate = 'N/D';
          if (createdAt) {
            const dt = new Date(createdAt);
            const diffMs = Date.now() - dt.getTime();
            daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
            formattedDate = dt.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'short', year: '2-digit' });
          }

          return {
            id: rawId.startsWith('ML-') ? rawId : `ML-${rawId.padStart(5, '0')}`,
            moto: `Operación #${rawId}`,
            currentStage,
            date: formattedDate,
            daysElapsed,
            deliveryStatus,
          };
        }),
        isAvailable: true,
      };
    } catch (opsErr: any) {
      console.error('[PULSE Analytics] Error en consulta de operaciones activas:', opsErr?.message || opsErr);
      recordQueryFailure('activeOperations', 'public.operation_tracking', opsErr?.message || String(opsErr));
      baseResult.activeOperations = {
        items: [],
        isAvailable: false,
        unavailableMessage: `Error al consultar operaciones activas: ${opsErr.message}`,
      };
    }

    baseResult.connection.tablesStatus.operation_tracking = { 
      success: true,
      rowCount: totalOpsInTable,
      details: totalOpsInTable === 0 ? 'Consulta exitosa. Retornó 0 filas.' : undefined
    };
    atLeastOneQuerySucceeded = true;
  } catch (err: any) {
    const classified = classifyPgError(err);
    console.error('[PULSE Analytics] Error al consultar public.operation_tracking:', err?.message || err);
    recordQueryFailure('deliveries', 'public.operation_tracking', classified.message);
    connectionFatalError = connectionFatalError || classified;
    baseResult.connection.tablesStatus.operation_tracking = { success: false, rowCount: 0, error: classified.message };
    baseResult.kpis.deliveries = {
      total: 0,
      previousPeriodTotal: 0,
      changePercent: null,
      trend: 'na',
      isAvailable: false,
      unavailableMessage: `Error al consultar public.operation_tracking: ${classified.message}`,
    };
    baseResult.activeOperations = {
      items: [],
      isAvailable: false,
      unavailableMessage: `Error al consultar public.operation_tracking: ${classified.message}`,
    };
  }

  // ----------------------------------------------------
  // CONVERSION FUNNEL
  // Computed strictly against Users Registered (100%)
  // ----------------------------------------------------
  const usersCount = baseResult.kpis.users.total;
  const motosPublishedCount = baseResult.kpis.inventory.total;
  const apartadosCount = baseResult.kpis.apartados.isAvailable ? baseResult.kpis.apartados.total : 0;
  const offersCount = baseResult.kpis.offers.isAvailable ? baseResult.kpis.offers.total : 0;
  const deliveriesCompletedCount = baseResult.kpis.deliveries.isAvailable ? baseResult.kpis.deliveries.total : 0;

  const calcFunnelPct = (val: number) => {
    if (usersCount <= 0) return null;
    return Math.round((val / usersCount) * 1000) / 10;
  };

  baseResult.funnel = {
    stages: [
      { name: 'Usuarios registrados', count: usersCount, percentageOfUsers: usersCount > 0 ? 100 : null, isAvailable: baseResult.kpis.users.isAvailable },
      { name: 'Motos publicadas', count: motosPublishedCount, percentageOfUsers: calcFunnelPct(motosPublishedCount), isAvailable: baseResult.kpis.inventory.isAvailable },
      { name: 'Apartados', count: apartadosCount, percentageOfUsers: calcFunnelPct(apartadosCount), isAvailable: baseResult.kpis.apartados.isAvailable },
      { name: 'Ofertas', count: offersCount, percentageOfUsers: calcFunnelPct(offersCount), isAvailable: baseResult.kpis.offers.isAvailable },
      { name: 'Ofertas aceptadas', count: acceptedOffersCount, percentageOfUsers: calcFunnelPct(acceptedOffersCount), isAvailable: hasAcceptedOffers },
      { name: 'Entregas', count: deliveriesCompletedCount, percentageOfUsers: calcFunnelPct(deliveriesCompletedCount), isAvailable: baseResult.kpis.deliveries.isAvailable },
    ],
    isAvailable: baseResult.kpis.users.isAvailable,
  };

  // ----------------------------------------------------
  // MOTOCICLETAS MÁS POPULARES
  // Query offers count grouped by moto_id
  // ----------------------------------------------------
  try {
    const popularRes = await executeReadOnlyQuery<{
      moto_id: string;
      offer_count: string;
    }>(`
      SELECT 
        moto_id::text,
        COUNT(*)::text as offer_count
      FROM public.offers
      WHERE moto_id IS NOT NULL
      GROUP BY moto_id
      ORDER BY COUNT(*) DESC
      LIMIT 5;
    `);

    if (popularRes.length > 0) {
      baseResult.popularMotos = {
        items: popularRes.map((row) => ({
          id: row.moto_id,
          make: 'Motocicleta',
          model: `ID #${row.moto_id}`,
          metricCount: parseInt(row.offer_count, 10),
          metricLabel: 'ofertas',
        })),
        criterion: 'Ordenado por número de ofertas.',
        isAvailable: true,
      };
    } else {
      baseResult.popularMotos = {
        items: [],
        criterion: '',
        isAvailable: false,
        unavailableMessage: 'Ranking no disponible con las tablas actualmente autorizadas: no se registran ofertas por motocicleta.',
      };
    }
  } catch (popErr: any) {
    console.error('[PULSE Analytics] Error al consultar motocicletas populares:', popErr?.message || popErr);
    recordQueryFailure('popularMotos', 'public.offers', popErr?.message || String(popErr));
    baseResult.popularMotos = {
      items: [],
      criterion: '',
      isAvailable: false,
      unavailableMessage: `Ranking no disponible con las tablas actualmente autorizadas: ${popErr?.message || String(popErr)}`,
    };
  }

  // Set overall connection state
  if (atLeastOneQuerySucceeded) {
    baseResult.connection.connected = true;
    baseResult.connection.status = 'connected';
    baseResult.connection.errorType = null;
    baseResult.connection.errorMessage = undefined;
  } else if (connectionFatalError) {
    baseResult.connection.connected = false;
    baseResult.connection.status = 'error';
    baseResult.connection.errorType = connectionFatalError.type;
    baseResult.connection.errorMessage = connectionFatalError.message;
  }

  return baseResult;
}
