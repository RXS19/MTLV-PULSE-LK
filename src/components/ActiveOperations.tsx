import React from 'react';
import { ActiveOperationItem } from '../types.js';
import { Clock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActiveOperationsProps {
  activeOperations: {
    items: ActiveOperationItem[];
    isAvailable: boolean;
    unavailableMessage?: string;
  };
}

export const ActiveOperations: React.FC<ActiveOperationsProps> = ({ activeOperations }) => {
  const { items, isAvailable, unavailableMessage } = activeOperations;

  const getStageBadgeColor = (stage: string) => {
    const s = stage.toUpperCase();
    if (s.includes('APARTADO')) return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
    if (s.includes('OFERTA')) return 'bg-sky-950/60 text-sky-300 border-sky-800/40';
    if (s.includes('CONTRATO')) return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
    if (s.includes('ENTREGA')) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
    if (s.includes('PAGO') || s.includes('LIQUIDACION')) return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
    return 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50';
  };

  if (!isAvailable || items.length === 0) {
    return (
      <div
        id="active-operations-card"
        className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1f28]">
          <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase font-display">
            OPERACIONES EN PROCESO
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-400 max-w-sm">
            {unavailableMessage || 'No hay operaciones activas registradas en proceso.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="active-operations-card"
      className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px] shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a1e27]">
        <h3 className="text-xs font-bold tracking-wider text-white uppercase font-display flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          OPERACIONES EN PROCESO
        </h3>
        <span className="text-xs font-medium text-red-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors">
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider py-1.5 px-2 border-b border-[#181c24]">
        <div className="col-span-2">ID</div>
        <div className="col-span-4">MOTO</div>
        <div className="col-span-3">ETAPA</div>
        <div className="col-span-2 text-right">FECHA</div>
        <div className="col-span-1 text-right">DÍAS</div>
      </div>

      {/* Rows */}
      <div className="flex-1 flex flex-col justify-around my-1 overflow-y-auto divide-y divide-[#171a22]">
        {items.slice(0, 5).map((op, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 items-center py-2 px-2 hover:bg-[#151821] rounded transition-colors text-xs"
          >
            {/* ID */}
            <div className="col-span-2 font-mono text-[11px] text-zinc-300 font-semibold truncate">
              {op.id}
            </div>

            {/* Moto */}
            <div className="col-span-4 text-zinc-200 font-medium truncate text-[11px]">
              {op.moto}
            </div>

            {/* Etapa actual */}
            <div className="col-span-3 truncate">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border truncate max-w-full ${getStageBadgeColor(
                  op.currentStage
                )}`}
              >
                {op.currentStage}
              </span>
            </div>

            {/* Fecha */}
            <div className="col-span-2 text-right font-mono text-[10px] text-zinc-400">
              {op.date}
            </div>

            {/* Días */}
            <div className="col-span-1 text-right font-mono text-[11px] font-bold text-zinc-300">
              {op.daysElapsed}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1a1e27] text-[10px] text-zinc-400 flex items-center justify-between">
        <span>Excluye operaciones con delivery_status = 'COMPLETADA'</span>
        <span className="font-mono">Total activas: {items.length}</span>
      </div>
    </div>
  );
};
