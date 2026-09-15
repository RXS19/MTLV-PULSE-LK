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
  const [isMotosExpanded, setIsMotosExpanded] = useState<boolean>(true);

  // Auto-expand Motocicletas submenu when any of its child sections is selected
  useEffect(() => {
    if (isMotosActive) {
      setIsMotosExpanded(true);
    }
  }, [currentSection, isMotosActive]);

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
    <aside
      id="pulse-sidebar"
      className={`relative ${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-[#0a0c10] border-r border-[#1a1e26] flex flex-col justify-between shrink-0 select-none min-h-screen transition-all duration-300 ease-in-out z-30`}
    >
      {/* Background Sport Motorcycle Image with subtle dark luxury overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-25 mix-blend-luminosity transform scale-105 transition-all duration-500"
        style={{ backgroundImage: "url('/images/sport-motorcycle-sidebar.jpg')" }}
      />
      {/* Multi-layered Dark Studio Overlays for 100% WCAG Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/95 via-[#0c0e14]/90 to-[#07080a]/98 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/70 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06070a] to-transparent pointer-events-none" />

      {/* Main Content Area in Sidebar */}
      <div className="relative z-10">
        {/* Top Branding Bar */}
        <div
          className={`border-b border-[#181c24] transition-all duration-300 ${
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
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#161a24] transition-colors cursor-pointer"
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
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#181c25] border border-transparent hover:border-[#262c3a] transition-all cursor-pointer shrink-0"
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
                      onClick={() => onSelectSection(item.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group cursor-pointer ${
                        isDirectActive
                          ? 'bg-red-600/20 text-white border border-red-600/40 shadow-[0_0_10px_rgba(255,30,39,0.3)]'
                          : isSectionHighlighted
                          ? 'text-red-400 bg-[#161a24]'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151820]'
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                      {isDirectActive && (
                        <span className="absolute right-1 top-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_6px_rgba(255,30,39,0.9)]" />
                      )}
                    </button>

                    {/* Submenu icons for quick direct access */}
                    <div className="flex flex-col items-center gap-1 pt-1 border-t border-[#1a1e27] w-8">
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
                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#14171e]'
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
                        setIsMotosExpanded(true);
                      }}
                      className={`flex-1 flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                        isDirectActive
                          ? 'bg-red-600/15 text-white border border-red-600/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                          : isSectionHighlighted
                          ? 'text-zinc-200 bg-[#14171f]'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151820]'
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
                        setIsMotosExpanded(!isMotosExpanded);
                      }}
                      className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#151820] rounded-lg transition-colors ml-1 cursor-pointer"
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
                    <div className="pl-6 ml-3 border-l border-[#1d222c] space-y-1 py-1">
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
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#14171e]'
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
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151820]'
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
                    ? 'bg-red-600/15 text-white border border-red-600/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#151820]'
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

      {/* Bottom Section: Decorative Motoluv Branding & Isotype */}
      <div className="relative z-10 p-3">
        {isCollapsed ? (
          /* Collapsed Bottom Badge */
          <div className="flex flex-col items-center py-3">
            <MotoluvIsotype className="w-5 h-5 text-red-500 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        ) : (
          /* Expanded Manifesto Card with Motoluv Isotype Watermark */
          <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#12141a]/90 to-[#0a0b0e]/95 border border-[#1e232d] shadow-lg backdrop-blur-sm">
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
  );
};
