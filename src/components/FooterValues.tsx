import React from 'react';
import { ShieldCheck, Eye, Gauge, Lightbulb, Users } from 'lucide-react';

export const FooterValues: React.FC = () => {
  const values = [
    {
      title: 'CONFIANZA',
      desc: 'Hacemos lo correcto.',
      icon: <ShieldCheck className="w-4 h-4 text-zinc-400" />,
    },
    {
      title: 'TRANSPARENCIA',
      desc: 'Información clara en cada paso.',
      icon: <Eye className="w-4 h-4 text-zinc-400" />,
    },
    {
      title: 'PASIÓN',
      desc: 'Amamos lo que hacemos.',
      icon: <Gauge className="w-4 h-4 text-zinc-400" />,
    },
    {
      title: 'INNOVACIÓN',
      desc: 'Mejoramos cada día.',
      icon: <Lightbulb className="w-4 h-4 text-zinc-400" />,
    },
    {
      title: 'COMUNIDAD',
      desc: 'Somos más que motos.',
      icon: <Users className="w-4 h-4 text-zinc-400" />,
    },
  ];

  return (
    <footer
      id="pulse-footer"
      className="mt-8 border-t border-[#1a1e27] bg-[#0c0e12] py-4 px-6 rounded-xl relative overflow-hidden"
    >
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Official Slogan */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex -space-x-1 items-center transform -skew-x-12">
            <span className="w-1.5 h-6 bg-red-600 rounded-xs"></span>
            <span className="w-1.5 h-6 bg-red-500 rounded-xs ml-1"></span>
            <span className="w-1.5 h-6 bg-red-700 rounded-xs ml-1"></span>
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-white font-display italic">
              SUBE. CONECTA. <span className="text-red-500">RUEDA.</span>
            </div>
          </div>
        </div>

        {/* Center Values Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
          {values.map((v, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="p-1.5 rounded bg-[#141720] border border-[#222734] shrink-0 mt-0.5">
                {v.icon}
              </span>
              <div>
                <h5 className="text-[11px] font-extrabold tracking-wider text-zinc-200 uppercase font-tech">
                  {v.title}
                </h5>
                <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Motto Callout */}
        <div className="shrink-0 pl-0 xl:pl-4 xl:border-l xl:border-[#1f242e] flex flex-col justify-center">
          <p className="text-xs font-black tracking-wider text-zinc-200 uppercase font-display italic">
            EL PRÓXIMO KILÓMETRO
          </p>
          <p className="text-xs font-black tracking-wider text-red-500 uppercase font-display italic">
            TAMBIÉN ES TUYO.
          </p>
        </div>
      </div>
    </footer>
  );
};
