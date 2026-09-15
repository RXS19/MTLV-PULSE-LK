export type NavSection =
  | 'resumen'
  | 'motos'
  | 'apartados'
  | 'ofertas'
  | 'entregas'
  | 'embudo'
  | 'finanzas'
  | 'reportes';

export interface ConnectionStatusInfo {
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
  tablesVerified?: {
    users: boolean;
    motos: boolean;
    apartados: boolean;
    offers: boolean;
    operation_tracking: boolean;
  };
  tablesStatus?: {
    users: { success: boolean; error?: string; rowCount?: number; details?: string };
    motos: { success: boolean; error?: string; rowCount?: number; details?: string };
    apartados: { success: boolean; error?: string; rowCount?: number; details?: string };
    offers: { success: boolean; error?: string; rowCount?: number; details?: string };
    operation_tracking: { success: boolean; error?: string; rowCount?: number; details?: string };
  };
  queryFailures?: Array<{ metric: string; table: string; error: string }>;
}

export interface InventoryMetricItem {
  count: number;
  isAvailable: boolean;
  unavailableMessage?: string;
  queryDetails?: string;
  trend?: 'up' | 'down' | 'neutral' | 'na';
}

export interface InventoryStatusSlice {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface InventoryBlockData {
  totalUniqueMotos: number;
  statusSlices: InventoryStatusSlice[];
  motosPublicadas: InventoryMetricItem;
  motosConOferta: InventoryMetricItem;
  motosApartadas: InventoryMetricItem;
  motosVcDocumental?: InventoryMetricItem;
  appliedFilters?: {
    period?: string;
    brand?: string;
    status?: string;
  };
}

export interface KPIValue {
  total: number;
  previousPeriodTotal: number;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral' | 'na';
  isAvailable: boolean;
  unavailableMessage?: string;
}

export interface UserGrowthPoint {
  date: string;
  displayDate: string;
  newUsers: number;
  cumulativeUsers: number;
}

export interface InventoryItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface FunnelStageItem {
  name: string;
  count: number;
  percentageOfUsers: number | null;
  isAvailable: boolean;
}

export interface PopularMotoItem {
  id: string | number;
  make: string;
  model: string;
  year?: string | number;
  metricCount: number;
  metricLabel: string;
  imageUrl?: string | null;
}

export interface ActiveOperationItem {
  id: string;
  moto: string;
  currentStage: string;
  date: string;
  daysElapsed: number;
  deliveryStatus: string;
}

export interface DashboardData {
  connection: ConnectionStatusInfo;
  kpis: {
    users: KPIValue;
    inventory: KPIValue;
    apartados: KPIValue;
    offers: KPIValue;
    deliveries: KPIValue;
  };
  userGrowth: UserGrowthPoint[];
  userGrowthError?: string;
  inventoryDistribution: {
    items: InventoryItem[];
    totalActiveInventory: number;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  funnel: {
    stages: FunnelStageItem[];
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  popularMotos: {
    items: PopularMotoItem[];
    criterion: string;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
  activeOperations: {
    items: ActiveOperationItem[];
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
  inventoryBlock?: InventoryBlockData;
}
