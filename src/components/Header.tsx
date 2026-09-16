import React, { useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Shield,
  Database,
  Radio,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ConnectionStatusInfo } from '../types.js';
import { MotoluvIsotype } from './MotoluvIsotype.js';

interface HeaderProps {
  connection: ConnectionStatusInfo;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenConnectionModal: () => void;
  hasBrandField: boolean;
  hasChannelField: boolean;
  availableBrands?: string[];
  availableStatuses?: string[];
  selectedPeriod?: string;
  selectedBrand?: string;
  selectedStatus?: string;
  onFilterChange?: (filters: { period: string; brand: string; status: string }) => void;
  lastUpdated?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connection,
  isRefreshing,
  onRefresh,
  onOpenConnectionModal,
  hasBrandField,
  hasChannelField,
  availableBrands = [],
  availableStatuses = [],
  selectedPeriod = 'all',
  selectedBrand = 'all',
  selectedStatus = 'all',
  onFilterChange,
  lastUpdated,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const formattedDateTime = useMemo(() => {
    const raw = lastUpdated || connection?.lastUpdated;
    if (!raw) return 'Sincronizando...';
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return raw;
    }
  }, [lastUpdated, connection?.lastUpdated]);
  return (
    <header id="pulse-header" className="w-full">
      {/* Top Bar with Filters & Actions - Responsive Layout */}
      <div className="py-2.5 sm:py-3.5 px-3 sm:px-8 border-b border-[#181c24] bg-[#0c0e12]/90 backdrop-blur-md sticky top-0 z-20 space-y-2.5 sm:space-y-0">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
          {/* Left: Desktop Toggle / Mobile Brand */}
          <div className="flex items-center gap-2">
            {/* Desktop sidebar toggle button */}
            <button
              id="header-sidebar-toggle-btn"
              type="button"
              onClick={onToggleSidebar}
              className="hidden md:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14171f] hover:bg-[#1a1e29] border border-[#232836] hover:border-zinc-600 text-xs font-medium text-zinc-200 hover:text-white transition-all shadow-xs group cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú (Pantalla completa)'}
            >
              <MotoluvIsotype className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Motoluv</span>
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors ml-0.5" />
              ) : (
                <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors ml-0.5" />
              )}
            </button>

            {/* Mobile Brand Logo & Pulse badge */}
            <div className="md:hidden flex items-center gap-2">
              <MotoluvIsotype withBackground={true} className="w-5 h-5 shrink-0" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-zinc-200">Motoluv</span>
                <span className="text-[9px] font-medium text-red-500 tracking-wider uppercase px-1 py-0.2 bg-red-950/60 rounded border border-red-800/40">
                  PULSE
                </span>
              </div>
            </div>
          </div>

          {/* Filters Bar: Fully responsive and scrollable on small mobile */}
          <div
            id="header-filters-container"
            className="w-full sm:w-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin order-3 sm:order-2"
          >
            {/* Period Filter */}
            <div
              id="filter-period"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-medium text-zinc-200 shadow-xs shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) =>
                  onFilterChange?.({
                    period: e.target.value,
                    brand: selectedBrand,
                    status: selectedStatus,
                  })
                }
                className="bg-transparent border-none text-zinc-200 text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="bg-[#14171f] text-zinc-200">
                  Todo el histórico
                </option>
                <option value="7d" className="bg-[#14171f] text-zinc-200">
                  Últimos 7 días
                </option>
                <option value="30d" className="bg-[#14171f] text-zinc-200">
                  Últimos 30 días
                </option>
                <option value="month" className="bg-[#14171f] text-zinc-200">
                  Este mes
                </option>
              </select>
            </div>

            {/* Brand Filter */}
            <div
              id="filter-brand"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
                hasBrandField && availableBrands.length > 0
                  ? 'bg-[#14171f] border-[#232836] text-zinc-200'
                  : 'bg-[#101217] border-[#1b1f28] text-zinc-400 opacity-70'
              }`}
              title={hasBrandField ? 'Filtrar por marca' : 'Dimensión de marca no disponible'}
            >
              <select
                id="brand-select"
                value={selectedBrand}
                disabled={!hasBrandField || availableBrands.length === 0}
                onChange={(e) =>
                  onFilterChange?.({
                    period: selectedPeriod,
                    brand: e.target.value,
                    status: selectedStatus,
                  })
                }
                className="bg-transparent border-none text-zinc-200 text-xs font-medium focus:outline-hidden cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="all" className="bg-[#14171f] text-zinc-200">
                  Todas las marcas
                </option>
                {availableBrands.map((b) => (
                  <option key={b} value={b} className="bg-[#14171f] text-zinc-200">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div
              id="filter-status"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-medium text-zinc-200 shadow-xs shrink-0"
            >
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) =>
                  onFilterChange?.({
                    period: selectedPeriod,
                    brand: selectedBrand,
                    status: e.target.value,
                  })
                }
                className="bg-transparent border-none text-zinc-200 text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="bg-[#14171f] text-zinc-200">
                  Todos los estados
                </option>
                <option value="PUBLICADA" className="bg-[#14171f] text-zinc-200">
                  PUBLICADA
                </option>
                <option value="EN REVISIÓN" className="bg-[#14171f] text-zinc-200">
                  EN REVISIÓN
                </option>
                <option value="VC DOCUMENTAL" className="bg-[#14171f] text-zinc-200">
                  VC DOCUMENTAL
                </option>
                <option value="RECHAZADA" className="bg-[#14171f] text-zinc-200">
                  RECHAZADA
                </option>
                <option value="ENTREGADA" className="bg-[#14171f] text-zinc-200">
                  ENTREGADA
                </option>
              </select>
            </div>

            {/* Channel Filter */}
            <div
              id="filter-channel"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors shrink-0 ${
                hasChannelField
                  ? 'bg-[#14171f] border-[#232836] text-zinc-200 cursor-pointer hover:border-zinc-600'
                  : 'bg-[#101217] border-[#1b1f28] text-zinc-400 cursor-not-allowed opacity-60'
              }`}
              title={hasChannelField ? 'Filtrar por canal' : 'Dimensión de canal no disponible'}
            >
              <span>Canales</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
          </div>

          {/* Right Section: Last Updated Time, Refresh Button & DB Indicator */}
          <div className="flex items-center gap-2 shrink-0 ml-auto order-2 sm:order-3">
            {/* Fecha y hora de última actualización */}
            <div
              id="header-last-updated"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-mono shadow-xs"
              title="Fecha y hora de la última actualización de métricas"
            >
              <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-zinc-200 text-[11px] font-medium">{formattedDateTime}</span>
            </div>

            {/* Refresh Button */}
            <button
              id="refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#14171f] hover:bg-[#1a1f2a] border border-[#232836] text-xs font-medium text-zinc-200 transition-all disabled:opacity-50 cursor-pointer min-h-[34px]"
              title="Actualizar métricas en tiempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Connection Indicator: Green/Red dot button */}
            <button
              onClick={onOpenConnectionModal}
              id="connection-badge-btn"
              title={
                connection.connected
                  ? 'Base de datos conectada (pulse_readonly)'
                  : 'Base de datos desconectada - Ver diagnóstico'
              }
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors cursor-pointer min-w-[34px] min-h-[34px] ${
                connection.connected
                  ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/30'
                  : 'bg-red-950/40 border-red-800/40 hover:bg-red-900/30'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connection.connected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-red-500'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Visual Section with Aesthetic Sports Motorcycle Background */}
      <div
        id="pulse-hero-banner"
        className="relative overflow-hidden border-b border-[#181c24] px-4 sm:px-8 py-3.5 sm:py-4.5 min-h-[110px] sm:min-h-[125px] lg:min-h-[135px] flex items-center bg-[#07080b] transition-all duration-300"
      >
        {/* Aesthetic background image layer with seamless progressive transparency */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-end">
          {/* Ambient atmosphere depth with soft gradient mask */}
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-[70%] md:w-[55%] flex items-center justify-end opacity-15 filter blur-2xl pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 35%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 35%, black 100%)',
            }}
          >
            <img
              src="/images/mercado-estetico-banner.jpg"
              alt=""
              className="h-full w-full object-cover object-right"
            />
          </div>

          {/* Left subtle obsidian gradient overlay to protect text contrast */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[38%] md:w-[32%] bg-gradient-to-r from-[#07080b] via-[#07080b]/80 to-transparent pointer-events-none z-1" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <MotoluvIsotype className="w-4 h-4 shrink-0 drop-shadow-[0_0_8px_rgba(238,28,37,0.8)]" />
              <span className="text-[11px] font-extrabold tracking-[0.2em] text-red-500 uppercase font-tech">
                MOTOLUV ANALYTICS
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-wider uppercase font-tech leading-tight drop-shadow-md">
              Mercado En Movimiento
            </h1>
          </div>

          {/* Right Section: Pillar Block right where the transparency mask starts, followed by the motorcycle image */}
          <div className="flex items-center shrink-0">
            {/* The text "CONFIANZA DATOS MOVIMIENTO" */}
            <div className="flex flex-col items-end text-right shrink-0 z-10">
              <div className="flex flex-col gap-0.5 text-[10px] sm:text-[11px] font-bold tracking-widest text-zinc-300 font-neo-grotesk">
                <span>CONFIANZA</span>
                <span>DATOS</span>
                <span>MOVIMIENTO</span>
              </div>
              <div className="w-5 h-0.5 bg-red-600 rounded-full mt-1.5 self-end shadow-[0_0_8px_rgba(255,30,39,0.8)]" />
            </div>

            {/* Motorcycle image with its transparency mask starting right at this point */}
            <div
              className="h-20 sm:h-24 lg:h-28 w-auto shrink-0 flex items-center pointer-events-none -ml-1 sm:-ml-2"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 10%, black 22%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 10%, black 22%, black 100%)',
              }}
            >
              <img
                src="/images/mercado-estetico-banner.jpg"
                alt="Mercado En Movimiento"
                className="h-full w-auto object-contain object-right filter brightness-100 contrast-105"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
