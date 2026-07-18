import React, { useState, useEffect } from 'react';
import { Borrower, Payment } from '../types';
import { formatMoney, formatKhmerDate, getFrequencyLabel } from '../utils';
import { Phone, Calendar, ArrowLeft, ShieldCheck, Check, Clock, TrendingUp, DollarSign, RefreshCw, AlertCircle, MessageCircle, QrCode, X } from 'lucide-react';
import { useLanguage } from '../i18n';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import LiveChat from './LiveChat';

interface BorrowerPortalProps {
  borrower: Borrower;
  onBackToLender?: () => void;
  isLenderLoggedIn?: boolean;
}

export default function BorrowerPortal({ borrower, onBackToLender, isLenderLoggedIn }: BorrowerPortalProps) {
  const { language } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQrZoomOpen, setIsQrZoomOpen] = useState(false);
  const [lenderProfile, setLenderProfile] = useState<any>(null);
  
  // Real-time Portal Configuration from Firestore settings/portal_config
  const [portalConfig, setPortalConfig] = useState<any>({
    logoType: 'text',
    logoText: 'LP',
    logoBgColor: '#2563EB',
    logoTextColor: '#FFFFFF',
    logoImageUrl: '',
    portalTitle: 'Luypay Ledger',
    marqueeText: 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ Pich Rachana',
    noticeTitle: 'សេចក្តីជូនដំណឹងអំពីគណនេយ្យ',
    noticeText: 'ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន។ រាល់ការបង់ប្រាក់ដែលលោកអ្នកបានវេរ ឬប្រគល់ជូន នឹងត្រូវម្ចាស់បំណុលបញ្ជាក់ និងកត់ត្រាចូលក្នុងប្រព័ន្ធនេះភ្លាមៗ។',
    sponsorEnabled: true,
    sponsorImageUrl: '',
    sponsorLinkUrl: '',
    sponsorTitle: ''
  });

  useEffect(() => {
    const unsubscribePortal = onSnapshot(doc(db, 'settings', 'portal_config'), (docSnap) => {
      if (docSnap.exists()) {
        setPortalConfig(docSnap.data());
      }
    }, (err) => {
      console.error('Error listening to portal config in BorrowerPortal:', err);
    });
    return () => {
      unsubscribePortal();
    };
  }, []);

  // Fetch Lender Profile to get global payment QR code if individual is not set
  useEffect(() => {
    if (!borrower.userId) return;
    const unsubscribeLender = onSnapshot(doc(db, 'members', borrower.userId), (docSnap) => {
      if (docSnap.exists()) {
        setLenderProfile(docSnap.data());
      }
    }, (err) => {
      console.error('Error listening to lender profile in BorrowerPortal:', err);
    });
    return () => unsubscribeLender();
  }, [borrower.userId]);

  const handleUpdateBorrower = async (updatedFields: Partial<Borrower>) => {
    try {
      const docRef = doc(db, 'borrowers', borrower.id);
      await updateDoc(docRef, updatedFields);
    } catch (err) {
      console.error("Error updating chat messages from borrower portal:", err);
    }
  };
  // Calculate stats
  const totalPaid = borrower.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, borrower.totalToPay - totalPaid);
  const progressPercent = Math.min(100, Math.round((totalPaid / borrower.totalToPay) * 100));
  const isCompleted = remaining <= 0;

  // Map payments by installment index for easy grid lookup
  const paymentBySlot: Record<number, Payment> = {};
  borrower.payments.forEach((p) => {
    if (p.installmentIndex !== -1) {
      paymentBySlot[p.installmentIndex] = p;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12 flex flex-col">
      {/* Marquee Banner */}
      <div id="portal-marquee-banner" className="bg-amber-500 text-slate-950 font-bold text-xs py-2 shadow-sm border-b border-amber-600/20 select-none shrink-0 z-40 overflow-hidden w-full">
        <div className="animate-marquee-smooth flex">
          <span className="inline-block mr-12 shrink-0">
            ✨ <span className="font-extrabold text-amber-950">{language === 'kh' ? 'សេចក្តីជូនដំណឹង៖' : 'Announcement:'}</span> {portalConfig.marqueeText || 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$'}
          </span>
          <span className="inline-block mr-12 shrink-0">
            ✨ <span className="font-extrabold text-amber-950">{language === 'kh' ? 'សេចក្តីជូនដំណឹង៖' : 'Announcement:'}</span> {portalConfig.marqueeText || 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$'}
          </span>
          <span className="inline-block mr-12 shrink-0">
            ✨ <span className="font-extrabold text-amber-950">{language === 'kh' ? 'សេចក្តីជូនដំណឹង៖' : 'Announcement:'}</span> {portalConfig.marqueeText || 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$'}
          </span>
          <span className="inline-block mr-12 shrink-0">
            ✨ <span className="font-extrabold text-amber-950">{language === 'kh' ? 'សេចក្តីជូនដំណឹង៖' : 'Announcement:'}</span> {portalConfig.marqueeText || 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$'}
          </span>
        </div>
      </div>

      {/* Top Banner / Navigation */}
      <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {portalConfig.logoType === 'image' && portalConfig.logoImageUrl ? (
              <img
                src={portalConfig.logoImageUrl}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg"
                style={{
                  backgroundColor: portalConfig.logoBgColor || '#2563EB',
                  color: portalConfig.logoTextColor || '#FFFFFF'
                }}
              >
                {portalConfig.logoText || 'LP'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wider uppercase">{portalConfig.portalTitle || 'Luypay Ledger'}</h1>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/50">
                  <a
                    href="https://www.facebook.com/share/1F4p12PfJx/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-blue-400 transition"
                    title="Facebook Link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                  </a>
                  <a
                    href="https://t.me/laymeancamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-sky-400 transition"
                    title="Telegram Link"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.49 4.47-1.75 4.97-1.76.11 0 .36.03.52.16.14.11.18.26.19.38 0 .09-.01.27-.02.39z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold -mt-0.5">{language === 'kh' ? 'លិខិតសងប្រាក់អេឡិចត្រូនិច' : 'Digital Debt Receipt'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 text-[10px] font-extrabold border border-blue-800/30">
              <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
              <span>{language === 'kh' ? 'មើលតែប៉ុណ្ណោះ (Read-Only)' : 'Read-Only'}</span>
            </span>

            {/* If the lender is logged in, show a way to return to dashboard */}
            {isLenderLoggedIn && onBackToLender && (
              <button
                onClick={onBackToLender}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'kh' ? 'ផ្ទាំងគ្រប់គ្រង (Dashboard)' : 'Dashboard'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Notice Info alert bar */}
        <div className="bg-blue-50 border border-blue-200/60 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">{portalConfig.noticeTitle || 'សេចក្តីជូនដំណឹងអំពីគណនេយ្យ'}</h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              {portalConfig.noticeText || 'ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន។'}
            </p>
          </div>
        </div>

        {/* Borrower Hero Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Profile Photo */}
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {borrower.profilePhoto ? (
                <img
                  src={borrower.profilePhoto}
                  alt={borrower.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-2xl font-black text-slate-400 uppercase">
                  {borrower.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900">{borrower.name}</h2>
                {borrower.statusTag && (
                  <span className={`inline-flex items-center text-xs font-extrabold px-2.5 py-1 rounded-xl border ${
                    borrower.statusTag === 'good'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : borrower.statusTag === 'late'
                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {borrower.statusTag === 'good' ? '🟢 ស្ថានភាព៖ ល្អណាស់ (Good)' : borrower.statusTag === 'late' ? '🔴 ស្ថានភាព៖ យឺតយ៉ាវ (Late)' : '🟡 ស្ថានភាព៖ ធម្មតា (Regular)'}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                {borrower.phone && (
                  <a href={`tel:${borrower.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{borrower.phone}</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>ថ្ងៃខ្ចី៖ {formatKhmerDate(borrower.loanDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>វគ្គបង់៖ {getFrequencyLabel(borrower.frequency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment QR Code inside Hero Card */}
          {(borrower.paymentQr || lenderProfile?.paymentQr) && (
            <div 
              onClick={() => setIsQrZoomOpen(true)}
              className="shrink-0 flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-3 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 transition duration-200 max-w-xs cursor-pointer"
            >
              <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center p-1 relative group">
                <img
                  src={borrower.paymentQr || lenderProfile?.paymentQr}
                  alt="Scan QR"
                  className="w-full h-full object-contain cursor-zoom-in"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{language === 'kh' ? 'ស្កេនដើម្បីទូទាត់' : 'Scan to Repay'}</span>
                </span>
                <p className="text-[11px] font-bold text-slate-700 leading-snug">
                  {language === 'kh' ? 'QR Code សងប្រាក់' : 'Payment QR Code'}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                  {language === 'kh' ? 'ចុចលើរូបដើម្បីពង្រីក' : 'Click image to zoom'}
                </p>
              </div>
            </div>
          )}

          {/* Custom notice from Lender */}
          <div className="flex-1 max-w-md bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start shadow-sm mx-0 md:mx-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-xl shrink-0">📣</span>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                {language === 'kh' ? 'សារជូនដំណឹងរំលឹកពីម្ចាស់បំណុល' : 'Notice from Lender'}
              </span>
              <p className="text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                {borrower.noticeMessage || (language === 'kh' ? 'សូមបង់ប្រាក់ឱ្យបានទៀងទាត់ និងទាន់ពេលវេលា។ សូមអរគុណ!' : 'Please make payments on time and regularly. Thank you!')}
              </p>
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-0.5">ស្ថានភាពកិច្ចសន្យា</span>
            <span className={`text-sm font-black px-3.5 py-1.5 rounded-full inline-block ${
              isCompleted 
                ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {isCompleted ? '🎉 បានទូទាត់សងរួចរាល់ (Completed)' : '📈 កំពុងសងប្រាក់ (Active)'}
            </span>
          </div>
        </div>

        {/* Financial Overview Grid & Repayment Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Stats column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Financial Stats box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span>របាយការណ៍សមតុល្យគណនេយ្យ</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">ប្រាក់ខ្ចីដើម</span>
                  <span className="text-base font-black text-slate-800">{formatMoney(borrower.principal, borrower.currency)}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">ប្រាក់សរុបត្រូវសង</span>
                  <span className="text-base font-black text-slate-800">{formatMoney(borrower.totalToPay, borrower.currency)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 block mb-1">បានសងសរុបរួច</span>
                  <span className="text-base font-black text-emerald-600">{formatMoney(totalPaid, borrower.currency)}</span>
                </div>
                <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
                  <span className="text-[10px] font-bold text-orange-600 block mb-1">ប្រាក់នៅសល់ខ្វះ</span>
                  <span className={`text-base font-black ${isCompleted ? 'text-slate-300 line-through' : 'text-orange-600'}`}>
                    {formatMoney(remaining, borrower.currency)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">វឌ្ឍនភាពនៃការសងប្រាក់</span>
                  <span className="text-blue-600 font-black">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Additional loan terms details */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-500 font-bold">
                {borrower.interestValue !== undefined && (
                  <div className="flex justify-between">
                    <span>ការប្រាក់ (Interest Rate)៖</span>
                    <span className="text-slate-800">
                      {borrower.interestType === 'percent' ? `${borrower.interestValue}%` : formatMoney(borrower.interestValue, borrower.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>គណនាការប្រាក់៖</span>
                  <span className="text-slate-800">
                    {borrower.interestCalculation === 'per-period' ? '🔄 ការប្រាក់ប្រចាំវគ្គ' : '🎯 ការប្រាក់សរុប (Flat)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>របៀបសងប្រាក់៖</span>
                  <span className="text-blue-700">
                    {borrower.paymentMode === 'interest-only' ? '📈 បង់តែការសុទ្ធ (Interest Only)' : '💵 បង់ទាំងដើមទាំងការ'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ប្រាក់ត្រូវបង់ក្នុងមួយវគ្គ៖</span>
                  <span className="text-blue-600 font-black">{formatMoney(borrower.installmentAmount, borrower.currency)}</span>
                </div>
                {borrower.notes && (
                  <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100">
                    <span className="font-bold block text-slate-500 mb-1">កំណត់ចំណាំពីម្ចាស់បំណុល៖</span>
                    <p className="whitespace-pre-line text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {borrower.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Repayment Checkboard (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex-1 flex flex-col shadow-sm">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>កាតគ្រីស្គូរបង់ប្រាក់ (Installment Calendar)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ប្រអប់ពណ៌បៃតងតំណាងឱ្យវគ្គដែលលោកអ្នកបានទូទាត់រួចរាល់។
                </p>
              </div>

              {/* Installment Boxes Grid - static/disabled */}
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-3 pt-1 overflow-y-auto max-h-[300px] md:max-h-[380px] p-1 border border-slate-100 rounded-2xl">
                {Array.from({ length: borrower.duration }).map((_, index) => {
                  const payment = paymentBySlot[index];
                  const isPaid = !!payment;

                  return (
                    <div
                      key={index}
                      className={`aspect-square p-2.5 rounded-xl flex flex-col justify-between items-center border transition-all duration-150 ${
                        isPaid 
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-50 border-slate-200/80 text-slate-600'
                      }`}
                    >
                      <span className="text-[9px] font-black opacity-75 uppercase">វគ្គទី</span>
                      <span className="text-base font-black leading-none">{index + 1}</span>
                      {isPaid ? (
                        <Check className="w-4 h-4 mt-0.5 text-white stroke-[3px]" />
                      ) : (
                        <span className="text-[9px] font-black opacity-50">
                          {formatMoney(borrower.installmentAmount, borrower.currency).replace('៛', '៛').split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend details */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-slate-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded-lg border border-emerald-600 shadow-sm" />
                  <span className="text-slate-600">បានទូទាត់រួច (Paid)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-50 rounded-lg border border-slate-200" />
                  <span>មិនទាន់ទូទាត់ (Unpaid)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions / Payment Logs table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>ប្រវត្តិនៃការបង់ប្រាក់សរុប (Detailed Payment Ledger)</span>
          </h3>

          {borrower.payments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              មិនទាន់មានកាលកំណត់ ឬកត់ត្រាបង់ប្រាក់ណាមួយនៅឡើយទេ។
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">ថ្ងៃខែឆ្នាំបង់</th>
                    <th className="py-3 px-4">ចំនួនទឹកប្រាក់</th>
                    <th className="py-3 px-4">ប្រភេទនៃការបង់</th>
                    <th className="py-3 px-4">កំណត់សម្គាល់បន្ថែម</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                  {[...borrower.payments].reverse().map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50 transition duration-100">
                      <td className="py-3 px-4 text-slate-800">{formatKhmerDate(pay.date)}</td>
                      <td className="py-3 px-4 text-blue-600 font-black text-sm">{formatMoney(pay.amount, borrower.currency)}</td>
                      <td className="py-3 px-4">
                        {pay.installmentIndex !== -1 ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black">
                            បង់វគ្គទី {pay.installmentIndex + 1}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[9px] font-black">
                            បង់ប្រាក់តាមចិត្ត
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 italic font-medium">{pay.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dynamic Sponsor Banner / Promotion Block */}
        {portalConfig.sponsorEnabled && portalConfig.sponsorImageUrl && (
          <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {language === 'kh' ? 'Sponsored / ការផ្សព្វផ្សាយពាណិជ្ជកម្ម' : 'Sponsored / Promotion'}
              </span>
              {portalConfig.sponsorTitle && (
                <span className="text-[10px] font-black text-indigo-600 truncate max-w-[200px]">
                  {portalConfig.sponsorTitle}
                </span>
              )}
            </div>

            {portalConfig.sponsorLinkUrl ? (
              <a 
                href={portalConfig.sponsorLinkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:opacity-95 transition"
              >
                <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                  <img
                    src={portalConfig.sponsorImageUrl}
                    alt="Sponsor Banner"
                    className="w-full h-auto max-h-[350px] object-contain block"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </a>
            ) : (
              <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                <img
                  src={portalConfig.sponsorImageUrl}
                  alt="Sponsor Banner"
                  className="w-full h-auto max-h-[350px] object-contain block"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info box */}
      <footer className="text-center text-xs font-bold text-slate-400 mt-12 space-y-1">
        <p>© {new Date().getFullYear()} Luypay Ledger. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
        <p className="text-[10px] opacity-75">រចនានិងអភិវឌ្ឍន៍ដោយ៖ <span className="text-blue-600 font-extrabold">ឡាយមាន (Lay Mean)</span> សម្រាប់ផ្ទាំងកូនបំណុលដែលគ្មានសិទ្ធិកែប្រែទិន្នន័យ។</p>
      </footer>

      {/* Floating Live Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-500/30 shadow-emerald-600/20"
        title={language === 'kh' ? 'ជជែកផ្ទាល់ (Live Chat)' : 'Live Chat'}
      >
        <MessageCircle className="w-6 h-6 animate-pulse" />
        {borrower.chatMessages && borrower.chatMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {borrower.chatMessages.length}
          </span>
        )}
      </button>

      {/* Zoomed QR Code Modal */}
      {isQrZoomOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setIsQrZoomOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrZoomOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5 border-b border-slate-100 pb-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>{language === 'kh' ? 'ស្កេនដើម្បីទូទាត់ប្រាក់' : 'Scan to Repay'}</span>
            </h3>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center aspect-square max-w-[280px] mx-auto overflow-hidden bg-white">
              <img
                src={borrower.paymentQr || lenderProfile?.paymentQr}
                alt="Payment QR Code"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs mx-auto">
              {language === 'kh' 
                ? 'សូមរក្សាទុករូបភាព QR នេះ ឬស្កេនដើម្បីទូទាត់ប្រាក់សង។ បន្ទាប់ពីវេររួច សូមផ្ញើវិក្កយបត្រមកកាន់ម្ចាស់បំណុល។' 
                : 'Please save this QR image or scan to repay. After transferring, please send the receipt to the lender.'}
            </div>
            <button
              onClick={() => setIsQrZoomOpen(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-850 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer"
            >
              {language === 'kh' ? 'យល់ព្រម' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Live Chat Drawer */}
      <LiveChat
        borrower={borrower}
        sender="borrower"
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onUpdateBorrower={handleUpdateBorrower}
      />
    </div>
  );
}
