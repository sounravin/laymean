import React, { useState, useEffect, useRef } from 'react';
import { Borrower } from '../types';
import { getDaysUntilNextPayment, formatMoney } from '../utils';
import { Bell, Phone, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationBellProps {
  borrowers: Borrower[];
  onSelectBorrower: (id: string) => void;
  isMobile?: boolean;
  sidebarMode?: boolean;
}

export default function NotificationBell({ borrowers, onSelectBorrower, isMobile = false, sidebarMode = false }: NotificationBellProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter borrowers who are due soon or overdue (days left <= 1) and not archived
  const dueSoonList = borrowers.filter((b) => {
    const dl = getDaysUntilNextPayment(b);
    return dl !== null && dl <= 1;
  });

  // Toggle notification panel
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className={`relative flex items-center justify-center rounded-xl transition cursor-pointer border border-transparent select-none focus:outline-none ${
          sidebarMode
            ? 'p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-md'
            : isMobile
            ? 'p-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-amber-400'
            : 'p-2.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 shadow-xs'
        }`}
        title={language === 'kh' ? 'ការជូនដំណឹងត្រូវទូទាត់ប្រាក់' : 'Payment Notifications'}
      >
        <Bell className={`${sidebarMode ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${dueSoonList.length > 0 ? 'animate-wiggle text-amber-500' : ''}`} />
        
        {/* Count Badge Alert with Ping Effect */}
        {dueSoonList.length > 0 && (
          <>
            <span className={`absolute ${sidebarMode ? '-top-0.5 -right-0.5 h-3.5 w-3.5' : '-top-1 -right-1 h-4.5 w-4.5'} flex`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className={`relative inline-flex rounded-full bg-rose-500 text-white items-center justify-center shadow-xs font-black ${sidebarMode ? 'h-3.5 w-3.5 text-[7.5px]' : 'h-4.5 w-4.5 text-[9px]'}`}>
                {dueSoonList.length}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop Overlay */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40"
              />
            )}
            <motion.div
              initial={
                sidebarMode
                  ? { opacity: 0, x: -20, scale: 0.95 }
                  : isMobile
                  ? { opacity: 0, y: -16, scale: 0.95 }
                  : { opacity: 0, y: 12, scale: 0.95 }
              }
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={
                sidebarMode
                  ? { opacity: 0, x: -16, scale: 0.95 }
                  : isMobile
                  ? { opacity: 0, y: -12, scale: 0.95 }
                  : { opacity: 0, y: 8, scale: 0.95 }
              }
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden ${
                sidebarMode
                  ? 'absolute left-full top-0 ml-4 w-88 md:w-96 z-50 shadow-2xl origin-left border-slate-100'
                  : isMobile
                  ? 'fixed top-[96px] left-4 right-4 max-w-[calc(100vw-32px)] sm:max-w-md mx-auto z-50 shadow-2xl'
                  : 'absolute mt-2 right-0 w-88 md:w-96 z-50'
              }`}
            >
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <h3 className="font-extrabold text-xs tracking-wider uppercase">
                  {language === 'kh' ? 'ការជូនដំណឹងត្រូវទូទាត់ប្រាក់' : 'Payment Alerts'}
                </h3>
              </div>
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {dueSoonList.length} {language === 'kh' ? 'ករណី' : 'Cases'}
              </span>
            </div>

            {/* Sub-label showing time scope */}
            <div className="bg-amber-50 border-b border-amber-100/60 px-4 py-2 text-[10px] text-amber-800 font-bold flex items-center justify-between">
              <span>{language === 'kh' ? '🔔 រាប់ចាប់ពីថ្ងៃស្អែកទៅ' : '🔔 Due Starting from Tomorrow'}</span>
              <span className="text-[9px] font-medium opacity-80">{language === 'kh' ? 'ចុចលើគណនីដើម្បីពិនិត្យ' : 'Click on account to verify'}</span>
            </div>

            {/* List Content */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {dueSoonList.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="text-3xl">🎉</div>
                  <p className="text-xs font-bold text-slate-800">
                    {language === 'kh' ? 'គ្មានការជូនដំណឹងថ្មីៗទេ' : 'No new notifications'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'kh' ? 'រាល់កូនបំណុលទាំងអស់បានទូទាត់ទាន់ពេលវេលា!' : 'All active borrowers have settled on schedule!'}
                  </p>
                </div>
              ) : (
                dueSoonList.map((b) => {
                  const daysLeft = getDaysUntilNextPayment(b);
                  const isOverdue = daysLeft !== null && daysLeft < 0;
                  const isToday = daysLeft === 0;

                  // Format status string
                  let statusText = '';
                  let statusColorClass = '';
                  if (isOverdue) {
                    statusText = language === 'kh' 
                      ? `ហួសកំណត់ ${Math.abs(daysLeft!)} ថ្ងៃ`
                      : `Overdue by ${Math.abs(daysLeft!)}d`;
                    statusColorClass = 'bg-rose-100 text-rose-800 border-rose-200';
                  } else if (isToday) {
                    statusText = language === 'kh' ? 'ត្រូវបង់ថ្ងៃនេះ' : 'Due Today';
                    statusColorClass = 'bg-amber-500 text-white border-amber-600';
                  } else {
                    statusText = language === 'kh' ? 'ត្រូវបង់ថ្ងៃស្អែក' : 'Due Tomorrow';
                    statusColorClass = 'bg-amber-100 text-amber-800 border-amber-200';
                  }

                  const totalPaid = Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
                  const remaining = Math.max(0, b.totalToPay - totalPaid);

                  return (
                    <div
                      key={`bell-item-${b.id}`}
                      onClick={() => {
                        onSelectBorrower(b.id);
                        setIsOpen(false);
                      }}
                      className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors duration-150 flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 group-hover:scale-125 transition-transform"></span>
                          <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                            {b.name}
                          </h4>
                        </div>
                        
                        {b.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold pl-3">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{b.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 pl-3">
                          <div className="bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-lg">
                            <span className="text-[8px] text-slate-400 block font-bold uppercase leading-none">{language === 'kh' ? 'ត្រូវបង់' : 'Installment'}</span>
                            <span className="font-extrabold text-[10px] text-slate-700 leading-none block mt-0.5">
                              {b.installmentAmount.toLocaleString()} {b.currency === 'USD' ? '$' : '៛'}
                            </span>
                          </div>
                          <div className="bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg">
                            <span className="text-[8px] text-amber-500 block font-bold uppercase leading-none">{language === 'kh' ? 'នៅខ្វះ' : 'Remaining'}</span>
                            <span className="font-extrabold text-[10px] text-amber-800 leading-none block mt-0.5">
                              {remaining.toLocaleString()} {b.currency === 'USD' ? '$' : '៛'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 text-center ${statusColorClass}`}>
                          {statusText}
                        </span>
                        {b.dueTime && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {b.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer with a check list action link */}
            {dueSoonList.length > 0 && (
              <div className="bg-slate-50 p-2.5 text-center text-[10px] text-slate-500 border-t border-slate-100 font-bold">
                {language === 'kh' ? '🔔 ចុចលើគណនីខាងលើដើម្បីពិនិត្យ និងកត់ត្រាការបង់ប្រាក់' : '🔔 Click above to view and register payment'}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}
