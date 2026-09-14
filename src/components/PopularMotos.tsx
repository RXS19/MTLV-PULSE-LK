import React from 'react';
import { PopularMotoItem } from '../types.js';
import { Flame, Bike, Heart, Tag, AlertCircle } from 'lucide-react';

interface PopularMotosProps {
  popularMotos: {
    items: PopularMotoItem[];
    criterion: string;
    isAvailable: boolean;
    unavailableMessage?: string;
  };
}

export const PopularMotos: React.FC<PopularMotosProps> = ({ popularMotos }) => {
  const { items, criterion, isAvailable, unavailableMessage } = popularMotos;

  if (!isAvailable || items.length === 0) {
    return (
      <div
        id="popular-motos-card"
        className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px]"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1f28]">
          <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase font-display">
            MOTOCICLETAS MÁS POPULARES
          </h3>
          <span className="text-[10px] text-zinc-400 font-mono">Ranking</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-8 h-8 text-zinc-400 mb-2" />
          <p className="text-xs text-zinc-400 max-w-sm">
            {unavailableMessage || 'Ranking no disponible con las tablas actualmente autorizadas.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="popular-motos-card"
      className="bg-[#111318] border border-[#1f242e] rounded-xl p-5 flex flex-col justify-between h-[360px] shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1a1e27]">
        <h3 className="text-xs font-bold tracking-wider text-white uppercase font-display flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-red-500" />
          MOTOS MÁS POPULARES
        </h3>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#171b24] px-2 py-0.5 rounded border border-[#232836]">
          {criterion || 'Métricas reales'}
        </span>
      </div>

      {/* List of top bikes */}
      <div className="flex-1 flex flex-col justify-around my-2 space-y-2 overflow-y-auto">
        {items.map((moto, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-[#14171f] hover:bg-[#181c26] border border-[#1e232e] transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="w-5 text-center font-bold text-xs text-zinc-400 font-mono">
                {idx + 1}
              </span>

              {/* Moto Thumbnail (Real image or neutral motorcycle icon) */}
              <div className="w-10 h-10 rounded-md bg-[#0e1014] border border-[#252a36] flex items-center justify-center overflow-hidden shrink-0">
                {moto.imageUrl ? (
                  <img
                    src={moto.imageUrl}
                    alt={`${moto.make} ${moto.model}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bike className="w-5 h-5 text-red-500/70" />
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <p className="text-xs font-bold text-zinc-100 truncate max-w-[140px] sm:max-w-[170px]">
                  {moto.make} {moto.model} {moto.year ? moto.year : ''}
                </p>
                <p className="text-[10px] text-zinc-400 font-mono">
                  {moto.metricCount} {moto.metricLabel}
                </p>
              </div>
            </div>

            {/* Metric pill */}
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-red-400 px-2 py-1 rounded bg-red-950/40 border border-red-900/30 shrink-0">
              <Tag className="w-3 h-3 text-red-500" />
              <span>{moto.metricCount}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1a1e27] text-[10px] text-zinc-400 flex items-center justify-between">
        <span>{criterion}</span>
        <span className="font-mono">Top 5</span>
      </div>
    </div>
  );
};
