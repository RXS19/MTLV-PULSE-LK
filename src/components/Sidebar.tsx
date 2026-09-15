import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Bike,
  FileText,
  Tag,
  CheckCircle2,
  Filter,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavSection, ConnectionStatusInfo } from '../types.js';
import { MotoluvIsotype } from './MotoluvIsotype.js';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  connection?: ConnectionStatusInfo;
  onOpenConnectionModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SubMenuItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
}

interface MenuItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  connection,
  onOpenConnectionModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isMotosActive = ['motos', 'apartados', 'ofertas', 'entregas'].includes(currentSection);
  // El menú desplegable de "motos" siempre debe mostrarse replegado al abrir la página
  const [isMotosExpanded, setIsMotosExpanded] = useState<boolean>(false);

  // Auto-expandir submenú ÚNICAMENTE si se selecciona un sub-ítem específico (apartados, ofertas, entregas)
  // Nunca expandir al montar la página ni al estar en resumen
  useEffect(() => {
    if (['apartados', 'ofertas', 'entregas'].includes(currentSection)) {
      setIsMotosExpanded(true);
    }
  }, [currentSection]);

  const menuItems: MenuItem[] = [
    { id: 'resumen', label: 'Resumen', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    {
      id: 'motos',
      label: 'Motocicletas',
      icon: <Bike className="w-4 h-4 shrink-0" />,
      subItems: [
        { id: 'apartados', label: 'Apartados', icon: <FileText className="w-3.5 h-3.5 shrink-0" /> },
        { id: 'ofertas', label: 'Ofertas', icon: <Tag className="w-3.5 h-3.5 shrink-0" /> },
        { id: 'entregas', label: 'Entregas', icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> },
      ],
    },
    { id: 'embudo', label: 'Embudo', icon: <Filter className="w-4 h-4 shrink-0" /> },
    { id: 'reportes', label: 'Reportes', icon: <PlusCircle className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR (hidden on mobile < md, visible on md+) */}
      <aside
        id="pulse-sidebar"
        className={`relative hidden md:flex md:flex-col justify-between shrink-0 select-none min-h-screen transition-all duration-300 ease-in-out z-30 ${
          isCollapsed ? 'w-18' : 'w-64'
        } bg-transparent border-r border-white/10`}
      >
        {/* Main Content Area in Sidebar */}
        <div className="relative z-10">
          {/* Top Branding Bar */}
          <div
            className={`border-b border-white/5 transition-all duration-300 ${
              isCollapsed ? 'p-3 py-4 flex flex-col items-center gap-2' : 'p-5 pb-4'
            }`}
          >
            {isCollapsed ? (
              /* Collapsed State Header */
              <div className="flex flex-col items-center gap-2 w-full">
                <button
                  id="sidebar-expand-header-btn"
                  type="button"
                  onClick={onToggleCollapse}
                  className="group flex flex-col items-center gap-1 p-1 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  title="Expandir menú lateral"
                >
                  <MotoluvIsotype withBackground={true} className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  <span className="text-[9px] font-black text-red-500 tracking-wider font-tech">PULSE</span>
                </button>
                {onToggleCollapse && (
                  <button
                    id="sidebar-expand-toggle-icon"
                    type="button"
                    onClick={onToggleCollapse}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="Expandir menú"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                  </button>
                )}
              </div>
            ) : (
              /* Expanded State Header */
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Real Motoluv Isotype */}
                  <MotoluvIsotype withBackground={true} className="w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black tracking-widest text-white font-display">MOTOLUV</span>
                      <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-950/70 border border-red-800/50">
                        PULSE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Retract / Collapse Button */}
                {onToggleCollapse && (
                  <button
                    id="collapse-sidebar-btn"
                    type="button"
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer shrink-0"
                    title="Contraer menú (Pantalla completa para métricas)"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation List */}
          <nav className={`space-y-1 mt-2 ${isCollapsed ? 'p-2' : 'p-3'}`}>
            {menuItems.map((item) => {
              if (item.subItems) {
                const isDirectActive = currentSection === item.id;
                const hasChildActive = item.subItems.some((s) => s.id === currentSection);
                const isSectionHighlighted = isDirectActive || hasChildActive;

                if (isCollapsed) {
                  // Collapsed parent + child subitems as compact icons
                  return (
                    <div key={item.id} className="space-y-1 py-1 flex flex-col items-center">
                      <button
                        id={`nav-${item.id}`}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          setIsMotosExpanded((prev) => !prev);
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group cursor-pointer ${
                          isDirectActive
                            ? 'bg-red-600/20 text-white border border-red-600/40 shadow-[0_0_10px_rgba(255,30,39,0.3)]'
                            : isSectionHighlighted
                            ? 'text-red-400 bg-white/5'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                        }`}
                        title={item.label}
                      >
                        {item.icon}
                        {isDirectActive && (
                          <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(255,30,39,0.9)]" />
                        )}
                      </button>

                      {/* Submenu icons for quick direct access */}
                      <div className="flex flex-col items-center gap-1 pt-1 border-t border-white/5 w-8">
                        {item.subItems.map((sub) => {
                          const isSubActive = currentSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              id={`nav-${sub.id}`}
                              type="button"
                              onClick={() => onSelectSection(sub.id)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md text-xs transition-all relative group cursor-pointer ${
                                isSubActive
                                  ? 'bg-red-600/25 text-red-300 font-bold border border-red-600/40'
                                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                              title={sub.label}
                            >
                              {sub.icon}
                              {isSubActive && (
                                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-red-600 rounded-r" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Expanded Motocicletas Menu Item
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center">
                      <button
                        id={`nav-${item.id}`}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          setIsMotosExpanded((prev) => !prev);
                        }}
                        className={`flex-1 flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                          isDirectActive
                            ? 'bg-red-600/20 text-white border border-red-600/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                            : isSectionHighlighted
                            ? 'text-zinc-200 bg-white/5'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                        }`}
                      >
                        <span className={isSectionHighlighted ? 'text-red-500' : 'text-zinc-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        {isDirectActive && (
                          <span className="ml-auto w-1.5 h-4 bg-red-600 rounded-full shadow-[0_0_8px_rgba(255,30,39,0.9)]" />
                        )}
                      </button>

                      {/* Toggle Submenu Chevron */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMotosExpanded((prev) => !prev);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors ml-1 cursor-pointer"
                        title={isMotosExpanded ? 'Contraer submenú' : 'Expandir submenú'}
                      >
                        {isMotosExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </button>
                    </div>

                    {/* Submenu: Apartados, Ofertas, Entregas */}
                    {isMotosExpanded && (
                      <div className="pl-6 ml-3 border-l border-white/10 space-y-1 py-1">
                        {item.subItems.map((sub) => {
                          const isSubActive = currentSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              id={`nav-${sub.id}`}
                              type="button"
                              onClick={() => onSelectSection(sub.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                                isSubActive
                                  ? 'bg-red-600/20 text-white font-semibold border border-red-600/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                              }`}
                            >
                              <span className={isSubActive ? 'text-red-500' : 'text-zinc-400'}>
                                {sub.icon}
                              </span>
                              <span>{sub.label}</span>
                              {isSubActive && (
                                <span className="ml-auto w-1 h-3 bg-red-600 rounded-full shadow-[0_0_6px_rgba(255,30,39,0.9)]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Menu Item
              const isActive = currentSection === item.id;

              if (isCollapsed) {
                return (
                  <div key={item.id} className="flex justify-center py-0.5">
                    <button
                      id={`nav-${item.id}`}
                      type="button"
                      onClick={() => onSelectSection(item.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-red-600/20 text-white border border-red-600/40 shadow-[0_0_10px_rgba(255,30,39,0.3)]'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                      }`}
                      title={item.label}
                    >
                      <span className={isActive ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200'}>
                        {item.icon}
                      </span>
                      {isActive && (
                        <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-600 rounded-l shadow-[0_0_6px_rgba(255,30,39,0.9)]" />
                      )}
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-red-600/20 text-white border border-red-600/35 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-red-500' : 'text-zinc-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-4 bg-red-600 rounded-full shadow-[0_0_8px_rgba(255,30,39,0.9)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Translucent Motoluv Branding & Isotype */}
        <div className="relative z-10 p-3">
          {isCollapsed ? (
            /* Collapsed Bottom Badge */
            <div className="flex flex-col items-center py-3">
              <MotoluvIsotype className="w-5 h-5 text-red-500 opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            /* Expanded Manifesto Card with Motoluv Isotype Watermark */
            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#12151e]/60 to-[#0b0d13]/70 border border-white/5 shadow-lg backdrop-blur-md">
              {/* Watermark Isotype */}
              <div className="absolute -top-3 -right-3 opacity-20 pointer-events-none">
                <MotoluvIsotype className="w-24 h-24" />
              </div>

              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase font-tech">DATOS REALES</p>
                <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase font-tech">DECISIONES REALES</p>
                <p className="text-xs font-extrabold tracking-wide text-white uppercase mt-1 italic font-display">
                  MÁS MOTOS EN MOVIMIENTO.
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION (visible on < md, hidden on md+) */}
      <nav
        id="pulse-mobile-bottom-nav"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0c10]/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.7)] px-2 py-1.5"
      >
        {/* Floating Motos Submenu sheet on mobile when expanded */}
        {isMotosExpanded && (
          <div
            id="mobile-motos-popover"
            className="absolute bottom-full left-4 right-4 mb-2 p-3 rounded-2xl bg-[#0e1117]/95 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 z-50"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-tech">
                  Secciones de Motocicletas
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMotosExpanded(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/5"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="mobile-subnav-motos-all"
                onClick={() => {
                  onSelectSection('motos');
                  setIsMotosExpanded(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                  currentSection === 'motos'
                    ? 'bg-red-600/25 text-white border border-red-600/40'
                    : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-red-500" />
                <span>Catálogo General</span>
              </button>

              <button
                type="button"
                id="mobile-subnav-apartados"
                onClick={() => {
                  onSelectSection('apartados');
                  setIsMotosExpanded(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                  currentSection === 'apartados'
                    ? 'bg-red-600/25 text-white border border-red-600/40'
                    : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-red-500" />
                <span>Apartados</span>
              </button>

              <button
                type="button"
                id="mobile-subnav-ofertas"
                onClick={() => {
                  onSelectSection('ofertas');
                  setIsMotosExpanded(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                  currentSection === 'ofertas'
                    ? 'bg-red-600/25 text-white border border-red-600/40'
                    : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-red-500" />
                <span>Ofertas</span>
              </button>

              <button
                type="button"
                id="mobile-subnav-entregas"
                onClick={() => {
                  onSelectSection('entregas');
                  setIsMotosExpanded(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                  currentSection === 'entregas'
                    ? 'bg-red-600/25 text-white border border-red-600/40'
                    : 'bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                <span>Entregas</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-around">
          {/* 1. Resumen */}
          <button
            id="mobile-nav-resumen"
            type="button"
            onClick={() => {
              onSelectSection('resumen');
              setIsMotosExpanded(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              currentSection === 'resumen'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentSection === 'resumen' ? 'bg-red-600/20 text-red-400 border border-red-600/30' : ''
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Resumen</span>
          </button>

          {/* 2. Motos (Toggles sub-menu popover or navigates) */}
          <button
            id="mobile-nav-motos"
            type="button"
            onClick={() => {
              onSelectSection('motos');
              setIsMotosExpanded((prev) => !prev);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[44px] rounded-xl transition-all relative cursor-pointer ${
              isMotosActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg relative ${
                isMotosActive ? 'bg-red-600/20 text-red-400 border border-red-600/30' : ''
              }`}
            >
              <Bike className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(255,30,39,0.9)]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight flex items-center gap-0.5">
              Motos
              <ChevronDown
                className={`w-2.5 h-2.5 transition-transform duration-200 ${
                  isMotosExpanded ? 'rotate-180 text-red-400' : 'text-zinc-500'
                }`}
              />
            </span>
          </button>

          {/* 3. Embudo */}
          <button
            id="mobile-nav-embudo"
            type="button"
            onClick={() => {
              onSelectSection('embudo');
              setIsMotosExpanded(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              currentSection === 'embudo' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentSection === 'embudo' ? 'bg-red-600/20 text-red-400 border border-red-600/30' : ''
              }`}
            >
              <Filter className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Embudo</span>
          </button>

          {/* 4. Reportes */}
          <button
            id="mobile-nav-reportes"
            type="button"
            onClick={() => {
              onSelectSection('reportes');
              setIsMotosExpanded(false);
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[44px] rounded-xl transition-all cursor-pointer ${
              currentSection === 'reportes' ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                currentSection === 'reportes' ? 'bg-red-600/20 text-red-400 border border-red-600/30' : ''
              }`}
            >
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Reportes</span>
          </button>

          {/* 5. Conexión DB trigger modal on mobile */}
          {onOpenConnectionModal && (
            <button
              id="mobile-nav-connection"
              type="button"
              onClick={onOpenConnectionModal}
              className="flex flex-col items-center justify-center py-1.5 px-2 min-w-[48px] min-h-[44px] rounded-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              title="Estado de base de datos"
            >
              <div
                className={`p-1 rounded-lg border ${
                  connection?.connected
                    ? 'bg-emerald-950/40 border-emerald-800/40'
                    : 'bg-red-950/40 border-red-800/40'
                }`}
              >
                <span
                  className={`block w-2.5 h-2.5 rounded-full ${
                    connection?.connected
                      ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-[9px] mt-0.5 text-zinc-500 font-mono">DB</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
