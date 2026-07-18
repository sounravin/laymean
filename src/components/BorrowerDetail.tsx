import React, { useState, useEffect } from 'react';
import { Borrower, Payment } from '../types';
import { formatMoney, formatKhmerDate, getTodayDateString } from '../utils';
import { X, Trash2, Archive, Phone, Calendar, ArrowLeft, Plus, Check, Share2, Copy, MessageSquare, RotateCcw, Edit3, MessageCircle, Camera, User, Image as ImageIcon, QrCode } from 'lucide-react';
import { useLanguage } from '../i18n';
import LiveChat from './LiveChat';
import { motion, AnimatePresence } from 'motion/react';
import AvatarWithFrame from './AvatarWithFrame';
import FrameSelectorModal from './FrameSelectorModal';

interface BorrowerDetailProps {
  borrower: Borrower;
  onClose: () => void;
  onAddPayment: (borrowerId: string, payment: Omit<Payment, 'id'>) => void;
  onDeletePayment: (borrowerId: string, paymentId: string) => void;
  onDeleteBorrower: (borrowerId: string) => void;
  onToggleArchive: (borrowerId: string) => void;
  onUpdateStatus: (borrowerId: string, newStatus: 'good' | 'late' | 'regular') => void;
  onToggleAutoCheckIn?: (borrowerId: string) => void;
  onEditBorrower?: (borrowerId: string, updatedFields: Partial<Borrower>) => void;
}

export default function BorrowerDetail({
  borrower,
  onClose,
  onAddPayment,
  onDeletePayment,
  onDeleteBorrower,
  onToggleArchive,
  onUpdateStatus,
  onToggleAutoCheckIn,
  onEditBorrower,
}: BorrowerDetailProps) {
  const { t, language } = useLanguage();
  const payments = Array.isArray(borrower.payments) ? borrower.payments : [];
  const [customAmount, setCustomAmount] = useState<string>('');

  const [customDate, setCustomDate] = useState<string>(getTodayDateString());
  const [customNote, setCustomNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isFrameModalOpen, setIsFrameModalOpen] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'schedule' | 'personal'>('schedule');

  // Edit Mode states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState(borrower.name);
  const [editPhone, setEditPhone] = useState(borrower.phone || '');
  const [editLoanDate, setEditLoanDate] = useState(borrower.loanDate);
  const [editDueTime, setEditDueTime] = useState(borrower.dueTime || '17:00');
  const [editPrincipal, setEditPrincipal] = useState(borrower.principal.toString());
  const [editTotalToPay, setEditTotalToPay] = useState(borrower.totalToPay.toString());
  const [editInstallmentAmount, setEditInstallmentAmount] = useState(borrower.installmentAmount.toString());
  const [editFrequency, setEditFrequency] = useState(borrower.frequency);
  const [editDuration, setEditDuration] = useState(borrower.duration.toString());
  const [editCurrency, setEditCurrency] = useState(borrower.currency);
  const [editNotes, setEditNotes] = useState(borrower.notes || '');
  const [editNoticeMessage, setEditNoticeMessage] = useState(borrower.noticeMessage || '');
  const [editProfilePhoto, setEditProfilePhoto] = useState(borrower.profilePhoto || '');
  const [editCoverPhoto, setEditCoverPhoto] = useState(borrower.coverPhoto || '');
  const [editPaymentQr, setEditPaymentQr] = useState(borrower.paymentQr || '');

  const [editInterestOnlyExtension, setEditInterestOnlyExtension] = useState<boolean>(!!borrower.interestOnlyExtension);
  const [editInterestOnlyExtensionNote, setEditInterestOnlyExtensionNote] = useState<string>(borrower.interestOnlyExtensionNote || '');
  const [extensionActive, setExtensionActive] = useState<boolean>(!!borrower.interestOnlyExtension);
  const [extensionNote, setExtensionNote] = useState<string>(borrower.interestOnlyExtensionNote || '');

  // Reset editing states when borrower or editing mode changes
  useEffect(() => {
    setEditName(borrower.name);
    setEditPhone(borrower.phone || '');
    setEditLoanDate(borrower.loanDate);
    setEditDueTime(borrower.dueTime || '17:00');
    setEditPrincipal(borrower.principal.toString());
    setEditTotalToPay(borrower.totalToPay.toString());
    setEditInstallmentAmount(borrower.installmentAmount.toString());
    setEditFrequency(borrower.frequency);
    setEditDuration(borrower.duration.toString());
    setEditCurrency(borrower.currency);
    setEditNotes(borrower.notes || '');
    setEditNoticeMessage(borrower.noticeMessage || '');
    setEditProfilePhoto(borrower.profilePhoto || '');
    setEditCoverPhoto(borrower.coverPhoto || '');
    setEditPaymentQr(borrower.paymentQr || '');
    setEditInterestOnlyExtension(!!borrower.interestOnlyExtension);
    setEditInterestOnlyExtensionNote(borrower.interestOnlyExtensionNote || '');
    setExtensionActive(!!borrower.interestOnlyExtension);
    setExtensionNote(borrower.interestOnlyExtensionNote || '');
  }, [borrower, isEditing]);

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditProfilePhoto(dataUrl);
      };
    };
  };

  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditCoverPhoto(dataUrl);
      };
    };
  };

  const handleEditQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 350;
        const MAX_HEIGHT = 350;
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setEditPaymentQr(dataUrl);
        // Auto-save if they upload in copy link view too
        if (onEditBorrower) {
          onEditBorrower(borrower.id, { paymentQr: dataUrl });
        }
      };
    };
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return alert(language === 'kh' ? 'សូមបញ្ចូលឈ្មោះកូនបំណុល!' : 'Please enter borrower name!');
    const pVal = parseFloat(editPrincipal);
    const tVal = parseFloat(editTotalToPay);
    const dVal = parseInt(editDuration);
    const iVal = parseFloat(editInstallmentAmount);

    if (isNaN(pVal) || pVal <= 0) return alert(language === 'kh' ? 'សូមបញ្ជាក់ប្រាក់ខ្ចីដើមឲ្យបានត្រឹមត្រូវ!' : 'Please enter a valid principal amount!');
    if (isNaN(tVal) || tVal <= 0) return alert(language === 'kh' ? 'សូមបញ្ជាក់ប្រាក់ត្រូវសងសរុបឲ្យបានត្រឹមត្រូវ!' : 'Please enter a valid total to pay!');
    if (isNaN(dVal) || dVal <= 0) return alert(language === 'kh' ? 'សូមបញ្ជាក់ចំនួនដងបង់ប្រាក់ឲ្យបានត្រឹមត្រូវ!' : 'Please enter a valid duration!');
    if (isNaN(iVal) || iVal <= 0) return alert(language === 'kh' ? 'សូមបញ្ជាក់ប្រាក់ត្រូវបង់ក្នុងមួយវគ្គឲ្យបានត្រឹមត្រូវ!' : 'Please enter a valid installment amount!');

    if (onEditBorrower) {
      onEditBorrower(borrower.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        loanDate: editLoanDate,
        dueTime: editDueTime,
        principal: pVal,
        totalToPay: tVal,
        installmentAmount: iVal,
        frequency: editFrequency,
        duration: dVal,
        currency: editCurrency,
        notes: editNotes.trim(),
        noticeMessage: editNoticeMessage.trim(),
        profilePhoto: editProfilePhoto,
        coverPhoto: editCoverPhoto,
        paymentQr: editPaymentQr,
        interestOnlyExtension: editInterestOnlyExtension,
        interestOnlyExtensionNote: editInterestOnlyExtensionNote.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${borrower.id}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy using clipboard API:', err);
          fallbackCopyText(shareUrl);
        });
    } else {
      fallbackCopyText(shareUrl);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(language === 'kh' 
        ? 'មិនអាចចម្លងដោយស្វ័យប្រវត្តបានទេ សូមចម្លងតំណភ្ជាប់នេះដោយផ្ទាល់៖ ' + text
        : 'Cannot copy automatically. Please copy this link manually: ' + text
      );
    }
    document.body.removeChild(textArea);
  };

  // Calculate stats
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, borrower.totalToPay - totalPaid);
  const progressPercent = Math.min(100, Math.round((totalPaid / borrower.totalToPay) * 100));
  const isCompleted = remaining <= 0;

  const [reminderMessage, setReminderMessage] = useState<string>('');
  const [msgCopied, setMsgCopied] = useState<boolean>(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${borrower.id}`;

  const getDefaultTemplate = (type: 'general' | 'urgent' | 'thanks') => {
    const formattedRemaining = formatMoney(remaining, borrower.currency);
    const formattedInstallment = formatMoney(borrower.installmentAmount, borrower.currency);
    
    if (language === 'kh') {
      if (type === 'thanks') {
        return `សួស្តីបង ${borrower.name}! ខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅសម្រាប់ការទូទាត់ប្រាក់ខ្ចីទាំងស្រុងចំនួន ${formatMoney(borrower.totalToPay, borrower.currency)} រួចរាល់ដោយជោគជ័យ។ 😊\n\nសូមបងពិនិត្យមើលប្រវត្តិនៃការបង់ប្រាក់លម្អិតតាមរយៈតំណភ្ជាប់នេះ៖ ${shareUrl}`;
      }
      
      if (type === 'urgent') {
        return `⚠️ សេចក្តីជូនដំណឹងសងប្រាក់បន្ទាន់!\nជម្រាបសួរសម្រាបបង ${borrower.name}។ ទឹកប្រាក់ដែលបងត្រូវបង់សម្រាប់វគ្គនេះគឺ ${formattedInstallment}។ សូមបងមេត្តាជួយទូទាត់ឲ្យបានឆាប់រហ័សតាមដែលអាចធ្វើទៅបាន។ \n\nបងអាចពិនិត្យមើលព័ត៌មានលម្អិត និងស្ថានភាពនៃការសងប្រាក់តាមរយៈតំណភ្ជាប់នេះ៖ ${shareUrl}\nសូមអរគុណ!`;
      }
      
      return `សួស្តីបង ${borrower.name}! នេះជាសាររំលឹកសម្រាប់ការបង់ប្រាក់ខ្ចីរបស់បង៖\n- ទឹកប្រាក់ត្រូវសងក្នុងមួយវគ្គ៖ ${formattedInstallment}\n- ទឹកប្រាក់នៅសល់សរុប៖ ${formattedRemaining}\n\nសូមបងពិនិត្យមើលតារាង និងប្រវត្តិសងប្រាក់លម្អិតតាមរយៈតំណភ្ជាប់នេះ៖ ${shareUrl}\nសូមអរគុណបង!`;
    } else {
      if (type === 'thanks') {
        return `Hello ${borrower.name}! I would like to express my deepest gratitude for completing your full loan payment of ${formatMoney(borrower.totalToPay, borrower.currency)} successfully. 😊\n\nYou can review your detailed payment history via this link: ${shareUrl}`;
      }
      
      if (type === 'urgent') {
        return `⚠️ Urgent Payment Notice!\nDear ${borrower.name}. Your installment payment for this period is ${formattedInstallment}. Please settle it as soon as possible.\n\nYou can review payment details and status via: ${shareUrl}\nThank you!`;
      }
      
      return `Hello ${borrower.name}! Here is a friendly reminder for your installment payment:\n- Installment amount due: ${formattedInstallment}\n- Total remaining balance: ${formattedRemaining}\n\nPlease check your schedule and details here: ${shareUrl}\nThank you!`;
    }
  };

  useEffect(() => {
    const isFullyPaid = remaining <= 0;
    setReminderMessage(getDefaultTemplate(isFullyPaid ? 'thanks' : 'general'));
  }, [borrower.id]);

  const handleCopyMessage = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(reminderMessage)
        .then(() => {
          setMsgCopied(true);
          setTimeout(() => setMsgCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy message:', err);
          fallbackCopyMessageText(reminderMessage);
        });
    } else {
      fallbackCopyMessageText(reminderMessage);
    }
  };

  const fallbackCopyMessageText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setMsgCopied(true);
      setTimeout(() => setMsgCopied(false), 2000);
    } catch (err) {
      alert(language === 'kh' ? 'មិនអាចចម្លងដោយស្វ័យប្រវត្តបានទេ៖ ' + text : 'Could not copy automatically: ' + text);
    }
    document.body.removeChild(textArea);
  };

  // Map payments by installment index for easy grid lookup
  const paymentBySlot: Record<number, Payment> = {};
  payments.forEach((p) => {
    if (p && p.installmentIndex !== -1) {
      paymentBySlot[p.installmentIndex] = p;
    }
  });

  // Handle checking/unchecking a box
  const handleBoxClick = (index: number) => {
    const existingPayment = paymentBySlot[index];
    if (existingPayment) {
      // Uncheck: delete payment
      const message = language === 'kh' 
        ? `តើអ្នកពិតជាចង់លុបការបង់ប្រាក់សម្រាប់ វគ្គទី ${index + 1} នេះមែនទេ?`
        : `Are you sure you want to delete payment for installment period ${index + 1}?`;
      if (confirm(message)) {
        onDeletePayment(borrower.id, existingPayment.id);
      }
    } else {
      // Check: add payment
      onAddPayment(borrower.id, {
        date: getTodayDateString(),
        amount: borrower.installmentAmount,
        installmentIndex: index,
        note: language === 'kh' ? `បង់ប្រាក់វគ្គទី ${index + 1}` : `Paid period ${index + 1}`,
      });
    }
  };

  // Custom/Partial payment submit
  const handleCustomPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(customAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      return alert(language === 'kh' ? 'សូមបញ្ចូលចំនួនទឹកប្រាក់ឲ្យបានត្រឹមត្រូវ!' : 'Please enter a valid amount!');
    }

    // Find the first unpaid installment slot to link it to, if any
    let unpaidSlot = -1;
    for (let i = 0; i < borrower.duration; i++) {
      if (!paymentBySlot[i]) {
        unpaidSlot = i;
        break;
      }
    }

    onAddPayment(borrower.id, {
      date: customDate,
      amount: amountVal,
      installmentIndex: unpaidSlot, // links to the first unpaid slot, or -1 if none
      note: customNote.trim() || (language === 'kh' ? 'ការបង់ប្រាក់តាមចិត្ត' : 'Custom Payment'),
    });

    // Reset inputs
    setCustomAmount('');
    setCustomDate(getTodayDateString());
    setCustomNote('');
  };

  const handleDeleteBorrowerClick = () => {
    const message = language === 'kh'
      ? `🚨 តើអ្នកពិតជាចង់លុបព័ត៌មានរបស់ "${borrower.name}" ទាំងស្រុងមែនទេ? រាល់ប្រវត្តិបង់ប្រាក់នឹងត្រូវបាត់បង់!`
      : `🚨 Are you sure you want to completely delete "${borrower.name}"? All payment history will be permanently lost!`;
    if (confirm(message)) {
      onDeleteBorrower(borrower.id);
    }
  };

  return (
    <motion.div
      id="borrower-detail-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 380 }}
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col my-4 md:my-8 max-h-[92vh]"
      >
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition md:hidden cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <AvatarWithFrame
              photoUrl={borrower.profilePhoto}
              name={borrower.name}
              frameId={borrower.avatarFrame}
              size="sm"
              className="shrink-0"
            />
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                {borrower.name}
              </h2>
              {borrower.phone && (
                <a
                  href={`tel:${borrower.phone}`}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5 font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{borrower.phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-wrap sm:items-center sm:gap-2 sm:w-auto">
            {isEditing ? (
              <>
                {/* Cancel button */}
                <button
                  id="cancel-edit-btn"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center w-full sm:w-auto"
                >
                  {language === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>

                {/* Save button */}
                <button
                  id="save-edit-btn"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition cursor-pointer shadow-sm shadow-emerald-600/10 flex items-center justify-center w-full sm:w-auto"
                >
                  {language === 'kh' ? 'រក្សាទុក' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {/* Copy Share Link button - Takes full width on mobile (col-span-2) */}
                <button
                  id="copy-share-link-btn"
                  onClick={() => setIsShareModalOpen(true)}
                  className="col-span-2 px-3 py-2 text-xs font-bold rounded-xl border bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-blue-600 shadow-sm shadow-blue-600/15 flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer w-full sm:w-auto sm:order-2"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{language === 'kh' ? 'ផ្ញើសាររំលឹក & តំណសងប្រាក់' : 'Send Reminder & Link'}</span>
                </button>

                {/* Edit button */}
                <button
                  id="edit-borrower-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto sm:order-1"
                >
                  <Edit3 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{language === 'kh' ? 'កែសម្រួល' : 'Edit Info'}</span>
                </button>

                {/* Live Chat Button */}
                <button
                  id="toolbar-live-chat-btn"
                  onClick={() => setIsChatOpen(true)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer relative w-full sm:w-auto sm:order-3"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                  <span>{language === 'kh' ? 'ជជែកផ្ទាល់' : 'Live Chat'}</span>
                  {borrower.chatMessages && borrower.chatMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>

                {/* Archive button */}
                <button
                  id="archive-borrower-btn"
                  onClick={() => onToggleArchive(borrower.id)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition cursor-pointer w-full sm:w-auto sm:order-4 ${borrower.isArchived ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                  title={borrower.isArchived ? (language === 'kh' ? "ស្តារមកវិញ" : "Restore") : (language === 'kh' ? "ដាក់ក្នុងបណ្ណសារទុក" : "Archive")}
                >
                  <Archive className="w-4 h-4 shrink-0" />
                  <span>{borrower.isArchived ? (language === 'kh' ? 'ស្តារឡើងវិញ' : 'Restore') : (language === 'kh' ? 'ដាក់ទុក' : 'Archive')}</span>
                </button>

                {/* Delete button */}
                <button
                  id="delete-borrower-btn"
                  onClick={handleDeleteBorrowerClick}
                  className="px-3 py-2 text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto sm:order-5"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>{language === 'kh' ? 'លុបអ្នកខ្ចី' : 'Delete'}</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition hidden md:block cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable grid area */}
        {isEditing ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📝</span>
                <span>{language === 'kh' ? 'កែសម្រួលព័ត៌មានលម្អិត' : 'Edit Borrower Information'}</span>
              </h3>

              <div className="space-y-4">
                {/* Profile & Cover Photo Edit Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-slate-200/60 mb-2">
                  {/* Profile Photo Edit */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl relative">
                    <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2 self-start">
                      {language === 'kh' ? 'រូបថតកូនបំណុល' : 'Profile Photo'}
                    </span>
                    <div className="relative group">
                      <div id="edit-photo-preview-box" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative">
                        {editProfilePhoto ? (
                          <img
                            src={editProfilePhoto}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                        )}
                        
                        {editProfilePhoto && (
                          <button
                            type="button"
                            onClick={() => setEditProfilePhoto('')}
                            className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                            title={language === 'kh' ? 'លុបរូបថត' : 'Remove Photo'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label
                        htmlFor="edit-borrower-photo-file"
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer transition flex items-center justify-center"
                        title={language === 'kh' ? 'ជ្រើសរើសរូបថត' : 'Upload Photo'}
                      >
                        <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <input
                          id="edit-borrower-photo-file"
                          type="file"
                          accept="image/*"
                          onChange={handleEditPhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 text-center">
                      {language === 'kh' ? 'ទំហំសមស្របសម្រាប់ប្រវត្តិរូប' : 'Suitable profile size'}
                    </p>
                  </div>

                  {/* Cover Photo Edit */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl relative">
                    <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2 self-start">
                      {language === 'kh' ? 'រូបថតគម្រប' : 'Cover Photo'}
                    </span>
                    <div className="w-full relative">
                      <div id="edit-cover-preview-box" className="w-full h-16 sm:h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative">
                        {editCoverPhoto ? (
                          <img
                            src={editCoverPhoto}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                        
                        {editCoverPhoto && (
                          <button
                            type="button"
                            onClick={() => setEditCoverPhoto('')}
                            className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                            title={language === 'kh' ? 'លុបរូបថត' : 'Remove Cover'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label
                        htmlFor="edit-borrower-cover-file"
                        className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer transition flex items-center justify-center"
                        title={language === 'kh' ? 'ជ្រើសរើសរូបភាពគម្រប' : 'Upload Cover'}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          id="edit-borrower-cover-file"
                          type="file"
                          accept="image/*"
                          onChange={handleEditCoverChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 text-center">
                      {language === 'kh' ? 'ទំហំសមស្របសម្រាប់រូបភាពគម្រប' : 'Suitable cover size'}
                    </p>
                  </div>

                  {/* Payment QR Code Edit */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/50 rounded-2xl relative">
                    <span className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider mb-2 self-start flex items-center gap-1">
                      <span>💵</span>
                      <span>{language === 'kh' ? 'QR Code សងប្រាក់' : 'Payment QR Code'}</span>
                    </span>
                    <div className="w-full relative">
                      <div id="edit-qr-preview-box" className="w-full h-16 sm:h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner relative">
                        {editPaymentQr ? (
                          <img
                            src={editPaymentQr}
                            alt="QR Preview"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <QrCode className="w-6 h-6 text-slate-300" />
                        )}
                        
                        {editPaymentQr && (
                          <button
                            type="button"
                            onClick={() => setEditPaymentQr('')}
                            className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                            title={language === 'kh' ? 'លុបរូបភាព QR' : 'Remove QR'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <label
                        htmlFor="edit-borrower-qr-file"
                        className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg border border-white cursor-pointer transition flex items-center justify-center"
                        title={language === 'kh' ? 'ជ្រើសរើសរូបភាព QR' : 'Upload QR Code'}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          id="edit-borrower-qr-file"
                          type="file"
                          accept="image/*"
                          onChange={handleEditQrChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1 text-center">
                      {language === 'kh' ? 'រូបភាព QR សម្រាប់កូនបំណុលស្កេន' : 'QR image for debtor to scan'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ឈ្មោះអ្នកខ្ចី' : 'Borrower Name'}
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'លេខទូរស័ព្ទ' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'កាលបរិច្ឆេទខ្ចី' : 'Loan Date'}
                    </label>
                    <input
                      type="date"
                      value={editLoanDate}
                      onChange={(e) => setEditLoanDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ម៉ោងត្រូវបង់ប្រាក់' : 'Due Time'}
                    </label>
                    <input
                      type="time"
                      value={editDueTime}
                      onChange={(e) => setEditDueTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'រូបិយប័ណ្ណ' : 'Currency'}
                    </label>
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="KHR">KHR (៛)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ប្រាក់ខ្ចីដើម' : 'Principal Loan'}
                    </label>
                    <input
                      type="number"
                      value={editPrincipal}
                      onChange={(e) => setEditPrincipal(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ប្រាក់សរុបត្រូវសង' : 'Total to Repay'}
                    </label>
                    <input
                      type="number"
                      value={editTotalToPay}
                      onChange={(e) => setEditTotalToPay(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ប្រាក់ត្រូវបង់ក្នុងមួយវគ្គ' : 'Term Installment Amount'}
                    </label>
                    <input
                      type="number"
                      value={editInstallmentAmount}
                      onChange={(e) => setEditInstallmentAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'វគ្គបង់ប្រាក់' : 'Payment Frequency'}
                    </label>
                    <select
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    >
                      <option value="daily">{language === 'kh' ? 'រាល់ថ្ងៃ' : 'Daily'}</option>
                      <option value="weekly">{language === 'kh' ? 'រាល់សប្តាហ៍' : 'Weekly'}</option>
                      <option value="monthly">{language === 'kh' ? 'រាល់ខែ' : 'Monthly'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {language === 'kh' ? 'ចំនួនដងបង់ប្រាក់ (Installments)' : 'Total Installments'}
                    </label>
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {language === 'kh' ? 'កំណត់ចំណាំ' : 'Notes / Memo'}
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>📣</span>
                    <span>{language === 'kh' ? 'សារជូនដំណឹងសម្រាប់កូនបំណុល (បង្ហាញនៅលើតំណភ្ជាប់សងប្រាក់)' : 'Borrower Alert Message (Shows on Payment Link page)'}</span>
                  </label>
                  <textarea
                    value={editNoticeMessage}
                    onChange={(e) => setEditNoticeMessage(e.target.value)}
                    rows={3}
                    placeholder={language === 'kh' ? 'ឧទាហរណ៍៖ សូមបង់ប្រាក់មុនម៉ោង 5:00 ល្ងាច ឬ បញ្ជាក់ការបង់ប្រាក់នៅទីនេះ...' : 'e.g. Please pay before 5:00 PM or confirm payment here...'}
                    className="w-full px-3.5 py-2.5 text-sm bg-amber-50/50 border border-amber-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium placeholder-slate-400"
                  />
                </div>

                {/* Edit Interest-Only Extension Option */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                        {language === 'kh' ? 'ពន្យារពេលសងដើម (សងការបន្តរ)' : 'Defer Principal (Interest Only)'}
                      </span>
                      <p className="text-[10px] text-amber-700/85 font-semibold mt-0.5">
                        {language === 'kh' ? 'សម្គាល់កូនបំណុលដែលសុំបង់តែការប្រាក់បន្តសិន' : 'Mark borrower paying interest only continuously'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditInterestOnlyExtension(!editInterestOnlyExtension)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        editInterestOnlyExtension ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          editInterestOnlyExtension ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {editInterestOnlyExtension && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {language === 'kh' ? 'កំណត់ចំណាំការសងការបន្តរ' : 'Extension Notes'}
                      </label>
                      <textarea
                        value={editInterestOnlyExtensionNote}
                        onChange={(e) => setEditInterestOnlyExtensionNote(e.target.value)}
                        rows={2}
                        placeholder={language === 'kh' ? 'បញ្ចូលព័ត៌មានលម្អិត...' : 'Enter details...'}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  {language === 'kh' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-md shadow-blue-600/10"
                >
                  {language === 'kh' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Facebook-style Cover and Profile Section */}
            <div className="relative w-full bg-slate-100">
              {/* Cover Photo */}
              <div className="relative h-32 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-slate-200 to-slate-300">
                {borrower.coverPhoto ? (
                  <img
                    src={borrower.coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-extrabold text-[10px] sm:text-xs select-none bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 uppercase tracking-widest">
                    {language === 'kh' ? 'គ្មានរូបភាពគម្រប (Cover photo)' : 'No Cover Photo'}
                  </div>
                )}
              </div>

              {/* Profile Overlapping Area */}
              <div className="px-6 pb-4 pt-12 sm:pt-4 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 border-b border-slate-100 bg-white relative">
                {/* Profile Photo Overlapping with animated frame selector */}
                <div className="absolute left-1/2 sm:left-10 -top-12 -translate-x-1/2 sm:translate-x-0 z-30">
                  <AvatarWithFrame
                    photoUrl={borrower.profilePhoto}
                    name={borrower.name}
                    frameId={borrower.avatarFrame}
                    size="lg"
                    editable={true}
                    onClick={() => setIsFrameModalOpen(true)}
                  />
                </div>

                {/* Name & Title */}
                <div className="text-center sm:text-left sm:pl-32 space-y-1 mt-2 sm:mt-0">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                    {borrower.name}
                  </h3>
                  {borrower.phone && (
                    <a
                      href={`tel:${borrower.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-bold"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{borrower.phone}</span>
                    </a>
                  )}
                </div>

                {/* Status Tags / Quick info */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCompleted 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {isCompleted ? (language === 'kh' ? 'សងរួចរាល់' : 'Completed') : (language === 'kh' ? 'កំពុងសង' : 'Active')}
                  </span>
                  {borrower.statusTag && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      borrower.statusTag === 'good' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : borrower.statusTag === 'late'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {borrower.statusTag}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {borrower.interestOnlyExtension && (
              <div className="mx-6 mt-4 p-4.5 bg-rose-50 border-2 border-rose-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">⚠️</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-rose-800 flex items-center gap-1.5">
                      <span>{language === 'kh' ? 'កូនបំណុលសងការបន្តរ' : 'Borrower Pays Interest Continuously'}</span>
                      <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    </h4>
                    {borrower.interestOnlyExtensionNote && (
                      <p className="text-xs font-bold text-slate-600 bg-white p-2.5 border border-slate-100 rounded-xl whitespace-pre-line leading-relaxed">
                        {language === 'kh' ? 'កំណត់ចំណាំការសងការបន្តរ៖ ' : 'Extension Note: '}{borrower.interestOnlyExtensionNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Elegant Tabs switcher */}
            <div className="px-6 border-b border-slate-100 bg-white flex gap-6 shrink-0">
              <button
                type="button"
                onClick={() => setDetailTab('schedule')}
                className={`py-3.5 text-xs sm:text-sm font-extrabold relative transition-colors duration-200 cursor-pointer ${
                  detailTab === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>🗓️</span>
                  <span>{language === 'kh' ? 'តារាងបង់ប្រាក់' : 'Payment Schedule & Logs'}</span>
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setDetailTab('personal')}
                className={`py-3.5 text-xs sm:text-sm font-extrabold relative transition-colors duration-200 cursor-pointer ${
                  detailTab === 'personal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>👤</span>
                  <span>{language === 'kh' ? 'ព័ត៌មានផ្ទាល់ខ្លួន' : 'Personal & Loan Info'}</span>
                </span>
              </button>
            </div>

            {/* Tab Contents with Framer Motion Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={detailTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-6"
              >
                {detailTab === 'schedule' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Column 2: Visual Installment Card / Box Checklist (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex-1 flex flex-col shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">🗓️ {language === 'kh' ? 'កាតគ្រីស្គូរបង់ប្រាក់ (Installment Checkboard)' : 'Installment Checkboard'}</h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {language === 'kh' ? 'ចុចលើប្រអប់លេខនីមួយៗ ដើម្បីកត់ត្រាសងប្រាក់រហ័ស ឬលុបការបង់ប្រាក់។' : 'Click any box to quickly record installment payment or uncheck to delete.'}
                              </p>
                            </div>
                            {totalPaid < borrower.totalToPay && (
                              <button
                                onClick={() => {
                                  const unpaidIndices: number[] = [];
                                  for (let i = 0; i < borrower.duration; i++) {
                                    if (!paymentBySlot[i]) unpaidIndices.push(i);
                                  }
                                  if (unpaidIndices.length === 0) return;
                                  const msg = language === 'kh'
                                    ? `តើអ្នកពិតជាចង់កត់ត្រាការបង់ប្រាក់សម្រាប់វគ្គដែលនៅសល់ទាំង ${unpaidIndices.length} វគ្គក្នុងពេលតែមួយមែនទេ?`
                                    : `Are you sure you want to log payments for all remaining ${unpaidIndices.length} installments at once?`;
                                  if (window.confirm(msg)) {
                                    unpaidIndices.forEach((index) => {
                                      onAddPayment(borrower.id, {
                                        amount: borrower.installmentAmount,
                                        date: getTodayDateString(),
                                        installmentIndex: index,
                                        note: language === 'kh' ? `ទូទាត់រហ័សវគ្គទី ${index + 1}` : `Quick paid installment ${index + 1}`,
                                      });
                                    });
                                  }
                                }}
                                className="shrink-0 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-xs rounded-xl border border-emerald-200 flex items-center gap-1 cursor-pointer transition duration-150"
                              >
                                <span>✔️ {language === 'kh' ? 'ទូទាត់រហ័សគ្រប់វគ្គ' : 'Auto Check All'}</span>
                              </button>
                            )}
                          </div>

                          {/* Installment Boxes grid */}
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-3 pt-2 overflow-y-auto max-h-[300px] md:max-h-[380px] p-1 border border-slate-100 rounded-xl">
                            {Array.from({ length: borrower.duration }).map((_, index) => {
                              const payment = paymentBySlot[index];
                              const isPaid = !!payment;

                              return (
                                <button
                                  key={index}
                                  id={`day-box-${index}`}
                                  onClick={() => handleBoxClick(index)}
                                  className={`aspect-square p-2 rounded-xl flex flex-col justify-between items-center border transition-all duration-150 cursor-pointer ${isPaid ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/10 hover:bg-emerald-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'}`}
                                >
                                  <span className="text-[10px] font-bold opacity-75 uppercase">{language === 'kh' ? 'វគ្គទី' : 'Term'}</span>
                                  <span className="text-lg font-extrabold leading-none">{index + 1}</span>
                                  {isPaid ? (
                                    <Check className="w-3.5 h-3.5 mt-0.5" />
                                  ) : (
                                    <span className="text-[9px] font-semibold opacity-60">
                                      {formatMoney(borrower.installmentAmount, borrower.currency).replace('៛', '៛').split(' ')[0]}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Instructions */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-emerald-600" />
                              <span>{language === 'kh' ? 'បង់រួច (Paid)' : 'Paid'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-slate-100 rounded-full border border-slate-200" />
                              <span>{language === 'kh' ? 'នៅសល់ (Unpaid)' : 'Unpaid'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Reminder Textbox Card (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 flex-1 flex flex-col shadow-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <span>📣 {language === 'kh' ? 'សារជូនដំណឹងសងប្រាក់' : 'Reminder Message'}</span>
                              </h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {language === 'kh' ? 'អ្នកអាចសរសេរ ឬកែសម្រួលសារជូនដំណឹងនេះ រួចចម្លងដើម្បីផ្ញើទៅកាន់កូនបំណុលរបស់អ្នក។' : 'You can customize this text message and copy it to send as SMS, Telegram, etc.'}
                              </p>
                            </div>
                          </div>

                          {/* Template Presets */}
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => setReminderMessage(getDefaultTemplate('general'))}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1 cursor-pointer"
                            >
                              🔔 {language === 'kh' ? 'សារទូទៅ' : 'General'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReminderMessage(getDefaultTemplate('urgent'))}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100/75 text-rose-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              ⚠️ {language === 'kh' ? 'សាររំលឹកបន្ទាន់' : 'Urgent Notice'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReminderMessage(getDefaultTemplate('thanks'))}
                              className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100/75 text-emerald-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              🎉 {language === 'kh' ? 'សារថ្លែងអំណរគុណ' : 'Thank You'}
                            </button>
                          </div>

                          {/* Message Textarea */}
                          <div className="relative flex-1 min-h-[100px] flex flex-col">
                            <textarea
                              value={reminderMessage}
                              onChange={(e) => setReminderMessage(e.target.value)}
                              rows={4}
                              className="w-full flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 leading-relaxed resize-none"
                              placeholder={language === 'kh' ? "សរសេរសារជូនដំណឹងនៅទីនេះ..." : "Write message here..."}
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={handleCopyMessage}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition duration-150 cursor-pointer ${
                                msgCopied
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/20'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-blue-600 shadow-sm shadow-blue-600/15'
                              }`}
                            >
                              {msgCopied ? (
                                <>
                                  <Check className="w-4 h-4 stroke-[3px]" />
                                  <span>{language === 'kh' ? 'បានចម្លងសារជូនដំណឹងរួចរាល់!' : 'Reminder Message Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>{language === 'kh' ? 'ចម្លងសារ និងតំណភ្ជាប់' : 'Copy Reminder Message'}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const isFullyPaid = remaining <= 0;
                                setReminderMessage(getDefaultTemplate(isFullyPaid ? 'thanks' : 'general'));
                              }}
                              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center"
                              title={language === 'kh' ? "កំណត់ឡើងវិញ" : "Reset Template"}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Payment History Logs */}
                    <div className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl overflow-y-auto max-h-[260px] shadow-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span>🕒</span> 
                        <span>{language === 'kh' ? 'ប្រវត្តិនៃការបង់ប្រាក់ (Payment History)' : 'Payment History Logs'}</span>
                      </h3>
                      
                      {payments.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                          {language === 'kh' ? 'មិនទាន់មានប្រវត្តិបង់ប្រាក់នៅឡើយទេ។' : 'No payment history logged yet.'}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                                <th className="py-2 px-3">{language === 'kh' ? 'ថ្ងៃបង់ប្រាក់' : 'Payment Date'}</th>
                                <th className="py-2 px-3">{language === 'kh' ? 'ចំនួនទឹកប្រាក់' : 'Amount'}</th>
                                <th className="py-2 px-3">{language === 'kh' ? 'ប្រភេទការបង់' : 'Payment Type'}</th>
                                <th className="py-2 px-3">{language === 'kh' ? 'កំណត់សម្គាល់' : 'Notes/Memo'}</th>
                                <th className="py-2 px-3 text-right">{language === 'kh' ? 'សកម្មភាព' : 'Action'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                              {[...payments].reverse().map((pay) => (
                                <tr key={pay.id} className="hover:bg-slate-100/50">
                                  <td className="py-2 px-3 text-slate-800">{formatKhmerDate(pay.date)}</td>
                                  <td className="py-2 px-3 text-blue-600 font-extrabold">{formatMoney(pay.amount, borrower.currency)}</td>
                                  <td className="py-2 px-3">
                                    {pay.installmentIndex !== -1 ? (
                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">
                                        {language === 'kh' ? `វគ្គទី ${pay.installmentIndex + 1}` : `Term ${pay.installmentIndex + 1}`}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold">
                                        {language === 'kh' ? 'បង់តាមចិត្ត' : 'Custom'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-slate-400 italic max-w-[200px] truncate">{pay.note || '-'}</td>
                                  <td className="py-2 px-3 text-right">
                                    <button
                                      onClick={() => {
                                        const confirmMsg = language === 'kh'
                                          ? 'តើអ្នកចង់លុបការបង់ប្រាក់នេះឡើងវិញមែនទេ?'
                                          : 'Are you sure you want to delete this payment record?';
                                        if (confirm(confirmMsg)) {
                                          onDeletePayment(borrower.id, pay.id);
                                        }
                                      }}
                                      className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-md transition cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column 1 Left: Financial Ledger (6 cols) */}
                    <div className="lg:col-span-6 space-y-6">
                      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📊</span>
                          <span>{language === 'kh' ? 'ព័ត៌មានគណនេយ្យ' : 'Financial Ledger'}</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{language === 'kh' ? 'ប្រាក់ខ្ចីដើម' : 'Principal Loan'}</span>
                            <span className="text-sm font-extrabold text-slate-800">{formatMoney(borrower.principal, borrower.currency)}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{language === 'kh' ? 'ប្រាក់សរុបត្រូវសង' : 'Total to Repay'}</span>
                            <span className="text-sm font-extrabold text-slate-800">{formatMoney(borrower.totalToPay, borrower.currency)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{language === 'kh' ? 'បានសងសរុប' : 'Total Collected'}</span>
                            <span className="text-sm font-extrabold text-emerald-600">{formatMoney(totalPaid, borrower.currency)}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">{language === 'kh' ? 'ប្រាក់នៅសល់' : 'Remaining'}</span>
                            <span className={`text-sm font-extrabold ${isCompleted ? 'text-slate-300' : 'text-orange-600'}`}>
                              {formatMoney(remaining, borrower.currency)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                            <span>{language === 'kh' ? 'វឌ្ឍនភាពនៃការសង' : 'Repayment Progress'}</span>
                            <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 text-slate-600 font-medium">
                          {borrower.interestValue !== undefined && (
                            <div className="flex justify-between">
                              <span>{language === 'kh' ? 'ការប្រាក់ (Interest)៖' : 'Interest rate:'}</span>
                              <span className="text-slate-800 font-bold">
                                {borrower.interestType === 'percent' ? `${borrower.interestValue}%` : formatMoney(borrower.interestValue, borrower.currency)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>{language === 'kh' ? 'របៀបគណនាការប្រាក់៖' : 'Interest Calculation:'}</span>
                            <span className="font-bold text-slate-800">
                              {borrower.interestCalculation === 'per-period' 
                                ? (language === 'kh' ? '🔄 ការប្រាក់ប្រចាំថ្ងៃ/វគ្គ' : '🔄 Per Installment Term') 
                                : (language === 'kh' ? '🎯 ការប្រាក់សរុប' : '🎯 Total Fixed Interest')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'kh' ? 'របៀបសងប្រាក់៖' : 'Repayment Mode:'}</span>
                            <span className="font-extrabold text-blue-700">
                              {borrower.paymentMode === 'interest-only' 
                                ? (language === 'kh' ? '📈 បង់តែការសុទ្ធ (Interest Only)' : '📈 Interest-only Payment') 
                                : (language === 'kh' ? '💵 បង់ទាំងដើមទាំងការ' : '💵 Principal + Interest')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'kh' ? 'កាលបរិច្ឆេទខ្ចី៖' : 'Loan Date:'}</span>
                            <span className="text-slate-800 font-bold">{formatKhmerDate(borrower.loanDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'kh' ? 'វគ្គបង់ប្រាក់៖' : 'Payment Frequency:'}</span>
                            <span className="text-slate-800 font-bold">
                              {borrower.frequency === 'daily' 
                                ? (language === 'kh' ? 'រាល់ថ្ងៃ' : 'Daily') 
                                : borrower.frequency === 'weekly' 
                                  ? (language === 'kh' ? 'រាល់សប្តាហ៍' : 'Weekly') 
                                  : (language === 'kh' ? 'រាល់ខែ' : 'Monthly')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === 'kh' ? 'បង់ប្រាក់ក្នុងមួយដង៖' : 'Term Installment Amount:'}</span>
                            <span className="text-blue-600 font-extrabold">{formatMoney(borrower.installmentAmount, borrower.currency)}</span>
                          </div>
                          {borrower.notes && (
                            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200">
                              <span className="font-bold block text-slate-500 mb-0.5">{language === 'kh' ? 'កំណត់ចំណាំ៖' : 'Notes:'}</span>
                              <p className="whitespace-pre-line text-slate-600 leading-relaxed font-bold bg-white p-2 border border-slate-100 rounded-lg">{borrower.notes}</p>
                            </div>
                          )}
                          {borrower.noticeMessage && (
                            <div className="pt-2 text-[11px] border-t border-slate-200">
                              <span className="font-bold block text-amber-600 flex items-center gap-1 mb-1">
                                <span>📣</span>
                                <span>{language === 'kh' ? 'សារជូនដំណឹងរំលឹកកូនបំណុល៖' : 'Borrower Alert Notice:'}</span>
                              </span>
                              <p className="whitespace-pre-line text-slate-700 font-bold bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl leading-relaxed">{borrower.noticeMessage}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Column 1 Right: Standing, Auto Check-In, Custom Payment Form (6 cols) */}
                    <div className="lg:col-span-6 space-y-6">
                      {/* Borrower standing status picker */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <span>🌟</span> {language === 'kh' ? 'ស្ថានភាពកូនបំណុល' : 'Borrower Standing Rating'}
                        </h4>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(borrower.id, 'good')}
                            className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              borrower.statusTag === 'good'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm">🟢</span>
                            <span>{language === 'kh' ? 'ល្អ (Good)' : 'Good'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(borrower.id, 'regular')}
                            className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              borrower.statusTag === 'regular' || !borrower.statusTag
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm">🟡</span>
                            <span>{language === 'kh' ? 'ធម្មតា (Regular)' : 'Regular'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(borrower.id, 'late')}
                            className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              borrower.statusTag === 'late'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-600/20 animate-pulse'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm">🔴</span>
                            <span>{language === 'kh' ? 'យឺតយ៉ាវ (Late)' : 'Late/Slow'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Auto Check-In Toggle Option */}
                      <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span>🔄</span> {t('toggleAutoCheckInLabel')}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                            {t('toggleAutoCheckInDesc')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onToggleAutoCheckIn && onToggleAutoCheckIn(borrower.id)}
                          disabled={!onToggleAutoCheckIn}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            borrower.autoCheckIn ? 'bg-blue-600' : 'bg-slate-200'
                          } ${!onToggleAutoCheckIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              borrower.autoCheckIn ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Interest-Only Extension Option Card */}
                      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span>⚠️</span> {language === 'kh' ? 'មុខងារពន្យាពេលសងដើម (សងការបន្តរ)' : 'Defer Principal (Interest Only)'}
                          </h4>
                          <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
                            {language === 'kh' 
                              ? 'ប្រើប្រាស់មុខងារនេះ នៅពេលកូនបំណុលសុំពន្យារពេលសងប្រាក់ដើម ដោយយល់ព្រមបង់តែការប្រាក់បន្តសិន។'
                              : 'Use this option when the borrower requests to delay principal payment and only pay interest continuously.'}
                          </p>
                        </div>

                        {/* Note Input */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {language === 'kh' ? 'កំណត់ចំណាំការសងការបន្តរ' : 'Extension Notes'}
                          </label>
                          <textarea
                            value={extensionNote}
                            onChange={(e) => setExtensionNote(e.target.value)}
                            rows={2}
                            placeholder={language === 'kh' ? 'បញ្ចូលមូលហេតុ ឬលក្ខខណ្ឌនៃការសងការបន្តរ...' : 'Enter reasons or conditions...'}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-700"
                          />
                        </div>

                        {/* Process Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {/* Toggle Active state */}
                          <button
                            type="button"
                            onClick={() => {
                              const nextActive = !extensionActive;
                              setExtensionActive(nextActive);
                            }}
                            className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              extensionActive
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-500/25'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>🔔</span>
                            <span>
                              {extensionActive 
                                ? (language === 'kh' ? 'បានបើកសងការបន្តរ' : 'Extension Enabled') 
                                : (language === 'kh' ? 'បើកសងការបន្តរ' : 'Enable Extension')}
                            </span>
                          </button>

                          {/* Proceed/Save Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onEditBorrower) {
                                onEditBorrower(borrower.id, {
                                  interestOnlyExtension: extensionActive,
                                  interestOnlyExtensionNote: extensionNote.trim(),
                                });
                                alert(language === 'kh' 
                                  ? 'បានដំណើរការកំណត់ការសងការបន្តររបស់កូនបំណុលរួចរាល់!' 
                                  : 'Successfully processed borrower interest-only payment extension!'
                                );
                              }
                            }}
                            className="px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition cursor-pointer shadow-md shadow-blue-600/10 flex items-center justify-center gap-1 shrink-0"
                          >
                            <span>🚀</span>
                            <span>{language === 'kh' ? 'ដំណើរការ' : 'Process'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Custom Payment Form */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span>📝 {language === 'kh' ? 'បញ្ចូលការបង់ប្រាក់តាមចិត្ត' : 'Custom Payment Entry'}</span>
                        </h3>
                        <form onSubmit={handleCustomPaymentSubmit} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{language === 'kh' ? 'ទឹកប្រាក់សង' : 'Amount Paid'}</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={customAmount}
                                  onChange={(e) => setCustomAmount(e.target.value)}
                                  placeholder={borrower.installmentAmount.toString()}
                                  className="w-full pl-3 pr-7 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-800"
                                  min="0.01"
                                  step="any"
                                  required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                  {borrower.currency === 'USD' ? '$' : '៛'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{language === 'kh' ? 'ថ្ងៃបង់ប្រាក់' : 'Payment Date'}</label>
                              <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{language === 'kh' ? 'ការសម្គាល់បន្ថែម' : 'Note / Memo'}</label>
                            <input
                              type="text"
                              value={customNote}
                              onChange={(e) => setCustomNote(e.target.value)}
                              placeholder={language === 'kh' ? "ឧ. បង់បន្ថែមសម្រាប់ថ្ងៃអាទិត្យ" : "e.g., extra payment on Sunday"}
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{language === 'kh' ? 'កត់ត្រាការបង់ប្រាក់' : 'Record Payment'}</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Copy Payment Link & Reminder Message Modal */}
        {isShareModalOpen && (
          <div id="share-link-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 flex flex-col p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📣</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                      {language === 'kh' ? 'ផ្ញើសារជូនដំណឹង និងតំណសងប្រាក់' : 'Send Payment Reminder & Link'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold">
                      {language === 'kh' ? 'អ្នកអាចកែសម្រួលសារជូនដំណឹងនេះ រួចចម្លងផ្ញើទៅកូនបំណុល' : 'You can edit this message and copy it to send to borrower'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Template Presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'kh' ? 'ជ្រើសរើសទម្រង់សារគំរូ' : 'Choose Preset Template'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReminderMessage(getDefaultTemplate('general'))}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    🔔 {language === 'kh' ? 'សារទូទៅ' : 'General'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderMessage(getDefaultTemplate('urgent'))}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100/75 text-rose-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    ⚠️ {language === 'kh' ? 'សាររំលឹកបន្ទាន់' : 'Urgent Notice'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderMessage(getDefaultTemplate('thanks'))}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-emerald-100 bg-emerald-50 hover:bg-emerald-100/75 text-emerald-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    🎉 {language === 'kh' ? 'សារថ្លែងអំណរគុណ' : 'Thank You'}
                  </button>
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  {language === 'kh' ? 'សរសេរសារជូនដំណឹងរបស់អ្នក' : 'Your Notice Message'}
                </span>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={6}
                  className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-700 leading-relaxed resize-none"
                  placeholder={language === 'kh' ? "សរសេរសារជូនដំណឹងនៅទីនេះ..." : "Write notice message here..."}
                />
              </div>

              {/* Payment QR Code Section */}
              <div className="border-t border-slate-100 pt-3.5 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                  <span>📸</span>
                  <span>{language === 'kh' ? 'QR Code សម្រាប់បង់ប្រាក់ (បង្ហាញនៅលើតំណភ្ជាប់)' : 'Payment QR Code (Shows on Link page)'}</span>
                </span>
                
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                  <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-white shrink-0 shadow-inner">
                    {editPaymentQr ? (
                      <img src={editPaymentQr} alt="QR Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <QrCode className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-700 truncate">
                      {editPaymentQr ? (language === 'kh' ? 'មានរូបភាព QR Code រួចរាល់' : 'QR Code Image Uploaded') : (language === 'kh' ? 'មិនទាន់មាន QR Code សម្រាប់បង់ប្រាក់' : 'No Payment QR Code Attached')}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                      {language === 'kh' ? 'កូនបំណុលនឹងឃើញ QR នេះពេលបើកតំណភ្ជាប់' : 'Debtor will see this QR when opening the link'}
                    </p>
                  </div>
                  <label className="px-2.5 py-1.5 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition cursor-pointer shrink-0">
                    {language === 'kh' ? 'ជ្រើសរើស QR' : 'Choose QR'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditQrChange}
                      className="hidden"
                    />
                  </label>
                  {editPaymentQr && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditPaymentQr('');
                        if (onEditBorrower) {
                          onEditBorrower(borrower.id, { paymentQr: '' });
                        }
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition animate-in fade-in"
                      title={language === 'kh' ? 'លុប QR' : 'Remove QR'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {/* Secondary: Copy Link Only */}
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>{copied ? (language === 'kh' ? 'បានចម្លងតំណភ្ជាប់!' : 'Link Copied!') : (language === 'kh' ? 'ចម្លងតែតំណសងប្រាក់' : 'Copy Link Only')}</span>
                </button>

                {/* Primary: Copy customized message */}
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition duration-150 cursor-pointer ${
                    msgCopied
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/20'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border-blue-600 shadow-sm shadow-blue-600/15'
                  }`}
                >
                  {msgCopied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3px]" />
                      <span>{language === 'kh' ? 'បានចម្លងសារជូនដំណឹង!' : 'Reminder Message Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'kh' ? 'ចម្លងសារ និងតំណភ្ជាប់' : 'Copy Message & Link'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Live Chat Drawer */}
        <LiveChat
          borrower={borrower}
          sender="lender"
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onUpdateBorrower={(updatedFields) => {
            if (onEditBorrower) {
              onEditBorrower(borrower.id, updatedFields);
            }
          }}
        />

        {/* Reusable Frame Selection Modal */}
        <FrameSelectorModal
          isOpen={isFrameModalOpen}
          onClose={() => setIsFrameModalOpen(false)}
          currentFrameId={borrower.avatarFrame}
          onSelectFrame={(frameId) => {
            if (onEditBorrower) {
              onEditBorrower(borrower.id, { avatarFrame: frameId });
            }
          }}
          borrowerName={borrower.name}
          photoUrl={borrower.profilePhoto}
        />
      </motion.div>
    </motion.div>
  );
}
