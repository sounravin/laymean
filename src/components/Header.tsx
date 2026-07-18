import React from 'react';
import { LedgerStats, Borrower } from '../types';
import { formatMoney } from '../utils';
import { DollarSign, Percent, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n';
import { motion } from 'motion/react';

interface HeaderProps {
  stats: LedgerStats;
  onAddNewClick: () => void;
  onBackupClick: () => void;
  onImportClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  onBulkAutoCheck: () => void;
  borrowers: Borrower[];
  onSelectBorrower: (id: string) => void;
}

export default function Header({ 
  stats, 
  onAddNewClick, 
  onBackupClick, 
  onImportClick, 
  selectedCount, 
  onBulkAutoCheck,
  borrowers,
  onSelectBorrower
}: HeaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t, language, setLanguage } = useLanguage();

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="app-header" className="space-y-6">
      {/* Sleek top header title area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('mainTitle')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('mainSubtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Elegant Language switcher option */}
          <div id="language-switcher" className="flex bg-slate-200/80 border border-slate-300/30 p-1 rounded-xl items-center shadow-xs shrink-0 mr-1.5">
            <motion.button
              id="lang-kh"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage('kh')}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                language === 'kh'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🇰🇭</span>
              <span>{t('langKhmer')}</span>
            </motion.button>
            <motion.button
              id="lang-en"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🇺🇸</span>
              <span>{t('langEnglish')}</span>
            </motion.button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportClick}
            accept=".json"
            className="hidden"
          />
          <motion.button
            id="import-data-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleImportButtonClick}
            className="px-4 py-2.5 text-xs bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            {t('importBtn')}
          </motion.button>
          <motion.button
            id="export-data-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBackupClick}
            className="px-4 py-2.5 text-xs bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            {t('backupBtn')}
          </motion.button>
          <motion.button
            id="bulk-auto-check-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBulkAutoCheck}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
              selectedCount > 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {language === 'kh' ? 'ទូទាត់ស្វ័យប្រវត្ត' : 'Auto Checking'}
              {selectedCount > 0 ? ` (${selectedCount})` : ''}
            </span>
          </motion.button>
          <motion.button
            id="add-borrower-btn"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddNewClick}
            className="px-5 py-2.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
          >
            {t('addBtn')}
          </motion.button>
        </div>
      </div>

      {/* Grid statistics cards matching Sleek Interface theme */}
      <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Active Borrowers */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('statsActive')}</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {stats.totalActiveLoansCount} <span className="text-xs font-normal text-slate-500">{t('personCount')}</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {stats.totalCompletedLoansCount} {t('statsCompleted')}
            </p>
          </div>
        </motion.div>

        {/* Card 2: Total Principal */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('statsPrincipal')}</p>
            <div className="mt-1 space-y-0.5">
              <div className="text-xs font-bold text-slate-800 flex justify-between">
                <span>USD:</span>
                <span>{formatMoney(stats.totalPrincipalUSD, 'USD')}</span>
              </div>
              <div className="text-xs font-bold text-slate-800 flex justify-between">
                <span>Riel:</span>
                <span>{formatMoney(stats.totalPrincipalKHR, 'KHR')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Total Collected */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('statsCollected')}</p>
            <div className="mt-1 space-y-0.5">
              <div className="text-xs font-extrabold text-emerald-600 flex justify-between">
                <span>USD:</span>
                <span>{formatMoney(stats.totalCollectedUSD, 'USD')}</span>
              </div>
              <div className="text-xs font-extrabold text-emerald-600 flex justify-between">
                <span>Riel:</span>
                <span>{formatMoney(stats.totalCollectedKHR, 'KHR')}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Total Remaining */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-md"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <Percent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('statsRemaining')}</p>
            <div className="mt-1 space-y-0.5">
              <div className="text-xs font-extrabold text-rose-600 flex justify-between">
                <span>USD:</span>
                <span>{formatMoney(stats.totalExpectedUSD - stats.totalCollectedUSD, 'USD')}</span>
              </div>
              <div className="text-xs font-extrabold text-rose-600 flex justify-between">
                <span>Riel:</span>
                <span>{formatMoney(stats.totalExpectedKHR - stats.totalCollectedKHR, 'KHR')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
