import React from 'react';
import { Borrower } from '../types';
import { formatMoney, formatKhmerDate } from '../utils';
import { Calendar, Phone, CheckCircle, Clock, Check } from 'lucide-react';
import { useLanguage } from '../i18n';
import AvatarWithFrame from './AvatarWithFrame';

interface BorrowerCardProps {
  borrower: Borrower;
  onSelect: (borrower: Borrower) => void;
  onQuickPay: (borrowerId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (borrowerId: string) => void;
}

export default function BorrowerCard({ borrower, onSelect, onQuickPay, isSelected = false, onToggleSelect }: BorrowerCardProps) {
  const { t } = useLanguage();

  // Calculate payments
  const payments = Array.isArray(borrower.payments) ? borrower.payments : [];
  const totalPaid = payments.reduce((sum, p) => sum + (p?.amount || 0), 0);
  const remaining = Math.max(0, borrower.totalToPay - totalPaid);
  
  // Progress percentage
  const progressPercent = Math.min(100, Math.round((totalPaid / borrower.totalToPay) * 100));
  
  const isCompleted = remaining <= 0;
  
  // Find if there is an installment left
  const paidIndices = payments.map(p => p?.installmentIndex);
  let nextInstallmentIndex = -1;
  for (let i = 0; i < borrower.duration; i++) {
    if (!paidIndices.includes(i)) {
      nextInstallmentIndex = i;
      break;
    }
  }

  const handleQuickPayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) return;
    onQuickPay(borrower.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect(borrower.id);
    }
  };

  return (
    <div
      id={`borrower-card-${borrower.id}`}
      onClick={() => onSelect(borrower)}
      className={`bg-white border rounded-2xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          {/* Styled Checkbox */}
          {onToggleSelect && (
            <button
              onClick={handleCheckboxClick}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          )}

          {/* Avatar Container with Animated Frame support */}
          <AvatarWithFrame
            photoUrl={borrower.profilePhoto}
            name={borrower.name}
            frameId={borrower.avatarFrame}
            size="sm"
            className="shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                {borrower.name}
              </h3>
              {borrower.statusTag && (
                <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  borrower.statusTag === 'good'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : borrower.statusTag === 'late'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {borrower.statusTag === 'good'
                    ? t('goodLabel')
                    : borrower.statusTag === 'late'
                      ? t('lateLabel')
                      : t('regularLabel')}
                </span>
              )}
              {borrower.interestOnlyExtension && (
                <span className="inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white border border-rose-600 animate-pulse" title="កូនបំណុលសងការបន្តរ">
                  ⚠️ {useLanguage().language === 'kh' ? 'កូនបំណុលសងការបន្តរ' : 'Paying Interest Only'}
                </span>
              )}
            </div>
            {borrower.phone ? (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{borrower.phone}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-300 italic">{t('noPhone')}</span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('completedLabel')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-100 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            {t('activeLabel')
              .replace('{current}', String(payments.length))
              .replace('{total}', String(borrower.duration))}
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-end text-xs font-semibold text-slate-500">
          <span>{t('progressLabel')}</span>
          <span className={isCompleted ? 'text-emerald-600 font-bold' : 'text-blue-600 font-bold'}>
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Money Statistics Row */}
      <div className="grid grid-cols-2 gap-3 py-1 bg-slate-50/80 rounded-xl p-3 text-xs border border-slate-100">
        <div>
          <span className="text-slate-400 block mb-0.5 font-medium">{t('paidAmountLabel')}</span>
          <span className="font-bold text-slate-700">
            {formatMoney(totalPaid, borrower.currency)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5 font-medium">{t('remainingAmountLabel')}</span>
          <span className={`font-bold ${isCompleted ? 'text-slate-300' : 'text-orange-600'}`}>
            {formatMoney(remaining, borrower.currency)}
          </span>
        </div>
      </div>

      {/* Footer Info & Quick Action */}
      <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{t('loanDateLabel')} {formatKhmerDate(borrower.loanDate)}</span>
        </div>
        
        {/* Quick payment check button */}
        {!isCompleted ? (
          <button
            id={`quick-pay-btn-${borrower.id}`}
            onClick={handleQuickPayClick}
            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white active:bg-blue-700 text-slate-600 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            title={t('quickPay')}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{t('quickPay')}</span>
          </button>
        ) : (
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            {t('totalLabel')} {formatMoney(borrower.totalToPay, borrower.currency)}
          </span>
        )}
      </div>
    </div>
  );
}
