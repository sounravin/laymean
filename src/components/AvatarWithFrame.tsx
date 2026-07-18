import React from 'react';

// Define the available frames
export interface FrameTemplate {
  id: string;
  nameKh: string;
  nameEn: string;
  descriptionKh: string;
  descriptionEn: string;
  color: string;
}

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'diamond_sovereign',
    nameKh: 'ពេជ្រម្កុដទេវតា (Diamond Sovereign)',
    nameEn: 'Diamond Sovereign',
    descriptionKh: 'ម្កុដមាស កូនសោរត្បូងពេជ្រ និងស្លាបទេវតាពណ៌ផ្កាឈូក',
    descriptionEn: 'Golden crown, glowing sapphire gem, and heavenly angel wings',
    color: 'from-fuchsia-500 via-indigo-400 to-cyan-400',
  },
  {
    id: 'neon_cyberpunk',
    nameKh: 'ឡាស៊ែរណេអុង (Neon Cyberpunk)',
    nameEn: 'Neon Cyberpunk',
    descriptionKh: 'រង្វង់ឡាស៊ែរបង្វិលបច្ចេកវិទ្យាទំនើប និងជ្រុងឌីជីថល',
    descriptionEn: 'Futuristic spinning laser ring and high-tech digital brackets',
    color: 'from-cyan-400 via-purple-500 to-pink-500',
  },
  {
    id: 'golden_phoenix',
    nameKh: 'ហ្វ៊ីនិកមាស (Golden Phoenix)',
    nameEn: 'Golden Phoenix',
    descriptionKh: 'អណ្តាតភ្លើងមហិមាមាស និងស្លាបបក្សីភ្លើងហ្វ៊ីនិក',
    descriptionEn: 'Majestic golden flames and radiant Phoenix fire wings',
    color: 'from-amber-400 via-orange-550 to-rose-600',
  },
  {
    id: 'cosmic_sakura',
    nameKh: 'ផ្កាសាគូរ៉ាអវកាស (Cosmic Sakura)',
    nameEn: 'Cosmic Sakura',
    descriptionKh: 'ផ្កាសាគូរ៉ាពណ៌ផ្កាឈូកហោះហើរ និងរស្មីពណ៌ស្វាយអវកាស',
    descriptionEn: 'Drifting pink cherry blossoms with a cosmic violet nebula glow',
    color: 'from-pink-400 via-fuchsia-550 to-violet-500',
  },
  {
    id: 'dragon_legend',
    nameKh: 'នាគរាជព្រលឹង (Dragon Legend)',
    nameEn: 'Dragon Legend',
    descriptionKh: 'ស្នែងនាគក្រហម អណ្តាតភ្លើងខ្មៅ និងកម្ទេចភ្លើងនរក',
    descriptionEn: 'Draconic horns, ruby core, and dark molten red fire embers',
    color: 'from-red-600 via-rose-700 to-amber-500',
  },
];

interface AvatarWithFrameProps {
  photoUrl?: string;
  name: string;
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  editable?: boolean;
}

export default function AvatarWithFrame({
  photoUrl,
  name,
  frameId,
  size = 'md',
  className = '',
  onClick,
  editable = false,
}: AvatarWithFrameProps) {
  // Sizing definitions for the inner avatar circle
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm border',
    md: 'w-16 h-16 text-2xl border-2',
    lg: 'w-24 h-24 text-3xl border-4',
    xl: 'w-32 h-32 text-4xl border-4',
  };

  // Sizing definitions for frame scaling
  const frameScale = {
    sm: 'scale-[1.35]',
    md: 'scale-[1.38]',
    lg: 'scale-[1.40]',
    xl: 'scale-[1.42]',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* 1. Custom Animation Styles inject dynamically to avoid index.css bloat */}
      <style>{`
        @keyframes custom-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes custom-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes custom-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes custom-float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(3px); }
        }
        @keyframes custom-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes custom-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(124, 58, 237, 0.5)); }
          50% { filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.8)); }
        }
        @keyframes sakura-petal-1 {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translate(-15px, 20px) rotate(120deg); opacity: 0; }
        }
        @keyframes sakura-petal-2 {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.8; }
          100% { transform: translate(15px, 15px) rotate(-90deg); opacity: 0; }
        }
        @keyframes embers-up {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-12px) scale(0.4); opacity: 0; }
        }
        .anim-spin-slow { animation: custom-spin-slow 12s linear infinite; }
        .anim-spin-reverse { animation: custom-spin-reverse 8s linear infinite; }
        .anim-float { animation: custom-float 4s ease-in-out infinite; }
        .anim-float-reverse { animation: custom-float-reverse 4s ease-in-out infinite; }
        .anim-sparkle { animation: custom-sparkle 2.5s ease-in-out infinite; }
        .anim-glow { animation: custom-glow 3s ease-in-out infinite; }
        .anim-sakura-1 { animation: sakura-petal-1 4s linear infinite; }
        .anim-sakura-2 { animation: sakura-petal-2 5s linear infinite; }
        .anim-embers { animation: embers-up 3s ease-in infinite; }
      `}</style>

      {/* 2. Inner Avatar (Main image/text) */}
      <div className={`rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-white text-slate-500 flex items-center justify-center font-black shrink-0 shadow-inner relative z-10 ${sizeClasses[size]}`}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="uppercase">{initial}</span>
        )}

        {/* Edit HUD overlay */}
        {editable && (
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-150 flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold text-center p-1 cursor-pointer z-20">
            {size === 'sm' ? '✍️' : '✍️ កែប្រែស៊ុម'}
          </div>
        )}
      </div>

      {/* 3. Avatar Frame Overlays */}
      {frameId && frameId !== 'none' && (
        <div className={`absolute inset-0 z-20 pointer-events-none flex items-center justify-center ${frameScale[size]}`}>
          
          {/* ========================================================
              DESIGN 1: DIAMOND SOVEREIGN (ពេជ្រម្កុដទេវតា)
              ======================================================== */}
          {frameId === 'diamond_sovereign' && (
            <div className="w-full h-full relative anim-glow">
              {/* Spinning crystal-blue outer accent ring */}
              <svg className="absolute inset-0 w-full h-full anim-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="41" fill="none" stroke="url(#diamond-ring)" strokeWidth="1.8" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#diamond-glow)" strokeWidth="0.8" opacity="0.6" />
                <defs>
                  <linearGradient id="diamond-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient id="diamond-glow" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Top Golden Crown with Blue Gem */}
              <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[35%] h-[35%] flex flex-col items-center justify-center z-30 anim-float">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_4px_rgba(234,179,8,0.5)]">
                  {/* Golden Crown */}
                  <path d="M15,70 L25,40 L40,55 L50,30 L60,55 L75,40 L85,70 Z" fill="url(#crown-gold)" stroke="#ca8a04" strokeWidth="2" />
                  <ellipse cx="50" cy="70" rx="35" ry="8" fill="url(#crown-base)" stroke="#ca8a04" strokeWidth="1.5" />
                  
                  {/* Diamonds on crown peaks */}
                  <circle cx="50" cy="30" r="4" fill="#a5f3fc" />
                  <circle cx="25" cy="40" r="3.5" fill="#a5f3fc" />
                  <circle cx="75" cy="40" r="3.5" fill="#a5f3fc" />

                  {/* Majestic Sapphire Diamond at crown center */}
                  <polygon points="50,55 58,66 50,77 42,66" fill="url(#sapphire-gem)" stroke="#2563eb" strokeWidth="1" />
                  <polygon points="50,55 50,77 42,66" fill="#67e8f9" opacity="0.4" />

                  <defs>
                    <linearGradient id="crown-gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                    <linearGradient id="crown-base" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ca8a04" />
                      <stop offset="50%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                    <linearGradient id="sapphire-gem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Side gem-crystal guard rails */}
              <div className="absolute left-[-2%] top-[30%] w-[12%] h-[40%]">
                <svg viewBox="0 0 20 60" className="w-full h-full">
                  <path d="M2,10 L14,2 L18,15 L10,50 L2,55 Z" fill="url(#crystal-grad-l)" opacity="0.9" stroke="#818cf8" strokeWidth="1" />
                  <defs>
                    <linearGradient id="crystal-grad-l" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute right-[-2%] top-[30%] w-[12%] h-[40%] scale-x-[-1]">
                <svg viewBox="0 0 20 60" className="w-full h-full">
                  <path d="M2,10 L14,2 L18,15 L10,50 L2,55 Z" fill="url(#crystal-grad-r)" opacity="0.9" stroke="#818cf8" strokeWidth="1" />
                  <defs>
                    <linearGradient id="crystal-grad-r" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Bottom angelic pink/purple wings with central diamond */}
              <div className="absolute bottom-[-13%] left-0 right-0 h-[38%] flex items-center justify-center anim-float-reverse">
                <svg viewBox="0 0 160 60" className="w-[105%] h-full drop-shadow-[0_2px_4px_rgba(219,39,119,0.3)]">
                  {/* Left Wing feathers */}
                  <path d="M70,35 C50,45 30,35 10,20 C18,32 30,42 45,46 C55,48 65,45 70,35 Z" fill="url(#pink-feathers)" stroke="#ec4899" strokeWidth="0.8" />
                  <path d="M72,37 C58,49 40,46 22,33 C32,44 46,52 60,51 C68,50 71,43 72,37 Z" fill="url(#violet-feathers)" stroke="#c084fc" strokeWidth="0.6" opacity="0.9" />

                  {/* Right Wing feathers (mirrored) */}
                  <path d="M90,35 C110,45 130,35 150,20 C142,32 130,42 115,46 C105,48 95,45 90,35 Z" fill="url(#pink-feathers)" stroke="#ec4899" strokeWidth="0.8" />
                  <path d="M88,37 C102,49 120,46 138,33 C128,44 114,52 100,51 C92,50 89,43 88,37 Z" fill="url(#violet-feathers)" stroke="#c084fc" strokeWidth="0.6" opacity="0.9" />

                  {/* Central purple diamond emblem linking the wings */}
                  <polygon points="80,18 94,32 80,46 66,32" fill="url(#bottom-diamond)" stroke="#a855f7" strokeWidth="1.5" />
                  <polygon points="80,18 80,46 66,32" fill="#e9d5ff" opacity="0.4" />

                  <defs>
                    <linearGradient id="pink-feathers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fdf2f8" />
                      <stop offset="60%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#db2777" />
                    </linearGradient>
                    <linearGradient id="violet-feathers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#faf5ff" />
                      <stop offset="60%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                    <linearGradient id="bottom-diamond" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5f3ff" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#581c87" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Sparkling stars overlay */}
              <div className="absolute top-1/4 left-0 w-3 h-3 anim-sparkle" style={{ animationDelay: '0.2s' }}>
                <svg viewBox="0 0 10 10" className="w-full h-full text-cyan-300 fill-current"><polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5" /></svg>
              </div>
              <div className="absolute top-1/4 right-0 w-3.5 h-3.5 anim-sparkle" style={{ animationDelay: '0.8s' }}>
                <svg viewBox="0 0 10 10" className="w-full h-full text-fuchsia-300 fill-current"><polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5" /></svg>
              </div>
              <div className="absolute bottom-1/5 left-1/5 w-2.5 h-2.5 anim-sparkle" style={{ animationDelay: '1.4s' }}>
                <svg viewBox="0 0 10 10" className="w-full h-full text-blue-300 fill-current"><polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5" /></svg>
              </div>
            </div>
          )}


          {/* ========================================================
              DESIGN 2: NEON CYBERPUNK (ឡាស៊ែរណេអុង)
              ======================================================== */}
          {frameId === 'neon_cyberpunk' && (
            <div className="w-full h-full relative">
              {/* Spinning cyberpunk digital hud */}
              <svg className="absolute inset-0 w-full h-full anim-spin-slow" viewBox="0 0 100 100">
                {/* Neon circle */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cyber-grad-1)" strokeWidth="2.2" strokeDasharray="30 15 10 15" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.4" strokeDasharray="5 20" />
                <defs>
                  <linearGradient id="cyber-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Counter-rotating cyan inner elements */}
              <svg className="absolute inset-0 w-full h-full anim-spin-reverse" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="39" fill="none" stroke="#ec4899" strokeWidth="1" strokeDasharray="50 15 5 15" opacity="0.7" />
                {/* Arrow pointers */}
                <polygon points="50,6 47,11 53,11" fill="#22d3ee" />
                <polygon points="50,94 47,89 53,89" fill="#22d3ee" />
              </svg>

              {/* Brackets around corners */}
              <div className="absolute inset-[-4%] border-2 border-cyan-400/80 rounded-2xl pointer-events-none opacity-80">
                <div className="absolute top-[-3px] left-[-3px] w-3 h-3 border-t-2 border-l-2 border-fuchsia-500"></div>
                <div className="absolute top-[-3px] right-[-3px] w-3 h-3 border-t-2 border-r-2 border-fuchsia-500"></div>
                <div className="absolute bottom-[-3px] left-[-3px] w-3 h-3 border-b-2 border-l-2 border-fuchsia-500"></div>
                <div className="absolute bottom-[-3px] right-[-3px] w-3 h-3 border-b-2 border-r-2 border-fuchsia-500"></div>
              </div>

              {/* Digital indicator overlays */}
              <div className="absolute top-[3%] right-[3%] font-mono text-[6px] text-cyan-400 font-bold px-1 bg-slate-950/80 rounded border border-cyan-500/30 scale-75">
                SYS.OK
              </div>
              <div className="absolute bottom-[3%] left-[3%] font-mono text-[6px] text-pink-400 font-bold px-1 bg-slate-950/80 rounded border border-pink-500/30 scale-75 animate-pulse">
                SYNC
              </div>
            </div>
          )}


          {/* ========================================================
              DESIGN 3: GOLDEN PHOENIX (ហ្វ៊ីនិកមាស)
              ======================================================== */}
          {frameId === 'golden_phoenix' && (
            <div className="w-full h-full relative">
              {/* Fiery spinning ring */}
              <svg className="absolute inset-0 w-full h-full anim-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#phoenix-fire)" strokeWidth="3" opacity="0.8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="10 5" />
                <defs>
                  <linearGradient id="phoenix-fire" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#f59e0b" />
                    <stop offset="70%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Bottom fire wings sweeping up */}
              <div className="absolute bottom-[-8%] left-[-10%] right-[-10%] h-[40%] anim-float">
                <svg viewBox="0 0 120 40" className="w-full h-full drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)]">
                  <path d="M10,35 C20,38 35,32 50,22 C44,28 35,36 20,38 Z" fill="url(#fire-grad)" stroke="#f97316" strokeWidth="0.8" />
                  <path d="M110,35 C100,38 85,32 70,22 C76,28 85,36 100,38 Z" fill="url(#fire-grad)" stroke="#f97316" strokeWidth="0.8" />
                  {/* Central flame crest */}
                  <path d="M60,10 L65,24 L55,24 Z" fill="#fef08a" stroke="#ea580c" strokeWidth="1" />
                  <path d="M60,18 L63,26 L57,26 Z" fill="#ffffff" />
                  <defs>
                    <linearGradient id="fire-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Sunburst top crest */}
              <div className="absolute top-[-8%] left-1/2 -translate-x-1/2 w-[30%] h-[20%] anim-float-reverse">
                <svg viewBox="0 0 40 20" className="w-full h-full">
                  <polygon points="20,2 24,14 16,14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                  <polygon points="12,6 18,14 10,15" fill="#f59e0b" />
                  <polygon points="28,6 22,14 30,15" fill="#f59e0b" />
                </svg>
              </div>

              {/* Flame embers floating up */}
              <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-amber-400 rounded-full anim-embers" style={{ animationDelay: '0.1s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-orange-500 rounded-full anim-embers" style={{ animationDelay: '0.7s' }} />
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full anim-embers" style={{ animationDelay: '1.3s' }} />
            </div>
          )}


          {/* ========================================================
              DESIGN 4: COSMIC SAKURA (ផ្កាសាគូរ៉ាអវកាស)
              ======================================================== */}
          {frameId === 'cosmic_sakura' && (
            <div className="w-full h-full relative">
              {/* Spinning cosmic purple/rose gradient ring */}
              <svg className="absolute inset-0 w-full h-full anim-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#sakura-glow)" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#f472b6" strokeWidth="0.6" strokeDasharray="2 6" />
                <defs>
                  <linearGradient id="sakura-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="40%" stopColor="#d946ef" />
                    <stop offset="80%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Soft pink sakura blossoms overlay */}
              <div className="absolute top-[5%] left-[20%] w-[16%] h-[16%] anim-float">
                <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow-[0_1px_3px_rgba(244,114,182,0.6)]">
                  {/* 5-petal flower */}
                  <path d="M10,10 C10,5 6,5 8,8 C5,6 5,10 8,10 C5,10 5,14 8,12 C6,15 10,15 10,12 C10,15 14,15 12,12 C15,14 15,10 12,10 C15,10 15,6 12,8 C14,5 10,5 10,10 Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.5" />
                  <circle cx="10" cy="10" r="1.5" fill="#f43f5e" />
                </svg>
              </div>
              <div className="absolute bottom-[8%] right-[15%] w-[18%] h-[18%] anim-float-reverse">
                <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow-[0_1px_3px_rgba(244,114,182,0.6)]">
                  <path d="M10,10 C10,5 6,5 8,8 C5,6 5,10 8,10 C5,10 5,14 8,12 C6,15 10,15 10,12 C10,15 14,15 12,12 C15,14 15,10 12,10 C15,10 15,6 12,8 C14,5 10,5 10,10 Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.5" />
                  <circle cx="10" cy="10" r="1.5" fill="#f43f5e" />
                </svg>
              </div>

              {/* Tiny drifting falling sakura petals */}
              <div className="absolute top-[15%] right-[15%] w-2.5 h-2.5 anim-sakura-1">
                <svg viewBox="0 0 10 10" className="w-full h-full fill-[#fbcfe8] opacity-90"><path d="M5,1 C2,3 2,6 5,9 C8,6 8,3 5,1 Z" /></svg>
              </div>
              <div className="absolute bottom-[20%] left-[10%] w-2 h-2 anim-sakura-2">
                <svg viewBox="0 0 10 10" className="w-full h-full fill-[#f472b6] opacity-80"><path d="M5,1 C2,3 2,6 5,9 C8,6 8,3 5,1 Z" /></svg>
              </div>

              {/* Star twinkling */}
              <div className="absolute top-[45%] right-[-4%] w-2 h-2 anim-sparkle">
                <svg viewBox="0 0 10 10" className="w-full h-full text-pink-200 fill-current"><polygon points="5,0 6.5,3.5 10,5 6.5,6.5 5,10 3.5,6.5 0,5 3.5,3.5" /></svg>
              </div>
            </div>
          )}


          {/* ========================================================
              DESIGN 5: DRAGON LEGEND (នាគរាជព្រលឹង)
              ======================================================== */}
          {frameId === 'dragon_legend' && (
            <div className="w-full h-full relative">
              {/* Outer scale/crimson ring */}
              <svg className="absolute inset-0 w-full h-full anim-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#dragon-fire)" strokeWidth="3" strokeDasharray="15 5 2 5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#dc2626" strokeWidth="0.8" opacity="0.6" />
                <defs>
                  <linearGradient id="dragon-fire" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#7f1d1d" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Left and Right crimson dragon horns/wings */}
              <div className="absolute left-[-12%] top-[20%] w-[25%] h-[50%] anim-float">
                <svg viewBox="0 0 30 60" className="w-full h-full">
                  {/* Horn path */}
                  <path d="M25,50 C15,40 5,25 10,5 C2,18 4,35 22,55 Z" fill="url(#horn-grad)" stroke="#b91c1c" strokeWidth="1" />
                  <defs>
                    <linearGradient id="horn-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="55%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute right-[-12%] top-[20%] w-[25%] h-[50%] scale-x-[-1] anim-float">
                <svg viewBox="0 0 30 60" className="w-full h-full">
                  <path d="M25,50 C15,40 5,25 10,5 C2,18 4,35 22,55 Z" fill="url(#horn-grad)" stroke="#b91c1c" strokeWidth="1" />
                </svg>
              </div>

              {/* Bottom Dragon Scale Jaw crest with ruby core */}
              <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[45%] h-[28%] flex items-center justify-center anim-float-reverse">
                <svg viewBox="0 0 60 30" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  <polygon points="30,2 45,15 30,28 15,15" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                  {/* Glowing ruby gem */}
                  <polygon points="30,6 40,15 30,24 20,15" fill="#ef4444" />
                  <polygon points="30,6 30,24 20,15" fill="#fca5a5" opacity="0.4" />
                </svg>
              </div>

              {/* Burning sparks */}
              <div className="absolute top-[10%] left-[-2%] w-1.5 h-1.5 bg-red-500 rounded-full anim-embers" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-[10%] right-[-2%] w-1.5 h-1.5 bg-yellow-500 rounded-full anim-embers" style={{ animationDelay: '1.1s' }} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}
