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
      {/* Top Bar with Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4 px-4 sm:px-8 border-b border-[#181c24] bg-[#0c0e12]/80 backdrop-blur-md sticky top-0 z-20">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Header Motoluv Brand / Menu Toggle (desktop sidebar toggle) */}
          <button
            id="header-sidebar-toggle-btn"
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14171f] hover:bg-[#1a1e29] border border-[#232836] text-zinc-200 hover:text-white transition-all text-xs font-semibold shadow-xs group cursor-pointer"
            title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Contraer menú (Pantalla completa)'}
          >
            <MotoluvIsotype className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            <span className="font-black tracking-wider text-white font-display">MOTOLUV</span>
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors ml-0.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors ml-0.5" />
            )}
          </button>

          {/* Mobile Brand Logo */}
          <div className="md:hidden flex items-center gap-1.5 mr-1">
            <MotoluvIsotype withBackground={true} className="w-5 h-5" />
            <span className="text-sm font-black tracking-wider text-white font-display">MOTOLUV</span>
          </div>

          {/* Period Filter */}
          <div
            id="filter-period"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-medium text-zinc-200 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
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
                13 sep 2026 - Actualidad (Todo)
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hasBrandField && availableBrands.length > 0
                ? 'bg-[#14171f] border-[#232836] text-zinc-200'
                : 'bg-[#101217] border-[#1b1f28] text-zinc-400 opacity-70'
            }`}
            title={hasBrandField ? 'Filtrar por marca' : 'Dimensión de marca no disponible en el esquema actual'}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-medium text-zinc-200 shadow-sm"
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hasChannelField
                ? 'bg-[#14171f] border-[#232836] text-zinc-200 cursor-pointer hover:border-zinc-600'
                : 'bg-[#101217] border-[#1b1f28] text-zinc-400 cursor-not-allowed opacity-60'
            }`}
            title={hasChannelField ? 'Filtrar por canal' : 'Dimensión de canal no disponible en el esquema actual'}
          >
            <span>Todos los canales</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </div>
        </div>

        {/* Right Section: Connection Dot & Refresh Button (pulse_readonly & Hola Rick removed) */}
        <div className="flex items-center gap-2.5">
          {/* Fecha y hora de última actualización */}
          <div
            id="header-last-updated"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171f] border border-[#232836] text-xs font-mono shadow-xs"
            title="Fecha y hora de la última actualización de métricas"
          >
            <Clock className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="hidden md:inline text-zinc-400 text-[11px]">Última act:</span>
            <span className="text-zinc-200 text-[11px] font-medium">{formattedDateTime}</span>
          </div>

          {/* Refresh Button */}
          <button
            id="refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171f] hover:bg-[#1a1f2a] border border-[#232836] text-xs font-medium text-zinc-200 transition-all disabled:opacity-50 cursor-pointer"
            title="Actualizar métricas en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Connection Indicator: Only green or red dot */}
          <button
            onClick={onOpenConnectionModal}
            id="connection-badge-btn"
            title={
              connection.connected
                ? 'Base de datos conectada (pulse_readonly)'
                : 'Base de datos desconectada'
            }
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors ${
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

      {/* Hero Visual Section with Sports Motorcycle Background (focused element) */}
      <div
        id="pulse-hero-banner"
        className="relative overflow-hidden border-b border-[#181c24] px-4 sm:px-8 py-6 sm:py-7 bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{ backgroundImage: "url('/images/sports-motorcycle-bg.jpg')" }}
      >
        {/* Cinematic dark studio gradient overlays to ensure 100% WCAG AA contrast for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f]/95 via-[#0c0e14]/80 to-[#080a0f]/92 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-[#08090c]/60 pointer-events-none" />
        {/* Subtle red spotlight glow */}
        <div className="absolute -top-16 left-1/4 w-96 h-48 bg-red-600/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <MotoluvIsotype className="w-4 h-4 shrink-0 drop-shadow-[0_0_8px_rgba(238,28,37,0.8)]" />
              <span className="text-[10px] font-extrabold tracking-[0.2em] text-red-500 uppercase font-tech">
                MOTOLUV ANALYTICS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-wider uppercase font-display italic drop-shadow-md">
              MERCADO EN MOVIMIENTO
            </h1>
          </div>

          {/* Right Brand Pillar Tag */}
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-300 font-tech">
              <span>CONFIANZA</span>
              <span className="text-zinc-400">•</span>
              <span>DATOS</span>
              <span className="text-zinc-400">•</span>
              <span>MOVIMIENTO</span>
            </div>
            <div className="w-28 h-1 bg-gradient-to-r from-transparent via-red-600 to-red-500 rounded-full mt-2 shadow-[0_0_8px_rgba(255,30,39,0.8)]"></div>
          </div>
        </div>
      </div>
    </header>
  );
};
