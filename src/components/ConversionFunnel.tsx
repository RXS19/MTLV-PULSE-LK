import React from 'react';
import { FunnelStageItem } from '../types.js';
import { Filter, Users, Bike, FileText, Tag, CheckCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConversionFunnelProps {
  stages: FunnelStageItem[];
  isAvailable: boolean;
  unavailableMessage?: string;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({
  stages,
  isAvailable,
  unavailableMessage,
}) => {
  const getStageIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('usuario')) return <Users className="w-3.5 h-3.5 text-zinc-400" />;
    if (lower.includes('moto')) return <Bike className="w-3.5 h-3.5 text-zinc-400" />;
    if (lower.includes('apartado')) return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    if (lower.includes('aceptada')) return <CheckCheck className="w-3.5 h-3.5 text-zinc-400" />;
    if (lower.includes('oferta')) return <Tag className="w-3.5 h-3.5 text-zinc-400" />;
    if (lower.includes('entrega')) return <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />;
    return <Filter className="w-3.5 h-3.5 text-zinc-400" />;
  };

  if (!isAvailable || stages.length === 0) {
    return (
      <div
        id="conversion-funnel-card"
        className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1f28]">
          <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase font-display">
            EMBUDO DE CONVERSIÓN
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">100% Base Usuarios</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-400 max-w-sm">
            {unavailableMessage || 'Datos del embudo no disponibles en este momento.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="conversion-funnel-card"
      className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px] shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a1e27]">
        <h3 className="text-xs font-bold tracking-wider text-white uppercase font-display flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-red-500" />
          EMBUDO DE CONVERSIÓN
        </h3>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#171b24] px-2 py-0.5 rounded border border-[#232836]">
          Usuarios → Entregas
        </span>
      </div>

      {/* Funnel Rows */}
      <div className="flex-1 flex flex-col justify-around my-2 space-y-2">
        {stages.map((stage, idx) => {
          const widthPercent = Math.max(
            4,
            stage.percentageOfUsers !== null ? Math.min(100, stage.percentageOfUsers) : 0
          );
          const isPrimary = idx === 0;

          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              {/* Icon & Name */}
              <div className="flex items-center gap-2 w-36 sm:w-40 shrink-0">
                <span className="p-1 rounded bg-[#181b24] border border-[#262b38]">
                  {getStageIcon(stage.name)}
                </span>
                <span className="text-zinc-300 font-medium truncate text-[11px]">
                  {stage.name}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 bg-[#181b22] h-4 rounded-md overflow-hidden p-0.5 relative">
                <div
                  className={`h-full rounded-sm transition-all duration-500 ${
                    isPrimary
                      ? 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_8px_rgba(255,30,39,0.7)]'
                      : idx === 1
                      ? 'bg-red-700/80'
                      : idx === 2
                      ? 'bg-zinc-500'
                      : idx === 3
                      ? 'bg-zinc-600'
                      : 'bg-zinc-700'
                  }`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {/* Count & % against total users */}
              <div className="flex items-center justify-end gap-2 w-24 shrink-0 font-mono text-[11px]">
                <span className="text-zinc-200 font-bold">{stage.count.toLocaleString()}</span>
                <span className="text-zinc-400 w-12 text-right">
                  {stage.percentageOfUsers !== null ? `${stage.percentageOfUsers}%` : 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#1a1e27] text-[10px] text-zinc-400 flex items-center justify-between">
        <span>Todas las etapas calculadas contra Usuarios Registrados (100%)</span>
      </div>
    </div>
  );
};
