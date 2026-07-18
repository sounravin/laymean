import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Borrower, ChatMessage } from '../types';
import { Send, X, MessageCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../i18n';

interface LiveChatProps {
  borrower: Borrower;
  sender: 'lender' | 'borrower';
  isOpen: boolean;
  onClose: () => void;
  onUpdateBorrower: (updatedFields: Partial<Borrower>) => void;
}

export default function LiveChat({
  borrower,
  sender,
  isOpen,
  onClose,
  onUpdateBorrower
}: LiveChatProps) {
  const { language } = useLanguage();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = borrower.chatMessages || [];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      // Delay slightly to allow transition animation to complete
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
      sender,
      message: text.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMessage];
    onUpdateBorrower({ chatMessages: updatedMessages });
    setText('');
  };

  // Helper to format timestamps beautifully
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            id="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Chat Sliding Drawer */}
          <motion.div
            id="chat-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                    {language === 'kh' ? 'ប្រអប់ជជែកផ្ទាល់' : 'Live Chat Portal'}
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    {sender === 'lender' ? (
                      <>
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{language === 'kh' ? `កូនបំណុល៖ ${borrower.name}` : `Borrower: ${borrower.name}`}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>{language === 'kh' ? 'ម្ចាស់បំណុល (Lender Support)' : 'Lender Support'}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body (Messages List) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xl border border-slate-700/50">💬</div>
                  <div>
                    <h4 className="text-sm font-black text-slate-300">
                      {language === 'kh' ? 'មិនទាន់មានការជជែកនៅឡើយទេ' : 'No messages yet'}
                    </h4>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1 font-semibold">
                      {language === 'kh' 
                        ? 'អ្នកអាចផ្ញើសារសាកសួរ ឬជជែកពិភាក្សាសងប្រាក់គ្នានៅទីនេះ។ រាល់ការផ្ញើនឹងជូនដំណឹងរហ័ស!'
                        : 'Start a direct chat with the other party here. Messages sync instantly in real-time!'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender === sender;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      {/* Sender label (only for received messages) */}
                      {!isMe && (
                        <span className="text-[9px] font-black text-slate-500 mb-1 px-1">
                          {msg.sender === 'lender' 
                            ? (language === 'kh' ? '📣 ម្ចាស់បំណុល' : '📣 Lender')
                            : (language === 'kh' ? '👤 កូនបំណុល' : '👤 Borrower')}
                        </span>
                      )}

                      {/* Chat bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold leading-relaxed whitespace-pre-wrap shadow-xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                        }`}
                      >
                        {msg.message}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[8px] font-bold text-slate-500 mt-1 flex items-center gap-0.5 px-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(msg.timestamp)}</span>
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Footer Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={language === 'kh' ? "វាយបញ្ចូលសារជជែកនៅទីនេះ..." : "Type your message here..."}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-bold"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer ${
                    text.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[9px] text-slate-500 text-center font-bold mt-2.5">
                🔒 {language === 'kh' ? 'ប្រព័ន្ធជជែកផ្ទាល់សុវត្ថិភាព និងល្បឿនលឿន' : 'Secured and synchronized live portal connection'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
