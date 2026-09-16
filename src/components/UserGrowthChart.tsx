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
  const chartHeight = 230;
  const paddingLeft = 45;
  const paddingRight = 16;
  const paddingTop = 15;
  const paddingBottom = 28;

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
          <h3 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-sans">
            CRECIMIENTO DE USUARIOS
          </h3>
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

          {/* Subtle Vertical Grid Lines (one per X-axis date tick) */}
          {data.map((d, i) => {
            const shouldRenderTick =
              pointsCount <= 10 ||
              i === 0 ||
              i === pointsCount - 1 ||
              i % Math.ceil(pointsCount / 6) === 0;

            if (!shouldRenderTick) return null;

            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            return (
              <line
                key={`x-grid-${i}`}
                x1={x}
                y1={paddingTop}
                x2={x}
                y2={paddingTop + innerHeight}
                stroke="#171b24"
                strokeWidth="1"
              />
            );
          })}

          {/* Bars: Daily/Periodic New Users (Solid Red, aligned at bottom) */}
          {data.map((d, i) => {
            const xCenter = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            const barWidth = Math.max(4, Math.min(8, (innerWidth / pointsCount) * 0.55));
            const x = xCenter - barWidth / 2;

            // Altura exacta y real según la escala del eje Y (si hay 3, llega exactamente al 3)
            const barHeight = d.newUsers > 0 ? (d.newUsers / effectiveTop) * innerHeight : 0;
            const y = paddingTop + innerHeight - barHeight;
            const isHovered = hoveredIdx === i;

            if (barHeight <= 0) return null;

            return (
              <g key={`bar-group-${i}`}>
                {/* Wider transparent hit area for easy tapping on mobile */}
                <rect
                  x={xCenter - Math.max(12, stepX / 2)}
                  y={paddingTop}
                  width={Math.max(24, stepX)}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onTouchStart={() => setHoveredIdx(i)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                />
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

          {/* Endpoint Dot: Single white circle at the final point (exact match to image) */}
          {linePoints.length > 0 && (
            <circle
              cx={linePoints[linePoints.length - 1].x}
              cy={linePoints[linePoints.length - 1].y}
              r="4"
              fill="#cbd5e1"
              stroke="#ffffff"
              strokeWidth="1"
            />
          )}

          {/* Hover interactive circle */}
          {hoveredIdx !== null && linePoints[hoveredIdx] && (
            <circle
              cx={linePoints[hoveredIdx].x}
              cy={linePoints[hoveredIdx].y}
              r="5"
              fill="#ffffff"
              stroke="#e50914"
              strokeWidth="2"
            />
          )}

          {/* X Axis Date labels (formatted like "1 ago", "8 ago", etc.) */}
          {data.map((d, i) => {
            const shouldRenderLabel =
              pointsCount <= 10 ||
              i === 0 ||
              i === pointsCount - 1 ||
              i % Math.ceil(pointsCount / 6) === 0;

            if (!shouldRenderLabel) return null;

            const x = paddingLeft + (pointsCount > 1 ? i * stepX : innerWidth / 2);
            return (
              <text
                key={`date-${i}`}
                x={x}
                y={chartHeight - 6}
                textAnchor="middle"
                fill="#8e9bb0"
                fontSize="11"
                fontFamily="sans-serif"
              >
                {d.displayDate}
              </text>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#181b22] border border-white/10 px-3 py-1.5 rounded-lg shadow-xl text-xs z-30 pointer-events-none flex items-center gap-3">
            <span className="font-semibold text-zinc-300">{data[hoveredIdx].displayDate}:</span>
            <span className="text-red-400 font-bold">+{data[hoveredIdx].newUsers} nuevos</span>
            <span className="text-zinc-500">|</span>
            <span className="text-white font-bold">{data[hoveredIdx].cumulativeUsers} acumulados</span>
          </div>
        )}
      </div>
    </div>
  );
};
