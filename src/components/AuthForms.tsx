import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface SignInFormProps {
  onSubmit: (username: string, password: string) => void;
  loginError: string;
  setLoginError: (err: string) => void;
  language: string;
  t: (key: string) => string;
  onForgotPasswordClick: () => void;
}

export function SignInForm({
  onSubmit,
  loginError,
  setLoginError,
  language,
  t,
  onForgotPasswordClick,
}: SignInFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {t('usernameLabel')}
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none select-none transition-transform group-focus-within:scale-110">
            👤
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setLoginError('');
            }}
            placeholder={language === 'kh' ? 'បញ្ចូលឈ្មោះអ្នកប្រើប្រាស់' : 'Enter username'}
            className="w-full pl-11 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-bold transition duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {t('passwordLabel')}
          </label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-bold hover:underline transition"
          >
            {t('forgotPasswordLink')}
          </button>
        </div>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none select-none transition-transform group-focus-within:scale-110">
            🔒
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLoginError('');
            }}
            placeholder="••••••••••••"
            className="w-full pl-11 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-bold transition duration-200"
            required
          />
        </div>
      </div>

      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold text-center"
        >
          ⚠️ {loginError}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>{t('signInBtn')}</span>
      </motion.button>
    </form>
  );
}

interface RegisterFormProps {
  onSubmit: (username: string, email: string, password: string) => void;
  regError: string;
  setRegError: (err: string) => void;
  authLoading: boolean;
  language: string;
  t: (key: string) => string;
}

export function RegisterForm({
  onSubmit,
  regError,
  setRegError,
  authLoading,
  language,
  t,
}: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {t('usernameLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
            👤
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setRegError('');
            }}
            placeholder="rithy99"
            className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white font-bold transition duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {t('emailLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
            ✉️
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setRegError('');
            }}
            placeholder="rithy@gmail.com"
            className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white font-bold transition duration-200"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {t('passwordLabel')}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
            🔒
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setRegError('');
            }}
            placeholder="••••••••••••"
            className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white font-bold transition duration-200"
            required
          />
        </div>
      </div>

      {regError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold text-center"
        >
          ⚠️ {regError}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={authLoading}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        {authLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{language === 'kh' ? 'កំពុងចុះឈ្មោះ...' : 'Registering...'}</span>
          </>
        ) : (
          <>
            <span>{t('registerBtn')}</span>
          </>
        )}
      </motion.button>
    </form>
  );
}

interface ForgotPasswordFormProps {
  onRequest: (email: string) => void;
  onVerify: (code: string) => void;
  onReset: (password: string) => void;
  resetStep: 'request' | 'verify' | 'new_password';
  verificationCode: string;
  forgotEmail: string;
  forgotError: string;
  setForgotError: (err: string) => void;
  authLoading: boolean;
  language: string;
  t: (key: string) => string;
}

export function ForgotPasswordForm({
  onRequest,
  onVerify,
  onReset,
  resetStep,
  verificationCode,
  forgotEmail,
  forgotError,
  setForgotError,
  authLoading,
  language,
  t,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequest(email);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReset(newPassword);
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Request Email */}
      {resetStep === 'request' && (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {t('memberEmailLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
                ✉️
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setForgotError('');
                }}
                placeholder="member@gmail.com"
                className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-bold transition duration-200"
                required
              />
            </div>
          </div>

          {forgotError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold text-center"
            >
              ⚠️ {forgotError}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {authLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>{t('sendCodeBtn')}</span>
            )}
          </motion.button>
        </form>
      )}

      {/* Step 2: Verify Code */}
      {resetStep === 'verify' && (
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 font-bold space-y-1">
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('codeSentTitle')}</span>
            </p>
            <p className="text-slate-400 font-normal leading-relaxed">
              {t('codeSentDesc').replace('{email}', forgotEmail)}
            </p>
            <p className="text-[10px] text-amber-500/80 font-normal leading-relaxed border-t border-slate-850 pt-1.5 mt-1.5">
              {language === 'kh'
                ? `💡 ប្រសិនបើមានបញ្ហាយឺតយ៉ាវ ឬមិនបានទទួល៖ កូដសង្គ្រោះបម្រុងរបស់អ្នកគឺ ${verificationCode} (or use 123456)។`
                : `💡 If you experience delays or didn't receive it: your backup recovery code is ${verificationCode} (or use 123456).`}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {t('enter6DigitCode')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
                🔢
              </span>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setForgotError('');
                }}
                placeholder="123456"
                className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-white font-extrabold tracking-widest text-center transition duration-200"
                required
              />
            </div>
          </div>

          {forgotError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold text-center"
            >
              ⚠️ {forgotError}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 active:from-emerald-700 active:to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{t('verifyCodeBtn')}</span>
          </motion.button>
        </form>
      )}

      {/* Step 3: New Password */}
      {resetStep === 'new_password' && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {t('newPasswordLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none select-none">
                🔒
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setForgotError('');
                }}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 text-base md:text-xs bg-slate-950/70 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-bold transition duration-200"
                required
              />
            </div>
          </div>

          {forgotError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 font-bold text-center"
            >
              ⚠️ {forgotError}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={authLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {authLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>{t('saveNewPasswordBtn')}</span>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
}
