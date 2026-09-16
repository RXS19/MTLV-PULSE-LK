import React from 'react';
import { ShieldCheck, User, Gauge, Lightbulb, Users } from 'lucide-react';

export const FooterValues: React.FC = () => {
  const values = [
    {
      title: 'CONFIANZA',
      desc: 'Hacemos lo correcto.',
      icon: <ShieldCheck className="w-5 h-5 text-zinc-200 stroke-[1.8]" />,
    },
    {
      title: 'TRANSPARENCIA',
      desc: 'Claridad en cada paso.',
      icon: <User className="w-5 h-5 text-zinc-200 stroke-[1.8]" />,
    },
    {
      title: 'PASIÓN',
      desc: 'Amamos lo que hacemos.',
      icon: <Gauge className="w-5 h-5 text-zinc-200 stroke-[1.8]" />,
    },
    {
      title: 'INNOVACIÓN',
      desc: 'Mejoramos cada día.',
      icon: <Lightbulb className="w-5 h-5 text-zinc-200 stroke-[1.8]" />,
    },
    {
      title: 'COMUNIDAD',
      desc: 'Somos más que motos.',
      icon: <Users className="w-5 h-5 text-zinc-200 stroke-[1.8]" />,
    },
  ];

  return (
    <footer
      id="pulse-footer"
      className="mt-8 border border-[#222834] rounded-xl relative overflow-hidden bg-[#0a0c10] shadow-2xl"
    >
      {/* Background Motorcycle (Grayscale & Darkened) */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/footer-motorcycle.jpg"
          alt="Motocicleta en carretera"
          className="w-full h-full object-cover object-[center_35%] grayscale brightness-[0.45] contrast-125 opacity-80"
        />
        {/* Soft Vignette and Horizontal Darkening Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-[#0a0c10]/75 to-[#0a0c10]/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="relative z-10 py-5 px-6 sm:px-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Official Slogan (Stacked) */}
        <div className="shrink-0 flex items-center font-neo-grotesk">
          <div className="text-xl sm:text-2xl font-bold tracking-[0.16em] uppercase font-neo-grotesk leading-[1.15] select-none">
            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">SUBE</div>
            <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">CONECTA</div>
            <div className="text-red-500 drop-shadow-[0_2px_6px_rgba(239,68,68,0.4)]">RUEDA</div>
          </div>
        </div>

        {/* Center Values Grid with subtle dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 flex-1 divide-y sm:divide-y-0 lg:divide-x divide-zinc-800/80 gap-y-2">
          {values.map((v, i) => (
            <div
              key={i}
              className={`flex items-start sm:items-center gap-2.5 py-2 sm:py-1 ${
                i === 0 ? 'lg:pl-2 lg:pr-3' : 'lg:px-3'
              }`}
            >
              <div className="shrink-0 p-1 rounded text-zinc-300 mt-0.5 sm:mt-0">
                {v.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-black tracking-wider text-white uppercase font-display leading-tight truncate">
                  {v.title}
                </h5>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-normal leading-snug mt-0.5 break-words">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Motto Callout with red vertical accent bar */}
        <div className="shrink-0 pl-0 xl:pl-5 xl:border-l-2 xl:border-red-600 flex flex-col justify-center select-none font-neo-grotesk">
          <p className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase font-neo-grotesk leading-tight drop-shadow-sm">
            EL PRÓXIMO
          </p>
          <p className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase font-neo-grotesk leading-tight drop-shadow-sm">
            KILÓMETRO
          </p>
          <p className="text-[11px] sm:text-xs font-bold tracking-widest text-white uppercase font-neo-grotesk leading-tight drop-shadow-sm">
            ES TUYO.
          </p>
        </div>
      </div>
    </footer>
  );
};
