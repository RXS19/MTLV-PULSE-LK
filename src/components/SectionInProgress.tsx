import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { NavSection } from '../types.js';

interface SectionInProgressProps {
  section: NavSection;
  onBackToResumen: () => void;
}

const sectionTitles: Record<NavSection, string> = {
  resumen: 'Resumen',
  motos: 'Motocicletas',
  apartados: 'Apartados',
  ofertas: 'Ofertas',
  entregas: 'Entregas',
  embudo: 'Embudo',
  finanzas: 'Finanzas',
  reportes: 'Reportes',
};

export const SectionInProgress: React.FC<SectionInProgressProps> = ({
  section,
  onBackToResumen,
}) => {
  return (
    <div
      id={`section-${section}-in-progress`}
      className="flex-1 flex flex-col items-center justify-center min-h-[500px] p-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#12141c] border border-[#232836] flex items-center justify-center mb-4 shadow-lg">
        <Construction className="w-8 h-8 text-red-500" />
      </div>

      <h2 className="text-xl font-black text-white uppercase tracking-wider font-display mb-1">
        {sectionTitles[section]}
      </h2>

      <p className="text-base font-semibold text-red-400 font-display uppercase tracking-wide">
        Sección en desarrollo.
      </p>

      <p className="text-xs text-zinc-400 max-w-md mt-2 leading-relaxed">
        Este módulo especializado de PULSE se habilitará en las siguientes etapas del proyecto Motoluv conforme a las especificaciones autorizadas.
      </p>

      <button
        onClick={onBackToResumen}
        id="back-to-resumen-btn"
        className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181b24] hover:bg-[#202532] border border-[#2b3140] text-xs font-semibold text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-red-500" />
        <span>Volver a Resumen</span>
      </button>
    </div>
  );
};
