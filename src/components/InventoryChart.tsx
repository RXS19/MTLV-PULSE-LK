import React, { useState } from 'react';
import { InventoryBlockData } from '../types.js';
import {
  Bike,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';

interface InventoryChartProps {
  inventoryBlock?: InventoryBlockData;
  isLoading?: boolean;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({
  inventoryBlock,
  isLoading = false,
}) => {
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);

  const publicadas = inventoryBlock?.motosPublicadas || {
    count: 0,
    isAvailable: false,
    unavailableMessage: 'Esperando respuesta del servidor',
  };

  const conOferta = inventoryBlock?.motosConOferta || {
    count: 0,
    isAvailable: false,
    unavailableMessage: 'Esperando respuesta del servidor',
  };

  const apartadas = inventoryBlock?.motosApartadas || {
    count: 0,
    isAvailable: false,
    unavailableMessage: 'Esperando respuesta del servidor',
  };

  // Real unique motorcycle count (guaranteed no duplication)
  const totalUniqueMotos = inventoryBlock?.totalUniqueMotos ?? publicadas.count ?? 0;

  // Status slices (each moto has strictly 1 status, so slices sum to 100% and totalUniqueMotos)
  const rawSlices = inventoryBlock?.statusSlices && inventoryBlock.statusSlices.length > 0
    ? inventoryBlock.statusSlices
    : publicadas.isAvailable
    ? [
        {
          status: 'PUBLICADA',
          count: publicadas.count,
          percentage: 100,
          color: '#ff1e27',
        },
      ]
    : [];

  // Filter out any zero slices for the wheel rendering if other slices exist, but keep them in breakdown if needed
  const validSlices = rawSlices.filter((s) => s.count > 0);
  const activeSlices = validSlices.length > 0 ? validSlices : rawSlices;

  // SVG Donut Calculations
  const radius = 85;
  const strokeWidth = 24;
  const activeStrokeWidth = 30;
  const circumference = 2 * Math.PI * radius; // ~534.07
  const gap = activeSlices.length > 1 ? 2.5 : 0;

  // Prepare slices with cumulative angles and stroke offsets
  let accumulatedLength = 0;
  const wheelSlices = activeSlices.map((slice, index) => {
    const slicePercentage = totalUniqueMotos > 0 ? (slice.count / totalUniqueMotos) * 100 : 0;
    const arcLength = (slicePercentage / 100) * circumference;
    const dashLength = Math.max(0, arcLength - gap);
    const offset = accumulatedLength;
    accumulatedLength += arcLength;

    return {
      ...slice,
      index,
      slicePercentage,
      dashLength,
      offset,
    };
  });

  const activeHoveredSlice =
    hoveredSliceIndex !== null ? wheelSlices[hoveredSliceIndex] ?? null : null;

  return (
    <div
      id="inventory-block-card"
      className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between shadow-sm min-h-[380px]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3.5 border-b border-[#1a1e27] gap-2">
        <div>
          <h3 className="text-xs font-black tracking-wider text-white uppercase font-display">
            MOTOS EN INVENTARIO
          </h3>
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
            Inventario real • Cada motocicleta pertenece estrictamente a 1 estado sin duplicación
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <RefreshCw className="w-3.5 h-3.5 text-red-500 animate-spin" />}
          <div className="px-2.5 py-1 rounded-md bg-[#161a22] border border-[#232936] text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
            <span className="text-zinc-400">Total global:</span>
            <span className="font-bold text-white text-xs">{totalUniqueMotos.toLocaleString('es-MX')}</span>
            <span className="text-[10px] text-zinc-400">motos</span>
          </div>
        </div>
      </div>

      {/* Main Wheel + Breakdown Layout */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-44 h-44 rounded-full border-4 border-zinc-800 border-t-red-600 animate-spin" />
          <p className="text-xs text-zinc-400 font-mono animate-pulse">
            Consultando inventario en tiempo real...
          </p>
        </div>
      ) : !publicadas.isAvailable && totalUniqueMotos === 0 && rawSlices.length === 0 ? (
        <div className="py-10">
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                Datos de inventario no disponibles
              </h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono leading-relaxed">
                {publicadas.unavailableMessage || 'No se pudo obtener el inventario de la base de datos.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-center">
          {/* Wheel Chart (Gráfica de Rueda) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="relative w-[240px] h-[240px] flex items-center justify-center">
              <svg
                id="inventory-wheel-svg"
                viewBox="0 0 240 240"
                className="w-full h-full transform -rotate-90 select-none"
              >
                {/* Background Ring Track */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="#1c212c"
                  strokeWidth={strokeWidth}
                />

                {/* Slices */}
                {totalUniqueMotos > 0 &&
                  wheelSlices.map((slice) => {
                    const isHovered = hoveredSliceIndex === slice.index;
                    return (
                      <circle
                        key={`${slice.status}-${slice.index}`}
                        id={`wheel-slice-${slice.status.toLowerCase().replace(/\s+/g, '-')}`}
                        cx="120"
                        cy="120"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? activeStrokeWidth : strokeWidth}
                        strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                        strokeDashoffset={-slice.offset}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredSliceIndex(slice.index)}
                        onMouseLeave={() => setHoveredSliceIndex(null)}
                      />
                    );
                  })}
              </svg>

              {/* Center Metrics (Interactive) */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4"
                id="inventory-wheel-center"
              >
                {activeHoveredSlice ? (
                  <div className="animate-in fade-in duration-150">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate max-w-[130px]">
                      {activeHoveredSlice.status}
                    </span>
                    <span
                      className="text-3xl font-black font-display tracking-tight block my-0.5"
                      style={{ color: activeHoveredSlice.color }}
                    >
                      {activeHoveredSlice.count.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-300 block">
                      {activeHoveredSlice.slicePercentage.toFixed(1)}% del total
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                      TOTAL REAL
                    </span>
                    <span className="text-3xl font-black text-white font-display tracking-tight block my-0.5">
                      {totalUniqueMotos.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      MOTOS ÚNICAS
                    </span>
                    <span className="inline-block mt-1 text-[8px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Sin duplicados
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-mono text-center mt-2">
              Pasa el cursor sobre los arcos de la rueda para inspeccionar cada estado.
            </p>
          </div>

          {/* Right Column: Status Breakdown & Unique Attributes */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {/* Status Slices List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-1 border-b border-[#1b1f28]">
                <span>Desglose por estado en BD</span>
                <span>Conteo • %</span>
              </div>

              {rawSlices.length === 0 ? (
                <div className="py-4 text-center text-xs text-zinc-400">
                  Sin estados registrados
                </div>
              ) : (
                <div className="space-y-2">
                  {rawSlices.map((slice, idx) => {
                    const isHovered = hoveredSliceIndex === idx;
                    const percent = totalUniqueMotos > 0 ? (slice.count / totalUniqueMotos) * 100 : 0;

                    return (
                      <div
                        key={slice.status}
                        id={`legend-status-${slice.status.toLowerCase().replace(/\s+/g, '-')}`}
                        onMouseEnter={() => setHoveredSliceIndex(idx)}
                        onMouseLeave={() => setHoveredSliceIndex(null)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-[#181d26] border-zinc-700 shadow-sm'
                            : 'bg-[#0f1116] border-[#1d222c] hover:border-[#272e3c]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: slice.color }}
                            />
                            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide truncate">
                              {slice.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-black text-white">
                              {slice.count.toLocaleString('es-MX')}{' '}
                              <span className="text-[10px] text-zinc-400 font-normal">motos</span>
                            </span>
                            <span className="text-[11px] font-bold text-zinc-400">
                              ({percent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#171a22] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(2, percent))}%`,
                              backgroundColor: slice.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Overlapping Attributes (Apartados & Ofertas) */}
            <div className="pt-2 border-t border-[#1a1e27] space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Atributos adicionales (sin duplicar motos):
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Apartadas */}
                <div
                  id="attr-apartadas"
                  className="p-2.5 rounded-lg bg-[#0d0f14] border border-[#1e232e] flex flex-col justify-between"
                  title="Motocicletas distintas con un apartado vigente"
                >
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium">
                    <FileText className="w-3 h-3 text-red-400" />
                    <span className="uppercase tracking-wider">Apartadas</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-white font-display">
                      {apartadas.isAvailable ? apartadas.count.toLocaleString('es-MX') : '—'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">vigentes</span>
                  </div>
                </div>

                {/* Con Ofertas */}
                <div
                  id="attr-con-oferta"
                  className="p-2.5 rounded-lg bg-[#0d0f14] border border-[#1e232e] flex flex-col justify-between"
                  title="Motocicletas distintas con al menos 1 oferta registrada"
                >
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium">
                    <Tag className="w-3 h-3 text-red-400" />
                    <span className="uppercase tracking-wider">Con Oferta</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-white font-display">
                      {conOferta.isAvailable ? conOferta.count.toLocaleString('es-MX') : '—'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">motos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Notes & Integrity Guarantees */}
      <div className="pt-3 border-t border-[#1a1e27] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>
            Garantía de integridad: Cada motocicleta se contabiliza una única vez según su estado.
          </span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 font-mono shrink-0">
          <Info className="w-3 h-3 text-zinc-400" />
          <span>Suma de gajos = {totalUniqueMotos} motos (100%)</span>
        </div>
      </div>
    </div>
  );
};
