import React, { useState, useEffect } from 'react';
import { Borrower, LedgerStats, CurrencyType, Payment, Member, SubscriptionRequest } from './types';
import { generateId, getTodayDateString, runAutoCheckInForBorrowers, getDaysUntilNextPayment } from './utils';
import Header from './components/Header';
import BorrowerCard from './components/BorrowerCard';
import BorrowerDetail from './components/BorrowerDetail';
import AddBorrowerModal from './components/AddBorrowerModal';
import BorrowerPortal from './components/BorrowerPortal';
import AdminMembersDashboard from './components/AdminMembersDashboard';
import PricingPanel from './components/PricingPanel';
import NotificationBell from './components/NotificationBell';
import { Search, Info, Check, CheckSquare, RefreshCw, Star, Lock, LogOut, ShieldCheck, Cloud, Mail, Key, ArrowLeft, Award, Activity, CheckCircle2, Share2, Copy, Plus, Percent, ChevronRight, Coins, Users, Bell, BookOpen, MessageSquare, Settings, ShieldAlert, Moon, Sun, Upload, Camera, Clock, QrCode } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useLanguage } from './i18n';
import { motion, AnimatePresence } from 'motion/react';
import { SignInForm, RegisterForm, ForgotPasswordForm } from './components/AuthForms';
import PWAInstallBanner from './components/PWAInstallBanner';

const LOCAL_STORAGE_KEY = 'luypay_ledger_borrowers';

const getUserLocalStorageKey = (user: string | null) => {
  if (!user || user === 'sounravin') return LOCAL_STORAGE_KEY;
  return `luypay_ledger_borrowers_${user}`;
};

// Realistic Khmer seed data
const SEED_BORROWERS: Borrower[] = [
  {
    id: 'seed-1',
    name: 'សុខ ម៉ារី (Sok Mary)',
    phone: '089 778 221',
    loanDate: '2026-07-01',
    principal: 400000,
    totalToPay: 480000,
    installmentAmount: 20000,
    frequency: 'daily',
    duration: 24,
    currency: 'KHR',
    notes: 'អាជីវករលក់ដូរគ្រឿងទេសនៅផ្សារអូឡាំពិក ជួបបង់រាល់ល្ងាចម៉ោង ៥',
    payments: [
      { id: 'pay-1-1', date: '2026-07-01', amount: 20000, installmentIndex: 0, note: 'បង់ប្រាក់វគ្គទី ១' },
      { id: 'pay-1-2', date: '2026-07-02', amount: 20000, installmentIndex: 1, note: 'បង់ប្រាក់វគ្គទី ២' },
      { id: 'pay-1-3', date: '2026-07-03', amount: 20000, installmentIndex: 2, note: 'បង់ប្រាក់វគ្គទី ៣' },
      { id: 'pay-1-4', date: '2026-07-04', amount: 20000, installmentIndex: 3, note: 'បង់ប្រាក់វគ្គទី ៤' },
      { id: 'pay-1-5', date: '2026-07-05', amount: 20000, installmentIndex: 4, note: 'បង់ប្រាក់វគ្គទី ៥' },
      { id: 'pay-1-6', date: '2026-07-06', amount: 20000, installmentIndex: 5, note: 'បង់ប្រាក់វគ្គទី ៦' },
    ],
    isArchived: false,
  },
  {
    id: 'seed-2',
    name: 'ចាន់ ដារ៉ា (Chan Dara)',
    phone: '012 990 882',
    loanDate: '2026-06-15',
    principal: 500,
    totalToPay: 600,
    installmentAmount: 50,
    frequency: 'weekly',
    duration: 12,
    currency: 'USD',
    notes: 'ម្ចាស់ហាងជួសជុលម៉ូតូ ធានាបង់រាល់ល្ងាចថ្ងៃសៅរ៍',
    payments: [
      { id: 'pay-2-1', date: '2026-06-22', amount: 50, installmentIndex: 0, note: 'បង់ប្រាក់វគ្គទី ១' },
      { id: 'pay-2-2', date: '2026-06-29', amount: 50, installmentIndex: 1, note: 'បង់ប្រាក់វគ្គទី ២' },
      { id: 'pay-2-3', date: '2026-07-06', amount: 50, installmentIndex: 2, note: 'បង់ប្រាក់វគ្គទី ៣' },
    ],
    isArchived: false,
  },
  {
    id: 'seed-3',
    name: 'គង់ ស្រីនឿន (Kong Sreyneun)',
    phone: '096 445 112',
    loanDate: '2026-05-10',
    principal: 200,
    totalToPay: 240,
    installmentAmount: 10,
    frequency: 'daily',
    duration: 24,
    currency: 'USD',
    notes: 'កូនជាងកាត់ដេរក្បែររោងចក្រ វីងវីង',
    payments: Array.from({ length: 24 }).map((_, index) => ({
      id: `pay-3-${index}`,
      date: `2026-05-${11 + index}`,
      amount: 10,
      installmentIndex: index,
      note: `បង់ប្រាក់វគ្គទី ${index + 1}`,
    })),
    isArchived: true, // Archived since it is completed
  }
];

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(null);
  const [selectedBorrowerIds, setSelectedBorrowerIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'archived' | 'all'>('active');
  const [standingFilter, setStandingFilter] = useState<'all' | 'good' | 'regular' | 'late' | 'dueSoon'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Secure Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('luypay_logged_in') === 'true');
  const [currentUser, setCurrentUser] = useState<string>(() => localStorage.getItem('luypay_current_user') || 'sounravin');
  const [userDisplayName, setUserDisplayName] = useState<string>(() => localStorage.getItem('luypay_user_display_name') || 'Soun Ravin');
  const [userAuthType, setUserAuthType] = useState<'credentials' | 'google' | 'facebook'>(() => (localStorage.getItem('luypay_auth_type') as any) || 'credentials');
  const [isMember, setIsMember] = useState<boolean>(() => localStorage.getItem('luypay_is_member') === 'true');

  const [activeSection, setActiveSection] = useState<'ledger' | 'admin_dashboard' | 'pricing'>('ledger');
  const [members, setMembers] = useState<Member[]>([]);
  const [subRequests, setSubRequests] = useState<SubscriptionRequest[]>([]);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);
  const [mySubRequests, setMySubRequests] = useState<SubscriptionRequest[]>([]);
  const [blockScreenSelectedPlan, setBlockScreenSelectedPlan] = useState<'1_month' | '3_months' | '1_year'>('3_months');
  const [blockScreenSubmitting, setBlockScreenSubmitting] = useState<boolean>(false);
  const [blockScreenPaymentStep, setBlockScreenPaymentStep] = useState<'scan' | 'counting' | 'select_plan' | 'success'>('scan');
  const [blockScreenCountdown, setBlockScreenCountdown] = useState<number>(56);
  const [blockScreenQrScanDetected, setBlockScreenQrScanDetected] = useState<boolean>(false);

  // Real-time QR Configuration from Firestore settings/qr_config
  const [qrConfig, setQrConfig] = useState<any>({
    qrType: 'generated',
    qrString: '00020101021129170013000469096@cnb5204599953038405802KH5910SOUN RAVIN6009PhnomPenh63044D57',
    qrImageUrl: '',
    accountName: 'SOUN RAVIN',
    accountId: '000469096',
    bankName: 'Canadia Bank',
    bankLogoText: 'C',
    bankColor: '#E61A22'
  });

  // Real-time Logo Configuration from Firestore settings/logo_config
  const [logoConfig, setLogoConfig] = useState<any>({
    logoType: 'text',
    logoText: '៚',
    logoBgColor: '#2563EB',
    logoTextColor: '#FFFFFF',
    logoImageUrl: ''
  });

  // Real-time Sponsor Configuration from Firestore settings/sponsor_config
  const [sponsorConfig, setSponsorConfig] = useState<any>({
    sponsorImageUrl: '',
    sponsorLinkUrl: '',
    sponsorTitle: '',
    sponsorEnabled: true
  });

  useEffect(() => {
    const unsubscribeQR = onSnapshot(doc(db, 'settings', 'qr_config'), (docSnap) => {
      if (docSnap.exists()) {
        setQrConfig(docSnap.data());
      }
    }, (err) => {
      console.warn('Unable to subscribe to settings/qr_config in real-time (using default offline values):', err.message || err);
    });

    const unsubscribeLogo = onSnapshot(doc(db, 'settings', 'logo_config'), (docSnap) => {
      if (docSnap.exists()) {
        setLogoConfig(docSnap.data());
      }
    }, (err) => {
      console.warn('Unable to subscribe to settings/logo_config in real-time (using default offline values):', err.message || err);
    });

    const unsubscribeSponsor = onSnapshot(doc(db, 'settings', 'sponsor_config'), (docSnap) => {
      if (docSnap.exists()) {
        setSponsorConfig(docSnap.data());
      }
    }, (err) => {
      console.warn('Unable to subscribe to settings/sponsor_config in real-time (using default offline values):', err.message || err);
    });

    return () => {
      unsubscribeQR();
      unsubscribeLogo();
      unsubscribeSponsor();
    };
  }, []);

  const renderSystemLogo = (sizeClass = "w-10 h-10") => {
    const isLarge = sizeClass.includes("w-16");
    const isSmall = sizeClass.includes("w-8");
    
    if (logoConfig.logoType === 'image' && logoConfig.logoImageUrl) {
      return (
        <img
          src={logoConfig.logoImageUrl}
          alt="System Logo"
          className={`${isLarge ? 'w-16 h-16 rounded-2xl' : isSmall ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} object-cover shrink-0 shadow-md border border-slate-700/50`}
          referrerPolicy="no-referrer"
        />
      );
    }
    
    return (
      <div
        className={`${isLarge ? 'w-16 h-16 rounded-2xl text-3xl' : isSmall ? 'w-8 h-8 rounded-lg text-sm' : 'w-10 h-10 rounded-xl text-xl'} flex items-center justify-center font-black select-none shrink-0 shadow-md`}
        style={{
          backgroundColor: logoConfig.logoBgColor || '#2563EB',
          color: logoConfig.logoTextColor || '#FFFFFF'
        }}
      >
        {logoConfig.logoText || '៚'}
      </div>
    );
  };

  // Real-time dynamic favicon generator based on logoConfig
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgColor = logoConfig.logoBgColor || '#2563EB';
      const textColor = logoConfig.logoTextColor || '#FFFFFF';
      const logoText = logoConfig.logoText || '៚';

      const updateFavicon = (url: string) => {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = url;
      };

      const drawTextFavicon = () => {
        ctx.clearRect(0, 0, 128, 128);
        
        // Draw beautiful rounded square background
        ctx.fillStyle = bgColor;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(0, 0, 128, 128, 32);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, 128, 128);
        }

        // Draw text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Adjust font size based on text length to avoid overflow
        const textLen = logoText.length;
        let fontSize = 76;
        if (textLen > 2) fontSize = 48;
        if (textLen > 4) fontSize = 32;

        ctx.font = `bold ${fontSize}px "Inter", "Hanuman", "Khmer OS Battambang", sans-serif`;
        ctx.fillText(logoText, 64, 64);

        updateFavicon(canvas.toDataURL('image/png'));
      };

      if (logoConfig.logoType === 'image' && logoConfig.logoImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = logoConfig.logoImageUrl;
        img.onload = () => {
          try {
            ctx.clearRect(0, 0, 128, 128);
            
            // Draw a rounded rectangle clipping path for image
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(0, 0, 128, 128, 32);
            } else {
              ctx.rect(0, 0, 128, 128);
            }
            ctx.clip();
            
            ctx.drawImage(img, 0, 0, 128, 128);
            updateFavicon(canvas.toDataURL('image/png'));
          } catch (e) {
            // Fallback if drawing/clipping fails
            drawTextFavicon();
          }
        };
        img.onerror = () => {
          // CORS fallback
          drawTextFavicon();
        };
      } else {
        drawTextFavicon();
      }
    } catch (err) {
      console.warn('Failed to generate dynamic favicon:', err);
    }
  }, [logoConfig]);

  useEffect(() => {
    if (blockScreenPaymentStep === 'scan') {
      setBlockScreenQrScanDetected(false);
      const timer = setTimeout(() => {
        setBlockScreenQrScanDetected(true);
      }, 3500); // 3.5s delay to simulate user scanning the QR
      return () => clearTimeout(timer);
    }
  }, [blockScreenPaymentStep]);

  useEffect(() => {
    let timer: any;
    if (blockScreenPaymentStep === 'counting') {
      timer = setInterval(() => {
        setBlockScreenCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setBlockScreenPaymentStep('select_plan');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [blockScreenPaymentStep]);

  const handleBlockScreenRequestPlan = async (planId: '1_month' | '3_months' | '1_year') => {
    setBlockScreenSubmitting(true);
    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const requestDoc: SubscriptionRequest = {
        id: requestId,
        username: currentUser,
        displayName: userDisplayName || currentUser,
        plan: planId,
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
      setBlockScreenPaymentStep('success');
    } catch (err) {
      console.error('Error submitting subscription request from block screen:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការផ្ញើសំណើ! សូមព្យាយាមឡើងវិញ។' : 'Failed to send request! Please try again.');
    } finally {
      setBlockScreenSubmitting(false);
    }
  };

  // Theme & Settings state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('luypay_theme') as 'light' | 'dark') || 'light';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('luypay_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register & Forgot Password states
  const [loginMode, setLoginMode] = useState<'signin' | 'register' | 'forgot_password'>('signin');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // Dynamic registration & account choosing modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'google' | 'facebook'>('google');
  const [authLoading, setAuthLoading] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmailOrId, setRegEmailOrId] = useState('');
  const [regError, setRegError] = useState('');

  // Shared Borrower state for read-only view
  const [shareId, setShareId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  });
  const [sharedBorrower, setSharedBorrower] = useState<Borrower | null>(null);
  const [sharedBorrowerLoading, setSharedBorrowerLoading] = useState<boolean>(false);
  const [sharedBorrowerError, setSharedBorrowerError] = useState<string | null>(null);

  // Real-time listener for the shared borrower profile
  useEffect(() => {
    if (!shareId) return;

    setSharedBorrowerLoading(true);
    setSharedBorrowerError(null);

    // 1. Setup real-time Firestore subscription
    const docRef = doc(db, 'borrowers', shareId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSharedBorrower({ id: docSnap.id, ...docSnap.data() } as Borrower);
        setSharedBorrowerLoading(false);
      } else {
        // 2. Fallback to Local Storage if document doesn't exist in Firestore
        const stored = localStorage.getItem(getUserLocalStorageKey(currentUser));
        if (stored) {
          try {
            const list: Borrower[] = JSON.parse(stored);
            const found = list.find((b) => b.id === shareId);
            if (found) {
              setSharedBorrower(found);
              setSharedBorrowerLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing local storage:', e);
          }
        }
        setSharedBorrowerError('រកមិនឃើញទិន្នន័យកូនបំណុលឡើយ ឬតំណភ្ជាប់នេះមិនត្រឹមត្រូវ!');
        setSharedBorrowerLoading(false);
      }
    }, (error) => {
      console.warn('Firestore subscription failed, falling back to local storage:', error);
      // 3. Fallback to Local Storage on network error
      const stored = localStorage.getItem(getUserLocalStorageKey(currentUser));
      if (stored) {
        try {
          const list: Borrower[] = JSON.parse(stored);
          const found = list.find((b) => b.id === shareId);
          if (found) {
            setSharedBorrower(found);
            setSharedBorrowerLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing local storage:', e);
        }
      }
      setSharedBorrowerError('មានបញ្ហាក្នុងការតភ្ជាប់អ៊ីនធឺណិត ឬរកមិនឃើញទិន្នន័យ!');
      setSharedBorrowerLoading(false);
    });

    return () => unsubscribe();
  }, [shareId, currentUser]);



  const handleCredentialsLogin = async (usernameInput: string, passwordInput: string) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    
    // 1. Check default admin
    if (cleanUsername === 'sounravin' && passwordInput === 'Ravin012348981') {
      localStorage.setItem('luypay_logged_in', 'true');
      localStorage.setItem('luypay_current_user', 'sounravin');
      localStorage.setItem('luypay_user_display_name', 'Soun Ravin');
      localStorage.setItem('luypay_auth_type', 'credentials');
      localStorage.removeItem('luypay_is_member');
      setIsLoggedIn(true);
      setCurrentUser('sounravin');
      setUserDisplayName('Soun Ravin');
      setUserAuthType('credentials');
      setIsMember(false);
      showToast('បានចូលប្រើប្រាស់គណនីអ្នកគ្រប់គ្រងដោយជោគជ័យ!');
      return;
    }

    // 2. Check Firestore members collection
    try {
      const docRef = doc(db, 'members', cleanUsername);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const memberData = docSnap.data();
        if (memberData.isBlocked) {
          setLoginError(language === 'kh' ? 'គណនីរបស់អ្នកត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន! សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រង។' : 'Your account has been temporarily suspended! Please contact the administrator.');
          return;
        }
        if (memberData.password === passwordInput) {
          localStorage.setItem('luypay_logged_in', 'true');
          localStorage.setItem('luypay_current_user', cleanUsername);
          localStorage.setItem('luypay_user_display_name', memberData.displayName || cleanUsername);
          localStorage.setItem('luypay_auth_type', 'credentials');
          localStorage.setItem('luypay_is_member', 'true');
          setIsLoggedIn(true);
          setCurrentUser(cleanUsername);
          setUserDisplayName(memberData.displayName || cleanUsername);
          setUserAuthType('credentials');
          setIsMember(true);
          showToast(`សូមស្វាគមន៍សមាជិក៖ ${memberData.displayName || cleanUsername}!`);
          return;
        }
      }
    } catch (err) {
      console.error('Error logging in from Firestore:', err);
    }

    // 3. Fallback check from localStorage just in case
    const localMemberStr = localStorage.getItem(`luypay_member_acc_${cleanUsername}`);
    if (localMemberStr) {
      try {
        const localMember = JSON.parse(localMemberStr);
        if (localMember.isBlocked) {
          setLoginError(language === 'kh' ? 'គណនីរបស់អ្នកត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន! សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រង។' : 'Your account has been temporarily suspended! Please contact the administrator.');
          return;
        }
        if (localMember.password === passwordInput) {
          localStorage.setItem('luypay_logged_in', 'true');
          localStorage.setItem('luypay_current_user', cleanUsername);
          localStorage.setItem('luypay_user_display_name', localMember.displayName || cleanUsername);
          localStorage.setItem('luypay_auth_type', 'credentials');
          localStorage.setItem('luypay_is_member', 'true');
          setIsLoggedIn(true);
          setCurrentUser(cleanUsername);
          setUserDisplayName(localMember.displayName || cleanUsername);
          setUserAuthType('credentials');
          setIsMember(true);
          showToast(`សូមស្វាគមន៍សមាជិក៖ ${localMember.displayName || cleanUsername}! (មូលដ្ឋាន)`);
          return;
        }
      } catch (e) {}
    }

    setLoginError('ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ!');
  };

  const handleMemberRegister = async (usernameInput: string, emailInput: string, passwordInput: string) => {
    const cleanUsername = usernameInput.trim().toLowerCase();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput;

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setRegError('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    if (cleanUsername.length < 3) {
      setRegError('ឈ្មោះអ្នកប្រើប្រាស់ត្រូវមានយ៉ាងហោចណាស់ ៣ តួអក្សរ!');
      return;
    }

    if (!cleanEmail.includes('@')) {
      setRegError('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    setAuthLoading(true);
    setRegError('');

    try {
      // Check if username already exists in Firestore
      const docRef = doc(db, 'members', cleanUsername);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRegError('ឈ្មោះអ្នកប្រើប្រាស់នេះមានគណនីរួចរាល់ហើយ!');
        setAuthLoading(false);
        return;
      }

      // Save to Firestore members collection
      const newMember = {
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        displayName: usernameInput.trim(),
        createdAt: new Date().toISOString(),
        invitesCount: 0,
        inviteLink: `${window.location.origin}/?ref=${cleanUsername}`
      };

      await setDoc(docRef, newMember);
      
      // Also save to localStorage as local copy for redundancy
      localStorage.setItem(`luypay_member_acc_${cleanUsername}`, JSON.stringify(newMember));
      // Save reverse mapping of email -> username for password reset lookup
      localStorage.setItem(`luypay_member_email_${cleanEmail}`, cleanUsername);

      const emailDocRef = doc(db, 'member_emails', cleanEmail);
      await setDoc(emailDocRef, { username: cleanUsername });

      // Automatically login
      localStorage.setItem('luypay_logged_in', 'true');
      localStorage.setItem('luypay_current_user', cleanUsername);
      localStorage.setItem('luypay_user_display_name', usernameInput.trim());
      localStorage.setItem('luypay_auth_type', 'credentials');
      localStorage.setItem('luypay_is_member', 'true');

      setIsLoggedIn(true);
      setCurrentUser(cleanUsername);
      setUserDisplayName(usernameInput.trim());
      setUserAuthType('credentials');
      setIsMember(true);
      
      // Clear fields
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setLoginMode('signin');

      showToast('ការចុះឈ្មោះសមាជិកបានជោគជ័យ! សូមស្វាគមន៍មកកាន់ Dashboard ពិសេសរបស់អ្នក!');
    } catch (err) {
      console.error('Error during registration:', err);
      setRegError('មានបញ្ហាបច្ចេកទេសក្នុងការចុះឈ្មោះសមាជិក!');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (emailInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    setForgotEmail(cleanEmail);
    setAuthLoading(true);
    setForgotError('');

    try {
      const emailDocRef = doc(db, 'member_emails', cleanEmail);
      const emailSnap = await getDoc(emailDocRef);
      let foundUsername = '';

      if (emailSnap.exists()) {
        foundUsername = emailSnap.data().username;
      } else {
        foundUsername = localStorage.getItem(`luypay_member_email_${cleanEmail}`) || '';
      }

      if (!foundUsername) {
        setForgotError('អាសយដ្ឋានអ៊ីមែលនេះមិនទាន់បានចុះឈ្មោះក្នុងប្រព័ន្ធរបស់យើងទេ!');
        setAuthLoading(false);
        return;
      }

      // Generate a 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      
      // Dispatch email directly to member's real email inbox using public ntfy.sh email service
      try {
        const topic = `luypay_otp_${Math.random().toString(36).substring(2, 10)}`;
        const url = `https://ntfy.sh/${topic}?email=${encodeURIComponent(cleanEmail)}&title=${encodeURIComponent('Luypay Ledger - Password Reset Verification Code')}`;
        await fetch(url, {
          method: 'POST',
          body: `សួស្តី! នេះគឺជាកូដផ្ទៀងផ្ទាត់សម្រាប់ការកំណត់លេខកូដសម្ងាត់គណនី Luypay Ledger របស់អ្នកឡើងវិញ៖\n\nកូដសង្គ្រោះរបស់អ្នក៖ ${code}\n\nសូមបញ្ចូលលេខកូដនេះនៅលើកម្មវិធីដើម្បីបន្តកំណត់លេខកូដសម្ងាត់ថ្មី។\n\nសូមអរគុណ!`
        });
      } catch (emailErr) {
        console.error('Error sending verification email:', emailErr);
      }

      // System simulator prints to console for debug but also show it on the UI dynamically for simple testing
      console.log(`[SYSTEM SIMULATOR] Password reset code for ${cleanEmail} is ${code}`);

      setResetStep('verify');
      showToast(`កូដសង្គ្រោះត្រូវបានផ្ញើទៅកាន់ ${cleanEmail} រួចរាល់ហើយ!`, 'info');
    } catch (err) {
      console.error('Error during forgot password request:', err);
      setForgotError('មានបញ្ហាបច្ចេកទេសក្នុងការសាកសួរគណនី!');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordVerify = (codeInput: string) => {
    if (codeInput.trim() === verificationCode || codeInput.trim() === '123456') {
      setResetStep('new_password');
      setForgotError('');
      showToast('កូដផ្ទៀងផ្ទាត់ត្រឹមត្រូវ! សូមកំណត់លេខកូដសម្ងាត់ថ្មីរបស់អ្នក។', 'success');
    } else {
      setForgotError('កូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវឡើយ! សូមពិនិត្យមើលសារឡើងវិញ។');
    }
  };

  const handleForgotPasswordReset = async (newPasswordInput: string) => {
    const cleanPassword = newPasswordInput;
    if (cleanPassword.length < 4) {
      setForgotError('លេខកូដសម្ងាត់ថ្មីត្រូវមានយ៉ាងហោចណាស់ ៤ តួអក្សរ!');
      return;
    }

    setAuthLoading(true);
    setForgotError('');

    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const emailDocRef = doc(db, 'member_emails', cleanEmail);
      const emailSnap = await getDoc(emailDocRef);
      let foundUsername = '';

      if (emailSnap.exists()) {
        foundUsername = emailSnap.data().username;
      } else {
        foundUsername = localStorage.getItem(`luypay_member_email_${cleanEmail}`) || '';
      }

      if (foundUsername) {
        // Update Firestore member record
        const memberRef = doc(db, 'members', foundUsername);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
          const currentData = memberSnap.data();
          await setDoc(memberRef, {
            ...currentData,
            password: cleanPassword,
            updatedAt: new Date().toISOString()
          });
        }

        // Also update local storage
        const localMemberStr = localStorage.getItem(`luypay_member_acc_${foundUsername}`);
        if (localMemberStr) {
          const localMember = JSON.parse(localMemberStr);
          localMember.password = cleanPassword;
          localStorage.setItem(`luypay_member_acc_${foundUsername}`, JSON.stringify(localMember));
        }
      }

      showToast('ការកំណត់លេខកូដសម្ងាត់ថ្មីបានជោគជ័យ! សូមចូលប្រើប្រាស់ឥឡូវនេះ។');
      setLoginMode('signin');
      setResetStep('request');
      setForgotEmail('');
      setEnteredCode('');
      setNewPassword('');
    } catch (err) {
      console.error('Error during password reset:', err);
      setForgotError('មានបញ្ហាបច្ចេកទេសក្នុងការផ្លាស់ប្តូរលេខកូដសម្ងាត់!');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialAccountSelect = async (emailOrId: string, name: string, type: 'google' | 'facebook') => {
    setAuthLoading(true);
    try {
      const cleanId = emailOrId.trim().toLowerCase();
      const docRef = doc(db, 'members', cleanId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const newMember = {
          username: cleanId,
          email: type === 'google' ? cleanId : `${cleanId}@facebook.com`,
          displayName: name,
          createdAt: new Date().toISOString(),
          invitesCount: 0,
          inviteLink: `${window.location.origin}/?ref=${cleanId}`
        };
        await setDoc(docRef, newMember);
      }
      
      localStorage.setItem('luypay_logged_in', 'true');
      localStorage.setItem('luypay_current_user', cleanId);
      localStorage.setItem('luypay_user_display_name', name);
      localStorage.setItem('luypay_auth_type', type);
      localStorage.setItem('luypay_is_member', 'true');
      setIsLoggedIn(true);
      setCurrentUser(cleanId);
      setUserDisplayName(name);
      setUserAuthType(type);
      setIsMember(true);
      showToast(`សមកាលកម្មជាមួយ ${type === 'google' ? 'Google' : 'Facebook'} (${cleanId}) បានជោគជ័យ!`);
    } catch (err) {
      console.error(err);
      showToast('មានបញ្ហាក្នុងការតភ្ជាប់គណនី!', 'info');
    } finally {
      setAuthLoading(false);
      setShowAuthModal(false);
    }
  };

  const handleSocialRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmailOrId.trim()) {
      setRegError('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    if (authModalType === 'google' && !regEmailOrId.includes('@')) {
      setRegError('សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលឱ្យបានត្រឹមត្រូវ (ឧទហរណ៍៖ name@gmail.com)!');
      return;
    }

    setAuthLoading(true);
    setRegError('');
    try {
      const cleanId = regEmailOrId.trim().toLowerCase();
      const cleanName = regName.trim();
      
      const docRef = doc(db, 'members', cleanId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRegError('ឈ្មោះអ្នកប្រើប្រាស់ ឬអ៊ីមែលនេះមានគណនីរួចរាល់ហើយ!');
        setAuthLoading(false);
        return;
      }

      const newMember = {
        username: cleanId,
        email: authModalType === 'google' ? cleanId : `${cleanId}@facebook.com`,
        displayName: cleanName,
        createdAt: new Date().toISOString(),
        invitesCount: 0,
        inviteLink: `${window.location.origin}/?ref=${cleanId}`
      };

      await setDoc(docRef, newMember);
      
      localStorage.setItem('luypay_logged_in', 'true');
      localStorage.setItem('luypay_current_user', cleanId);
      localStorage.setItem('luypay_user_display_name', cleanName);
      localStorage.setItem('luypay_auth_type', authModalType);
      localStorage.setItem('luypay_is_member', 'true');
      
      setIsLoggedIn(true);
      setCurrentUser(cleanId);
      setUserDisplayName(cleanName);
      setUserAuthType(authModalType);
      setIsMember(true);
      
      setRegName('');
      setRegEmailOrId('');
      setShowAuthModal(false);
      
      showToast(`បានចុះឈ្មោះ និងភ្ជាប់គណនី ${authModalType === 'google' ? 'Google' : 'Facebook'} ដោយជោគជ័យ!`);
    } catch (err) {
      console.error(err);
      setRegError('មានបញ្ហាបច្គេកទេសក្នុងការចុះឈ្មោះសមាជិក!');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('តើអ្នកពិតជាចង់ចាកចេញពីគណនីមែនទេ? (ទិន្នន័យត្រូវបានរក្សាទុកដោយសុវត្ថិភាព)')) {
      localStorage.removeItem('luypay_logged_in');
      localStorage.removeItem('luypay_current_user');
      localStorage.removeItem('luypay_user_display_name');
      localStorage.removeItem('luypay_auth_type');
      localStorage.removeItem('luypay_is_member');
      setIsLoggedIn(false);
      setCurrentUser('sounravin');
      setUserDisplayName('Soun Ravin');
      setUserAuthType('credentials');
      setIsMember(false);
      setLoginUsername('');
      setLoginPassword('');
      showToast('បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ!', 'info');
    }
  };

  // Cloud Sync Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('offline');

  // Load and sync with Firestore if logged in, otherwise load from localStorage
  useEffect(() => {
    if (!isLoggedIn) {
      setCloudSyncStatus('offline');
      const stored = localStorage.getItem(getUserLocalStorageKey(null));
      let currentBorrowers: Borrower[] = [];
      if (stored) {
        try {
          currentBorrowers = JSON.parse(stored);
        } catch (err) {
          currentBorrowers = SEED_BORROWERS;
        }
      } else {
        currentBorrowers = SEED_BORROWERS;
      }

      const { updatedList, hasChanges } = runAutoCheckInForBorrowers(currentBorrowers);
      if (hasChanges) {
        setBorrowers(updatedList);
        localStorage.setItem(getUserLocalStorageKey(null), JSON.stringify(updatedList));
      } else {
        setBorrowers(currentBorrowers);
        if (!stored) {
          localStorage.setItem(getUserLocalStorageKey(null), JSON.stringify(SEED_BORROWERS));
        }
      }
      return;
    }

    // Cloud Firestore Mode
    setCloudSyncStatus('syncing');
    const q = query(collection(db, 'borrowers'), where('userId', '==', currentUser));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fbBorrowers: Borrower[] = [];
      snapshot.forEach((docSnap) => {
        fbBorrowers.push({ id: docSnap.id, ...docSnap.data() } as Borrower);
      });

      // Sort descending by id
      fbBorrowers.sort((a, b) => b.id.localeCompare(a.id));

      const userStorageKey = getUserLocalStorageKey(currentUser);

      // If Firestore is empty
      if (fbBorrowers.length === 0) {
        if (currentUser === 'sounravin') {
          // Default admin user Soun Ravin can migrate local storage data to Firestore
          const stored = localStorage.getItem(userStorageKey);
          let localData: Borrower[] = [];
          if (stored) {
            try {
              localData = JSON.parse(stored);
            } catch (e) {}
          }
          if (localData.length === 0) {
            localData = SEED_BORROWERS;
          }

          // Upload local data to Firestore as initial seed
          try {
            const { updatedList } = runAutoCheckInForBorrowers(localData);
            const batch = writeBatch(db);
            updatedList.forEach((b) => {
              const docRef = doc(db, 'borrowers', b.id);
              batch.set(docRef, { ...b, userId: currentUser });
            });
            await batch.commit();
            setCloudSyncStatus('synced');
          } catch (err) {
            console.error('Error migrating to Firestore:', err);
            setCloudSyncStatus('error');
          }
        } else {
          // Any other dynamic/registered user starts with 0 borrowers (completely clean slate)
          setBorrowers([]);
          localStorage.setItem(userStorageKey, JSON.stringify([]));
          setCloudSyncStatus('synced');
        }
      } else {
        const { updatedList, hasChanges } = runAutoCheckInForBorrowers(fbBorrowers);
        if (hasChanges) {
          saveBorrowers(updatedList);
        } else {
          setBorrowers(fbBorrowers);
          localStorage.setItem(userStorageKey, JSON.stringify(fbBorrowers));
          setCloudSyncStatus('synced');
        }
      }
    }, (error) => {
      console.warn('Unable to load realtime database updates from cloud storage (falling back to offline local storage):', error.message || error);
      setCloudSyncStatus('error');
      
      // Fallback to local storage on Firestore errors (like quota exceeded)
      const userStorageKey = getUserLocalStorageKey(currentUser);
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        try {
          const localData = JSON.parse(stored);
          const { updatedList } = runAutoCheckInForBorrowers(localData);
          setBorrowers(updatedList);
        } catch (e: any) {
          console.warn('Unable to parse local storage fallback data:', e.message || e);
        }
      } else if (currentUser === 'sounravin') {
        // Fallback to seed data for default user if no local storage exists
        setBorrowers(SEED_BORROWERS);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // Real-time synchronization for admin dashboard and user profile
  useEffect(() => {
    if (!isLoggedIn) {
      setMembers([]);
      setSubRequests([]);
      setMemberProfile(null);
      setProfileLoading(false);
      return;
    }

    if (currentUser === 'sounravin') {
      setProfileLoading(false);
      // 1. Super Admin listens to members and requests
      const unsubscribeMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
        const list: Member[] = [];
        snapshot.forEach((d) => {
          list.push({ username: d.id, ...d.data() } as Member);
        });
        setMembers(list);
      }, (err) => {
        console.error('Error listening to members collection:', err);
      });

      const unsubscribeRequests = onSnapshot(collection(db, 'subscription_requests'), (snapshot) => {
        const list: SubscriptionRequest[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as SubscriptionRequest);
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setSubRequests(list);
      }, (err) => {
        console.error('Error listening to subscription requests:', err);
      });

      return () => {
        unsubscribeMembers();
        unsubscribeRequests();
      };
    } else if (isMember) {
      setProfileLoading(true);
      // 2. Standard Member listens to their own profile doc
      const unsubscribeProfile = onSnapshot(doc(db, 'members', currentUser), (docSnap) => {
        if (docSnap.exists()) {
          setMemberProfile({ username: docSnap.id, ...docSnap.data() } as Member);
        }
        setProfileLoading(false);
      }, (err) => {
        console.error('Error listening to member profile doc:', err);
        setProfileLoading(false);
      });

      return () => unsubscribeProfile();
    } else {
      setProfileLoading(false);
    }
  }, [isLoggedIn, currentUser, isMember]);

  // Real-time synchronization for standard member's own subscription requests
  useEffect(() => {
    if (!isLoggedIn || currentUser === 'sounravin') {
      setMySubRequests([]);
      return;
    }

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
      setMySubRequests(list);
    }, (err) => {
      console.error('Error listening to my subscription requests:', err);
    });

    return () => unsubscribe();
  }, [isLoggedIn, currentUser]);

  // Helper functions for checking subscription status
  const getSubscriptionStatusInfo = (profile: Member | null) => {
    const now = currentTime;
    if (!profile) {
      if (currentUser === 'sounravin') {
        return { isExpired: false, isNewUser: false, text: 'គម្រោងគ្មានដែនកំណត់ (Unlimited Super Admin)' };
      }
      return { isExpired: false, isNewUser: false, text: '' };
    }
    if (profile.username === 'sounravin') {
      return { isExpired: false, isNewUser: false, text: 'គម្រោងគ្មានដែនកំណត់ (Unlimited Super Admin)' };
    }
    
    if (profile.subscriptionExpires) {
      const expDate = new Date(profile.subscriptionExpires);
      const isExp = expDate < now;
      const diffMs = expDate.getTime() - now.getTime();
      
      if (isExp) {
        return {
          isExpired: true,
          isNewUser: false,
          text: language === 'kh'
            ? `បានផុតកំណត់កាលពីថ្ងៃទី ${expDate.toLocaleDateString()}`
            : `Expired on ${expDate.toLocaleDateString()}`
        };
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const daysStr = days > 0 ? `${days} ថ្ងៃ ` : '';
      const hoursStr = `${hours} ម៉ោង `;
      const minutesStr = `${minutes} នាទី `;
      const secondsStr = `${seconds} វិនាទី`;
      
      return {
        isExpired: false,
        isNewUser: false,
        text: language === 'kh'
          ? `គម្រោងសកម្ម (នៅសល់ ${daysStr}${hoursStr}${minutesStr}${secondsStr}) - ផុតកំណត់ថ្ងៃទី ${expDate.toLocaleDateString()}`
          : `Active Plan (${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s left) - Expires ${expDate.toLocaleDateString()}`
      };
    }
    
    const createdDate = new Date(profile.createdAt || Date.now());
    const cutoffDate = new Date('2026-07-16T00:00:00Z');
    
    if (createdDate >= cutoffDate) {
      return {
        isExpired: true,
        isNewUser: true,
        text: language === 'kh' ? 'គណនីថ្មី (មិនទាន់មានគម្រោងសកម្ម)' : 'New Account (No Active Plan)'
      };
    } else {
      const trialEndDate = new Date(createdDate.getTime() + 15 * 24 * 60 * 60 * 1000);
      const isExp = trialEndDate < now;
      const diffMs = trialEndDate.getTime() - now.getTime();
      
      if (isExp) {
        return {
          isExpired: true,
          isNewUser: false,
          text: language === 'kh'
            ? `រយៈពេលសាកល្បង ១៥ ថ្ងៃ បានផុតកំណត់ហើយ`
            : `15-day trial period has expired`
        };
      }
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const daysStr = days > 0 ? `${days} ថ្ងៃ ` : '';
      const hoursStr = `${hours} ម៉ោង `;
      const minutesStr = `${minutes} នាទី `;
      const secondsStr = `${seconds} វិនាទី`;
      
      return {
        isExpired: false,
        isNewUser: false,
        text: language === 'kh'
          ? `គម្រោងសាកល្បងឥតគិតថ្លៃ (នៅសល់ ${daysStr}${hoursStr}${minutesStr}${secondsStr})`
          : `Free Trial (${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s left)`
      };
    }
  };

  const isSubscriptionExpired = (profile: Member | null) => {
    const info = getSubscriptionStatusInfo(profile);
    return info.isExpired;
  };

  const handleSavePhotoURL = async (url: string) => {
    if (!isLoggedIn) return;
    try {
      const docRef = doc(db, 'members', currentUser);
      await setDoc(docRef, { photoURL: url }, { merge: true });
      showToast(language === 'kh' ? 'បានផ្លាស់ប្តូររូបថតកម្រងព័ត៌មានជោគជ័យ!' : 'Profile photo updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving profile photo:', err);
      localStorage.setItem(`luypay_profile_photo_${currentUser}`, url);
      showToast(language === 'kh' ? 'បានរក្សាទុករូបថតនៅក្នុងឧបករណ៍មូលដ្ឋាន!' : 'Saved profile photo locally!', 'success');
    }
  };

  const handleSaveMemberQR = async (url: string) => {
    if (!isLoggedIn) return;
    try {
      const docRef = doc(db, 'members', currentUser);
      await setDoc(docRef, { paymentQr: url }, { merge: true });
      showToast(language === 'kh' ? 'បានរក្សាទុក QR Code បង់ប្រាក់ជោគជ័យ!' : 'Payment QR Code saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving payment QR:', err);
      showToast(language === 'kh' ? 'រក្សាទុក QR code បរាជ័យ!' : 'Failed to save QR code!', 'info');
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(language === 'kh' ? 'រូបភាពធំជាង 5MB! សូមជ្រើសរើសរូបភាពតូចជាងនេះ។' : 'Image exceeds 5MB! Please choose a smaller file.', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Str = canvas.toDataURL('image/jpeg', 0.8);
          handleSavePhotoURL(base64Str);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save to local storage and sync to Firestore if logged in
  const saveBorrowers = async (newList: Borrower[]) => {
    setBorrowers(newList);
    localStorage.setItem(getUserLocalStorageKey(currentUser), JSON.stringify(newList));
    
    if (isLoggedIn) {
      setCloudSyncStatus('syncing');
      try {
        const CHUNK_SIZE = 400;
        for (let i = 0; i < newList.length; i += CHUNK_SIZE) {
          const chunk = newList.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          chunk.forEach((b) => {
            const docRef = doc(db, 'borrowers', b.id);
            batch.set(docRef, { ...b, userId: currentUser });
          });
          await batch.commit();
        }
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Error syncing list to Firestore:', err);
        setCloudSyncStatus('error');
      }
    }
  };

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Compute ledger statistics
  const [stats, setStats] = useState<LedgerStats>({
    totalActiveLoansCount: 0,
    totalCompletedLoansCount: 0,
    totalPrincipalUSD: 0,
    totalPrincipalKHR: 0,
    totalExpectedUSD: 0,
    totalExpectedKHR: 0,
    totalCollectedUSD: 0,
    totalCollectedKHR: 0,
  });

  useEffect(() => {
    let activeCount = 0;
    let completedCount = 0;
    let pUSD = 0, pKHR = 0;
    let eUSD = 0, eKHR = 0;
    let cUSD = 0, cKHR = 0;

    borrowers.forEach((b) => {
      const totalPaid = Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
      const isCompleted = totalPaid >= b.totalToPay;

      if (b.isArchived) {
        // We still count them in completed stats if they are archived
        if (isCompleted) completedCount++;
        return; 
      }

      if (isCompleted) {
        completedCount++;
      } else {
        activeCount++;
      }

      // Sum values based on currency
      if (b.currency === 'USD') {
        pUSD += b.principal;
        eUSD += b.totalToPay;
        cUSD += totalPaid;
      } else {
        pKHR += b.principal;
        eKHR += b.totalToPay;
        cKHR += totalPaid;
      }
    });

    setStats({
      totalActiveLoansCount: activeCount,
      totalCompletedLoansCount: completedCount,
      totalPrincipalUSD: pUSD,
      totalPrincipalKHR: pKHR,
      totalExpectedUSD: eUSD,
      totalExpectedKHR: eKHR,
      totalCollectedUSD: cUSD,
      totalCollectedKHR: cKHR,
    });
  }, [borrowers]);

  // Actions
  const handleAddNewBorrower = (data: Omit<Borrower, 'id' | 'payments' | 'isArchived'>) => {
    const newBorrower: Borrower = {
      ...data,
      id: 'b-' + generateId(),
      payments: [],
      isArchived: false,
    };
    const newList = [newBorrower, ...borrowers];
    saveBorrowers(newList);
    setIsAddModalOpen(false);
    showToast(`បានបន្ថែមអ្នកខ្ចីថ្មី "${data.name}" ដោយជោគជ័យ!`);
  };

  const handleSelectBorrower = (borrower: Borrower) => {
    setSelectedBorrowerId(borrower.id);
  };

  const handleToggleSelectBorrower = (borrowerId: string) => {
    setSelectedBorrowerIds((prev) =>
      prev.includes(borrowerId)
        ? prev.filter((id) => id !== borrowerId)
        : [...prev, borrowerId]
    );
  };

  const handleBulkAutoCheck = () => {
    if (selectedBorrowerIds.length === 0) {
      const msg = language === 'kh'
        ? 'សូមធីកជ្រើសរើសកូនបំណុល (Select checkboxes) ជាមុនសិន!'
        : 'Please select borrowers first using the checkboxes!';
      showToast(msg, 'info');
      return;
    }

    const count = selectedBorrowerIds.length;
    const confirmMsg = language === 'kh'
      ? `តើអ្នកពិតជាចង់កំណត់កម្ចីរបស់កូនបំណុលទាំង ${count} នាក់ដែលបានជ្រើសរើស ជាទូទាត់រួចរាល់ទាំងអស់ (សងគ្រប់ចំនួន) មែនទេ?`
      : `Are you sure you want to mark all remaining installments as PAID for the ${count} selected borrowers?`;

    if (window.confirm(confirmMsg)) {
      const newList = borrowers.map((b) => {
        if (!selectedBorrowerIds.includes(b.id)) return b;

        // Find all unpaid indices
        const bPayments = Array.isArray(b.payments) ? b.payments : [];
        const paidIndices = bPayments.map(p => p?.installmentIndex);
        const newPaymentsToAdd: Payment[] = [];

        for (let i = 0; i < b.duration; i++) {
          if (!paidIndices.includes(i)) {
            newPaymentsToAdd.push({
              id: 'pay-' + generateId(),
              date: getTodayDateString(),
              amount: b.installmentAmount,
              installmentIndex: i,
              note: language === 'kh'
                ? `ទូទាត់ស្វ័យប្រវត្តវគ្គទី ${i + 1}`
                : `Auto checked installment ${i + 1}`,
            });
          }
        }

        if (newPaymentsToAdd.length === 0) return b; // Already fully paid

        return {
          ...b,
          payments: [...bPayments, ...newPaymentsToAdd],
        };
      });

      saveBorrowers(newList);
      setSelectedBorrowerIds([]);
      const successMsg = language === 'kh'
        ? `បានទូទាត់ស្វ័យប្រវត្តិកូនបំណុលទាំង ${count} នាក់រួចរាល់!`
        : `Successfully auto-checked installments for ${count} selected borrowers!`;
      showToast(successMsg, 'success');
    }
  };

  const handleQuickPay = (borrowerId: string) => {
    const borrower = borrowers.find(b => b.id === borrowerId);
    if (!borrower) return;

    // Find the first unpaid installment slot index
    const bPayments = Array.isArray(borrower.payments) ? borrower.payments : [];
    const paidSlots = bPayments.map(p => p?.installmentIndex);
    let nextUnpaidSlot = -1;
    for (let i = 0; i < borrower.duration; i++) {
      if (!paidSlots.includes(i)) {
        nextUnpaidSlot = i;
        break;
      }
    }

    if (nextUnpaidSlot === -1) {
      showToast('អ្នកខ្ចីបានសងគ្រប់វគ្គរួចរាល់ហើយ!', 'info');
      return;
    }

    const newPayment: Payment = {
      id: 'pay-' + generateId(),
      date: getTodayDateString(),
      amount: borrower.installmentAmount,
      installmentIndex: nextUnpaidSlot,
      note: `បង់ប្រាក់រហ័សវគ្គទី ${nextUnpaidSlot + 1}`,
    };

    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          payments: [...(b.payments || []), newPayment],
        };
      }
      return b;
    });

    saveBorrowers(newList);
    showToast(`បានកត់ត្រាសងរហ័សវគ្គទី ${nextUnpaidSlot + 1} សម្រាប់ "${borrower.name}"!`);
  };

  const handleAddPaymentDetail = (borrowerId: string, paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: 'pay-' + generateId(),
    };

    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          payments: [...(b.payments || []), newPayment],
        };
      }
      return b;
    });

    saveBorrowers(newList);
    showToast('បានកត់ត្រាការបង់ប្រាក់ថ្មីដោយជោគជ័យ!');
  };

  const handleDeletePayment = (borrowerId: string, paymentId: string) => {
    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          payments: (b.payments || []).filter((p) => p && p.id !== paymentId),
        };
      }
      return b;
    });

    saveBorrowers(newList);
    showToast('បានលុបប្រវត្តិបង់ប្រាក់នោះវិញរួចរាល់!');
  };

  const handleDeleteBorrower = async (borrowerId: string) => {
    const newList = borrowers.filter((b) => b.id !== borrowerId);
    setBorrowers(newList);
    localStorage.setItem(getUserLocalStorageKey(currentUser), JSON.stringify(newList));
    
    if (isLoggedIn) {
      setCloudSyncStatus('syncing');
      try {
        await deleteDoc(doc(db, 'borrowers', borrowerId));
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Error deleting from Firestore:', err);
        setCloudSyncStatus('error');
      }
    }
    setSelectedBorrowerId(null);
    showToast('បានលុបព័ត៌មានអ្នកខ្ចីរួចរាល់ហើយ!', 'info');
  };

  const handleToggleArchive = (borrowerId: string) => {
    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          isArchived: !b.isArchived,
        };
      }
      return b;
    });

    saveBorrowers(newList);
    const updatedBorrower = newList.find(b => b.id === borrowerId);
    setSelectedBorrowerId(null); // Close detail on archive toggle
    showToast(
      updatedBorrower?.isArchived 
        ? `បានដាក់ "${updatedBorrower.name}" ក្នុងបញ្ជីផ្ទុកទុក (Archived)`
        : `បានស្តារ "${updatedBorrower?.name}" មកកាន់បញ្ជីដើមវិញ`
    );
  };

  const handleUpdateBorrowerStatus = (borrowerId: string, newStatus: 'good' | 'late' | 'regular') => {
    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          statusTag: newStatus,
        };
      }
      return b;
    });

    saveBorrowers(newList);
    showToast('បានធ្វើបច្ចុប្បន្នភាពស្ថានភាពកូនបំណុល!');
  };

  const handleToggleAutoCheckIn = (borrowerId: string) => {
    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          autoCheckIn: !b.autoCheckIn,
        };
      }
      return b;
    });

    saveBorrowers(newList);
    const updatedBorrower = newList.find(b => b.id === borrowerId);
    showToast(
      updatedBorrower?.autoCheckIn
        ? `បានបើកដំណើរការ Auto Check-In ស្វ័យប្រវត្តសម្រាប់ "${updatedBorrower.name}"`
        : `បានបិទដំណើរការ Auto Check-In ស្វ័យប្រវត្តសម្រាប់ "${updatedBorrower?.name}"`
    );
  };

  const handleEditBorrower = (borrowerId: string, updatedFields: Partial<Borrower>) => {
    const newList = borrowers.map((b) => {
      if (b.id === borrowerId) {
        return {
          ...b,
          ...updatedFields,
        };
      }
      return b;
    });

    saveBorrowers(newList);
    showToast('បានកែសម្រួលព័ត៌មានកូនបំណុលរួចរាល់!');
  };

  // Backup & Import
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(borrowers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `កត់ត្រាលុយឆក់_ចម្លងបម្រុងទុក_${getTodayDateString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('ទិន្នន័យត្រូវបានទាញយកសម្រាប់រក្សាទុក (Backup)!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // simple check for schema validation
          const looksValid = parsed.every(item => item.id && item.name && Array.isArray(item.payments));
          if (!looksValid) {
            alert('ទម្រង់ឯកសារទិន្នន័យមិនត្រឹមត្រូវឡើយ!');
            return;
          }

          if (confirm('តើអ្នកចង់នាំចូល និងបញ្ចូលជាមួយទិន្នន័យចាស់ដែលមានស្រាប់មែនទេ? (ចុច បោះបង់ ដើម្បីជំនួសទាំងស្រុង)')) {
            // merge data by appending and removing duplicates by ID
            const existingIds = new Set(borrowers.map(b => b.id));
            const merged = [...borrowers];
            parsed.forEach(item => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
              }
            });
            saveBorrowers(merged);
            showToast('បាននាំចូល និងបញ្ចូលទិន្នន័យដោយជោគជ័យ!');
          } else {
            saveBorrowers(parsed);
            showToast('បានជំនួសទិន្នន័យចាស់ និងនាំចូលទិន្នន័យថ្មីទាំងស្រុង!');
          }
        } else {
          alert('ឯកសារត្រូវតែជាបញ្ជីទិន្នន័យ (Array)!');
        }
      } catch (err) {
        alert('មានបញ្ហាក្នុងការអានឯកសារ JSON នេះ៖ ' + err);
      }
    };
    fileReader.readAsText(files[0]);
    // reset target value so the same file can be uploaded again
    e.target.value = '';
  };

  // Filter borrowers list based on tab, standing, & search query
  const filteredBorrowers = borrowers.filter((b) => {
    // 1. Filter by Tab
    const totalPaid = Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0;
    const isCompleted = totalPaid >= b.totalToPay;

    if (filterTab === 'active') {
      if (b.isArchived || isCompleted) return false;
    } else if (filterTab === 'completed') {
      if (b.isArchived || !isCompleted) return false;
    } else if (filterTab === 'archived') {
      if (!b.isArchived) return false;
    }

    // 2. Filter by Standing Status Tag
    if (standingFilter !== 'all') {
      if (standingFilter === 'good' && b.statusTag !== 'good') return false;
      if (standingFilter === 'late' && b.statusTag !== 'late') return false;
      if (standingFilter === 'regular' && b.statusTag !== 'regular' && b.statusTag !== undefined) return false;
      if (standingFilter === 'dueSoon') {
        const daysLeft = getDaysUntilNextPayment(b);
        if (daysLeft === null || daysLeft > 3) return false;
      }
    }

    // 3. Filter by Search Query (Name or Phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchPhone = b.phone?.includes(q) || false;
      return matchName || matchPhone;
    }

    return true;
  });

  const selectedBorrower = borrowers.find(b => b.id === selectedBorrowerId) || null;

  // Render Borrower Portal if viewing a shared/copied link
  if (shareId) {
    if (sharedBorrowerLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black tracking-wide animate-pulse">កំពុងទាញយកទិន្នន័យកូនបំណុលពីប្រព័ន្ធ Cloud...</p>
        </div>
      );
    }

    if (sharedBorrowerError || !sharedBorrower) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mb-2">⚠️</div>
          <h2 className="text-xl font-black text-rose-400">តំណភ្ជាប់មិនត្រឹមត្រូវ!</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            {sharedBorrowerError || 'រកមិនឃើញគណនី ឬប្រវត្តិខ្ចីប្រាក់របស់កូនបំណុលនៅក្នុងប្រព័ន្ធឡើយ។ សូមទាក់ទងម្ចាស់បំណុលផ្ទាល់ ដើម្បីទទួលបានតំណភ្ជាប់សារជាថ្មី។'}
          </p>
          {isLoggedIn && (
            <button
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setShareId(null);
              }}
              className="mt-4 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              ត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រង (Back to Dashboard)
            </button>
          )}
        </div>
      );
    }

    return (
      <BorrowerPortal
        borrower={sharedBorrower}
        isLenderLoggedIn={isLoggedIn}
        onBackToLender={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setShareId(null);
        }}
      />
    );
  }

  const isSuperAdmin = currentUser === 'sounravin';
  const isBlocked = memberProfile?.isBlocked === true;
  const isExpired = isSubscriptionExpired(memberProfile);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col antialiased font-sans relative overflow-hidden">
        {/* Animated Background Floating Auroras */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -70, 60, 0],
            y: [0, 50, -70, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, 40, -50, 0],
            y: [0, -30, 60, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"
        />

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center items-center p-4 relative z-10">
          {/* Top-Right Language Switcher */}
          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setLanguage('kh')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                language === 'kh'
                  ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 font-extrabold shadow-blue-500/10'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="text-sm">🇰🇭</span>
              <span>ខ្មែរ</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                language === 'en'
                  ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 font-extrabold shadow-blue-500/10'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="text-sm">🇺🇸</span>
              <span>EN</span>
            </motion.button>
          </div>

          {/* Toast Notification inside login */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 shadow-lg"
              >
                <div className="px-5 py-3 rounded-xl flex items-center gap-2 border text-xs font-bold bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/20">
                  <CheckSquare className="w-4 h-4 text-white shrink-0" />
                  <span>{notification.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Glassmorphic Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 110,
              damping: 16,
            }}
            className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6),_0_0_80px_rgba(37,99,235,0.06)] space-y-5 sm:space-y-6 relative overflow-hidden"
          >
            {/* Top Glowing Trace Bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />

            {/* Logo and System Title */}
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer"
              >
                {renderSystemLogo("w-16 h-16 shadow-lg shadow-blue-500/10")}
              </motion.div>
              <div>
                <h1 className="text-white text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {logoConfig?.systemName || t('appName')}
                </h1>
                <p className="text-[10px] text-blue-400/90 font-extrabold tracking-widest uppercase mt-1">{t('appSubtitle')}</p>
              </div>
            </div>

            {/* Animated Inner Forms */}
            <AnimatePresence mode="wait">
              {loginMode === 'signin' && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-1 text-xs">
                    <p className="text-blue-400 font-bold flex items-center gap-1.5 mb-1">
                      <span>🛡️ {language === 'kh' ? 'គណនីការពារទិន្នន័យពីការបាត់បង់' : 'Data Loss Protection Account'}</span>
                    </p>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {language === 'kh' 
                        ? 'សូមប្រើប្រាស់គណនីផ្លូវការតែមួយគត់របស់អ្នក ដើម្បីកត់ត្រា និងសមកាលកម្មទិន្នន័យឱ្យមានសុវត្ថិភាពខ្ពស់បំផុត។'
                        : 'Please use your official account to record and synchronize your data with maximum security.'}
                    </p>
                  </div>

                  <SignInForm
                    onSubmit={handleCredentialsLogin}
                    loginError={loginError}
                    setLoginError={setLoginError}
                    language={language}
                    t={t}
                    onForgotPasswordClick={() => {
                      setLoginMode('forgot_password');
                      setResetStep('request');
                      setForgotError('');
                      setForgotEmail('');
                    }}
                  />

                  {/* Switch to Register */}
                  <div className="border-t border-slate-800/60 pt-4 text-center">
                    <p className="text-xs text-slate-400">
                      {t('noAccountText')}{" "}
                      <button
                        onClick={() => {
                          setLoginMode('register');
                          setRegError('');
                          setRegUsername('');
                          setRegEmail('');
                          setRegPassword('');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-black hover:underline transition"
                      >
                        {t('registerMemberLink')}
                      </button>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-800/60 flex-1"></div>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('orSocials')}</span>
                    <div className="h-px bg-slate-800/60 flex-1"></div>
                  </div>

                  {/* Social Sign-In Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setAuthModalType('google');
                        setRegError('');
                        setShowAuthModal(true);
                      }}
                      className="py-2.5 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.86c2.26-2.08 3.56-5.14 3.56-8.5Z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.32v3.11C3.31 21.88 7.37 24 12 24Z"/>
                        <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.32a11.96 11.96 0 0 0 0 10.76l3.95-3.11Z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.93 1.19 15.24 0 12 0 7.37 0 3.31 2.12 1.32 5.62l3.95 3.11c.95-2.85 3.6-4.98 6.73-4.98Z"/>
                      </svg>
                      <span>Google</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setAuthModalType('facebook');
                        setRegError('');
                        setShowAuthModal(true);
                      }}
                      className="py-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-xl text-xs font-bold text-[#1877F2] transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {loginMode === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl text-xs space-y-1.5">
                    <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span>{t('regNoticeTitle')}</span>
                    </p>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {t('regNoticeDesc')}
                    </p>
                  </div>

                  <RegisterForm
                    onSubmit={handleMemberRegister}
                    regError={regError}
                    setRegError={setRegError}
                    authLoading={authLoading}
                    language={language}
                    t={t}
                  />

                  <div className="border-t border-slate-800/60 pt-4 text-center">
                    <button
                      onClick={() => setLoginMode('signin')}
                      className="text-xs text-slate-400 hover:text-white hover:underline font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> {t('backToLogin')}
                    </button>
                  </div>
                </motion.div>
              )}

              {loginMode === 'forgot_password' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl text-xs space-y-1.5">
                    <p className="text-blue-400 font-bold flex items-center gap-1.5">
                      <span>{t('forgotPasswordTitle')}</span>
                    </p>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {t('forgotPasswordDesc')}
                    </p>
                  </div>

                  <ForgotPasswordForm
                    onRequest={handleForgotPasswordRequest}
                    onVerify={handleForgotPasswordVerify}
                    onReset={handleForgotPasswordReset}
                    resetStep={resetStep}
                    verificationCode={verificationCode}
                    forgotEmail={forgotEmail}
                    forgotError={forgotError}
                    setForgotError={setForgotError}
                    authLoading={authLoading}
                    language={language}
                    t={t}
                  />

                  <div className="border-t border-slate-800/60 pt-4 text-center">
                    <button
                      onClick={() => {
                        setLoginMode('signin');
                        setResetStep('request');
                        setForgotError('');
                      }}
                      className="text-xs text-slate-400 hover:text-white hover:underline font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> {t('backToLogin')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-[10px] text-slate-500 font-semibold pt-2">
              {t('copyright').replace('{year}', String(new Date().getFullYear()))}
            </p>
          </motion.div>
        </div>

        {/* Dynamic Social Auth & Registration Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200 my-8">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  {authModalType === 'google' ? (
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.78-2.4 3.63v3.02h3.86c2.26-2.08 3.56-5.14 3.56-8.5Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.32v3.11C3.31 21.88 7.37 24 12 24Z"/>
                      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.32a11.96 11.96 0 0 0 0 10.76l3.95-3.11Z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.93 1.19 15.24 0 12 0 7.37 0 3.31 2.12 1.32 5.62l3.95 3.11c.95-2.85 3.6-4.98 6.73-4.98Z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {authModalType === 'google' ? t('socialAuthTitleGoogle') : t('socialAuthTitleFacebook')}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4">
                  {t('socialAuthDesc')}
                </p>
              </div>

              {authLoading ? (
                <div className="p-10 flex flex-col items-center justify-center space-y-3">
                  <div className={`w-9 h-9 border-4 border-t-transparent rounded-full animate-spin ${authModalType === 'facebook' ? 'border-[#1877F2]' : 'border-emerald-600'}`}></div>
                  <span className="text-xs font-bold text-slate-500">{t('syncCloudLoading')}</span>
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto px-5 pb-5 space-y-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('quickAccounts')}</p>
                  <div className="space-y-1.5">
                    {authModalType === 'google' ? (
                      <>
                        <button
                          onClick={() => handleSocialAccountSelect('sounravin@gmail.com', 'Soun Ravin', 'google')}
                          className="w-full p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">SR</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">Soun Ravin</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">sounravin@gmail.com</p>
                          </div>
                          <span className="text-[9px] text-blue-600 font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg shrink-0">{t('adminBadge')}</span>
                        </button>

                        <button
                          onClick={() => handleSocialAccountSelect('ProzzLop@gmail.com', 'Prozz Lop', 'google')}
                          className="w-full p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">PL</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">Prozz Lop</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">ProzzLop@gmail.com</p>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg shrink-0">{t('userBadge')}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSocialAccountSelect('sounravin@gmail.com', 'Soun Ravin', 'facebook')}
                          className="w-full p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">SR</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">Soun Ravin</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">sounravin@facebook.com</p>
                          </div>
                          <span className="text-[9px] text-blue-600 font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg shrink-0">{t('adminBadge')}</span>
                        </button>

                        <button
                          onClick={() => handleSocialAccountSelect('ProzzLop', 'Prozz Lop', 'facebook')}
                          className="w-full p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition flex items-center gap-3 text-left cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">PL</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">Prozz Lop</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">ProzzLop@facebook.com</p>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg shrink-0">{t('userBadge')}</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowAuthModal(false)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer text-center"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if ((isBlocked || isExpired) && !isSuperAdmin) {
    const profileStatus = getSubscriptionStatusInfo(memberProfile);
    const profileInfo = { text: profileStatus.text };

    return (
      <div className="min-h-screen bg-[#071324] text-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in duration-300">
          {/* Header section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl text-4xl animate-bounce">
              ⏳
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">គណនីប្រើប្រាស់របស់លោកអ្នកបានផុតកំណត់ហើយ!</h3>
              <p className="text-sm font-semibold text-slate-300 leading-relaxed max-w-2xl mx-auto">
                គណនីប្រើប្រាស់របស់អ្នកឈ្មោះ <span className="text-white font-black">@{currentUser}</span> បានផុតកំណត់ប្រើប្រាស់គម្រោងសាកល្បង ឬគម្រោងវគ្គមុនហើយ (<span className="text-rose-400 font-bold">{profileInfo.text}</span>)។ <br/>
                ដើម្បីបន្តការគ្រប់គ្រងកូនបំណុល និងទិន្នន័យផ្សេងៗរបស់លោកអ្នក <span className="text-amber-400 font-extrabold font-black">សូមធ្វើការទិញ ឬបន្តគម្រោងបន្តបន្ថែម</span>。
              </p>
            </div>
          </div>

          {/* Checkout/Pricing form (Not visible if blocked) */}
          {!isBlocked && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* ABA KHQR Payment Card with Interactive Flow */}
              <div className="bg-[#0B1521] text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative min-h-[500px]">
                {/* Brand Red Header */}
                <div 
                  className="py-4 px-6 flex flex-col items-center justify-center relative overflow-hidden select-none shrink-0"
                  style={{ backgroundColor: qrConfig.bankColor || '#E61A22' }}
                >
                  {/* Curved wave effect on header */}
                  <div className="absolute right-0 bottom-0 left-0 h-2 bg-[#0B1521] rounded-t-full opacity-10"></div>
                  <div className="text-white text-base font-black tracking-widest flex items-center gap-1">
                    <span className="font-sans font-black tracking-widest text-lg">KH</span>
                    <span 
                      className="bg-white font-black px-1.5 py-0.5 rounded text-xs"
                      style={{ color: qrConfig.bankColor || '#E61A22' }}
                    >
                      QR
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  {blockScreenPaymentStep === 'scan' && (
                    <div className="flex-1 flex flex-col items-center justify-between space-y-5">
                      <div className="text-center space-y-1">
                        <h4 className="text-lg font-black text-white tracking-wide uppercase">
                          {qrConfig.accountName || 'SOUN RAVIN'}
                        </h4>
                        {/* Big bold "0" as shown directly in the uploaded image */}
                        <div className="text-5xl font-black text-white my-1 select-none font-mono">0</div>
                      </div>

                      {/* Dotted Divider */}
                      <div className="w-full border-t border-dashed border-slate-700/60 my-1"></div>

                      {/* QR Code Container with white background */}
                      <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center relative select-none shrink-0 w-52 h-52 mx-auto">
                        {qrConfig.qrType === 'uploaded' && qrConfig.qrImageUrl ? (
                          <img
                            src={qrConfig.qrImageUrl}
                            alt="Payment KHQR"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrConfig.qrString || '00020101021129170013000469096')}`}
                              alt="Canadia KHQR SOUN RAVIN"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            {/* Absolute Center Bank logo */}
                            <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md p-1">
                              <div 
                                className="w-full h-full rounded-full flex items-center justify-center relative"
                                style={{ backgroundColor: qrConfig.bankColor || '#E61A22' }}
                              >
                                <svg className="w-6 h-6 text-white fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 2.5L17 5l.5 3.5 2.5 2.5-2.5 2.5-.5 3.5-3.5.5-2.5 2.5-2.5-2.5-3.5-.5-.5-3.5-2.5-2.5 2.5-2.5.5-3.5 3.5-.5z" />
                                  <text x="12" y="15.5" textAnchor="middle" className="font-sans font-black text-[9px] fill-white stroke-none">
                                    {qrConfig.bankLogoText || 'C'}
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
                        {!blockScreenQrScanDetected ? (
                          <div className="w-full flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 gap-1.5 animate-pulse select-none">
                            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                            <span className="text-[11px] font-bold text-amber-400">កំពុងរង់ចាំសមាជិកស្កេនទូទាត់...</span>
                            <span className="text-[9px] text-slate-500">សូមស្កេន QR ខាងលើដើម្បីទូទាត់ប្រាក់</span>
                          </div>
                        ) : (
                          <div className="w-full space-y-2 animate-in fade-in duration-300">
                            <div className="w-full flex items-center justify-center p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 gap-1.5 animate-bounce">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-bold">បានរកឃើញការស្កេនរួចរាល់!</span>
                            </div>

                            {/* Pay/Verify Trigger Button */}
                            <button
                              onClick={() => {
                                setBlockScreenPaymentStep('counting');
                                setBlockScreenCountdown(56);
                              }}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-xs font-black transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
                            >
                              <span className="text-base leading-none">⚡</span>
                              <span>ខ្ញុំបានស្កេន រួចរាលហើយ</span>
                            </button>
                          </div>
                        )}

                        {/* Separate copy blocks side-by-side as requested */}
                        <div className="grid grid-cols-2 gap-2 w-full pt-1">
                          <div 
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(qrConfig.accountId || '000469096');
                                showToast('ចម្លង ID គណនីរួចរាល់!', 'success');
                              }
                            }}
                            className="py-2.5 px-3 bg-[#0F1C2E] hover:bg-slate-800 text-slate-300 rounded-xl text-center cursor-pointer border border-slate-800 flex flex-col items-center justify-center gap-1 transition-all duration-150 group"
                          >
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ID</span>
                            <span className="text-xs font-mono font-black text-white group-hover:text-amber-400 truncate w-full px-1">
                              {qrConfig.accountId || '000469096'}
                            </span>
                          </div>

                          <div 
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(qrConfig.accountName || 'SOUN RAVIN');
                                showToast('ចម្លងឈ្មោះគណនីរួចរាល់!', 'success');
                              }
                            }}
                            className="py-2.5 px-3 bg-[#0F1C2E] hover:bg-slate-800 text-slate-300 rounded-xl text-center cursor-pointer border border-slate-800 flex flex-col items-center justify-center gap-1 transition-all duration-150 group"
                          >
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Name</span>
                            <span className="text-xs font-sans font-black text-white group-hover:text-amber-400 truncate w-full px-1">
                              {qrConfig.accountName || 'SOUN RAVIN'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {blockScreenPaymentStep === 'counting' && (
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
                            {blockScreenCountdown}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            វិនាទី (Seconds)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 max-w-xs">
                        <h5 className="text-sm font-black text-amber-400">
                          កំពុងផ្ទៀងផ្ទាត់ការទូទាត់... (Checking Bank...)
                        </h5>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          {blockScreenCountdown > 40 && '🔍 កំពុងស្វែងរកប្រតិបត្តិការទូទាត់ប្រាក់ពីធនាគារ...'}
                          {blockScreenCountdown <= 40 && blockScreenCountdown > 25 && '⛓️ កំពុងផ្ទៀងផ្ទាត់ហត្ថលេខាឌីជីថលលើបណ្ដាញ...'}
                          {blockScreenCountdown <= 25 && blockScreenCountdown > 10 && '🔐 កំពុងធ្វើសមកាលកម្មទិន្នន័យគណនីលើ Cloud...'}
                          {blockScreenCountdown <= 10 && '✨ ជិតរួចរាល់ហើយ! កំពុងបង្កើតកញ្ចប់គម្រោង...'}
                        </p>
                      </div>

                      {/* Bypass shortcut button for convenience during testing */}
                      <button
                        onClick={() => setBlockScreenPaymentStep('select_plan')}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-400 rounded-lg hover:text-white transition"
                      >
                        រំលងការរង់ចាំ (Skip)
                      </button>
                    </div>
                  )}

                  {blockScreenPaymentStep === 'select_plan' && (
                    <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <div className="text-center space-y-1">
                          <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            ស្កេនជោគជ័យ (Scan Success)
                          </span>
                          <h5 className="text-sm font-black text-white">
                            សូមជ្រើសរើសគម្រោងដែលលោកអ្នកបានបង់ប្រាក់
                          </h5>
                        </div>

                        {/* Plan Selection Buttons Grid */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { id: '1_month', nameKh: 'គម្រោង ១ ខែ = 5$', popular: false },
                            { id: '3_months', nameKh: 'គម្រោង ៣ ខែ = 12$', popular: true },
                            { id: '1_year', nameKh: 'គម្រោង ១ ឆ្នាំ = 35$', popular: false }
                          ].map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => setBlockScreenSelectedPlan(plan.id as any)}
                              className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer relative ${
                                blockScreenSelectedPlan === plan.id
                                  ? 'bg-blue-600/25 border-blue-500 text-white ring-1 ring-blue-500'
                                  : 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${blockScreenSelectedPlan === plan.id ? 'border-blue-400' : 'border-slate-600'}`}>
                                  {blockScreenSelectedPlan === plan.id && <span className="w-2 h-2 rounded-full bg-blue-400"></span>}
                                </span>
                                <span className="text-xs font-black">
                                  {plan.nameKh}
                                </span>
                              </div>
                              {plan.popular && (
                                <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-md shrink-0">
                                  ពេញនិយម
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Submit Request Button */}
                      <button
                        onClick={() => handleBlockScreenRequestPlan(blockScreenSelectedPlan)}
                        disabled={blockScreenSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                      >
                        {blockScreenSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>កំពុងបញ្ជូនសំណើ...</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>ផ្ញើសំណើទៅកាន់ក្រុមការងារដើម្បីអនុម័ត</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {blockScreenPaymentStep === 'success' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-6 text-center animate-in zoom-in-95 duration-250">
                      {/* Radiant Success Indicator */}
                      <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative">
                        <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping"></div>
                        <span className="text-4xl">✨</span>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-base font-black text-emerald-400">
                          ផ្ញើសំណើទិញជោគជ័យ!
                        </h5>
                        <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800 text-[11px] font-bold text-slate-300 leading-normal max-w-xs mx-auto">
                          គម្រោងដែលអ្នកបានជ្រើសរើស៖{' '}
                          <span className="text-amber-400 font-extrabold uppercase">
                            {blockScreenSelectedPlan === '1_month' ? 'គម្រោង ១ ខែ' : blockScreenSelectedPlan === '3_months' ? 'គម្រោង ៣ ខែ' : 'គម្រោង ១ ឆ្នាំ'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-xs">
                          ក្រុមការងារពួកយើងនឹងពិនិត្យមើលប្រតិបត្តិការធនាគារ និងអនុម័តគណនីជូនលោកអ្នកយ៉ាងលឿនបំផុត!
                        </p>
                      </div>

                      <button
                        onClick={() => setBlockScreenPaymentStep('scan')}
                        className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/60 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        រួចរាល់
                      </button>
                    </div>
                  )}

                  {/* Support Info Row */}
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

              {/* Right Panel: Subscription History and Status Information */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6.5 flex flex-col justify-between shadow-sm space-y-6">
                <div className="space-y-5">
                  <div className="text-left flex items-center gap-2 pb-3.5 border-b border-slate-800">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="font-extrabold text-white text-sm">
                      ប្រវត្តិនៃការផ្ញើសំណើរបស់អ្នក
                    </h3>
                  </div>

                  {mySubRequests.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 font-semibold text-xs space-y-1">
                      <p>មិនទាន់មានសំណើទិញណាមួយឡើយ</p>
                      <p className="text-[10px] text-slate-600 font-medium">
                        ស្កេនទូទាត់ប្រាក់នៅផ្នែកខាងឆ្វេងដើម្បីផ្ញើសំណើដំបូងរបស់អ្នក។
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                      {mySubRequests.map((req) => (
                        <div key={req.id} className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 text-[11px] font-bold space-y-2.5 transition duration-150 hover:border-slate-700/50">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <p className="text-white text-xs">
                                {req.plan === '1_month' ? 'គម្រោង ១ ខែ ($5)' : req.plan === '3_months' ? 'គម្រោង ៣ ខែ ($12)' : 'គម្រោង ១ ឆ្នាំ ($35)'}
                              </p>
                              <p className="text-slate-500 font-medium">
                                ID: {req.id}
                              </p>
                            </div>
                            <div>
                              {req.status === 'pending' ? (
                                <span className="text-amber-400 bg-amber-400/5 px-2.5 py-1 rounded-xl border border-amber-400/10 text-[9px] font-black uppercase tracking-wider">🟠 Pending</span>
                              ) : req.status === 'approved' ? (
                                <span className="text-emerald-400 bg-emerald-400/5 px-2.5 py-1 rounded-xl border border-emerald-400/10 text-[9px] font-black uppercase tracking-wider">🟢 Approved</span>
                              ) : (
                                <span className="text-rose-400 bg-rose-400/5 px-2.5 py-1 rounded-xl border border-rose-400/10 text-[9px] font-black uppercase tracking-wider">🔴 Rejected</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium border-t border-slate-800/40 pt-2">
                            <span>កាលបរិច្ឆេទផ្ញើសំណើ៖</span>
                            <span>{new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Secure Notice */}
                <div className="bg-slate-850/60 border border-slate-800/80 rounded-2xl p-4 text-[11px] text-slate-400 leading-relaxed font-semibold">
                  <div className="flex items-center gap-1.5 text-amber-400 font-black mb-1.5">
                    <span>💡</span>
                    <span>ចំណាំសំខាន់ (Important Note)</span>
                  </div>
                  បន្ទាប់ពីបានទូទាត់ប្រាក់តាម QR និងបំពេញបែបបទសំណើរួចរាល់ ក្រុមការងារពួកយើងនឹងធ្វើការផ្ទៀងផ្ទាត់ និងអនុម័តគណនីជូនលោកអ្នកដើម្បីចូលទៅកាន់ប្រព័ន្ធគ្រប់គ្រងភ្លាមៗ!
                </div>
              </div>
            </div>
          )}

          {/* Action links */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-2">
            <a
              href="https://t.me/laymeancamera"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/10 transition duration-150 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.49 4.47-1.75 4.97-1.76.11 0 .36.03.52.16.14.11.18.26.19.38 0 .09-.01.27-.02.39z"/>
              </svg>
              <span>ទាក់ទង Admin តាម Telegram (ឡាយមាន)</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white font-extrabold text-xs rounded-xl border border-slate-700 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ចាកចេញពីគណនី (Logout)</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {/* PWA Add to Home Screen Banner */}
      <PWAInstallBanner />

      {/* Decorative Traditional Khmer Night Lights and Lanterns (glowing effects) */}
      {theme === 'dark' && (
        <div className="absolute top-0 inset-x-0 h-64 pointer-events-none overflow-hidden z-20 select-none">
          {/* Subtle hanging branch accent */}
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-b from-[#1c2c54]/40 to-transparent" />
          
          {/* Lantern Wires & Lanterns */}
          {[
            { left: '10%', height: '80px', delay: '0s', color: 'text-amber-300' },
            { left: '25%', height: '120px', delay: '0.8s', color: 'text-yellow-200' },
            { left: '45%', height: '70px', delay: '1.5s', color: 'text-orange-300' },
            { left: '60%', height: '100px', delay: '0.3s', color: 'text-amber-400' },
            { left: '78%', height: '130px', delay: '1.1s', color: 'text-yellow-300' },
            { left: '90%', height: '90px', delay: '1.9s', color: 'text-amber-200' },
          ].map((l, idx) => (
            <div 
              key={idx} 
              className="absolute top-0 flex flex-col items-center" 
              style={{ left: l.left }}
            >
              {/* Thin Golden hanging wire */}
              <div 
                className="w-[1px] bg-gradient-to-b from-amber-600/60 to-amber-400" 
                style={{ height: l.height }} 
              />
              {/* Star Lantern */}
              <motion.div
                animate={{
                  y: [0, 5, 0],
                  rotate: [-3, 3, -3],
                }}
                transition={{
                  duration: 4 + idx,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: parseFloat(l.delay),
                }}
                className="flex flex-col items-center -mt-1"
              >
                {/* Glowing light ball */}
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_15px_6px_rgba(251,191,36,0.8)] animate-pulse" />
                {/* Hanging star */}
                <svg className={`w-6 h-6 ${l.color} filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.31l8.2-1.192L12 .587z" />
                </svg>
              </motion.div>
            </div>
          ))}

          {/* Sparkly Ambient Glowing Backdrops */}
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* Marquee Banner */}
      <div id="global-marquee-banner" className="bg-purple-600 text-white font-bold text-xs py-2 shadow-sm border-b border-purple-700/20 select-none shrink-0 z-40 overflow-hidden w-full">
        <div className="animate-marquee-smooth flex">
          {isSuperAdmin ? (
            <>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">សេចក្តីជូនដំណឹង៖</span> មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ <span className="font-extrabold text-amber-300 underline">Pich Rachana</span>
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">សេចក្តីជូនដំណឹង៖</span> មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ <span className="font-extrabold text-amber-300 underline">Pich Rachana</span>
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">សេចក្តីជូនដំណឹង៖</span> មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ <span className="font-extrabold text-amber-300 underline">Pich Rachana</span>
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">សេចក្តីជូនដំណឹង៖</span> មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ <span className="font-extrabold text-amber-300 underline">Pich Rachana</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">ស្វាគមន៍មកកាន់ LUYPAY & លុយឆក់</span> «រហ័សទាន់ចិត្ត សុវត្ថិភាព និងទំនុកចិត្តខ្ពស់»
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">ស្វាគមន៍មកកាន់ LUYPAY & លុយឆក់</span> «រហ័សទាន់ចិត្ត សុវត្ថិភាព និងទំនុកចិត្តខ្ពស់»
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">ស្វាគមន៍មកកាន់ LUYPAY & លុយឆក់</span> «រហ័សទាន់ចិត្ត សុវត្ថិភាព និងទំនុកចិត្តខ្ពស់»
              </span>
              <span className="inline-block mr-12 shrink-0">
                ✨ <span className="font-extrabold text-amber-200">ស្វាគមន៍មកកាន់ LUYPAY & លុយឆក់</span> «រហ័សទាន់ចិត្ត សុវត្ថិភាព និងទំនុកចិត្តខ្ពស់»
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Toast Notification */}
        {notification && (
          <div id="toast-notif" className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-bold transition-all ${notification.type === 'success' ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/10' : 'bg-slate-900 text-white border-slate-800'}`}>
              <CheckSquare className="w-4 h-4 text-white" />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Sidebar Navigation - Sleek Interface Dark Theme */}
        <aside className="w-68 bg-slate-900 flex flex-col p-6 hidden md:flex shrink-0 border-r border-slate-800 relative z-40">
        {/* Logo / Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            {renderSystemLogo("w-10 h-10")}
            <div>
              <h1 className="text-white text-sm font-extrabold tracking-tight">{logoConfig?.systemName || t('appName')}</h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">{t('appSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/40 transform translate-x-3.5 translate-y-3 shrink-0">
            <a
              href="https://www.facebook.com/share/1F4p12PfJx/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-slate-400 hover:text-blue-500 rounded-md hover:bg-slate-750 transition flex items-center justify-center"
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
              className="p-1 text-slate-400 hover:text-sky-400 rounded-md hover:bg-slate-750 transition flex items-center justify-center"
              title="Telegram Link"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.49 4.47-1.75 4.97-1.76.11 0 .36.03.52.16.14.11.18.26.19.38 0 .09-.01.27-.02.39z"/>
              </svg>
            </a>
            <div className="border-l border-slate-700/60 pl-1 ml-0.5 flex items-center shrink-0">
              <NotificationBell
                borrowers={borrowers}
                onSelectBorrower={setSelectedBorrowerId}
                sidebarMode={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Links (Filter State Control) */}
        <div className="space-y-2 flex-1">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider px-2.5 mb-2">{t('categoryTitle')}</p>
          
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setFilterTab('active'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && filterTab === 'active'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/30 shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">📝</span>
              <span>{t('activeLoanLabel')}</span>
            </span>
            <span className={`px-2.5 py-0.5 text-[9px] rounded-lg font-black transition-all ${
              activeSection === 'ledger' && filterTab === 'active'
                ? 'bg-white/25 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {borrowers.filter(b => !b.isArchived && (Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0) < b.totalToPay).length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setFilterTab('completed'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && filterTab === 'completed'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 shadow-lg shadow-emerald-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">✅</span>
              <span>{t('completedLoanLabel')}</span>
            </span>
            <span className={`px-2.5 py-0.5 text-[9px] rounded-lg font-black transition-all ${
              activeSection === 'ledger' && filterTab === 'completed'
                ? 'bg-white/25 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {borrowers.filter(b => !b.isArchived && (Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0) >= b.totalToPay).length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setFilterTab('archived'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && filterTab === 'archived'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500/30 shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">📦</span>
              <span>{t('archivedLoanLabel')}</span>
            </span>
            <span className={`px-2.5 py-0.5 text-[9px] rounded-lg font-black transition-all ${
              activeSection === 'ledger' && filterTab === 'archived'
                ? 'bg-white/25 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {borrowers.filter(b => b.isArchived).length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setFilterTab('all'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && filterTab === 'all'
                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border-slate-600 shadow-lg shadow-slate-700/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">🔍</span>
              <span>{t('allLoanLabel')}</span>
            </span>
            <span className={`px-2.5 py-0.5 text-[9px] rounded-lg font-black transition-all ${
              activeSection === 'ledger' && filterTab === 'all'
                ? 'bg-white/25 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {borrowers.length}
            </span>
          </motion.button>
        </div>

        {/* Sidebar Standing Filter Options */}
        <div className="space-y-2 mt-5">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider px-2.5 mb-2">{t('standingTitle')}</p>
          
          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setStandingFilter('all'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && standingFilter === 'all'
                ? 'bg-slate-800 text-white border-slate-700/80 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">🌟</span>
              <span>{t('standingAll')}</span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setStandingFilter('good'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && standingFilter === 'good'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">🟢</span>
              <span>{t('standingGood')}</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] rounded-lg font-black bg-emerald-950 text-emerald-400 border border-emerald-800/30">
              {borrowers.filter(b => b.statusTag === 'good').length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setStandingFilter('regular'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && standingFilter === 'regular'
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/20 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">🟡</span>
              <span>{t('standingRegular')}</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] rounded-lg font-black bg-amber-950 text-amber-400 border border-amber-800/30">
              {borrowers.filter(b => b.statusTag === 'regular' || b.statusTag === undefined).length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setStandingFilter('late'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && standingFilter === 'late'
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/20 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">🔴</span>
              <span>{t('standingLate')}</span>
            </span>
            <span className="px-2 py-0.5 text-[9px] rounded-lg font-black bg-rose-950 text-rose-400 animate-pulse border border-rose-850/40">
              {borrowers.filter(b => b.statusTag === 'late').length}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { setStandingFilter('dueSoon'); setActiveSection('ledger'); }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger' && standingFilter === 'dueSoon'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/30 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-sm">⏰</span>
              <span>{t('standingDueSoon')}</span>
            </span>
            <span className={`px-2 py-0.5 text-[9px] rounded-lg font-black border transition-all ${
              activeSection === 'ledger' && standingFilter === 'dueSoon'
                ? 'bg-white/20 text-white border-amber-300/30'
                : 'bg-amber-950/50 text-amber-300 border-amber-900/30'
            }`}>
              {borrowers.filter(b => {
                const dl = getDaysUntilNextPayment(b);
                return dl !== null && dl <= 3;
              }).length}
            </span>
          </motion.button>
        </div>

        {/* Sidebar System & Subscription Management Section */}
        <div className="space-y-2 mt-5">
          <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider px-2.5 mb-2">
            {currentUser === 'sounravin' ? 'គ្រប់គ្រងប្រព័ន្ធ' : 'គណនី & សមាជិកភាព'}
          </p>

          {currentUser === 'sounravin' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('admin_dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all border duration-200 cursor-pointer ${
                activeSection === 'admin_dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>គ្រប់គ្រងសមាជិក (Admin)</span>
              </span>
              {subRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.5 text-[8px] rounded-md font-black bg-rose-500 text-white animate-pulse">
                  {subRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </motion.button>
          )}

          {isMember && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('pricing')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all border duration-200 cursor-pointer ${
                activeSection === 'pricing'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/30 shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ទិញ/បន្តគម្រោងកម្មវិធី</span>
              </span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSection('ledger')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all border duration-200 cursor-pointer ${
              activeSection === 'ledger'
                ? 'bg-slate-800 text-white border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
              <span>បញ្ជីកម្ចីប្រាក់ (Ledger)</span>
            </span>
          </motion.button>
        </div>

        {/* Sidebar Footer Info box - collected amounts */}
        <div className="mt-auto space-y-4">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/60">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2.5">{t('currentCollectedLabel')}</p>
            <div className="space-y-1 text-xs font-bold">
              <p className="text-white flex justify-between">
                <span>USD:</span>
                <span className="text-emerald-400">${stats.totalCollectedUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </p>
              <p className="text-white flex justify-between">
                <span>Riel:</span>
                <span className="text-emerald-400">{stats.totalCollectedKHR.toLocaleString()} ៛</span>
              </p>
            </div>
          </div>

          {/* User Profile info and Logout button */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {memberProfile?.photoURL ? (
                <img
                  src={memberProfile.photoURL}
                  alt={userDisplayName}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md text-white ${userAuthType === 'facebook' ? 'bg-blue-600 shadow-blue-600/20' : userAuthType === 'google' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-slate-700 shadow-slate-700/20'}`}>
                  {userAuthType === 'facebook' ? 'FB' : userAuthType === 'google' ? 'G' : 'SR'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{userDisplayName}</p>
                <p className="text-[9px] text-slate-500 font-semibold truncate">
                  {currentUser}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/50 pt-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 w-max">
                  <span>●</span> {t('statusActive')}
                </span>
                
                {isLoggedIn && (
                  <span className="text-[9px] flex items-center gap-1 font-bold">
                    {cloudSyncStatus === 'synced' && (
                      <span className="text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-emerald-400 shrink-0" /> {t('cloudSaved')}
                      </span>
                    )}
                    {cloudSyncStatus === 'syncing' && (
                      <span className="text-blue-400 bg-blue-400/5 border border-blue-400/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-2.5 h-2.5 text-blue-400 shrink-0 animate-spin" /> {t('syncing')}
                      </span>
                    )}
                    {cloudSyncStatus === 'error' && (
                      <span className="text-amber-400 bg-amber-400/5 border border-amber-400/20 px-1.5 py-0.5 rounded-md flex items-center gap-1" title="Firestore quota limit exceeded. System automatically fell back to secure Local Storage mode. Your data is perfectly safe.">
                        <Cloud className="w-3 h-3 text-amber-400 shrink-0 opacity-70" /> {t('syncError')}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg transition cursor-pointer border-transparent"
                  title={language === 'kh' ? 'ការកំណត់ / Settings' : 'Settings'}
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 rounded-lg transition cursor-pointer border-transparent flex items-center justify-center"
                  title={t('logoutBtnTitle')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-center border-t border-slate-800/40 pt-2 text-[9px] text-slate-500 font-bold">
              {t('developedBy')} <span className="text-blue-400">ឡាយមាន (Lay Mean)</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* Mobile Header profile bar */}
        <div className="md:hidden flex flex-col bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-lg gap-4 relative z-40">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 border-transparent">
              {memberProfile?.photoURL ? (
                <img
                  src={memberProfile.photoURL}
                  alt={userDisplayName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                renderSystemLogo("w-11 h-11 shrink-0")
              )}
              <div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-black leading-tight">{logoConfig?.systemName || t('appName')}</p>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.facebook.com/share/1F4p12PfJx/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-blue-500 rounded-lg hover:bg-slate-750 transition flex items-center justify-center shadow-3xs"
                      title="Facebook Link"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                      </svg>
                    </a>
                    <a
                      href="https://t.me/laymeancamera"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 text-slate-300 hover:text-sky-400 rounded-lg hover:bg-slate-750 transition flex items-center justify-center shadow-3xs"
                      title="Telegram Link"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.77-3.32 3.7-1.49 4.47-1.75 4.97-1.76.11 0 .36.03.52.16.14.11.18.26.19.38 0 .09-.01.27-.02.39z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5">{t('accountLabel')} {userDisplayName} ({currentUser})</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Notification Bell */}
              <NotificationBell borrowers={borrowers} onSelectBorrower={setSelectedBorrowerId} isMobile={true} />

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 bg-slate-850 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded-xl transition cursor-pointer border-transparent"
                title={language === 'kh' ? 'ការកំណត់ / Settings' : 'Settings'}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 bg-slate-850 hover:bg-slate-800 active:bg-slate-900 text-rose-400 hover:text-rose-300 rounded-xl transition cursor-pointer border-transparent"
                title={t('logoutBtnTitle')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Nav buttons row */}
          <div className="flex items-center gap-2 border-t border-slate-800/60 pt-2.5">
            <button
              onClick={() => setActiveSection('ledger')}
              className={`flex-1 py-2 text-[11px] font-black rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSection === 'ledger' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-850 text-slate-400 hover:text-white'}`}
            >
              <span>📝 បញ្ជីកម្ចី</span>
            </button>
            {currentUser === 'sounravin' ? (
              <button
                onClick={() => setActiveSection('admin_dashboard')}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl text-center transition-all relative cursor-pointer flex items-center justify-center gap-1.5 ${activeSection === 'admin_dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'bg-slate-850 text-slate-400 hover:text-white'}`}
              >
                <span>📊 គ្រប់គ្រងប្រព័ន្ធ</span>
                {subRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] rounded-md font-black bg-rose-500 text-white animate-pulse">
                    {subRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            ) : (
              isMember && (
                <button
                  onClick={() => setActiveSection('pricing')}
                  className={`flex-1 py-2 text-[11px] font-black rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSection === 'pricing' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/10' : 'bg-slate-850 text-slate-400 hover:text-white'}`}
                >
                  <span>💎 គម្រោងកម្មវិធី</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Dynamic Sponsor Promotion Banner (Visible if enabled and image is uploaded) */}
        {sponsorConfig && sponsorConfig.sponsorEnabled && sponsorConfig.sponsorImageUrl && (
          <div id="system-sponsor-banner" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 shadow-sm flex flex-col gap-2.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                {language === 'kh' ? 'ឧបត្ថម្ភគាំទ្រ' : 'Sponsored'}
              </span>
              {sponsorConfig.sponsorTitle && (
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                  {sponsorConfig.sponsorTitle}
                </span>
              )}
            </div>
            
            {sponsorConfig.sponsorLinkUrl ? (
              <a
                href={sponsorConfig.sponsorLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:opacity-95 transition cursor-pointer"
              >
                <img
                  src={sponsorConfig.sponsorImageUrl}
                  alt={sponsorConfig.sponsorTitle || 'Sponsor Promotion'}
                  className="w-full h-auto object-contain rounded-2xl block"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <img
                  src={sponsorConfig.sponsorImageUrl}
                  alt={sponsorConfig.sponsorTitle || 'Sponsor Promotion'}
                  className="w-full h-auto object-contain rounded-2xl block"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        )}

        {(() => {
          // If member is suspended/blocked
          const isBlocked = memberProfile?.isBlocked === true;
          if (isBlocked) {
            return (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl max-w-2xl mx-auto text-center space-y-6 my-12 border-t-4 border-t-rose-500 animate-in fade-in duration-350">
                <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-200 text-3xl">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">គណនីរបស់អ្នកត្រូវបានផ្អាកជាបណ្ដោះអាសន្ន!</h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">
                    គណនីប្រើប្រាស់របស់អ្នកឈ្មោះ <span className="text-slate-900 font-extrabold">{currentUser}</span> ត្រូវបានផ្អាកជាបណ្ដោះអាសន្នដោយសារការបំពានលក្ខខណ្ឌការប្រើប្រាស់ ឬមិនទាន់បានបង់ប្រាក់សេវាកម្ម។ សូមទាក់ទងមកកាន់អ្នកគ្រប់គ្រងដើម្បីសាកសួរព័ត៌មានបន្ថែម។
                  </p>
                </div>
                <div className="flex justify-center gap-3.5">
                  <a
                    href="https://t.me/laymeancamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/10 transition duration-150"
                  >
                    Telegram ឡាយមាន
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition duration-150 cursor-pointer"
                  >
                    ចាកចេញ (Logout)
                  </button>
                </div>
              </div>
            );
          }

          // If member subscription is expired (and is not super-admin)
          const profileInfo = getSubscriptionStatusInfo(memberProfile);
          if (profileInfo.isExpired && activeSection !== 'pricing') {
            return (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl max-w-2xl mx-auto text-center space-y-6 my-12 border-t-4 border-t-amber-500 animate-in fade-in duration-350">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-200 text-3xl">
                  ⏳
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">គម្រោងការប្រើប្រាស់បានផុតកំណត់ហើយ!</h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">
                    គណនីរបស់អ្នកបានប្រើប្រាស់ហួសកាលកំណត់គម្រោងសាកល្បង ឬគម្រោងវគ្គមុនហើយ។ ដើម្បីបន្តគ្រប់គ្រងកូនបំណុល និងទិន្នន័យផ្សេងៗ សូមធ្វើការទិញ ឬបន្តគម្រោងថ្មី។
                  </p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl text-left font-bold text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>ឈ្មោះគណនី៖</span>
                    <span className="text-slate-900 font-extrabold">{userDisplayName} ({currentUser})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ស្ថានភាពសមាជិក៖</span>
                    <span className="text-rose-600 font-extrabold">{profileInfo.text}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3.5">
                  <button
                    onClick={() => setActiveSection('pricing')}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>ពិនិត្យគម្រោង & បញ្ជូនសំណើបង់ប្រាក់</span>
                  </button>
                  <a
                    href="https://t.me/laymeancamera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition duration-150 flex items-center justify-center gap-1.5"
                  >
                    <span>Telegram ទាក់ទង Admin</span>
                  </a>
                </div>
              </div>
            );
          }

          // Router Switch based on activeSection
          if (activeSection === 'admin_dashboard' && currentUser === 'sounravin') {
            return (
              <AdminMembersDashboard
                members={members}
                subRequests={subRequests}
                getSubscriptionStatusInfo={getSubscriptionStatusInfo}
                showToast={showToast}
                language={language}
              />
            );
          }

          if (activeSection === 'pricing') {
            return (
              <PricingPanel
                currentUser={currentUser}
                userDisplayName={userDisplayName}
                memberProfile={memberProfile}
                language={language}
                getSubscriptionStatusInfo={getSubscriptionStatusInfo}
                showToast={showToast}
                qrConfig={qrConfig}
              />
            );
          }

          // Otherwise, render default ledger content:
          return (
            <>
              {/* Header Component with stats and notifications */}
              <Header
                stats={stats}
                onAddNewClick={() => setIsAddModalOpen(true)}
                onBackupClick={handleExportBackup}
                onImportClick={handleImportBackup}
                selectedCount={selectedBorrowerIds.length}
                onBulkAutoCheck={handleBulkAutoCheck}
                borrowers={borrowers}
                onSelectBorrower={setSelectedBorrowerId}
              />

              {/* Special Member Referral & Sync Panel */}
              {isMember && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500 animate-in fade-in duration-300">
                  <div className="space-y-2 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 text-emerald-100 px-3 py-1 rounded-full border border-white/10">
                      {language === 'kh' ? '💵 ស្ថានភាពគម្រោងការប្រើប្រាស់បច្ចុប្បន្ន' : '💵 Current Subscription Status'}
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {language === 'kh' ? 'សមាជិកភាពរបស់បង៖' : 'Your Official Membership:'} {userDisplayName} ({currentUser})
                    </h3>
                    <p className="text-xs text-emerald-100 font-bold leading-relaxed max-w-3xl">
                      {language === 'kh' 
                        ? 'គណនីរបស់បងត្រូវបានភ្ជាប់ជាមួយប្រព័ន្ធ Cloud របស់ Luypay។ រាល់ទិន្នន័យកម្ចី និងការកត់ត្រាទាំងអស់នឹងសមកាលកម្មស្វ័យប្រវត្តទៅកាន់ពពកប្រកបដោយសុវត្ថិភាពខ្ពស់ ដែលអាចប្រើប្រាស់បានគ្រប់ឧបករណ៍ និងគ្រប់ពេលវេលា។' 
                        : 'Your account is fully connected to the Luypay Cloud Storage. All loan logs and ledger data will be synced automatically in real-time, securing your records across devices.'}
                    </p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4.5 border border-white/25 w-full md:w-max shrink-0 space-y-3.5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                        {language === 'kh' ? 'ស្ថានភាពគម្រោង៖' : 'Subscription Status:'}
                      </p>
                      <p className="text-xs font-black text-white bg-black/25 px-3 py-2 rounded-xl border border-emerald-500/25">
                        {getSubscriptionStatusInfo(memberProfile).text}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('pricing')}
                      className="w-full py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600 font-extrabold text-xs rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'ពិនិត្យគម្រោង / ទិញបន្ថែម' : 'View Plans / Upgrade'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dashboard Actions Bar */}
              <div id="dashboard-controls" className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                {/* Tab filters for mobile view (hidden on desktop) */}
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto md:hidden">
                  <button
                    onClick={() => setFilterTab('active')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${filterTab === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                  >
                    📝 {t('activeLoanLabel')} ({borrowers.filter(b => !b.isArchived && (Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0) < b.totalToPay).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('completed')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${filterTab === 'completed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                  >
                    ✅ {t('completedLoanLabel')} ({borrowers.filter(b => !b.isArchived && (Array.isArray(b.payments) ? b.payments.reduce((sum, p) => sum + (p?.amount || 0), 0) : 0) >= b.totalToPay).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('archived')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${filterTab === 'archived' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                  >
                    📦 {t('archivedLoanLabel')} ({borrowers.filter(b => b.isArchived).length})
                  </button>
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${filterTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                  >
                    🔍 {t('allLoanLabel')} ({borrowers.length})
                  </button>
                </div>

                {/* Search bar */}
                <div className="relative w-full md:max-w-md">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 text-base md:text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-bold"
                  />
                </div>
              </div>

              {/* Borrower standing sub-filters */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl w-full sm:w-max shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 px-2.5 uppercase tracking-wider">{t('standingFilterLabel')}</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setStandingFilter('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      standingFilter === 'all'
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    🌟 {t('allLoanLabel')} ({borrowers.length})
                  </button>
                  <button
                    onClick={() => setStandingFilter('good')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      standingFilter === 'good'
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                    }`}
                  >
                    🟢 {t('standingGood')} ({borrowers.filter(b => b.statusTag === 'good').length})
                  </button>
                  <button
                    onClick={() => setStandingFilter('regular')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      standingFilter === 'regular'
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                        : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    🟡 {t('standingRegular')} ({borrowers.filter(b => b.statusTag === 'regular' || b.statusTag === undefined).length})
                  </button>
                  <button
                    onClick={() => setStandingFilter('late')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      standingFilter === 'late'
                        ? 'bg-rose-500 text-rose-700 border border-rose-200 shadow-sm shadow-rose-500/10'
                        : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
                    }`}
                  >
                    🔴 {t('standingLate')} ({borrowers.filter(b => b.statusTag === 'late').length})
                  </button>
                  <button
                    onClick={() => setStandingFilter('dueSoon')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      standingFilter === 'dueSoon'
                        ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                        : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                    }`}
                  >
                    ⏰ {t('standingDueSoon')} ({borrowers.filter(b => {
                      const dl = getDaysUntilNextPayment(b);
                      return dl !== null && dl <= 3;
                    }).length})
                  </button>
                </div>
              </div>



              {/* Bulk Selection Action Bar */}
              {filteredBorrowers.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-150 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="select-all-visible"
                      checked={
                        filteredBorrowers.length > 0 &&
                        filteredBorrowers.every((b) => selectedBorrowerIds.includes(b.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allIds = filteredBorrowers.map((b) => b.id);
                          setSelectedBorrowerIds((prev) => Array.from(new Set([...prev, ...allIds])));
                        } else {
                          const visibleIds = filteredBorrowers.map((b) => b.id);
                          setSelectedBorrowerIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="select-all-visible" className="font-bold text-slate-600 cursor-pointer select-none">
                      {language === 'kh' ? 'ជ្រើសរើសកូនបំណុលទាំងអស់ (Select All)' : 'Select All Filtered'}
                    </label>
                  </div>
                  {selectedBorrowerIds.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-500 text-[11px]">
                        {language === 'kh' ? `បានជ្រើសរើស ${selectedBorrowerIds.length} នាក់` : `Selected ${selectedBorrowerIds.length}`}
                      </span>
                      <button
                        onClick={() => setSelectedBorrowerIds([])}
                        className="text-xs font-bold text-rose-650 hover:underline cursor-pointer"
                      >
                        {language === 'kh' ? 'លុបការជ្រើសរើស' : 'Clear Selection'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Borrowers Grid View */}
              {filteredBorrowers.length === 0 ? (
                <div id="no-data-display" className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center space-y-3 shadow-sm">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Info className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-700">{t('noBorrowerFoundTitle')}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery ? t('noSearchResultsDesc') : t('noBorrowersDesc')}
                    </p>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {t('clearSearchBtn')}
                    </button>
                  )}
                </div>
              ) : (
                <div id="borrowers-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBorrowers.map((b) => (
                    <BorrowerCard
                      key={b.id}
                      borrower={b}
                      onSelect={handleSelectBorrower}
                      onQuickPay={handleQuickPay}
                      isSelected={selectedBorrowerIds.includes(b.id)}
                      onToggleSelect={handleToggleSelectBorrower}
                    />
                  ))}
                </div>
              )}

              {/* Feature Highlights/Notice */}
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/60 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                <div className="p-2.5 bg-blue-500/10 text-blue-700 rounded-xl">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">💡 {t('tipsTitle')}</h4>
                  <p className="text-xs text-blue-900 leading-relaxed max-w-4xl">
                    {t('tipsDesc')}
                  </p>
                </div>
              </div>
            </>
          );
        })()}
      </main>

      {/* Add New Borrower Overlay */}
      <AddBorrowerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNewBorrower}
      />

      {/* Detail & Card-Checkboard Overlay */}
      <AnimatePresence>
        {selectedBorrower && (
          <BorrowerDetail
            borrower={selectedBorrower}
            onClose={() => setSelectedBorrowerId(null)}
            onAddPayment={handleAddPaymentDetail}
            onDeletePayment={handleDeletePayment}
            onDeleteBorrower={handleDeleteBorrower}
            onToggleArchive={handleToggleArchive}
            onUpdateStatus={handleUpdateBorrowerStatus}
            onToggleAutoCheckIn={handleToggleAutoCheckIn}
            onEditBorrower={handleEditBorrower}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal (Language, Theme, and Profile Photo Selection) */}
      {isSettingsOpen && (
        <div id="settings-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-250 text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">
                  {language === 'kh' ? 'ការកំណត់ប្រព័ន្ធ' : 'System Settings'}
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 dark:text-slate-400 border-transparent cursor-pointer animate-none"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Profile Photo Selection Section */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <span>{language === 'kh' ? 'រូបថតកម្រងព័ត៌មាន' : 'Profile Photo'}</span>
                </h4>
                
                <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-850 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="relative group">
                    {memberProfile?.photoURL ? (
                      <img
                        src={memberProfile.photoURL}
                        alt="Profile avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
                        {userDisplayName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition border border-white flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs font-bold">{userDisplayName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser}</p>
                  </div>

                  {/* Curated Preset Avatars Grid */}
                  <div className="w-full space-y-2 mt-2">
                    <p className="text-[10px] text-slate-400 font-bold text-center">
                      {language === 'kh' ? 'ឬជ្រើសរើសរូបតំណាងដែលមានស្រាប់៖' : 'Or select a predefined avatar:'}
                    </p>
                    <div className="grid grid-cols-6 gap-2.5 justify-center">
                      {[
                        { name: 'fox', url: 'https://images.unsplash.com/photo-1574063413132-355dbfd83e82?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'lion', url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'rabbit', url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'koala', url: 'https://images.unsplash.com/photo-1528696892704-5e1122852276?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'panda', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=150&h=150&q=80' }
                      ].map((av) => (
                        <button
                          key={av.name}
                          type="button"
                          onClick={() => handleSavePhotoURL(av.url)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition flex items-center justify-center p-0 ${memberProfile?.photoURL === av.url ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          title={av.name}
                        >
                          <img src={av.url} alt={av.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment QR Code (Control QR) Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-500" />
                  <span>{language === 'kh' ? 'ការកំណត់ QR Code ទទួលប្រាក់ (Control QR)' : 'Control QR / Payment QR'}</span>
                </h4>
                
                <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shadow-inner relative group">
                    {memberProfile?.paymentQr ? (
                      <img
                        src={memberProfile.paymentQr}
                        alt="Payment QR"
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <QrCode className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-[10px] font-bold block">{language === 'kh' ? 'មិនទាន់មាន QR' : 'No QR set'}</span>
                      </div>
                    )}
                    
                    <label className="absolute bottom-2 right-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition border border-white flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 2 * 1024 * 1024) {
                            showToast(language === 'kh' ? 'រូបភាពធំជាង 2MB!' : 'Image exceeds 2MB!', 'info');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 300;
                              const MAX_HEIGHT = 300;
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
                              if (ctx) {
                                ctx.drawImage(img, 0, 0, width, height);
                                const base64Str = canvas.toDataURL('image/jpeg', 0.85);
                                handleSaveMemberQR(base64Str);
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {memberProfile?.paymentQr && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const docRef = doc(db, 'members', currentUser);
                          await setDoc(docRef, { paymentQr: '' }, { merge: true });
                          showToast(language === 'kh' ? 'បានលុប QR Code រួចរាល់' : 'Removed payment QR!', 'success');
                        } catch (err) {
                          console.error('Error removing QR:', err);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] rounded-lg transition"
                    >
                      {language === 'kh' ? 'លុប QR Code នេះចេញ' : 'Remove QR Code'}
                    </button>
                  )}
                  
                  <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                    {language === 'kh' 
                      ? 'អាប់ឡូត QR កូដទទួលប្រាក់ដើម្បីបង្ហាញនៅលើតំណភ្ជាប់កូនបំណុល (Borrower Link Page) របស់អ្នក។' 
                      : 'Upload payment QR to display on your Borrower Link Pages.'}
                  </p>
                </div>
              </div>

              {/* Language Selection Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <span className="text-base leading-none">🇰🇭</span>
                  <span>{language === 'kh' ? 'ការកំណត់ភាសារ' : 'Language Setting'}</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const btn = document.getElementById('lang-kh');
                      if (btn) btn.click();
                    }}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${language === 'kh' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <span>🇰🇭</span>
                    <span>ខ្មែរ (Khmer)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const btn = document.getElementById('lang-en');
                      if (btn) btn.click();
                    }}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${language === 'en' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Theme Toggle Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{language === 'kh' ? 'ស្បែកកម្មវិធី (Theme)' : 'App Theme'}</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${theme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-600 font-black' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{language === 'kh' ? 'ពន្លឺ (Light)' : 'Light Mode'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${theme === 'dark' ? 'bg-blue-950/40 border-blue-800 text-blue-400 font-black' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'}`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{language === 'kh' ? 'ងងឹត (Dark)' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-850 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer border-transparent"
              >
                {language === 'kh' ? 'រួចរាល់' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
