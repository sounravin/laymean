import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ShieldCheck, Mail, Key, Coins, Clock, Send, MessageSquare, ChevronRight } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member, SubscriptionRequest } from '../types';

interface PricingPanelProps {
  currentUser: string;
  userDisplayName: string;
  memberProfile: Member | null;
  language: 'kh' | 'en';
  getSubscriptionStatusInfo: (profile: Member | null) => { isExpired: boolean; text: string };
  showToast: (msg: string, type?: 'success' | 'info') => void;
  qrConfig?: any;
}

export default function PricingPanel({
  currentUser,
  userDisplayName,
  memberProfile,
  language,
  getSubscriptionStatusInfo,
  showToast,
  qrConfig
}: PricingPanelProps) {
  const [myRequests, setMyRequests] = useState<SubscriptionRequest[]>([]);

  const fallbackQrConfig = {
    qrType: 'generated',
    qrString: '00020101021129170013000469096@cnb5204599953038405802KH5910SOUN RAVIN6009PhnomPenh63044D57',
    qrImageUrl: '',
    accountName: 'SOUN RAVIN',
    accountId: '000469096',
    bankName: 'Canadia Bank',
    bankLogoText: 'C',
    bankColor: '#E61A22'
  };

  const currentQrConfig = qrConfig || fallbackQrConfig;
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  // Interactive Payment Flow states
  const [paymentStep, setPaymentStep] = useState<'scan' | 'counting' | 'select_plan' | 'success'>('scan');
  const [countdown, setCountdown] = useState<number>(56);
  const [selectedPlanForPay, setSelectedPlanForPay] = useState<'1_month' | '3_months' | '1_year'>('3_months');
  const [qrScanDetected, setQrScanDetected] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (paymentStep === 'counting') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPaymentStep('select_plan');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStep]);

  useEffect(() => {
    if (paymentStep === 'scan') {
      setQrScanDetected(false);
      const timer = setTimeout(() => {
        setQrScanDetected(true);
      }, 3500); // 3.5s delay to simulate the user scanning the QR
      return () => clearTimeout(timer);
    }
  }, [paymentStep]);

  const handleSubmitPlanAfterPay = async () => {
    setSubmittingPlan(selectedPlanForPay);
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const requestDoc: SubscriptionRequest = {
        id: requestId,
        username: currentUser,
        displayName: userDisplayName,
        plan: selectedPlanForPay,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await setDoc(doc(db, 'subscription_requests', requestId), requestDoc);
      showToast(
        language === 'kh' 
          ? 'បានផ្ញើសំណើទិញគម្រោងរួចរាល់! ក្រុមការងារនឹងពិនិត្យ និងអនុម័តជូនក្នុងពេលឆាប់ៗនេះ។' 
          : 'Purchase request sent successfully! Our team will verify and approve shortly.',
        'success'
      );
      setPaymentStep('success');
    } catch (err) {
      console.error('Error submitting subscription request:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការផ្ញើសំណើ! សូមព្យាយាមឡើងវិញ។' : 'Failed to send request! Please try again.');
    } finally {
      setSubmittingPlan(null);
    }
  };

  useEffect(() => {
    // Sync current user's subscription requests in real-time
    const q = query(
      collection(db, 'subscription_requests'),
      where('username', '==', currentUser)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SubscriptionRequest[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SubscriptionRequest);
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setMyRequests(list);
    }, (err) => {
      console.error('Error listening to my subscription requests:', err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const statusInfo = getSubscriptionStatusInfo(memberProfile);

  const plans = [
    {
      id: '1_month',
      nameKh: 'គម្រោង ១ ខែ',
      nameEn: '1-Month Plan',
      price: '$5',
      durationKh: 'រយៈពេល ៣០ ថ្ងៃ',
      durationEn: '30 Days Access',
      popular: false,
      color: 'border-slate-200 bg-white'
    },
    {
      id: '3_months',
      nameKh: 'គម្រោង ៣ ខែ',
      nameEn: '3-Month Plan',
      price: '$12',
      durationKh: 'រយៈពេល ៩០ ថ្ងៃ',
      durationEn: '90 Days Access',
      popular: true,
      color: 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
    },
    {
      id: '1_year',
      nameKh: 'គម្រោង ១ ឆ្នាំ',
      nameEn: '1-Year Plan',
      price: '$35',
      durationKh: 'រយៈពេល ៣៦៥ ថ្ងៃ',
      durationEn: '365 Days Access',
      popular: false,
      color: 'border-slate-200 bg-white'
    }
  ];

  const featuresKh = [
    'Cloud Synced Backups (រក្សាទុកទិន្នន័យលើ Cloud ស្វ័យប្រវត្ត)',
    'បន្ថែមចំនួនកូនបំណុល និងគណនីបានមិនកំណត់ (Infinite borrowers)',
    'គាំទ្រភាសាខ្មែរ និងអង់គ្លេសពេញលេញ (Khmer/English bilingual)',
    'ផ្ញើសារទាក់ទងផ្ទាល់ជាមួយកូនបំណុលតាមតេឡេក្រាម និងទូរស័ព្ទ',
    'ជូនដំណឹងស្វ័យប្រវត្តពេលកូនបំណុលដល់ថ្ងៃបង់ប្រាក់',
    'ផតថលផ្ទាល់ខ្លួនសម្រាប់កូនបំណុលចូលពិនិត្យមើល និងឆាតសួរ'
  ];

  const featuresEn = [
    'Cloud Synced Backups (Automatic safe backups)',
    'Infinite borrowers and loan records (No limit)',
    'Fully bilingual support (Khmer & English)',
    'Direct contact options with borrowers via Telegram/Phone',
    'Intelligent automatic reminders for upcoming payments',
    'Dynamic Client Portals for borrowers to view checks & live chat'
  ];

  const handleRequestPlan = async (planId: '1_month' | '3_months' | '1_year') => {
    const confirmMsg = language === 'kh'
      ? 'តើអ្នកពិតជាចង់ផ្ញើសំណើទិញគម្រោងនេះមែនទេ? បន្ទាប់ពីផ្ញើជោគជ័យ សូមទាក់ទងមកកាន់ Admin ដើម្បីទូទាត់ប្រាក់ និងបើកដំណើការគណនី។'
      : 'Do you want to send a purchase request for this plan? Once sent, please contact the Administrator to complete payment and activate your plan.';
    
    if (!window.confirm(confirmMsg)) return;

    setSubmittingPlan(planId);
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const requestDoc: SubscriptionRequest = {
        id: requestId,
        username: currentUser,
        displayName: userDisplayName,
        plan: planId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await setDoc(doc(db, 'subscription_requests', requestId), requestDoc);
      showToast(
        language === 'kh' 
          ? 'បានផ្ញើសំណើទិញគម្រោងរួចរាល់! សូមផ្ញើវិក្កយបត្រ ABA ទៅតេឡេក្រាម Admin ដើម្បីបើកដំណើរការ។' 
          : 'Purchase request sent successfully! Please send the ABA receipt to Admin via Telegram to activate.',
        'success'
      );
    } catch (err) {
      console.error('Error submitting subscription request:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការផ្ញើសំណើ! សូមព្យាយាមឡើងវិញ។' : 'Failed to send request! Please try again.');
    } finally {
      setSubmittingPlan(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Current Status Widget */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl shadow-sm shrink-0">
            💎
          </div>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 text-base">
              {language === 'kh' ? 'ស្ថានភាពគម្រោងការប្រើប្រាស់បច្ចុប្បន្ន' : 'Current Subscription Status'}
            </h3>
            <p className="text-xs font-bold text-slate-500">
              {language === 'kh' ? `គណនី៖ ${userDisplayName} (${currentUser})` : `Account: ${userDisplayName} (${currentUser})`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl border text-xs font-black shadow-sm ${
            statusInfo.isExpired 
              ? 'bg-rose-50 text-rose-700 border-rose-100' 
              : memberProfile?.subscriptionExpires 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse' 
                : 'bg-blue-50 text-blue-700 border-blue-100'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Pricing Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {language === 'kh' ? 'គម្រោងការប្រើប្រាស់' : 'PRICING PLANS'}
        </span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {language === 'kh' ? 'ជ្រើសរើសគម្រោងដើម្បីបន្តការប្រើប្រាស់' : 'Choose a Plan to Upgrade'}
        </h2>
        <p className="text-xs text-slate-500 font-bold">
          {language === 'kh' 
            ? 'បង់ប្រាក់ម្តង ប្រើប្រាស់បានពេញលេញលើគ្រប់មុខងារ ដោយមិនមានការលាក់លក្ខខណ្ឌបន្ថែមឡើយ។' 
            : 'One-time payment for complete unrestricted access to all client loan ledger features.'}
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`border rounded-3xl p-6.5 flex flex-col justify-between relative shadow-sm hover:shadow-md transition duration-200 ${p.color}`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                {language === 'kh' ? 'ពេញនិយមបំផុត' : 'Most Popular'}
              </span>
            )}

            <div className="space-y-4">
              <div className="text-left">
                <h4 className="text-sm font-black text-slate-800">
                  {language === 'kh' ? p.nameKh : p.nameEn}
                </h4>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                  {language === 'kh' ? p.durationKh : p.durationEn}
                </p>
              </div>

              <div className="flex items-baseline gap-1 text-left">
                <span className="text-4xl font-black text-slate-900">{p.price}</span>
                <span className="text-xs font-bold text-slate-400">
                  / {language === 'kh' ? 'ម្តង' : 'one-time'}
                </span>
              </div>

              {/* Bullet list */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                {(language === 'kh' ? featuresKh : featuresEn).map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 font-semibold leading-relaxed">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRequestPlan(p.id as any)}
              disabled={submittingPlan !== null}
              className={`w-full py-3 rounded-2xl font-black text-xs transition duration-150 mt-6 cursor-pointer flex items-center justify-center gap-1.5 ${
                p.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submittingPlan === p.id 
                  ? (language === 'kh' ? 'កំពុងផ្ញើ...' : 'Sending...') 
                  : (language === 'kh' ? 'ផ្ញើសំណើទិញគម្រោង' : 'Request Purchase')}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* ABA Card and Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* ABA KHQR Payment Card with Interactive Flow */}
        <div className="bg-[#0B1521] text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative min-h-[520px]">
          {/* Brand Red Header */}
          <div 
            className="py-4 px-6 flex flex-col items-center justify-center relative overflow-hidden select-none shrink-0"
            style={{ backgroundColor: currentQrConfig.bankColor || '#E61A22' }}
          >
            {/* Curved wave effect on header */}
            <div className="absolute right-0 bottom-0 left-0 h-2 bg-[#0B1521] rounded-t-full opacity-10"></div>
            <div className="text-white text-base font-black tracking-widest flex items-center gap-1">
              <span className="font-sans font-black tracking-widest text-lg">KH</span>
              <span 
                className="bg-white font-black px-1.5 py-0.5 rounded text-xs"
                style={{ color: currentQrConfig.bankColor || '#E61A22' }}
              >
                QR
              </span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            {paymentStep === 'scan' && (
              <div className="flex-1 flex flex-col items-center justify-between space-y-5">
                <div className="text-center space-y-1">
                  <h4 className="text-lg font-black text-white tracking-wide uppercase">
                    {currentQrConfig.accountName || 'SOUN RAVIN'}
                  </h4>
                  {/* Big bold "0" as shown directly in the uploaded image */}
                  <div className="text-5xl font-black text-white my-1 select-none font-mono">0</div>
                </div>

                {/* Dotted Divider */}
                <div className="w-full border-t border-dashed border-slate-700/60 my-1"></div>

                {/* QR Code Container with white background */}
                <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center relative select-none shrink-0 w-52 h-52 mx-auto">
                  {currentQrConfig.qrType === 'uploaded' && currentQrConfig.qrImageUrl ? (
                    <img
                      src={currentQrConfig.qrImageUrl}
                      alt="Payment KHQR"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentQrConfig.qrString || '00020101021129170013000469096')}`}
                        alt="Payment KHQR"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      {/* Absolute Center Bank logo overlay */}
                      <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md p-1">
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center relative"
                          style={{ backgroundColor: currentQrConfig.bankColor || '#E61A22' }}
                        >
                          <svg className="w-6 h-6 text-white fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 2.5L17 5l.5 3.5 2.5 2.5-2.5 2.5-.5 3.5-3.5.5-2.5 2.5-2.5-2.5-3.5-.5-.5-3.5-2.5-2.5 2.5-2.5.5-3.5 3.5-.5z" />
                            <text x="12" y="15.5" textAnchor="middle" className="font-sans font-black text-[9px] fill-white stroke-none">
                              {currentQrConfig.bankLogoText || 'C'}
                            </text>
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons Row */}
                <div className="w-full space-y-3 pt-1">
                  {/* Interactive Status Indicator / Button */}
                  {!qrScanDetected ? (
                    <div className="w-full flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 gap-1.5 animate-pulse select-none">
                      <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                      <span className="text-[11px] font-bold text-amber-400">
                        {language === 'kh' ? 'កំពុងរង់ចាំសមាជិកស្កេនទូទាត់...' : 'Waiting for member to scan...'}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {language === 'kh' ? 'សូមស្កេន QR ខាងលើដើម្បីទូទាត់ប្រាក់' : 'Please scan the QR above to pay'}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 animate-in fade-in duration-300">
                      <div className="w-full flex items-center justify-center p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 gap-1.5 animate-bounce">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold">
                          {language === 'kh' ? 'បានរកឃើញការស្កេនរួចរាល់!' : 'Scan Detected successfully!'}
                        </span>
                      </div>

                      {/* Pay/Verify Trigger Button */}
                      <button
                        onClick={() => {
                          setPaymentStep('counting');
                          setCountdown(56);
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-xs font-black transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <span className="text-base leading-none">⚡</span>
                        <span>{language === 'kh' ? 'ខ្ញុំបានស្កេន រួចរាលហើយ' : 'I Have Scanned, Done'}</span>
                      </button>
                    </div>
                  )}

                  {/* Separate copy blocks side-by-side as requested */}
                  <div className="grid grid-cols-2 gap-2 w-full pt-1">
                    <div 
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(currentQrConfig.accountId || '000469096');
                          showToast(language === 'kh' ? 'ចម្លង ID គណនីរួចរាល់!' : 'Account ID copied!', 'success');
                        }
                      }}
                      className="py-2.5 px-3 bg-[#0F1C2E] hover:bg-slate-800 text-slate-300 rounded-xl text-center cursor-pointer border border-slate-800 flex flex-col items-center justify-center gap-1 transition-all duration-150 group"
                    >
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ID</span>
                      <span className="text-xs font-mono font-black text-white group-hover:text-amber-400 truncate w-full px-1">
                        {currentQrConfig.accountId || '000469096'}
                      </span>
                    </div>

                    <div 
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(currentQrConfig.accountName || 'SOUN RAVIN');
                          showToast(language === 'kh' ? 'ចម្លងឈ្មោះគណនីរួចរាល់!' : 'Account Name copied!', 'success');
                        }
                      }}
                      className="py-2.5 px-3 bg-[#0F1C2E] hover:bg-slate-800 text-slate-300 rounded-xl text-center cursor-pointer border border-slate-800 flex flex-col items-center justify-center gap-1 transition-all duration-150 group"
                    >
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Name</span>
                      <span className="text-xs font-sans font-black text-white group-hover:text-amber-400 truncate w-full px-1">
                        {currentQrConfig.accountName || 'SOUN RAVIN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'counting' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-6 text-center animate-in fade-in duration-300">
                {/* Beautiful Countdown Dial */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Outer animated rotating border */}
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin"></div>
                  {/* Middle pulse ring */}
                  <div className="absolute inset-3 rounded-full border border-slate-700/60 bg-slate-900/40 animate-pulse"></div>
                  {/* Timer Display */}
                  <div className="relative flex flex-col items-center">
                    <span className="text-5xl font-black text-amber-500 font-mono tracking-tighter">
                      {countdown}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {language === 'kh' ? 'វិនាទី' : 'Seconds'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-w-xs">
                  <h5 className="text-sm font-black text-amber-400">
                    {language === 'kh' ? 'កំពុងផ្ទៀងផ្ទាត់ការទូទាត់...' : 'Checking Bank API...'}
                  </h5>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    {countdown > 40 && (language === 'kh' ? '🔍 កំពុងស្វែងរកប្រតិបត្តិការទូទាត់ប្រាក់ពីធនាគារ...' : 'Searching for incoming bank transaction...')}
                    {countdown <= 40 && countdown > 25 && (language === 'kh' ? '⛓️ កំពុងផ្ទៀងផ្ទាត់ហត្ថលេខាឌីជីថលលើបណ្ដាញ...' : 'Verifying cryptographic digital signatures...')}
                    {countdown <= 25 && countdown > 10 && (language === 'kh' ? '🔐 កំពុងធ្វើសមកាលកម្មទិន្នន័យគណនីលើ Cloud...' : 'Synchronizing member secure ledger on Cloud...')}
                    {countdown <= 10 && (language === 'kh' ? '✨ ជិតរួចរាល់ហើយ! កំពុងបង្កើតកញ្ចប់គម្រោង...' : 'Almost done! Finalizing subscription setup...')}
                  </p>
                </div>

                {/* Bypass shortcut button for convenience during testing */}
                <button
                  onClick={() => setPaymentStep('select_plan')}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-400 rounded-lg hover:text-white transition"
                >
                  {language === 'kh' ? 'រំលងការរង់ចាំ (Skip)' : 'Skip Waiting'}
                </button>
              </div>
            )}

            {paymentStep === 'select_plan' && (
              <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-300">
                <div className="space-y-3">
                  <div className="text-center space-y-1">
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {language === 'kh' ? 'ស្កេនជោគជ័យ' : 'Scan Successful'}
                    </span>
                    <h5 className="text-sm font-black text-white">
                      {language === 'kh' ? 'សូមជ្រើសរើសគម្រោងដែលលោកអ្នកបានបង់ប្រាក់' : 'Please Select the Plan You Paid For'}
                    </h5>
                  </div>

                  {/* Plan Selection Buttons Grid */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: '1_month', nameKh: 'គម្រោង ១ ខែ = 5$', nameEn: '1-Month Plan = $5', popular: false },
                      { id: '3_months', nameKh: 'គម្រោង ៣ ខែ = 12$', nameEn: '3-Month Plan = $12', popular: true },
                      { id: '1_year', nameKh: 'គម្រោង ១ ឆ្នាំ = 35$', nameEn: '1-Year Plan = $35', popular: false }
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlanForPay(plan.id as any)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer relative ${
                          selectedPlanForPay === plan.id
                            ? 'bg-blue-600/25 border-blue-500 text-white ring-1 ring-blue-500'
                            : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlanForPay === plan.id ? 'border-blue-400' : 'border-slate-600'}`}>
                            {selectedPlanForPay === plan.id && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                          </span>
                          <span className="text-xs font-black">
                            {language === 'kh' ? plan.nameKh : plan.nameEn}
                          </span>
                        </div>
                        {plan.popular && (
                          <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-md shrink-0">
                            {language === 'kh' ? 'ពេញនិយម' : 'Popular'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Request Button */}
                <button
                  onClick={handleSubmitPlanAfterPay}
                  disabled={submittingPlan !== null}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingPlan ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{language === 'kh' ? 'កំពុងផ្ញើសំណើ...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>{language === 'kh' ? 'ផ្ញើសំណើទៅកាន់ក្រុមការងារដើម្បីអនុម័ត' : 'Submit Subscription Request'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-6 text-center animate-in zoom-in-95 duration-250">
                {/* Radiant Success Indicator */}
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative">
                  <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"></div>
                  <span className="text-4xl">✨</span>
                </div>

                <div className="space-y-2">
                  <h5 className="text-base font-black text-emerald-400">
                    {language === 'kh' ? 'ផ្ញើសំណើទិញជោគជ័យ!' : 'Request Sent Successfully!'}
                  </h5>
                  <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800 text-[11px] font-bold text-slate-300 leading-normal max-w-xs mx-auto">
                    {language === 'kh' ? 'គម្រោងដែលអ្នកបានជ្រើសរើស៖' : 'Selected Plan:'}{' '}
                    <span className="text-amber-400 font-extrabold uppercase">
                      {selectedPlanForPay === '1_month' ? 'គម្រោង ១ ខែ' : selectedPlanForPay === '3_months' ? 'គម្រោង ៣ ខែ' : 'គម្រោង ១ ឆ្នាំ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-xs">
                    {language === 'kh'
                      ? 'ក្រុមការងារពួកយើងនឹងពិនិត្យមើលប្រតិបត្តិការធនាគារ និងអនុម័តគណនីជូនលោកអ្នកយ៉ាងលឿនបំផុត!'
                      : 'Our support team will verify the payment transaction and activate your ledger features shortly!'}
                  </p>
                </div>

                <button
                  onClick={() => setPaymentStep('scan')}
                  className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/60 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  {language === 'kh' ? 'រួចរាល់' : 'Done'}
                </button>
              </div>
            )}

            {/* Support/Instant Approval Row */}
            <div className="flex justify-between items-center border-t border-slate-800 pt-3.5 text-[10px] text-slate-400 shrink-0 select-none">
              <a
                href="https://t.me/laymeancamera"
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Telegram: ឡាយមាន</span> <ChevronRight className="w-3 h-3" />
              </a>
              <span className="font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">INSTANT APPROVAL</span>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="text-left flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="font-extrabold text-slate-800 text-sm">
                {language === 'kh' ? 'ប្រវត្តិនៃការផ្ញើសំណើរបស់អ្នក' : 'Your Plan Requests History'}
              </h3>
            </div>

            {myRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs space-y-1">
                <p>{language === 'kh' ? 'មិនទាន់មានសំណើទិញណាមួយឡើយ' : 'No purchase requests made yet.'}</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'kh' ? 'ជ្រើសរើសគម្រោងខាងលើដើម្បីផ្ញើសំណើ' : 'Choose a plan above to send a request.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {myRequests.map((r) => {
                  const reqPlan = plans.find((p) => p.id === r.plan);
                  return (
                    <div
                      key={r.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="text-left space-y-0.5">
                        <p className="font-extrabold text-slate-800">
                          {language === 'kh' ? reqPlan?.nameKh : reqPlan?.nameEn} ({reqPlan?.price})
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span className={`inline-flex items-center text-[9px] font-black px-2.5 py-1 rounded-lg border ${
                        r.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : r.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                      }`}>
                        {r.status === 'approved' 
                          ? (language === 'kh' ? 'បានអនុម័ត' : 'Approved') 
                          : r.status === 'rejected' 
                            ? (language === 'kh' ? 'បានបដិសេធ' : 'Rejected') 
                            : (language === 'kh' ? 'កំពុងរង់ចាំ' : 'Pending')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-blue-50/40 p-3 rounded-2xl border border-blue-100/40 text-[10px] text-blue-800 font-semibold text-left mt-4 flex items-start gap-2">
            <span className="text-xs">💡</span>
            <p className="leading-normal">
              {language === 'kh'
                ? 'បន្ទាប់ពីផ្ញើសំណើជោគជ័យ សូមទាក់ទង Admin តាមតេឡេក្រាម រួចផ្ញើវិក្កយបត្រ ដើម្បីទទួលបានការអនុម័តដំណើរការលឿនរហ័ស!'
                : 'After requesting, send your ABA payment slip to Admin via Telegram. Your plan will be updated instantly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
