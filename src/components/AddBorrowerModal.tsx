import React, { useState, useEffect } from 'react';
import { CurrencyType, FrequencyType } from '../types';
import { getTodayDateString } from '../utils';
import { X, Info, Camera, User, Image } from 'lucide-react';
import { useLanguage } from '../i18n';

interface AddBorrowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    phone: string;
    loanDate: string;
    principal: number;
    totalToPay: number;
    installmentAmount: number;
    frequency: FrequencyType;
    duration: number;
    currency: CurrencyType;
    notes?: string;
    interestType?: 'percent' | 'fixed';
    interestValue?: number;
    paymentMode?: 'all' | 'interest-only';
    interestCalculation?: 'flat' | 'per-period';
    statusTag?: 'good' | 'late' | 'regular';
    autoCheckIn?: boolean;
    dueTime?: string;
    profilePhoto?: string;
    coverPhoto?: string;
  }) => void;
}

export default function AddBorrowerModal({ isOpen, onClose, onSave }: AddBorrowerModalProps) {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');

  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [principal, setPrincipal] = useState<string>('');
  const [totalToPay, setTotalToPay] = useState<string>('');
  const [duration, setDuration] = useState<string>('24'); // Default 24 installments
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [loanDate, setLoanDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'all' | 'interest-only'>('all');
  const [interestCalculation, setInterestCalculation] = useState<'flat' | 'per-period'>('per-period');
  const [statusTag, setStatusTag] = useState<'good' | 'late' | 'regular'>('good');
  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [dueTime, setDueTime] = useState('17:00');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [coverPhoto, setCoverPhoto] = useState<string>('');

  // Compress image to store as a small base64 string
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setProfilePhoto(dataUrl);
      };
    };
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCoverPhoto(dataUrl);
      };
    };
  };

  // Interest states
  const [interestType, setInterestType] = useState<'percent' | 'fixed'>('percent');
  const [interestValue, setInterestValue] = useState<string>('4'); // Default 4% interest as requested by the user

  const [isTotalToPayManuallyEdited, setIsTotalToPayManuallyEdited] = useState(false);
  const [isInstallmentManuallyEdited, setIsInstallmentManuallyEdited] = useState(false);

  // Quick Interest Presets based on calculation type and currency
  const quickInterestPresets = interestType === 'percent'
    ? ['4', '5', '10', '15', '20']
    : currency === 'USD'
      ? ['4', '5', '10', '20', '50']
      : ['10000', '20000', '50000', '100000', '200000'];

  // Helper values for calculations & visual breakdown
  const pValNum = parseFloat(principal) || 0;
  const iValNum = parseFloat(interestValue) || 0;
  const computedInterestAmount = interestType === 'percent' 
    ? pValNum * (iValNum / 100) 
    : iValNum;
  
  // Total computed amount depends on the selected payment mode and interest calculation type
  const computedCalculatedTotal = interestCalculation === 'per-period'
    ? (paymentMode === 'all'
        ? pValNum + (computedInterestAmount * (parseInt(duration) || 1))
        : computedInterestAmount * (parseInt(duration) || 1))
    : (paymentMode === 'all'
        ? pValNum + computedInterestAmount
        : computedInterestAmount);

  // Auto calculate values when principal, interestType, interestValue, paymentMode, duration, interestCalculation, or currency changes
  useEffect(() => {
    const pVal = parseFloat(principal);
    const iVal = parseFloat(interestValue);
    const dVal = parseInt(duration) || 1;

    if (!isNaN(pVal) && pVal > 0) {
      if (!isTotalToPayManuallyEdited) {
        let computedTotal = 0;
        const interestAmt = interestType === 'percent' ? pVal * (iVal / 100) : iVal;
        const safeInterestAmt = isNaN(interestAmt) ? 0 : interestAmt;
        
        if (interestCalculation === 'per-period') {
          if (paymentMode === 'all') {
            computedTotal = pVal + (safeInterestAmt * dVal);
          } else {
            computedTotal = safeInterestAmt * dVal;
          }
        } else { // 'flat'
          if (paymentMode === 'all') {
            computedTotal = pVal + safeInterestAmt;
          } else {
            computedTotal = safeInterestAmt;
          }
        }
        
        // Round nicely based on currency
        if (currency === 'KHR') {
          computedTotal = Math.round(computedTotal);
        } else {
          computedTotal = parseFloat(computedTotal.toFixed(2));
        }
        setTotalToPay(computedTotal.toString());
      }
    } else {
      if (!isTotalToPayManuallyEdited) setTotalToPay('');
    }
  }, [principal, interestType, interestValue, paymentMode, duration, interestCalculation, currency, isTotalToPayManuallyEdited]);

  useEffect(() => {
    const tVal = parseFloat(totalToPay);
    const dVal = parseInt(duration);
    if (!isNaN(tVal) && !isNaN(dVal) && dVal > 0) {
      if (!isInstallmentManuallyEdited) {
        // Calculate daily payment amount
        let calculatedInstallment = tVal / dVal;
        
        // Round nicely based on currency
        if (currency === 'KHR') {
          // Round to nearest 100 Riels for Cambodian currency
          calculatedInstallment = Math.round(calculatedInstallment / 100) * 100;
        } else {
          // Round down to 2 decimals (truncation) so 110/30 gives exactly 3.66 USD
          calculatedInstallment = Math.floor(calculatedInstallment * 100) / 100;
        }
        setInstallmentAmount(calculatedInstallment.toString());
      }
    } else {
      if (!isInstallmentManuallyEdited) setInstallmentAmount('');
    }
  }, [totalToPay, duration, currency, paymentMode, isInstallmentManuallyEdited]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('សូមបញ្ជាក់ឈ្មោះអ្នកខ្ចី!');
    
    const pVal = parseFloat(principal);
    const tVal = parseFloat(totalToPay);
    const dVal = parseInt(duration);
    const iVal = parseFloat(installmentAmount);

    if (isNaN(pVal) || pVal <= 0) return alert('សូមបញ្ជាក់ប្រាក់ខ្ចីដើមឲ្យបានត្រឹមត្រូវ!');
    if (isNaN(tVal) || tVal <= 0) return alert('សូមបញ្ជាក់ប្រាក់ត្រូវសងសរុបឲ្យបានត្រឹមត្រូវ!');
    if (isNaN(dVal) || dVal <= 0) return alert('សូមបញ្ជាក់ចំនួនដងបង់ប្រាក់ឲ្យបានត្រឹមត្រូវ!');
    if (isNaN(iVal) || iVal <= 0) return alert('សូមបញ្ជាក់ប្រាក់ត្រូវបង់ក្នុងមួយវគ្គឲ្យបានត្រឹមត្រូវ!');

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      loanDate,
      principal: pVal,
      totalToPay: tVal,
      installmentAmount: iVal,
      frequency,
      duration: dVal,
      currency,
      notes: notes.trim(),
      interestType,
      interestValue: isNaN(parseFloat(interestValue)) ? 0 : parseFloat(interestValue),
      paymentMode,
      interestCalculation,
      statusTag,
      autoCheckIn,
      dueTime,
      profilePhoto,
      coverPhoto,
    });

    // Reset fields
    setName('');
    setPhone('');
    setPrincipal('');
    setTotalToPay('');
    setDuration('24');
    setInstallmentAmount('');
    setFrequency('daily');
    setLoanDate(getTodayDateString());
    setNotes('');
    setIsTotalToPayManuallyEdited(false);
    setIsInstallmentManuallyEdited(false);
    setInterestType('percent');
    setInterestValue('4');
    setPaymentMode('all');
    setInterestCalculation('per-period');
    setStatusTag('good');
    setAutoCheckIn(false);
    setDueTime('17:00');
    setProfilePhoto('');
    setCoverPhoto('');
  };

  return (
    <div id="add-borrower-modal" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-900">{t('addBorrowerTitle')}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {/* Section 1: Borrower Information */}
          <div className="space-y-3">
            {/* Profile & Cover Photo Upload */}
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 mb-2">
              {/* Profile Photo */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 border border-slate-150 rounded-2xl relative">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 self-start">
                  {language === 'kh' ? 'រូបថតកូនបំណុល' : 'Profile Photo'}
                </span>
                <div className="relative group">
                  <div id="add-photo-preview" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative">
                    {profilePhoto ? (
                      <img
                        src={profilePhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                    )}
                    
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                        title={language === 'kh' ? 'លុបរូបថត' : 'Remove Photo'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <label
                    htmlFor="borrower-photo-upload"
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer transition flex items-center justify-center"
                    title={language === 'kh' ? 'ជ្រើសរើសរូបថត' : 'Upload Photo'}
                  >
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <input
                      id="borrower-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Cover Photo */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 border border-slate-150 rounded-2xl relative">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 self-start">
                  {language === 'kh' ? 'រូបថតគម្រប' : 'Cover Photo'}
                </span>
                <div className="w-full relative">
                  <div id="add-cover-preview" className="w-full h-16 sm:h-20 rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative">
                    {coverPhoto ? (
                      <img
                        src={coverPhoto}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Image className="w-6 h-6 text-slate-300" />
                    )}
                    
                    {coverPhoto && (
                      <button
                        type="button"
                        onClick={() => setCoverPhoto('')}
                        className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                        title={language === 'kh' ? 'លុបរូបថត' : 'Remove Cover'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <label
                    htmlFor="borrower-cover-upload"
                    className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer transition flex items-center justify-center"
                    title={language === 'kh' ? 'ជ្រើសរើសរូបភាពគម្រប' : 'Upload Cover'}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      id="borrower-cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {language === 'kh' ? 'ឈ្មោះអ្នកខ្ចី *' : 'Borrower Name *'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'kh' ? 'ឧ. សុខ ជា' : 'e.g. John Doe'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'kh' ? 'ឧ. 012 345 678' : 'e.g. 012 345 678'}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'កាលបរិច្ឆេទខ្ចី' : 'Loan Date'}
                </label>
                <input
                  type="date"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'ម៉ោងត្រូវបង់ប្រាក់' : 'Due Time'}
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Loan Calculation Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kh' ? 'ព័ត៌មានប្រាក់កម្ចី & ការគណនា' : 'Loan Info & Calculations'}
              </span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('USD');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${currency === 'USD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('KHR');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${currency === 'KHR' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  KHR (៛)
                </button>
              </div>
            </div>

            {/* Payment Mode Choice Option */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kh' ? 'ប្រភេទនៃការបង់ប្រាក់' : 'Payment Mode'}
              </label>
              <div className="inline-flex w-full bg-slate-200/60 p-0.5 rounded-xl h-[38px] items-center">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('all');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 h-full ${
                    paymentMode === 'all' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  💵 {language === 'kh' ? 'បង់ទាំងដើមទាំងការ' : 'Principal + Interest'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('interest-only');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 h-full ${
                    paymentMode === 'interest-only' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  📈 {language === 'kh' ? 'បង់តែការសុទ្ធ' : 'Interest-Only'}
                </button>
              </div>
            </div>

            {/* Interest Calculation Method Option */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'kh' ? 'របៀបគណនាការប្រាក់' : 'Interest Calculation'}
              </label>
              <div className="inline-flex w-full bg-slate-200/60 p-0.5 rounded-xl h-[38px] items-center">
                <button
                  type="button"
                  onClick={() => {
                    setInterestCalculation('per-period');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 h-full ${
                    interestCalculation === 'per-period' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  🔄 {language === 'kh' ? 'ការប្រាក់ប្រចាំថ្ងៃ/វគ្គ' : 'Per Day/Period'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInterestCalculation('flat');
                    setIsTotalToPayManuallyEdited(false);
                    setIsInstallmentManuallyEdited(false);
                  }}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 h-full ${
                    interestCalculation === 'flat' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  🎯 {language === 'kh' ? 'ការប្រាក់សរុប' : 'Flat/Total Rate'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'ប្រាក់ខ្ចីដើម' : 'Principal Amount'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    placeholder={currency === 'USD' ? '100' : '400000'}
                    className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    min="0"
                    step="any"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                    {currency === 'USD' ? '$' : '៛'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'របៀបគណនាការប្រាក់' : 'Interest Type'}
                </label>
                <div className="inline-flex w-full bg-slate-100 p-0.5 rounded-xl border border-slate-200 h-[42px] items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setInterestType('percent');
                      setIsTotalToPayManuallyEdited(false);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${interestType === 'percent' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {language === 'kh' ? 'ភាគរយ (%)' : 'Percentage (%)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInterestType('fixed');
                      setIsTotalToPayManuallyEdited(false);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${interestType === 'fixed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    ចំនួនថេរ ({currency === 'USD' ? '$' : '៛'})
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  តម្លៃការប្រាក់ (Interest)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestValue}
                    onChange={(e) => {
                      setInterestValue(e.target.value);
                      setIsTotalToPayManuallyEdited(false);
                    }}
                    placeholder={interestType === 'percent' ? '4' : '4'}
                    className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                    min="0"
                    step="any"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                    {interestType === 'percent' ? '%' : (currency === 'USD' ? '$' : '៛')}
                  </span>
                </div>

                {/* Preset quick select buttons */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {quickInterestPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setInterestValue(preset);
                        setIsTotalToPayManuallyEdited(false);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition cursor-pointer border ${
                        interestValue === preset
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                      }`}
                    >
                      {interestType === 'percent' 
                        ? `${preset}%` 
                        : currency === 'USD' 
                          ? `$${preset}` 
                          : `${parseInt(preset).toLocaleString('en-US')}៛`
                      }
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>{language === 'kh' ? 'ប្រាក់ត្រូវសងសរុប' : 'Total Expected Amount'}</span>
                  {!isTotalToPayManuallyEdited ? (
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-bold">
                      {language === 'kh' ? 'ស្វ័យប្រវត្ត' : 'Auto'} ({interestType === 'percent' ? `+${interestValue || 0}%` : `+${interestValue || 0}${currency === 'USD' ? '$' : '៛'}`})
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsTotalToPayManuallyEdited(false)}
                      className="text-[10px] text-rose-500 hover:underline font-bold bg-transparent border-none cursor-pointer"
                    >
                      {language === 'kh' ? 'កំណត់ឡើងវិញ' : 'Reset'}
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={totalToPay}
                    onChange={(e) => {
                      setTotalToPay(e.target.value);
                      setIsTotalToPayManuallyEdited(true);
                    }}
                    placeholder={currency === 'USD' ? '104' : '416000'}
                    className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-slate-800"
                    min="0"
                    step="any"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                    {currency === 'USD' ? '$' : '៛'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Formula Explanation / Breakdown Card */}
            {pValNum > 0 && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5 text-xs animate-fadeIn">
                <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{language === 'kh' ? 'សេចក្តីលម្អិតនៃការគណនា (Calculation Details)' : 'Calculation Details'}</span>
                </div>
                
                {paymentMode === 'all' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-slate-600 font-semibold pt-1">
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5">
                        <span>{language === 'kh' ? 'ប្រាក់ខ្ចីដើម៖' : 'Principal:'}</span>
                        <span className="font-bold text-slate-800">
                          {pValNum.toLocaleString('en-US')} {currency === 'USD' ? '$' : '៛'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5">
                        <span>{language === 'kh' ? 'ប្រាក់ការខ្ចី៖' : 'Interest Amount:'}</span>
                        <span className="font-bold text-amber-600">
                          +{computedInterestAmount.toLocaleString('en-US')}{currency === 'USD' ? '$' : '៛'} 
                          {interestType === 'percent' && ` (${iValNum}%)`}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-blue-900 font-extrabold pt-2 text-sm border-t border-blue-100">
                      <span>{language === 'kh' ? 'ប្រាក់សរុបត្រូវសង (ដើម+ការ)៖' : 'Total to Pay (Principal+Interest):'}</span>
                      <span className="text-blue-600">
                        {computedCalculatedTotal.toLocaleString('en-US')} {currency === 'USD' ? '$' : '៛'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-slate-600 font-semibold pt-1">
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5">
                        <span>{language === 'kh' ? 'ប្រាក់ខ្ចីដើម៖' : 'Principal:'}</span>
                        <span className="font-bold text-slate-800">
                          {pValNum.toLocaleString('en-US')} {currency === 'USD' ? '$' : '៛'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5 col-span-2">
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-100/40 px-1.5 py-0.5 rounded-md">
                          * {language === 'kh' ? 'ប្រាក់ដើមរក្សាទុកសងចុងក្រោយបង្អស់ (Principal remains unpaid)' : 'Principal remains unpaid until final maturity'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5">
                        <span>{language === 'kh' ? 'ការប្រាក់ក្នុង១ដង៖' : 'Interest per Installment:'}</span>
                        <span className="font-bold text-amber-600">
                          {computedInterestAmount.toLocaleString('en-US')}{currency === 'USD' ? '$' : '៛'}
                          {interestType === 'percent' && ` (${iValNum}%)`}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-blue-100/50 pb-1.5">
                        <span>{language === 'kh' ? 'ចំនួនដងត្រូវបង់ការ៖' : 'Maturity Periods:'}</span>
                        <span className="font-bold text-slate-800">
                          {duration || '0'} {language === 'kh' ? 'ដង' : 'periods'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-blue-900 font-extrabold pt-2 text-sm border-t border-blue-100">
                      <span>{language === 'kh' ? 'ប្រាក់ការសរុប (បង់តែការសុទ្ធ)៖' : 'Total Interest Amount:'}</span>
                      <span className="text-blue-600">
                        {computedCalculatedTotal.toLocaleString('en-US')} {currency === 'USD' ? '$' : '៛'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'វគ្គបង់ប្រាក់' : 'Payment Frequency'}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                >
                  <option value="daily">{language === 'kh' ? 'រាល់ថ្ងៃ (Daily)' : 'Daily'}</option>
                  <option value="weekly">{language === 'kh' ? 'រាល់សប្តាហ៍ (Weekly)' : 'Weekly'}</option>
                  <option value="monthly">{language === 'kh' ? 'រាល់ខែ (Monthly)' : 'Monthly'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {language === 'kh' ? 'ចំនួនដងត្រូវសង (ដង)' : 'Installments Duration (times)'}
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="24"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{t('installmentAmountLabel')}</span>
                {!isInstallmentManuallyEdited && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-bold">
                    {language === 'kh' ? 'ស្វ័យប្រវត្ត (សរុប / ចំនួនដង)' : 'Auto (Total / Terms)'}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => {
                    setInstallmentAmount(e.target.value);
                    setIsInstallmentManuallyEdited(true);
                  }}
                  placeholder={currency === 'USD' ? '5' : '20000'}
                  className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold text-blue-600"
                  min="0"
                  step="any"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">
                  {currency === 'USD' ? '$' : '៛'}
                </span>
              </div>
            </div>
          </div>

          {/* Borrower Standing Rating Selection */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('standingTitle')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatusTag('good')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer border flex flex-col items-center justify-center gap-1.5 ${
                  statusTag === 'good'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🟢</span>
                <span>{language === 'kh' ? 'ល្អ (Good)' : 'Good'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusTag('regular')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer border flex flex-col items-center justify-center gap-1.5 ${
                  statusTag === 'regular'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🟡</span>
                <span>{language === 'kh' ? 'ធម្មតា (Regular)' : 'Regular'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusTag('late')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer border flex flex-col items-center justify-center gap-1.5 ${
                  statusTag === 'late'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">🔴</span>
                <span>{language === 'kh' ? 'យឺតយ៉ាវ (Late/Slow)' : 'Late/Slow'}</span>
              </button>
            </div>
          </div>

          {/* Auto Check-In Toggle Option */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔄</span> {t('toggleAutoCheckInLabel')}
              </label>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                {t('toggleAutoCheckInDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoCheckIn(!autoCheckIn)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoCheckIn ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  autoCheckIn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {language === 'kh' ? 'កំណត់សម្គាល់ផ្សេងៗ' : 'Additional Notes'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'kh' ? 'ព័ត៌មានលម្អិតបន្ថែម ដូចជា ទីកន្លែង ឬលក្ខខណ្ឌផ្សេងៗ...' : 'Additional notes, details or location...'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition h-20 resize-none font-medium"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition font-bold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold transition shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              {language === 'kh' ? 'រក្សាទុក' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
