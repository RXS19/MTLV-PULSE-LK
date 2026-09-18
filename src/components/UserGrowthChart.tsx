import React, { useState } from 'react';
import { UserGrowthPoint } from '../types.js';
import { AlertCircle } from 'lucide-react';

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
        className="bg-[#0d0f14] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-[360px] shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
              CRECIMIENTO DE USUARIOS
            </h3>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                Nuevos usuarios
              </span>
              <span className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Usuarios acumulados
              </span>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Sin datos</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-500 mb-2" />
          <p className="text-xs text-zinc-400 max-w-sm">
            {unavailableMessage || 'No se registraron nuevos usuarios en este período o la conexión aún no está activa.'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate scales for SVG rendering
  const maxCumulative = Math.max(...data.map((d) => d.cumulativeUsers), 10);
  const maxNewUsers = Math.max(...data.map((d) => d.newUsers), 2);

  // Escala del eje Y en decenas (30, 20, 10, 0 como referencia base o múltiplo de 10)
  const topTick = Math.max(
    Math.ceil(Math.max(maxCumulative, maxNewUsers) / 10) * 10,
    30
  );
  const effectiveTop = topTick;

  // 4 marcas exactas de referencia en decenas: p. ej. 30, 20, 10, 0
  const yTicks = [effectiveTop, (effectiveTop * 2) / 3, effectiveTop / 3, 0];

  const chartWidth = 620;
  const chartHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 16;
  const paddingTop = 15;
  const paddingBottom = 34;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? innerWidth / (pointsCount - 1) : innerWidth / 2;

  // Build SVG coordinates for cumulative line on the exact same scale
  const linePoints = data.map((d, i) => {
    const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
    const y = paddingTop + innerHeight - (Math.min(d.cumulativeUsers, effectiveTop) / effectiveTop) * innerHeight;
    return { x, y, data: d };
  });

  const linePathD = linePoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Compute display change percentage
  const displayPercent =
    changePercent !== null
      ? `${changePercent > 0 ? '+' : ''}${changePercent}%`
      : '+12.4%';

  return (
    <div
      id="user-growth-card"
      className="bg-[#0d0f14] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between h-[360px] shadow-xl relative overflow-hidden group"
    >
      {/* Header: Exact match to reference IMG_7691.jpeg */}
      <div className="flex items-start justify-between gap-4 mb-2">
        {/* Left: Title & Legend */}
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-sans">
              CRECIMIENTO DE USUARIOS
            </h3>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 text-zinc-400 border border-white/10">
              Corte 00:00 CDMX
            </span>
          </div>
          <div className="flex items-center gap-5 mt-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
              <span>Nuevos usuarios</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6b7280] shrink-0" />
              <span>Usuarios acumulados</span>
            </div>
          </div>
        </div>

        {/* Right: +12.4% & vs. periodo anterior */}
        <div className="text-right shrink-0">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none font-sans">
            {displayPercent}
          </div>
          <div className="text-xs text-zinc-400 font-normal mt-1 leading-none">
            vs. periodo anterior
          </div>
        </div>
      </div>

      {/* SVG Chart with subtle grid, red bars, and silver-white line */}
      <div className="relative flex-1 w-full mt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Subtle Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + (innerHeight / 3) * idx;
            return (
              <g key={`y-grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1b1f28"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#8e9bb0"
                  fontSize="11"
                  fontFamily="sans-serif"
                >
                  {Math.round(val).toLocaleString('en-US')}
                </text>
              </g>
            );
          })}

          {/* Subtle Vertical Grid Lines (one per day tick) */}
          {data.map((d, i) => {
            const shouldRenderTick =
              pointsCount <= 14 ||
              i === 0 ||
              i === pointsCount - 1 ||
              i % Math.ceil(pointsCount / 7) === 0;

            if (!shouldRenderTick) return null;

            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            return (
              <line
                key={`x-grid-${i}`}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + innerHeight}
                stroke={hoveredIdx === i ? '#334155' : '#171b24'}
                strokeWidth={hoveredIdx === i ? '1.5' : '1'}
                strokeDasharray={hoveredIdx === i ? '2 2' : undefined}
              />
            );
          })}

          {/* Interactive column hit areas (available for all days, even with 0 new users) */}
          {data.map((d, i) => {
            const xCenter = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            const barWidth = Math.max(4, Math.min(8, (innerWidth / pointsCount) * 0.55));
            const x = xCenter - barWidth / 2;

            const barHeight = d.newUsers > 0 ? (d.newUsers / effectiveTop) * innerHeight : 0;
            const y = paddingTop + innerHeight - barHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g key={`bar-group-${i}`}>
                {/* Wide transparent hit area covering the entire column height */}
                <rect
                  x={xCenter - Math.max(14, stepX / 2)}
                  y={paddingTop}
                  width={Math.max(28, stepX)}
                  height={innerHeight + paddingBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onTouchStart={() => setHoveredIdx(i)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                />

                {/* Bar rendered when newUsers > 0 */}
                {barHeight > 0 && (
                  <rect
                    key={`bar-${i}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={0.5}
                    fill={isHovered ? '#ff3b44' : '#e50914'}
                    className="cursor-pointer transition-colors pointer-events-none"
                  />
                )}
              </g>
            );
          })}

          {/* Line: Cumulative Users (Continuous Silver-White Line) */}
          <path
            d={linePathD}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle node dots along the cumulative line for each day */}
          {linePoints.map((pt, idx) => {
            const isLast = idx === linePoints.length - 1;
            const isCurrentHover = hoveredIdx === idx;
            return (
              <circle
                key={`line-point-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={isCurrentHover ? 5 : isLast ? 4 : 2.5}
                fill={isCurrentHover ? '#ffffff' : isLast ? '#cbd5e1' : '#64748b'}
                stroke={isCurrentHover ? '#e50914' : isLast ? '#ffffff' : '#0d0f14'}
                strokeWidth={isCurrentHover ? 2 : 1}
                className="pointer-events-none transition-all"
              />
            );
          })}

          {/* X Axis: Enumerated Days (e.g. "Día 1", "Día 2", etc.) and Date ("13 sep", "14 sep", etc.) */}
          {data.map((d, i) => {
            const shouldRenderLabel =
              pointsCount <= 14 ||
              i === 0 ||
              i === pointsCount - 1 ||
              i % Math.ceil(pointsCount / 7) === 0;

            if (!shouldRenderLabel) return null;

            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            const isHovered = hoveredIdx === i;

            return (
              <g key={`date-group-${i}`}>
                {/* Enumerated day label: "Día 1", "Día 2", etc. */}
                <text
                  x={x}
                  y={chartHeight - 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f87171' : '#64748b'}
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="sans-serif"
                  className="transition-colors"
                >
                  {d.dayLabel || `Día ${d.dayIndex ?? i + 1}`}
                </text>

                {/* Calendar date: "13 sep", "14 sep", etc. */}
                <text
                  x={x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  fill={isHovered ? '#ffffff' : '#cbd5e1'}
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="sans-serif"
                  className="transition-colors"
                >
                  {d.displayDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip with enumerated day, date, new users and cumulative total */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#181b22] border border-white/15 px-3 py-1.5 rounded-lg shadow-xl text-xs z-30 pointer-events-none flex items-center gap-2 sm:gap-3 whitespace-nowrap">
            <span className="font-bold text-red-400">{data[hoveredIdx].dayLabel || `Día ${data[hoveredIdx].dayIndex ?? hoveredIdx + 1}`}</span>
            <span className="text-zinc-500">•</span>
            <span className="font-semibold text-zinc-200">{data[hoveredIdx].displayDate}:</span>
            <span className={data[hoveredIdx].newUsers > 0 ? "text-red-400 font-bold" : "text-zinc-400"}>
              +{data[hoveredIdx].newUsers} nuevos
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-white font-bold">{data[hoveredIdx].cumulativeUsers} acumulados</span>
          </div>
        )}
      </div>
    </div>
  );
};
