import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

// Authentic Khmer Corner Vector Ornament
const KhmerCorner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M 0 0 L 28 0 C 22 2, 18 6, 15 11 C 18 10.5, 20 9.5, 19.5 11.5 C 16 15, 13.5 16, 10 20 C 11.5 19.5, 13 18.5, 12.5 20 C 8.5 23.5, 6.5 24.5, 0 26.5 Z"
      fill="url(#pwa-gold-grad)"
    />
    <path
      d="M 0 0 L 18 0 C 14 1.5, 11 3.5, 9 7 C 11 6.5, 12 6, 11.5 7.5 C 9 10, 7 11, 5 13 C 6 12.5, 7 12, 6.5 13 C 4 15, 3 15.5, 0 17 Z"
      fill="#FFE082"
      opacity="0.6"
    />
  </svg>
);

export default function PWAInstallBanner() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed & opened as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Only show if the user hasn't explicitly dismissed it in this session
      const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (!isDismissed) {
        // Delay slightly for a smoother entry animation
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('Luypay app was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // If already installed or prompt is not available, don't show the banner
  if (isInstalled || !isVisible || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="relative">
        {/* SVG definitions for PWA golden gradients */}
        <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pwa-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFB035" />
              <stop offset="30%" stopColor="#FFF2A3" />
              <stop offset="70%" stopColor="#B37E1B" />
              <stop offset="100%" stopColor="#FAD860" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:max-w-md bg-gradient-to-br from-[#0c1836] via-[#050a16] to-[#0d1c3e] border-2 border-[#dfb035]/60 rounded-2xl p-5 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.8),0_0_20px_4px_rgba(223,176,53,0.15)] z-[999] overflow-hidden select-none dark-glow-amber"
        >
          {/* Inner Golden Border Outline */}
          <div className="absolute inset-[3px] border border-[#dfb035]/15 rounded-[13px] pointer-events-none z-10" />

          {/* Authentic Khmer Corner Ornaments */}
          <KhmerCorner className="absolute top-[3px] left-[3px] w-4.5 h-4.5 pointer-events-none z-10" />
          <KhmerCorner className="absolute top-[3px] right-[3px] w-4.5 h-4.5 pointer-events-none rotate-90 z-10" />
          <KhmerCorner className="absolute bottom-[3px] left-[3px] w-4.5 h-4.5 pointer-events-none -rotate-90 z-10" />
          <KhmerCorner className="absolute bottom-[3px] right-[3px] w-4.5 h-4.5 pointer-events-none rotate-180 z-10" />

          {/* Golden Watermark Backdrop */}
          <div 
            className="absolute inset-0 opacity-[0.025] pointer-events-none" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 0 L48 24 L24 48 L0 24 Z M24 8 L40 24 L24 40 L8 24 Z' fill='%23dfb035'/%3E%3C/svg%3E")`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Main Layout Grid */}
          <div className="relative z-20 flex items-start gap-4 pr-4 pl-2">
            {/* Round Golden App Icon Representation */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#dfb035] to-[#fff2a3] flex items-center justify-center shadow-[0_0_12px_rgba(223,176,53,0.4)] shrink-0 border border-white/20">
              <Smartphone className="w-6 h-6 text-[#050a16]" />
            </div>

            {/* Title & Copy */}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black tracking-widest text-[#dfb035] uppercase bg-[#dfb035]/10 px-2 py-0.5 rounded-md border border-[#dfb035]/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  PWA APP
                </span>
                <span className="text-[9px] text-[#FFE082]/80 font-bold">
                  {language === 'kh' ? 'ដំឡើងទូរស័ព្ទ' : 'Install on Mobile'}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-white tracking-wide">
                {language === 'kh' ? 'ដំឡើងកម្មវិធី Luypay' : 'Install Luypay Web App'}
              </h4>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                {language === 'kh' 
                  ? 'ដំឡើងកម្មវិធីនេះទៅលើអេក្រង់ទូរស័ព្ទ ឬកុំព្យូទ័ររបស់អ្នក ដើម្បីងាយស្រួលបើកប្រើប្រាស់ និងរហ័សទាន់ចិត្ត!'
                  : 'Add Luypay directly to your home screen for quick offline access and premium app experience.'}
              </p>
            </div>
          </div>

          {/* Buttons Controls */}
          <div className="relative z-20 flex items-center gap-2.5 mt-4.5 justify-end pl-2">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:bg-slate-800/40"
            >
              {language === 'kh' ? 'ទុកពេលក្រោយ' : 'Maybe Later'}
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-[#dfb035] to-[#b37e1b] text-[#050a16] text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md border border-[#fff2a3]/30 hover:shadow-[0_0_15px_rgba(223,176,53,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'kh' ? 'ដំឡើងកម្មវិធីឥឡូវនេះ' : 'Install Now'}</span>
            </button>
          </div>

          {/* Dismiss Icon */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-800/40 z-30"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
