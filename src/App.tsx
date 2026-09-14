import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { KPICards } from './components/KPICards.js';
import { UserGrowthChart } from './components/UserGrowthChart.js';
import { InventoryChart } from './components/InventoryChart.js';
import { ConversionFunnel } from './components/ConversionFunnel.js';
import { PopularMotos } from './components/PopularMotos.js';
import { ActiveOperations } from './components/ActiveOperations.js';
import { FooterValues } from './components/FooterValues.js';
import { ConnectionModal } from './components/ConnectionModal.js';
import { SectionInProgress } from './components/SectionInProgress.js';
import { DashboardData, NavSection } from './types.js';
import { AlertCircle, Database, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<NavSection>('resumen');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<{ period: string; brand: string; status: string }>({
    period: 'all',
    brand: 'all',
    status: 'all',
  });

  const fetchMetrics = useCallback(async (activeFilters = filters) => {
    try {
      setIsRefreshing(true);
      const params = new URLSearchParams();
      if (activeFilters.period && activeFilters.period !== 'all') params.set('period', activeFilters.period);
      if (activeFilters.brand && activeFilters.brand !== 'all') params.set('brand', activeFilters.brand);
      if (activeFilters.status && activeFilters.status !== 'all') params.set('status', activeFilters.status);

      const qs = params.toString();
      const res = await fetch(`/api/dashboard-metrics${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        throw new Error(`Error en servidor (${res.status})`);
      }
      const json: DashboardData = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Error fetching dashboard metrics:', err);
      // Even if network fails, ensure connection diagnostic state is preserved
      setData((prev) => {
        if (prev) return prev;
        return {
          connection: {
            connected: false,
            status: 'error',
            source: 'PostgreSQL DB',
            user: 'pulse_readonly',
            database: 'postgres',
            host: 'aws-0-us-east-1.pooler.supabase.com',
            port: 5432,
            ssl: true,
            lastUpdated: new Date().toLocaleTimeString('es-MX'),
            errorType: 'QUERY_ERROR',
            errorMessage: err?.message || 'Error al comunicar con la API de PULSE.',
          },
          inventoryBlock: {
            motosPublicadas: { count: 0, isAvailable: false, unavailableMessage: 'Error de conexión' },
            motosConOferta: { count: 0, isAvailable: false, unavailableMessage: 'Error de conexión' },
            motosApartadas: { count: 0, isAvailable: false, unavailableMessage: 'Error de conexión' },
          },
          kpis: {
            users: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión' },
            inventory: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión' },
            apartados: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión' },
            offers: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión' },
            deliveries: { total: 0, previousPeriodTotal: 0, changePercent: null, trend: 'na', isAvailable: false, unavailableMessage: 'Pendiente de conexión' },
          },
          userGrowth: [],
          inventoryDistribution: { items: [], totalActiveInventory: 0, isAvailable: false },
          funnel: { stages: [], isAvailable: false },
          popularMotos: { items: [], criterion: '', isAvailable: false },
          activeOperations: { items: [], isAvailable: false },
          filterDimensions: { brands: [], statuses: [], channels: [], hasBrandField: false, hasStatusField: false, hasChannelField: false },
        };
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters: { period: string; brand: string; status: string }) => {
    setFilters(newFilters);
    fetchMetrics(newFilters);
  };

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const connection = data?.connection || {
    connected: false,
    status: 'disconnected',
    source: 'PostgreSQL DB',
    user: 'pulse_readonly',
    database: 'postgres',
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 5432,
    ssl: true,
    lastUpdated: 'Sin sincronizar',
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col md:flex-row antialiased">
      {/* Fixed / Sticky Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        connection={connection}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with filters and status */}
        <Header
          connection={connection}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchMetrics(filters)}
          onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
          hasBrandField={data?.filterDimensions?.hasBrandField ?? false}
          hasChannelField={data?.filterDimensions?.hasChannelField ?? false}
          availableBrands={data?.filterDimensions?.brands ?? []}
          availableStatuses={data?.filterDimensions?.statuses ?? []}
          selectedPeriod={filters.period}
          selectedBrand={filters.brand}
          selectedStatus={filters.status}
          onFilterChange={handleFilterChange}
          lastUpdated={connection.lastUpdated}
        />

        {/* Dynamic Section Rendering */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
          {currentSection !== 'resumen' ? (
            <SectionInProgress
              section={currentSection}
              onBackToResumen={() => setCurrentSection('resumen')}
            />
          ) : (
            <>
              {/* Disconnected or Credentials Notice (strictly informational, no fake numbers) */}
              {!connection.connected && (
                <div
                  id="pulse-connection-banner"
                  className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#151218] to-[#12141c] border border-red-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-900/40 border border-red-700/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Database className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-tech">
                          Conexión PostgreSQL en Espera
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/70 border border-red-800 text-red-300">
                          pulse_readonly
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                        {connection.errorMessage ||
                          'PULSE está configurado para conectarse al usuario de solo lectura mediante variables de entorno seguras (DATABASE_URL o POSTGRES_URL). Conforme al mandato, no se muestran datos ficticios.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsConnectionModalOpen(true)}
                    id="banner-details-btn"
                    className="px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-200 text-xs font-semibold shrink-0 transition-colors"
                  >
                    Ver Diagnóstico
                  </button>
                </div>
              )}

              {/* 1. 5 KPI Cards */}
              {data ? (
                <KPICards
                  users={data.kpis.users}
                  inventory={data.kpis.inventory}
                  apartados={data.kpis.apartados}
                  offers={data.kpis.offers}
                  deliveries={data.kpis.deliveries}
                />
              ) : (
                <div className="h-28 rounded-xl bg-[#111318] border border-[#1f242e] animate-pulse" />
              )}

              {/* 2. Middle Row: Crecimiento de Usuarios + Bloque Motos en Inventario (3 Métricas Exclusivas) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <UserGrowthChart
                    data={data?.userGrowth || []}
                    changePercent={data?.kpis?.users?.changePercent ?? null}
                    isAvailable={data?.kpis?.users?.isAvailable ?? false}
                    unavailableMessage={data?.kpis?.users?.unavailableMessage}
                  />
                </div>
                <div className="lg:col-span-7">
                  <InventoryChart
                    inventoryBlock={data?.inventoryBlock}
                    isLoading={isRefreshing || loading}
                  />
                </div>
              </div>

              {/* 3. Lower Row: Embudo de Conversión + Motos Populares + Operaciones en Proceso */}
              {/* Note: "Actividad Transaccional" is strictly excluded per prompt instructions. */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div>
                  <ConversionFunnel
                    stages={data?.funnel?.stages || []}
                    isAvailable={data?.funnel?.isAvailable ?? false}
                    unavailableMessage={data?.funnel?.unavailableMessage}
                  />
                </div>
                <div>
                  <PopularMotos
                    popularMotos={
                      data?.popularMotos || {
                        items: [],
                        criterion: '',
                        isAvailable: false,
                        unavailableMessage: 'Ranking no disponible con las tablas actualmente autorizadas.',
                      }
                    }
                  />
                </div>
                <div>
                  <ActiveOperations
                    activeOperations={
                      data?.activeOperations || {
                        items: [],
                        isAvailable: false,
                        unavailableMessage: 'Operaciones no disponibles con la estructura actual de datos.',
                      }
                    }
                  />
                </div>
              </div>

              {/* 4. Bottom Motoluv Values Banner */}
              <FooterValues />
            </>
          )}
        </main>
      </div>

      {/* Database Connection & Diagnostic Modal */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        connection={connection}
        onRefresh={fetchMetrics}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
