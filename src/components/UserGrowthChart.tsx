import React, { useState } from 'react';
import { UserGrowthPoint } from '../types.js';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
  changePercent: number | null;
  isAvailable: boolean;
  unavailableMessage?: string;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({
  data,
  changePercent,
  isAvailable,
  unavailableMessage,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!isAvailable || data.length === 0) {
    return (
      <div
        id="user-growth-card"
        className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1f28]">
          <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase font-display">
            CRECIMIENTO DE USUARIOS
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">Desde 14 sep 2026</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-400 max-w-sm">
            {unavailableMessage || 'No se registraron nuevos usuarios a partir del 14 de septiembre de 2026 o la conexión aún no está activa.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate scales for SVG rendering
  const maxCumulative = Math.max(...data.map((d) => d.cumulativeUsers), 10);
  const maxNewUsers = Math.max(...data.map((d) => d.newUsers), 5);

  const chartWidth = 580;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? innerWidth / (pointsCount - 1) : innerWidth / 2;

  // Build SVG path for cumulative line
  const linePoints = data.map((d, i) => {
    const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
    const y = paddingTop + innerHeight - (d.cumulativeUsers / maxCumulative) * innerHeight;
    return { x, y, data: d };
  });

  const linePathD = linePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  return (
    <div
      id="user-growth-card"
      className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px] shadow-sm relative overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1a1e27]">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-white uppercase font-display flex items-center gap-2">
            CRECIMIENTO DE USUARIOS
          </h3>
          <div className="flex items-center gap-4 mt-1 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_6px_rgba(255,30,39,0.8)]" />
              Nuevos usuarios
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-200" />
              Usuarios acumulados
            </span>
          </div>
        </div>

        {/* Change badge - Dynamic according to trend */}
        {changePercent !== null && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border ${
              changePercent > 0
                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
                : changePercent < 0
                ? 'text-rose-400 bg-rose-950/40 border-red-800/40'
                : 'text-zinc-400 bg-zinc-900 border-zinc-800'
            }`}
          >
            {changePercent > 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : changePercent < 0 ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`} vs. periodo anterior
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative flex-1 mt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          {/* Y Axis Grid Lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = paddingTop + innerHeight * (1 - ratio);
            const val = Math.round(maxCumulative * ratio);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1c212c"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Bars: Daily New Users */}
          {data.map((d, i) => {
            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2) - 4;
            const barHeight = Math.max(3, (d.newUsers / maxNewUsers) * (innerHeight * 0.45));
            const y = paddingTop + innerHeight - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={`bar-${i}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={8}
                  height={barHeight}
                  rx={2}
                  fill={isHovered ? '#ff4d54' : '#ff1e27'}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-colors"
                />
              </g>
            );
          })}

          {/* Line: Cumulative Users */}
          <path
            d={linePathD}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />

          {/* Points on Cumulative Line */}
          {linePoints.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={`pt-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5 : 3}
                fill="#0f1117"
                stroke="#ffffff"
                strokeWidth={isHovered ? 2.5 : 1.5}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all"
              />
            );
          })}

          {/* X Axis Date labels */}
          {data.map((d, i) => {
            // Show dates spaced nicely
            if (pointsCount > 8 && i % Math.ceil(pointsCount / 6) !== 0 && i !== pointsCount - 1) {
              return null;
            }
            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            return (
              <text
                key={`date-${i}`}
                x={x}
                y={chartHeight - 6}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
                fontFamily="sans-serif"
              >
                {d.displayDate}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-[#191d26] border border-[#2b3242] px-3 py-1.5 rounded-lg shadow-xl text-xs z-30 pointer-events-none flex items-center gap-3"
          >
            <span className="font-semibold text-zinc-300">{data[hoveredIdx].displayDate}:</span>
            <span className="text-red-400 font-bold">+{data[hoveredIdx].newUsers} nuevos</span>
            <span className="text-zinc-400">|</span>
            <span className="text-white font-bold">{data[hoveredIdx].cumulativeUsers} acumulados</span>
          </div>
        )}
      </div>
    </div>
  );
};
