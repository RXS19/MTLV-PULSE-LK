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
  ChevronRight
} from 'lucide-react';
import { NavSection, ConnectionStatusInfo } from '../types.js';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  connection?: ConnectionStatusInfo;
  onOpenConnectionModal?: () => void;
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
    { id: 'resumen', label: 'Resumen', icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: 'motos',
      label: 'Motocicletas',
      icon: <Bike className="w-4 h-4" />,
      subItems: [
        { id: 'apartados', label: 'Apartados', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'ofertas', label: 'Ofertas', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'entregas', label: 'Entregas', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
      ],
    },
    { id: 'embudo', label: 'Embudo', icon: <Filter className="w-4 h-4" /> },
    { id: 'reportes', label: 'Reportes', icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <aside
      id="pulse-sidebar"
      className="w-64 bg-[#0e1014] border-r border-[#1a1e26] flex flex-col justify-between shrink-0 select-none min-h-screen"
    >
      {/* Top Branding */}
      <div>
        <div className="p-6 pb-5 border-b border-[#181c24]">
          <div className="flex items-center gap-3">
            {/* Motoluv 3-slash logo badge */}
            <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center border border-red-600/40 shadow-inner group">
              <div className="flex -space-x-1 items-center transform -skew-x-12">
                <span className="w-1.5 h-5 bg-red-600 rounded-xs shadow-[0_0_8px_rgba(255,30,39,0.8)]"></span>
                <span className="w-1.5 h-5 bg-red-500 rounded-xs ml-1"></span>
                <span className="w-1.5 h-5 bg-red-700 rounded-xs ml-1"></span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black tracking-widest text-white font-display">MOTOLUV</span>
                <span className="text-[10px] font-bold text-red-500 tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-950/60 border border-red-800/40">
                  PULSE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isDirectActive = currentSection === item.id;
              const hasChildActive = item.subItems.some((s) => s.id === currentSection);
              const isSectionHighlighted = isDirectActive || hasChildActive;

              return (
                <div key={item.id} className="space-y-1">
                  {/* Parent Motocicletas Menu Item */}
                  <div className="flex items-center">
                    <button
                      id={`nav-${item.id}`}
                      onClick={() => {
                        onSelectSection(item.id);
                        setIsMotosExpanded(true);
                      }}
                      className={`flex-1 flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
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
                      className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#151820] rounded-lg transition-colors ml-1"
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
                            onClick={() => onSelectSection(sub.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
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

            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
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

      {/* Bottom Section: Decorative branding */}
      <div className="p-4 space-y-4">
        {/* Diagonal Motoluv Red Art & Brand Stamped Manifesto */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#12141a] to-[#0a0b0e] border border-[#1e232d]">
          {/* 3 Red Slanted Bars */}
          <div className="absolute -top-3 -right-2 opacity-35 pointer-events-none flex -space-x-2 transform -skew-x-12">
            <div className="w-3.5 h-20 bg-red-600 rounded-sm"></div>
            <div className="w-3.5 h-20 bg-red-500 rounded-sm ml-2"></div>
            <div className="w-3.5 h-20 bg-red-700 rounded-sm ml-2"></div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">DATOS REALES</p>
            <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">DECISIONES REALES</p>
            <p className="text-xs font-extrabold tracking-wide text-white uppercase mt-1 italic font-display">
              MÁS MOTOS EN MOVIMIENTO.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
