import React from 'react';
import {
  Users,
  FileText,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { KPIValue } from '../types.js';

interface KPICardsProps {
  users: KPIValue;
  inventory: KPIValue;
  apartados: KPIValue;
  offers: KPIValue;
  deliveries: KPIValue;
}

interface CardConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  data: KPIValue;
}

// Crisp motorcycle SVG icon matching the exact icon in the user's reference image
const MotorcycleIcon: React.FC<{ className?: string }> = ({ className = 'w-8 h-8 text-white' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Rear wheel */}
    <circle cx="5.5" cy="16" r="3.2" />
    <circle cx="5.5" cy="16" r="0.9" fill="currentColor" />
    {/* Front wheel */}
    <circle cx="18.5" cy="16" r="3.2" />
    <circle cx="18.5" cy="16" r="0.9" fill="currentColor" />
    {/* Frame / Engine block */}
    <path d="M5.5 16h3.2l2.3-4.2h4.2l1.8 4.2h1.5" />
    <path d="M10 11.8h4" />
    {/* Fuel tank & seat */}
    <path d="M7 11.5c1.2-1.2 2.8-1.5 4.5-1.5h1.8l1.8-3.2h2.2" />
    {/* Handlebars */}
    <path d="M15.5 6.8l1.3-1.3h2" />
    {/* Headlight */}
    <circle cx="19" cy="8.6" r="0.7" fill="currentColor" />
  </svg>
);

export const KPICards: React.FC<KPICardsProps> = ({
  users,
  inventory,
  apartados,
  offers,
  deliveries,
}) => {
  const cards: CardConfig[] = [
    {
      id: 'kpi-users',
      title: 'USUARIOS REGISTRADOS',
      icon: <Users className="w-7 h-7 text-white stroke-[1.8]" />,
      data: users,
    },
    {
      id: 'kpi-inventory',
      title: 'MOTOS EN INVENTARIO',
      icon: <MotorcycleIcon className="w-7 h-7 text-white" />,
      data: inventory,
    },
    {
      id: 'kpi-apartados',
      title: 'APARTADOS',
      icon: <FileText className="w-7 h-7 text-white stroke-[1.8]" />,
      data: apartados,
    },
    {
      id: 'kpi-offers',
      title: 'OFERTAS',
      icon: <Tag className="w-7 h-7 text-white stroke-[1.8]" />,
      data: offers,
    },
    {
      id: 'kpi-deliveries',
      title: 'ENTREGAS',
      icon: <CheckCircle2 className="w-7 h-7 text-white stroke-[1.8]" />,
      data: deliveries,
    },
  ];

  return (
    <section id="pulse-kpis" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const { data } = card;
          const isUp =
            data.trend === 'up' ||
            (data.changePercent !== null && data.changePercent > 0);
          const isDown =
            data.trend === 'down' ||
            (data.changePercent !== null && data.changePercent < 0);

          return (
            <div
              key={card.id}
              id={card.id}
              className="relative overflow-hidden bg-[#0d0f14] hover:bg-[#11131a] border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-4.5 transition-all duration-200 flex items-center gap-3.5 sm:gap-4 shadow-xl group"
            >
              {/* Left Rounded Dark Icon Box */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#181b22] border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#1e222b] transition-colors">
                {card.icon}
              </div>

              {/* Right Content Area */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                {/* Top Label */}
                <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-zinc-300 uppercase truncate block">
                  {card.title}
                </span>

                {data.isAvailable ? (
                  <>
                    {/* Big Numeric Value */}
                    <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans leading-none my-1">
                      {data.total.toLocaleString('es-MX')}
                    </div>

                    {/* Bottom Row: Trend and Red/Blue Sparkline */}
                    <div className="flex items-center justify-between gap-2 mt-1 relative">
                      {/* Left: Arrow + Percentage and "vs. período anterior" */}
                      <div className="flex flex-col min-w-0 pr-1">
                        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm">
                          {data.changePercent !== null ? (
                            isUp ? (
                              <span className="text-emerald-400 flex items-center font-extrabold">
                                <span className="mr-0.5 text-base leading-none">↑</span>
                                +{Math.abs(data.changePercent)}%
                              </span>
                            ) : isDown ? (
                              <span className="text-red-500 flex items-center font-extrabold">
                                <span className="mr-0.5 text-base leading-none">↓</span>
                                -{Math.abs(data.changePercent)}%
                              </span>
                            ) : (
                              <span className="text-zinc-400 flex items-center font-bold">
                                <span className="mr-0.5">−</span>
                                0.0%
                              </span>
                            )
                          ) : (
                            <span className="text-zinc-400 text-xs font-medium">N/A</span>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-zinc-400 font-normal leading-tight mt-0.5 truncate">
                          vs. período anterior
                        </span>
                      </div>

                      {/* Right: Dynamic Wave Sparkline (Centered vertically, constrained so it never overlaps any text) */}
                      {(() => {
                        const strokeColor = isUp ? '#10b981' : isDown ? '#ef4444' : '#71717a';
                        const glowColor = isUp
                          ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]'
                          : isDown
                          ? 'drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                          : '';

                        const linePath = isDown
                          ? 'M 0 6 L 8 10 L 15 8 L 26 16 L 35 14 L 46 22 L 56 20 L 68 28 L 73 27 L 80 32'
                          : isUp
                          ? 'M 0 30 L 8 26 L 15 28 L 26 20 L 35 22 L 46 14 L 56 16 L 68 8 L 73 9 L 80 4'
                          : 'M 0 18 L 80 18';

                        const fillPath = isDown
                          ? 'M 0 6 L 8 10 L 15 8 L 26 16 L 35 14 L 46 22 L 56 20 L 68 28 L 73 27 L 80 32 L 80 36 L 0 36 Z'
                          : isUp
                          ? 'M 0 30 L 8 26 L 15 28 L 26 20 L 35 22 L 46 14 L 56 16 L 68 8 L 73 9 L 80 4 L 80 36 L 0 36 Z'
                          : 'M 0 18 L 80 18 L 80 36 L 0 36 Z';

                        return (
                          <div className="w-14 sm:w-16 h-7 sm:h-8 shrink-0 relative flex items-center justify-center self-center overflow-hidden ml-auto rounded">
                            <svg
                              viewBox="0 0 80 36"
                              className="w-full h-full block"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <linearGradient
                                  id={`kpi-spark-grad-${card.id}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.45" />
                                  <stop offset="60%" stopColor={strokeColor} stopOpacity="0.12" />
                                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                                </linearGradient>
                              </defs>
                              {/* Gradient Fill under the curve */}
                              <path d={fillPath} fill={`url(#kpi-spark-grad-${card.id})`} />
                              {/* Main Stroke */}
                              <path
                                d={linePath}
                                fill="none"
                                stroke={strokeColor}
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={glowColor}
                              />
                            </svg>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="mt-1 flex items-start gap-1.5 text-zinc-400 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {data.unavailableMessage || 'Sin datos disponibles'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
