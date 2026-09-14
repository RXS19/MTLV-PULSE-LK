import React from 'react';
import {
  Users,
  Bike,
  FileText,
  Tag,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
      icon: <Users className="w-4 h-4 text-zinc-400" />,
      data: users,
    },
    {
      id: 'kpi-inventory',
      title: 'MOTOS EN INVENTARIO',
      icon: <Bike className="w-4 h-4 text-zinc-400" />,
      data: inventory,
    },
    {
      id: 'kpi-apartados',
      title: 'APARTADOS',
      icon: <FileText className="w-4 h-4 text-zinc-400" />,
      data: apartados,
    },
    {
      id: 'kpi-offers',
      title: 'OFERTAS',
      icon: <Tag className="w-4 h-4 text-zinc-400" />,
      data: offers,
    },
    {
      id: 'kpi-deliveries',
      title: 'ENTREGAS',
      icon: <CheckCircle className="w-4 h-4 text-zinc-400" />,
      data: deliveries,
    },
  ];

  return (
    <section id="pulse-kpis" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const { data } = card;

          return (
            <div
              key={card.id}
              id={card.id}
              className="relative overflow-hidden bg-[#111318] hover:bg-[#151820] border border-[#1f242e] hover:border-[#2a313e] rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-sm group"
            >
              {/* Header: Icon & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-[#181b22] border border-[#262b36] group-hover:border-red-500/30 transition-colors">
                  {card.icon}
                </span>
                <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase truncate">
                  {card.title}
                </span>
              </div>

              {/* Main Content */}
              {data.isAvailable ? (
                <div className="mt-1">
                  {/* Big Number */}
                  <div className="text-2xl lg:text-3xl font-black text-white tracking-tight font-display">
                    {data.total.toLocaleString('es-MX')}
                  </div>

                  {/* Variation & Dynamic Sparkline */}
                  <div className="flex items-end justify-between mt-2 pt-1 border-t border-[#1a1d25]">
                    {/* Variation text */}
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      {data.changePercent !== null ? (
                        <>
                          {(data.trend === 'up' || (data.changePercent !== null && data.changePercent > 0)) && (
                            <span className="flex items-center text-emerald-400 font-bold">
                              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                              +{data.changePercent}%
                            </span>
                          )}
                          {(data.trend === 'down' || (data.changePercent !== null && data.changePercent < 0)) && (
                            <span className="flex items-center text-rose-400 font-bold">
                              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                              {data.changePercent}%
                            </span>
                          )}
                          {data.trend === 'neutral' || data.changePercent === 0 ? (
                            <span className="flex items-center text-zinc-400 font-bold">
                              <Minus className="w-3.5 h-3.5 mr-0.5" />
                              0%
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-zinc-400 font-medium">N/A</span>
                      )}
                      <span className="text-zinc-400 text-[10px] truncate">vs. periodo anterior</span>
                    </div>

                    {/* Dynamic Trend Sparkline */}
                    {(() => {
                      const isUp =
                        data.trend === 'up' ||
                        (data.changePercent !== null && data.changePercent > 0);
                      const isDown =
                        data.trend === 'down' ||
                        (data.changePercent !== null && data.changePercent < 0);

                      const strokeColor = isUp ? '#10b981' : isDown ? '#ef4444' : '#71717a';
                      const dropShadowClass = isUp
                        ? 'drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]'
                        : isDown
                        ? 'drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]'
                        : 'drop-shadow-[0_0_2px_rgba(113,113,122,0.4)]';

                      const pathD = isUp
                        ? 'M 2 16 C 14 15, 24 9, 34 6 S 44 4, 48 3'
                        : isDown
                        ? 'M 2 4 C 14 5, 24 11, 34 14 S 44 16, 48 17'
                        : 'M 2 10 L 48 10';

                      const circleY = isUp ? 3 : isDown ? 17 : 10;

                      return (
                        <div
                          className="w-12 h-5 shrink-0 opacity-85 group-hover:opacity-100 transition-opacity"
                          title={
                            isUp
                              ? `Tendencia al alza (+${data.changePercent ?? 0}%)`
                              : isDown
                              ? `Tendencia a la baja (${data.changePercent ?? 0}%)`
                              : 'Tendencia neutral (0%)'
                          }
                        >
                          <svg viewBox="0 0 50 20" className="w-full h-full overflow-visible">
                            <path
                              d={pathD}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth="2"
                              strokeLinecap="round"
                              className={dropShadowClass}
                            />
                            <circle
                              cx="48"
                              cy={circleY}
                              r={isUp || isDown ? '2.5' : '1.5'}
                              fill={strokeColor}
                              className={isUp || isDown ? 'animate-pulse' : ''}
                            />
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-[#1a1d25]">
                  <div className="flex items-start gap-2 text-zinc-400 text-xs" title={data.unavailableMessage}>
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {data.unavailableMessage || 'Métrica no disponible con la estructura actual de datos.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
