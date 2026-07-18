import React, { useState, useEffect } from 'react';
import { Users, UserX, UserCheck, ShieldAlert, Check, X, Search, Calendar, Award, Trash2, Edit2, Lock, Plus, RefreshCw, QrCode, Upload, Image, Settings, AlertCircle, Camera } from 'lucide-react';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member, SubscriptionRequest } from '../types';

interface AdminMembersDashboardProps {
  members: Member[];
  subRequests: SubscriptionRequest[];
  getSubscriptionStatusInfo: (profile: Member | null) => { isExpired: boolean; text: string };
  showToast: (msg: string, type?: 'success' | 'info') => void;
  language: 'kh' | 'en';
}

export default function AdminMembersDashboard({
  members,
  subRequests,
  getSubscriptionStatusInfo,
  showToast,
  language
}: AdminMembersDashboardProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'directory' | 'qr_settings' | 'logo_settings' | 'sponsor_settings' | 'portal_settings'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResellerInfo, setShowResellerInfo] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  
  // QR Config states
  const [qrType, setQrType] = useState<'generated' | 'uploaded'>('uploaded');
  const [qrString, setQrString] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankLogoText, setBankLogoText] = useState('');
  const [bankColor, setBankColor] = useState('');
  const [isQrSaving, setIsQrSaving] = useState(false);

  // System Logo Config states
  const [logoType, setLogoType] = useState<'text' | 'image'>('text');
  const [logoText, setLogoText] = useState('៚');
  const [logoBgColor, setLogoBgColor] = useState('#2563EB');
  const [logoTextColor, setLogoTextColor] = useState('#FFFFFF');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [systemName, setSystemName] = useState('');
  const [isLogoSaving, setIsLogoSaving] = useState(false);

  // System Sponsor Config states
  const [sponsorImageUrl, setSponsorImageUrl] = useState('');
  const [sponsorLinkUrl, setSponsorLinkUrl] = useState('');
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorEnabled, setSponsorEnabled] = useState(true);
  const [isSponsorSaving, setIsSponsorSaving] = useState(false);

  // Borrower Portal Config states
  const [portalLogoType, setPortalLogoType] = useState<'text' | 'image'>('text');
  const [portalLogoText, setPortalLogoText] = useState('LP');
  const [portalLogoBgColor, setPortalLogoBgColor] = useState('#2563EB');
  const [portalLogoTextColor, setPortalLogoTextColor] = useState('#FFFFFF');
  const [portalLogoImageUrl, setPortalLogoImageUrl] = useState('');
  const [portalTitle, setPortalTitle] = useState('Luypay Ledger');
  const [portalMarqueeText, setPortalMarqueeText] = useState('មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ Pich Rachana');
  const [portalNoticeTitle, setPortalNoticeTitle] = useState('សេចក្តីជូនដំណឹងអំពីគណនេយ្យ');
  const [portalNoticeText, setPortalNoticeText] = useState('ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន។ រាល់ការបង់ប្រាក់ដែលលោកអ្នកបានវេរ ឬប្រគល់ជូន នឹងត្រូវម្ចាស់បំណុលបញ្ជាក់ និងកត់ត្រាចូលក្នុងប្រព័ន្ធនេះភ្លាមៗ។');
  
  // Borrower Portal Sponsor Config states
  const [portalSponsorImageUrl, setPortalSponsorImageUrl] = useState('');
  const [portalSponsorLinkUrl, setPortalSponsorLinkUrl] = useState('');
  const [portalSponsorTitle, setPortalSponsorTitle] = useState('');
  const [portalSponsorEnabled, setPortalSponsorEnabled] = useState(true);
  const [isPortalSaving, setIsPortalSaving] = useState(false);

  // Fetch current configurations
  useEffect(() => {
    const loadSystemConfigs = async () => {
      try {
        // Load Logo Config
        const logoDocRef = doc(db, 'settings', 'logo_config');
        const logoSnap = await getDoc(logoDocRef);
        if (logoSnap.exists()) {
          const data = logoSnap.data();
          setLogoType(data.logoType || 'text');
          setLogoText(data.logoText || '៚');
          setLogoBgColor(data.logoBgColor || '#2563EB');
          setLogoTextColor(data.logoTextColor || '#FFFFFF');
          setLogoImageUrl(data.logoImageUrl || '');
          setSystemName(data.systemName || '');
        }

        // Load Sponsor Config
        const sponsorDocRef = doc(db, 'settings', 'sponsor_config');
        const sponsorSnap = await getDoc(sponsorDocRef);
        if (sponsorSnap.exists()) {
          const data = sponsorSnap.data();
          setSponsorImageUrl(data.sponsorImageUrl || '');
          setSponsorLinkUrl(data.sponsorLinkUrl || '');
          setSponsorTitle(data.sponsorTitle || '');
          setSponsorEnabled(data.sponsorEnabled !== false);
        }

        // Load Borrower Portal Config
        const portalDocRef = doc(db, 'settings', 'portal_config');
        const portalSnap = await getDoc(portalDocRef);
        if (portalSnap.exists()) {
          const data = portalSnap.data();
          setPortalLogoType(data.logoType || 'text');
          setPortalLogoText(data.logoText || 'LP');
          setPortalLogoBgColor(data.logoBgColor || '#2563EB');
          setPortalLogoTextColor(data.logoTextColor || '#FFFFFF');
          setPortalLogoImageUrl(data.logoImageUrl || '');
          setPortalTitle(data.portalTitle || 'Luypay Ledger');
          setPortalMarqueeText(data.marqueeText || 'មានទទួលដាក់លុយឈរលុយឆក ចាប់ពី 50$ រហូតដល់ 500$ | Facebook: ឈ្មោះ Pich Rachana');
          setPortalNoticeTitle(data.noticeTitle || 'សេចក្តីជូនដំណឹងអំពីគណនេយ្យ');
          setPortalNoticeText(data.noticeText || 'ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន។ រាល់ការបង់ប្រាក់ដែលលោកអ្នកបានវេរ ឬប្រគល់ជូន នឹងត្រូវម្ចាស់បំណុលបញ្ជាក់ និងកត់ត្រាចូលក្នុងប្រព័ន្ធនេះភ្លាមៗ។');
          setPortalSponsorImageUrl(data.sponsorImageUrl || '');
          setPortalSponsorLinkUrl(data.sponsorLinkUrl || '');
          setPortalSponsorTitle(data.sponsorTitle || '');
          setPortalSponsorEnabled(data.sponsorEnabled !== false);
        }
      } catch (err) {
        console.error('Error fetching system configurations in admin:', err);
      }
    };
    loadSystemConfigs();
  }, []);

  // Save Logo configuration to Firestore
  const handleSaveLogoConfig = async () => {
    setIsLogoSaving(true);
    try {
      const docRef = doc(db, 'settings', 'logo_config');
      await setDoc(docRef, {
        logoType,
        logoText,
        logoBgColor,
        logoTextColor,
        logoImageUrl,
        systemName
      }, { merge: true });
      showToast(language === 'kh' ? 'បានរក្សាទុកការកំណត់ Logo ប្រព័ន្ធជោគជ័យ!' : 'System Logo configuration saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving logo config:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការរក្សាទុក! សូមព្យាយាមម្តងទៀត។' : 'Failed to save! Please try again.');
    } finally {
      setIsLogoSaving(false);
    }
  };

  // Convert uploaded logo image file to Base64
  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) { // keep base64 within firestore document limit
      alert(language === 'kh' ? 'ទំហំរូបភាពត្រូវតែតូចជាង 1MB ដើម្បីរក្សាទុកក្នុងពពក!' : 'Image size must be less than 1MB to save to cloud!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogoImageUrl(reader.result);
        showToast(language === 'kh' ? 'បានផ្ទុកឡើងរូបភាព Logo ជោគជ័យ!' : 'Logo image uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Sponsor configuration to Firestore
  const handleSaveSponsorConfig = async () => {
    setIsSponsorSaving(true);
    try {
      const docRef = doc(db, 'settings', 'sponsor_config');
      await setDoc(docRef, {
        sponsorImageUrl,
        sponsorLinkUrl,
        sponsorTitle,
        sponsorEnabled
      }, { merge: true });
      showToast(language === 'kh' ? 'បានរក្សាទុកការកំណត់ផ្ទាំង Sponsor ជោគជ័យ!' : 'Sponsor banner configuration saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving sponsor config:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការរក្សាទុក! សូមព្យាយាមម្តងទៀត។' : 'Failed to save! Please try again.');
    } finally {
      setIsSponsorSaving(false);
    }
  };

  // Convert uploaded sponsor image file to Base64 with canvas compression
  const handleSponsorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 450;
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
        setSponsorImageUrl(dataUrl);
        showToast(language === 'kh' ? 'បានផ្ទុកឡើងរូបភាពផ្ទាំង Sponsor ជោគជ័យ!' : 'Sponsor image uploaded successfully!', 'success');
      };
    };
    reader.readAsDataURL(file);
  };

  // Save Borrower Portal Configuration
  const handleSavePortalConfig = async () => {
    setIsPortalSaving(true);
    try {
      const docRef = doc(db, 'settings', 'portal_config');
      await setDoc(docRef, {
        logoType: portalLogoType,
        logoText: portalLogoText,
        logoBgColor: portalLogoBgColor,
        logoTextColor: portalLogoTextColor,
        logoImageUrl: portalLogoImageUrl,
        portalTitle,
        marqueeText: portalMarqueeText,
        noticeTitle: portalNoticeTitle,
        noticeText: portalNoticeText,
        sponsorImageUrl: portalSponsorImageUrl,
        sponsorLinkUrl: portalSponsorLinkUrl,
        sponsorTitle: portalSponsorTitle,
        sponsorEnabled: portalSponsorEnabled
      }, { merge: true });
      showToast(language === 'kh' ? 'បានរក្សាទុកការកំណត់ Link កូនបំណុលជោគជ័យ!' : 'Borrower Link configuration saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving portal config:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការរក្សាទុក! សូមព្យាយាមម្តងទៀត។' : 'Failed to save! Please try again.');
    } finally {
      setIsPortalSaving(false);
    }
  };

  // Upload Portal Logo Image with canvas compression
  const handlePortalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
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
        setPortalLogoImageUrl(dataUrl);
        showToast(language === 'kh' ? 'បានផ្ទុកឡើងរូបភាព Logo ជោគជ័យ!' : 'Logo image uploaded successfully!', 'success');
      };
    };
    reader.readAsDataURL(file);
  };

  // Upload Portal Sponsor Image with canvas compression
  const handlePortalSponsorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 450;
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
        setPortalSponsorImageUrl(dataUrl);
        showToast(language === 'kh' ? 'បានផ្ទុកឡើងរូបភាព Sponsor ជោគជ័យ!' : 'Sponsor image uploaded successfully!', 'success');
      };
    };
    reader.readAsDataURL(file);
  };

  // Fetch current QR configuration
  useEffect(() => {
    const loadQRConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'qr_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setQrType('uploaded');
          setQrString(data.qrString || '');
          setQrImageUrl(data.qrImageUrl || '');
          setAccountName(data.accountName || '');
          setAccountId(data.accountId || '');
          setBankName(data.bankName || '');
          setBankLogoText(data.bankLogoText || '');
          setBankColor(data.bankColor || '');
        } else {
          // fallback defaults
          setQrType('uploaded');
          setQrString('00020101021129170013000469096@cnb5204599953038405802KH5910SOUN RAVIN6009PhnomPenh63044D57');
          setQrImageUrl('');
          setAccountName('SOUN RAVIN');
          setAccountId('000469096');
          setBankName('Canadia Bank');
          setBankLogoText('C');
          setBankColor('#E61A22');
        }
      } catch (err) {
        console.error('Error fetching qr config in admin:', err);
      }
    };
    loadQRConfig();
  }, []);

  // Save QR config to Firestore
  const handleSaveQRConfig = async () => {
    setIsQrSaving(true);
    try {
      const docRef = doc(db, 'settings', 'qr_config');
      await setDoc(docRef, {
        qrType: 'uploaded',
        qrString,
        qrImageUrl,
        accountName,
        accountId,
        bankName,
        bankLogoText,
        bankColor
      }, { merge: true });
      showToast(language === 'kh' ? 'បានរក្សាទុកការកំណត់ QR កូដជោគជ័យ!' : 'QR configuration saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving qr config:', err);
      alert(language === 'kh' ? 'មានបញ្ហាក្នុងការរក្សាទុក! សូមព្យាយាមម្តងទៀត។' : 'Failed to save! Please try again.');
    } finally {
      setIsQrSaving(false);
    }
  };

  // Convert uploaded image file to Base64 with canvas compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
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
        setQrImageUrl(dataUrl);
        showToast(language === 'kh' ? 'បានផ្ទុកឡើងរូបភាពជោគជ័យ!' : 'Image uploaded successfully!', 'success');
      };
    };
    reader.readAsDataURL(file);
  };
  
  // Member edit modal state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPaymentQr, setEditPaymentQr] = useState('');

  // 1. Core metrics calculation
  const totalMembersCount = members.length;
  const activeMembersCount = members.filter(m => !m.isBlocked && !getSubscriptionStatusInfo(m).isExpired).length;
  const blockedMembersCount = members.filter(m => m.isBlocked).length;
  const expiredMembersCount = members.filter(m => !m.isBlocked && getSubscriptionStatusInfo(m).isExpired).length;
  const pendingRequestsCount = subRequests.filter(r => r.status === 'pending').length;

  // 2. Approve Request logic
  const handleApproveRequest = async (req: SubscriptionRequest) => {
    const confirmMsg = `តើអ្នកពិតជាចង់អនុម័តសំណើរបស់ ${req.displayName || req.username} មែនទេ?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      // Find current user's membership doc to determine current expiry
      const member = members.find(m => m.username === req.username);
      
      let currentExpiry = member?.subscriptionExpires ? new Date(member.subscriptionExpires) : new Date();
      if (currentExpiry < new Date()) {
        currentExpiry = new Date(); // If already expired or doesn't have expiry, start from today
      }

      // Add days based on the requested plan
      let daysToAdd = 30;
      if (req.plan === '3_months') daysToAdd = 90;
      if (req.plan === '1_year') daysToAdd = 365;

      const newExpiry = new Date(currentExpiry.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      // 1. Update the member's subscription expiration
      const memberRef = doc(db, 'members', req.username);
      await setDoc(memberRef, {
        subscriptionExpires: newExpiry.toISOString(),
        isBlocked: false // Auto-unblock on subscription approval
      }, { merge: true });

      // 2. Update the request status
      const requestRef = doc(db, 'subscription_requests', req.id);
      await setDoc(requestRef, {
        status: 'approved'
      }, { merge: true });

      showToast(`បានអនុម័ត និងពន្យារពេលជូនសមាជិក៖ ${req.displayName || req.username} ជោគជ័យ!`, 'success');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('មានបញ្ហាក្នុងការអនុម័តសំណើ! សូមព្យាយាមឡើងវិញ។');
    }
  };

  // 3. Reject Request logic
  const handleRejectRequest = async (req: SubscriptionRequest) => {
    const confirmMsg = `តើអ្នកពិតជាចង់បដិសេធសំណើរបស់ ${req.displayName || req.username} មែនទេ?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const requestRef = doc(db, 'subscription_requests', req.id);
      await setDoc(requestRef, {
        status: 'rejected'
      }, { merge: true });

      showToast('បានបដិសេធសំណើទិញគម្រោងរួចរាល់។', 'info');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('មានកំហុសបដិសេធសំណើ!');
    }
  };

  // 4. Toggle Member Block status
  const handleToggleBlock = async (member: Member) => {
    const newBlockStatus = !member.isBlocked;
    const confirmMsg = newBlockStatus
      ? `តើអ្នកពិតជាចង់ "ផ្អាកគណនី" (Block) របស់ ${member.displayName || member.username} មែនទេ?`
      : `តើអ្នកពិតជាចង់ "បើកដំណើរការគណនីឡើងវិញ" របស់ ${member.displayName || member.username} មែនទេ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const memberRef = doc(db, 'members', member.username);
      await setDoc(memberRef, {
        isBlocked: newBlockStatus
      }, { merge: true });

      showToast(newBlockStatus ? 'បានផ្អាកគណនីសមាជិកជោគជ័យ!' : 'បានបើកដំណើរការគណនីសមាជិកឡើងវិញ!', 'success');
    } catch (err) {
      console.error('Error toggling member block status:', err);
    }
  };

  // 5. Delete Member account
  const handleDeleteMember = async (member: Member) => {
    const confirmMsg = `⚠️ ព្រមាន៖ តើអ្នកពិតជាចង់លុបគណនីសមាជិក "${member.displayName || member.username}" ចេញពីប្រព័ន្ធទាំងស្រុងមែនទេ? ទិន្នន័យទាំងអស់របស់គាត់នឹងត្រូវបាត់បង់!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const memberRef = doc(db, 'members', member.username);
      await deleteDoc(memberRef);
      showToast('បានលុបគណនីសមាជិកជោគជ័យ!', 'info');
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  // 6. Manual Extension of duration
  const handleManualExtend = async (member: Member, days: number) => {
    let currentExpiry = member.subscriptionExpires ? new Date(member.subscriptionExpires) : new Date();
    if (currentExpiry < new Date()) {
      currentExpiry = new Date();
    }
    const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

    try {
      const memberRef = doc(db, 'members', member.username);
      await setDoc(memberRef, {
        subscriptionExpires: newExpiry.toISOString()
      }, { merge: true });

      showToast(`បានបន្ថែមចំនួន ${days} ថ្ងៃជូនសមាជិក ${member.displayName || member.username} រួចរាល់!`, 'success');
    } catch (err) {
      console.error('Error manually extending subscription:', err);
    }
  };

  // 7. Save edited member details (displayName and password)
  const handleSaveMemberEdit = async () => {
    if (!editingMember) return;
    if (!editDisplayName.trim()) return;

    try {
      const memberRef = doc(db, 'members', editingMember.username);
      await setDoc(memberRef, {
        displayName: editDisplayName,
        password: editPassword || editingMember.password,
        paymentQr: editPaymentQr
      }, { merge: true });

      showToast('បានកែប្រែព័ត៌មានគណនីសមាជិកជោគជ័យ!', 'success');
      setEditingMember(null);
    } catch (err) {
      console.error('Error updating member details:', err);
    }
  };

  // Filter members directory by search query
  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.username.toLowerCase().includes(query) ||
      (m.displayName || '').toLowerCase().includes(query) ||
      (m.email || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Admin Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="text-left space-y-1.5">
          <h2 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>📊</span> Admin Member Management Dashboard
          </h2>
          <p className="text-xs text-slate-500 font-bold">
            ផ្ទាំងគ្រប់គ្រងសមាជិកភាព អនុម័តគម្រោងការប្រើប្រាស់ និងគ្រប់គ្រងការផ្អាកគណនី (Block list)
          </p>
        </div>

        {/* System reseller info button */}
        <button
          onClick={() => setShowResellerInfo(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/10 transition duration-150 flex items-center gap-1.5 shrink-0 border border-indigo-500/10 cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>ទិញសិទ្ធិប្រព័ន្ធទៅប្រើប្រាស់បន្ត</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">សមាជិកសរុប</p>
          <p className="text-2xl font-black text-slate-900">{totalMembersCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left">
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider mb-1">កំពុងដំណើរការ</p>
          <p className="text-2xl font-black text-emerald-600">{activeMembersCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left">
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider mb-1">ផុតកំណត់</p>
          <p className="text-2xl font-black text-amber-600">{expiredMembersCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left">
          <p className="text-[10px] text-rose-500 font-black uppercase tracking-wider mb-1">ផ្អាក (Blocked)</p>
          <p className="text-2xl font-black text-rose-600">{blockedMembersCount}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm text-left col-span-2 md:col-span-1">
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mb-1">សំណើទិញគម្រោង</p>
          <p className="text-2xl font-black text-indigo-600 flex items-center gap-1.5">
            {pendingRequestsCount}
            {pendingRequestsCount > 0 && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse inline-block"></span>
            )}
          </p>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 bg-slate-200/60 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-indigo-500" />
              <span>សំណើទិញគម្រោង ({pendingRequestsCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>បញ្ជីសមាជិកទាំងអស់ ({totalMembersCount})</span>
            </button>

            {/* Grouped Settings Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  ['qr_settings', 'logo_settings', 'sponsor_settings', 'portal_settings'].includes(activeTab)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 bg-slate-200/40'
                }`}
              >
                <Settings className={`w-4 h-4 ${['qr_settings', 'logo_settings', 'sponsor_settings', 'portal_settings'].includes(activeTab) ? 'text-white' : 'text-blue-500'} ${isSettingsMenuOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
                <span>
                  {language === 'kh' ? 'ការកំណត់ប្រព័ន្ធ ⚙' : 'System Settings ⚙'}
                </span>
              </button>

              {isSettingsMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsSettingsMenuOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setActiveTab('qr_settings');
                        setIsSettingsMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition flex items-center gap-2 hover:bg-slate-50 ${
                        activeTab === 'qr_settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{language === 'kh' ? 'ការកំណត់ QR បង់ប្រាក់' : 'QR Payment Settings'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('logo_settings');
                        setIsSettingsMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition flex items-center gap-2 hover:bg-slate-50 ${
                        activeTab === 'logo_settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{language === 'kh' ? 'ការកំណត់ Logo' : 'Logo Settings'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('sponsor_settings');
                        setIsSettingsMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition flex items-center gap-2 hover:bg-slate-50 ${
                        activeTab === 'sponsor_settings' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'
                      }`}
                    >
                      <Image className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>{language === 'kh' ? 'ការកំណត់ Sponsor' : 'Sponsor Settings'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('portal_settings');
                        setIsSettingsMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-bold transition flex items-center gap-2 hover:bg-slate-50 ${
                        activeTab === 'portal_settings' ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{language === 'kh' ? 'ការកំណត់ Link កូនបំណុល' : 'Borrower Link Settings'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {activeTab === 'directory' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកតាម ឈ្មោះ / លេខសម្គាល់..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
              />
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: Pending Purchase Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {subRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 text-xl">
                    📁
                  </div>
                  <p className="text-sm font-black text-slate-800">មិនទាន់មានសំណើទិញគម្រោងឡើយ</p>
                  <p className="text-xs text-slate-400 font-medium">រាល់សំណើរបស់សមាជិកដែលបានចុចផ្ញើ នឹងបង្ហាញឡើងនៅទីនេះដើម្បីអនុម័ត។</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subRequests.filter(r => r.status === 'pending').map((req) => (
                    <div
                      key={req.id}
                      className="border border-slate-200 hover:border-slate-300 bg-white p-5 rounded-2xl text-left flex flex-col justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {req.displayName || req.username}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold">
                              ឈ្មោះអ្នកប្រើប្រាស់៖ @{req.username}
                            </p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black rounded-lg text-[10px]">
                            {req.plan === '1_month' ? 'គម្រោង ១ ខែ ($5)' : req.plan === '3_months' ? 'គម្រោង ៣ ខែ ($12)' : 'គម្រោង ១ ឆ្នាំ ($35)'}
                          </span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-xs space-y-1.5 text-slate-600">
                          <div className="flex justify-between">
                            <span>កាលបរិច្ឆេទផ្ញើ៖</span>
                            <span className="text-slate-800 font-extrabold">{new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>គម្រោងបច្ចុប្បន្ន៖</span>
                            <span className="text-slate-800 font-extrabold">
                              {getSubscriptionStatusInfo(members.find(m => m.username === req.username) || null).text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>អនុម័តគម្រោង</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>បដិសេធ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: All Members Directory */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              {filteredMembers.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold text-xs">
                  រកមិនឃើញគណនីដែលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50">
                        <th className="py-3 px-4">គណនី / ឈ្មោះ</th>
                        <th className="py-3 px-4">កាលបរិច្ឆេទចុះឈ្មោះ</th>
                        <th className="py-3 px-4">កាលបរិច្ឆេទផុតកំណត់</th>
                        <th className="py-3 px-4">ស្ថានភាពគម្រោង</th>
                        <th className="py-3 px-4">ពន្យារពេលដោយដៃ</th>
                        <th className="py-3 px-4 text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredMembers.map((m) => {
                        const subInfo = getSubscriptionStatusInfo(m);
                        const isBlocked = m.isBlocked === true;

                        return (
                          <tr key={m.username} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="text-left">
                                <p className="font-extrabold text-slate-900">{m.displayName || m.username}</p>
                                <p className="text-[10px] text-slate-400 font-bold">@{m.username}</p>
                                {m.email && (
                                  <p className="text-[9px] text-slate-400 font-medium leading-normal italic">{m.email}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-500">
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-800">
                              {m.subscriptionExpires ? new Date(m.subscriptionExpires).toLocaleDateString() : 'សាកល្បង ១៥ ថ្ងៃ'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-[9px] border ${
                                isBlocked
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : subInfo.isExpired
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {isBlocked ? 'ផ្អាក (Blocked)' : subInfo.text.split(' - ')[0]}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleManualExtend(m, 30)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-extrabold text-[10px] rounded-lg transition"
                                >
                                  +1 ខែ
                                </button>
                                <button
                                  onClick={() => handleManualExtend(m, 90)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-extrabold text-[10px] rounded-lg transition"
                                >
                                  +3 ខែ
                                </button>
                                <button
                                  onClick={() => handleManualExtend(m, 365)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 font-extrabold text-[10px] rounded-lg transition"
                                >
                                  +1 ឆ្នាំ
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingMember(m);
                                    setEditDisplayName(m.displayName || '');
                                    setEditPassword(m.password || '');
                                    setEditPaymentQr(m.paymentQr || '');
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                  title="កែសម្រួលគណនី"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleBlock(m)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    isBlocked
                                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100'
                                  }`}
                                  title={isBlocked ? "បើកដំណើរការវិញ" : "ផ្អាកដំណើរការ (Block)"}
                                >
                                  {isBlocked ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(m)}
                                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition cursor-pointer"
                                  title="លុបគណនី"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QR Code & Payment Customization */}
          {activeTab === 'qr_settings' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs & Form - Col-span-7 */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'kh' ? '📱 កំណត់ QR កូដទទួលប្រាក់' : '📱 Configure Payment QR Code'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      {language === 'kh' 
                        ? 'កំណត់ព័ត៌មានគណនីធនាគារ និងរូបភាព QR កូដសម្រាប់បង្ហាញជូនសមាជិកបង់ប្រាក់។' 
                        : 'Configure your bank account info and QR code displayed to members for subscription payments.'}
                    </p>
                  </div>

                  {/* Custom QR Image Upload Only */}
                  <div className="space-y-4">
                    <div className="space-y-3 bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl text-left">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">
                        {language === 'kh' ? 'អាប់ឡូតរូបភាព QR (Upload custom image)' : 'Upload custom QR Image file'}
                      </label>
                      
                      <div className="flex items-center gap-4">
                        <label className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-4 h-4" />
                          <span>{language === 'kh' ? 'ជ្រើសរើសរូបភាព' : 'Choose File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {qrImageUrl && (
                          <button
                            type="button"
                            onClick={() => setQrImageUrl('')}
                            className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-[10px] rounded-lg transition"
                          >
                            {language === 'kh' ? 'លុបរូបភាព' : 'Remove Image'}
                          </button>
                        )}
                      </div>

                      {qrImageUrl && (
                        <div className="mt-3 bg-white p-2 border border-slate-200 rounded-xl inline-block">
                          <img
                            src={qrImageUrl}
                            alt="Custom QR Preview"
                            className="w-32 h-32 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <p className="text-[9px] text-slate-400 font-medium">
                        {language === 'kh' 
                          ? 'សូមប្រើប្រាស់រូបភាពដែលមានទំហំតូចជាង 1.5MB ដើម្បីអាចរក្សាទុកក្នុងទិន្នន័យបានលឿន និងមានប្រសិទ្ធភាព។' 
                          : 'Please use an image under 1.5MB to ensure fast storage and synchronization.'}
                      </p>
                    </div>

                    {/* General details fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'លេខគណនី (ID)' : 'Account ID / Number'}
                        </label>
                        <input
                          type="text"
                          value={accountId}
                          onChange={(e) => setAccountId(e.target.value)}
                          placeholder="e.g. 000469096"
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold font-mono"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'ឈ្មោះគណនី (Account Name)' : 'Account Holder Name'}
                        </label>
                        <input
                          type="text"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="e.g. SOUN RAVIN"
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-extrabold"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'ឈ្មោះធនាគារ' : 'Bank Name'}
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Canadia Bank, ABA Bank"
                          className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'ពណ៌ធនាគារ (Bank Theme Color)' : 'Bank Theme Color'}
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={bankColor}
                            onChange={(e) => setBankColor(e.target.value)}
                            className="w-10 h-9 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={bankColor}
                            onChange={(e) => setBankColor(e.target.value)}
                            className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={handleSaveQRConfig}
                      disabled={isQrSaving}
                      className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isQrSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'kh' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{language === 'kh' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* QR Live Preview Display - Col-span-5 */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 text-center space-y-4.5 shadow-xs sticky top-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 border border-amber-200 text-amber-800 px-3 py-1 rounded-full shrink-0">
                        ✨ {language === 'kh' ? 'ផ្ទាំងមើលផ្ទាល់ (Live Preview)' : 'Live Preview'}
                      </span>
                    </div>

                    {/* QR Code Card container styling matching original Payment screen perfectly */}
                    <div className="bg-[#071324] text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 flex flex-col items-center">
                      <div className="text-center space-y-1 w-full">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: bankColor || '#E61A22' }}>
                          {bankName || 'BANK NAME'}
                        </p>
                        <h4 className="text-lg font-black text-white tracking-wide uppercase truncate max-w-full">
                          {accountName || 'ACCOUNT NAME'}
                        </h4>
                        {/* Big bold "0" as requested in KHQR rules */}
                        <div className="text-5xl font-black text-white my-1 select-none font-mono">0</div>
                      </div>

                      {/* KHQR styling for QR block */}
                      <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center relative select-none shrink-0 w-48 h-48 mx-auto">
                        {qrImageUrl ? (
                          <img
                            src={qrImageUrl}
                            alt="Uploaded Custom QR"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 font-bold text-[10px]">
                            <Image className="w-8 h-8 mb-1.5 text-slate-300 animate-pulse" />
                            <span>{language === 'kh' ? 'មិនទាន់មានរូបភាព' : 'No QR image'}</span>
                          </div>
                        )}
                      </div>

                      {/* Copy fields */}
                      <div className="grid grid-cols-2 gap-2 w-full pt-1">
                        <div className="py-2 px-3 bg-[#0F1C2E] text-slate-300 rounded-xl text-center border border-slate-800 flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">ID</span>
                          <span className="text-xs font-mono font-black text-white truncate max-w-full">{accountId || '000000000'}</span>
                        </div>

                        <div className="py-2 px-3 bg-[#0F1C2E] text-slate-300 rounded-xl text-center border border-slate-800 flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Name</span>
                          <span className="text-xs font-sans font-black text-white truncate max-w-full">{accountName || 'ACCOUNT NAME'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Logo Settings */}
          {activeTab === 'logo_settings' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs & Form */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'kh' ? '🎨 កំណត់ Logo ប្រព័ន្ធ' : '🎨 Configure System Logo'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      {language === 'kh' 
                        ? 'រៀបចំស្លាកសញ្ញា (Logo) សម្រាប់បង្ហាញនៅខាងលើរបារស្វែងរក និងផ្ទាំងគ្រប់គ្រងរបស់អ្នក។' 
                        : 'Configure your custom brand logo displayed at the top of the header and dashboard areas.'}
                    </p>
                  </div>

                  {/* Logo Type Selection */}
                  <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-3">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                      {language === 'kh' ? 'ប្រភេទ Logo' : 'Logo Type'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setLogoType('text')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center space-y-1 flex flex-col items-center justify-center ${
                          logoType === 'text'
                            ? 'border-blue-600 bg-blue-50 text-blue-950'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Settings className="w-5 h-5 mb-0.5 text-blue-500" />
                        <span className="text-xs font-black">{language === 'kh' ? 'អក្សររចនា (Text)' : 'Stylized Text'}</span>
                        <span className="text-[9px] font-medium text-slate-400">{language === 'kh' ? 'ប្រើប្រាស់អក្សរ និងពណ៌' : 'Use colored circular text'}</span>
                      </div>

                      <div
                        onClick={() => setLogoType('image')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center space-y-1 flex flex-col items-center justify-center ${
                          logoType === 'image'
                            ? 'border-blue-600 bg-blue-50 text-blue-950'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Image className="w-5 h-5 mb-0.5 text-emerald-500" />
                        <span className="text-xs font-black">{language === 'kh' ? 'រូបភាពផ្ទាល់ (Image)' : 'Custom Image'}</span>
                        <span className="text-[9px] font-medium text-slate-400">{language === 'kh' ? 'ប្រើប្រាស់ឯកសាររូបភាព' : 'Upload custom logo file'}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Name Configuration Input */}
                  <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-2">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                      {language === 'kh' ? 'ឈ្មោះប្រព័ន្ធ (System Name)' : 'System Name'}
                    </label>
                    <input
                      type="text"
                      value={systemName}
                      onChange={(e) => setSystemName(e.target.value)}
                      placeholder={language === 'kh' ? 'ប្រព័ន្ធលុយឆក' : 'Luypay Ledger'}
                      className="w-full px-3 py-2 text-sm border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    />
                    <p className="text-[9px] text-slate-400 font-medium">
                      {language === 'kh' 
                        ? 'ឈ្មោះនេះនឹងត្រូវបង្ហាញនៅផ្នែកខាងលើរបារស្វែងរក និងទំព័រចូលប្រើប្រាស់របស់ប្រព័ន្ធ។' 
                        : 'This name will be displayed at the top of the header, sidebar, and login page of the system.'}
                    </p>
                  </div>

                  {/* Dynamic inputs based on logo type */}
                  {logoType === 'text' ? (
                    <div className="space-y-4 bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'អក្សរ Logo (អតិបរមា ២ តួ)' : 'Logo Text (Max 2 chars)'}
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={logoText}
                          onChange={(e) => setLogoText(e.target.value)}
                          placeholder="៚"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-black text-center"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                            {language === 'kh' ? 'ពណ៌ផ្ទៃក្រោយ' : 'Background Color'}
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={logoBgColor}
                              onChange={(e) => setLogoBgColor(e.target.value)}
                              className="w-10 h-9 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={logoBgColor}
                              onChange={(e) => setLogoBgColor(e.target.value)}
                              className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                            {language === 'kh' ? 'ពណ៌អក្សរ' : 'Text Color'}
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={logoTextColor}
                              onChange={(e) => setLogoTextColor(e.target.value)}
                              className="w-10 h-9 p-1 rounded-xl border border-slate-200 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={logoTextColor}
                              onChange={(e) => setLogoTextColor(e.target.value)}
                              className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">
                          {language === 'kh' ? 'អាប់ឡូតរូបភាព Logo' : 'Upload custom Logo image'}
                        </label>
                        
                        <div className="flex items-center gap-4">
                          <label className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition">
                            <Upload className="w-4 h-4" />
                            <span>{language === 'kh' ? 'ជ្រើសរើសរូបភាព' : 'Choose File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoImageUpload}
                              className="hidden"
                            />
                          </label>
                          {logoImageUrl && (
                            <button
                              type="button"
                              onClick={() => setLogoImageUrl('')}
                              className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-[10px] rounded-lg transition"
                            >
                              {language === 'kh' ? 'លុបរូបភាព' : 'Remove Logo'}
                            </button>
                          )}
                        </div>

                        {logoImageUrl && (
                          <div className="mt-3 bg-white p-3 border border-slate-200 rounded-2xl inline-block shadow-sm">
                            <img
                              src={logoImageUrl}
                              alt="Logo Preview"
                              className="w-20 h-20 object-contain rounded-xl"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">
                          {language === 'kh' 
                            ? 'សូមប្រើប្រាស់រូបភាពការ៉េ (1:1 Ratio) ដើម្បីបង្ហាញបានស្អាតបំផុត និងទំហំតូចជាង 1MB។' 
                            : 'Use a square (1:1 aspect ratio) image for the best display. Max file size: 1MB.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSaveLogoConfig}
                      disabled={isLogoSaving}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isLogoSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'kh' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{language === 'kh' ? 'រក្សាទុកការកំណត់ Logo' : 'Save Logo Config'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Preview Side Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 text-center space-y-4 shadow-xs sticky top-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 border border-blue-200 text-blue-800 px-3 py-1 rounded-full inline-block">
                      ✨ {language === 'kh' ? 'របៀបបង្ហាញនៅលើប្រព័ន្ធ' : 'How it displays on system'}
                    </span>

                    {/* Simulating Header Logo Display */}
                    <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center gap-3 text-white text-left shadow-lg">
                      {logoType === 'text' ? (
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm select-none shadow-md shrink-0 transition-transform duration-300"
                          style={{ backgroundColor: logoBgColor, color: logoTextColor }}
                        >
                          {logoText || '៚'}
                        </div>
                      ) : logoImageUrl ? (
                        <img 
                          src={logoImageUrl} 
                          alt="Custom logo preview" 
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-800 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shrink-0">
                          ៚
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-black tracking-wide">{systemName ? systemName.toUpperCase() : 'LUYPAY LEDGER'}</p>
                        <p className="text-[9px] text-slate-400 font-bold">{language === 'kh' ? 'ប្រព័ន្ធគ្រប់គ្រងកូនបំណុល' : 'Debt Management Platform'}</p>
                      </div>
                    </div>

                    <div className="bg-white p-4.5 rounded-2xl border border-slate-150 text-left space-y-2 shadow-xs">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{language === 'kh' ? 'ពន្យល់លម្អិត' : 'Information'}</p>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {language === 'kh' 
                          ? 'ឡូហ្គោនេះនឹងផ្លាស់ប្តូរដោយស្វ័យប្រវត្តនៅគ្រប់ទំព័ររបស់សមាជិក និងទំព័រគ្រប់គ្រងទាំងអស់ភ្លាមៗបន្ទាប់ពីអ្នកចុចរក្សាទុក។' 
                          : 'This logo will automatically update in real-time across all member views and admin dashboards.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: Sponsor Settings */}
          {activeTab === 'sponsor_settings' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Inputs & Form */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'kh' ? '📢 កំណត់ផ្ទាំង Sponsor ផ្សព្វផ្សាយ' : '📢 Configure Sponsor Banner'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      {language === 'kh' 
                        ? 'รៀបចំផ្ទាំងបដា Sponsor (ទំហំ 1200x627) សម្រាប់បង្ហាញជូនសមាជិកនៅពីក្រោមរបារម៉ឺនុយប្រព័ន្ធ។' 
                        : 'Configure a promotional sponsor banner (1200x627) displayed to users below the system menus.'}
                    </p>
                  </div>

                  {/* Banner Upload / Configuration Section */}
                  <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-800">{language === 'kh' ? 'បើកដំណើរការផ្ទាំង Sponsor' : 'Enable Sponsor Banner'}</span>
                        <p className="text-[10px] text-slate-400 font-medium">{language === 'kh' ? 'បើក ឬបិទការបង្ហាញផ្ទាំងផ្សាយពាណិជ្ជកម្មនេះ' : 'Show or hide this promotion banner'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSponsorEnabled(!sponsorEnabled)}
                        className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                          sponsorEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform duration-200 ${
                            sponsorEnabled ? 'translate-x-5.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">
                        {language === 'kh' ? 'ឯកសាររូបភាពបដា (អតិបរមា 2MB)' : 'Sponsor Image (Max 2MB, 1200x627 aspect ratio)'}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition">
                          <Upload className="w-4 h-4" />
                          <span>{language === 'kh' ? 'អាប់ឡូតរូបភាព' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSponsorImageUpload}
                            className="hidden"
                          />
                        </label>
                        {sponsorImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSponsorImageUrl('')}
                            className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-[10px] rounded-lg transition"
                          >
                            {language === 'kh' ? 'លុបរូបភាព' : 'Remove Image'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Link URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {language === 'kh' ? 'តំណភ្ជាប់ទៅកាន់គេហទំព័រ / Telegram (Link URL - បើមាន)' : 'Sponsor Link URL (Optional)'}
                      </label>
                      <input
                        type="url"
                        value={sponsorLinkUrl}
                        onChange={(e) => setSponsorLinkUrl(e.target.value)}
                        placeholder="e.g. https://t.me/yourusername"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                      />
                    </div>

                    {/* Sponsor Title / Promo Label */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {language === 'kh' ? 'ចំណងជើងខ្លី / ឈ្មោះអ្នកឧបត្ថម្ភ' : 'Sponsor Title / Short label'}
                      </label>
                      <input
                        type="text"
                        value={sponsorTitle}
                        onChange={(e) => setSponsorTitle(e.target.value)}
                        placeholder="e.g. Lay Mean Telegram"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSaveSponsorConfig}
                      disabled={isSponsorSaving}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-purple-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSponsorSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'kh' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{language === 'kh' ? 'រក្សាទុកការកំណត់ Sponsor' : 'Save Sponsor Config'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Preview Side Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 text-center space-y-4.5 shadow-xs sticky top-4">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-purple-100 border border-purple-200 text-purple-800 px-3 py-1 rounded-full inline-block">
                      ✨ {language === 'kh' ? 'ទិដ្ឋភាពបង្ហាញសាកល្បង (Sponsor Preview)' : 'Sponsor Live Preview'}
                    </span>

                    {/* Simulator displaying how the 1200x627 banner looks like */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-2 text-left">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sponsored</span>
                        {sponsorTitle && (
                          <span className="text-[9px] font-extrabold text-indigo-600 truncate max-w-[150px]">{sponsorTitle}</span>
                        )}
                      </div>
                      
                      {sponsorEnabled && sponsorImageUrl ? (
                        <div className="w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                          <img
                            src={sponsorImageUrl}
                            alt="Sponsor Promotion Banner"
                            className="w-full h-auto object-contain block"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[1200/627] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 p-4 text-center">
                          <Image className="w-8 h-8 mb-1.5 text-slate-300 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400">{language === 'kh' ? 'មិនមានរូបភាព Sponsor ឬបិទការបង្ហាញ' : 'No sponsor image uploaded or disabled'}</span>
                          <span className="text-[8px] font-medium text-slate-400 mt-0.5">{language === 'kh' ? 'ទំហំសមស្រប 1200x627' : 'Aspect ratio: 1200x627'}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-150 text-left space-y-1.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                      <p className="font-extrabold text-slate-800">{language === 'kh' ? '💡 គន្លឹះរចនាផ្ទាំង Banner' : '💡 Design Banner Tips'}</p>
                      <p>{language === 'kh' ? '• ប្រើប្រាស់រូបភាពដែលមានសមាមាត្រ 1200x627 pixel (Landscape)' : '• Use standard 1200x627 pixel (landscape) banner image.'}</p>
                      <p>{language === 'kh' ? '• ដាក់តំណភ្ជាប់ Telegram ឬលេខទូរស័ព្ទដើម្បីអតិថិជនងាយស្រួលចុចទាក់ទង' : '• Insert a Telegram or phone call link URL for users to easily click and contact.'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: Borrower Portal / Link Settings */}
          {activeTab === 'portal_settings' && (
            <div className="space-y-8 animate-in fade-in duration-200 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Config Forms */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'kh' ? '🔗 កំណត់ផ្ទាំង Link របស់កូនបំណុល' : '🔗 Borrower Link Settings'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      {language === 'kh' 
                        ? 'រៀបចំស្លាកសញ្ញា ផ្ទាំងពត៌មាន អត្ថបទ និងផ្ទាំង Sponsor ដែលត្រូវបង្ហាញនៅលើទំព័រ Link របស់កូនបំណុល។' 
                        : 'Configure your custom branding, messages, and sponsor banner displayed to your borrowers on their checklink pages.'}
                    </p>
                  </div>

                  {/* 1. Brand Logo & Title Config */}
                  <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>{language === 'kh' ? '១. ស្លាកសញ្ញា & ឈ្មោះខាងលើ' : '1. Logo & Top Header Brand'}</span>
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {language === 'kh' ? 'ឈ្មោះខាងលើ (Portal Title)' : 'Header Brand Title'}
                      </label>
                      <input
                        type="text"
                        value={portalTitle}
                        onChange={(e) => setPortalTitle(e.target.value)}
                        placeholder="Luypay Ledger"
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div
                        onClick={() => setPortalLogoType('text')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition text-center space-y-1 flex flex-col items-center justify-center ${
                          portalLogoType === 'text'
                            ? 'border-blue-600 bg-blue-50 text-blue-950'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Settings className="w-4 h-4 mb-0.5 text-blue-500" />
                        <span className="text-xs font-black">{language === 'kh' ? 'អក្សររចនា (Text)' : 'Stylized Text'}</span>
                      </div>

                      <div
                        onClick={() => setPortalLogoType('image')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition text-center space-y-1 flex flex-col items-center justify-center ${
                          portalLogoType === 'image'
                            ? 'border-blue-600 bg-blue-50 text-blue-950'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Image className="w-4 h-4 mb-0.5 text-emerald-500" />
                        <span className="text-xs font-black">{language === 'kh' ? 'រូបភាពផ្ទាល់ (Image)' : 'Custom Image'}</span>
                      </div>
                    </div>

                    {portalLogoType === 'text' ? (
                      <div className="space-y-3 bg-white border border-slate-150 p-3.5 rounded-xl">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                            {language === 'kh' ? 'អក្សរ Logo (អតិបរមា ២ តួ)' : 'Logo Text (Max 2 chars)'}
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={portalLogoText}
                            onChange={(e) => setPortalLogoText(e.target.value)}
                            placeholder="LP"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-black text-center"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                              {language === 'kh' ? 'ពណ៌ផ្ទៃក្រោយ' : 'Background Color'}
                            </label>
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="color"
                                value={portalLogoBgColor}
                                onChange={(e) => setPortalLogoBgColor(e.target.value)}
                                className="w-8 h-8 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
                              />
                              <input
                                type="text"
                                value={portalLogoBgColor}
                                onChange={(e) => setPortalLogoBgColor(e.target.value)}
                                className="w-full px-2 py-1.5 text-[10px] border border-slate-200 rounded-lg focus:outline-none font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                              {language === 'kh' ? 'ពណ៌អក្សរ' : 'Text Color'}
                            </label>
                            <div className="flex gap-1.5 items-center">
                              <input
                                type="color"
                                value={portalLogoTextColor}
                                onChange={(e) => setPortalLogoTextColor(e.target.value)}
                                className="w-8 h-8 p-0.5 rounded-lg border border-slate-200 cursor-pointer bg-white"
                              />
                              <input
                                type="text"
                                value={portalLogoTextColor}
                                onChange={(e) => setPortalLogoTextColor(e.target.value)}
                                className="w-full px-2 py-1.5 text-[10px] border border-slate-200 rounded-lg focus:outline-none font-mono font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 bg-white border border-slate-150 p-3.5 rounded-xl">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">
                          {language === 'kh' ? 'អាប់ឡូតរូបភាព Logo' : 'Upload Custom Logo'}
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition border border-slate-200">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{language === 'kh' ? 'ជ្រើសរើសរូបភាព' : 'Choose Logo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePortalLogoUpload}
                              className="hidden"
                            />
                          </label>
                          {portalLogoImageUrl && (
                            <button
                              type="button"
                              onClick={() => setPortalLogoImageUrl('')}
                              className="px-2.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-[10px] rounded-lg transition"
                            >
                              {language === 'kh' ? 'លុបចោល' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Messages / Announcement Settings */}
                  <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      <Settings className="w-4 h-4 text-amber-500" />
                      <span>{language === 'kh' ? '២. អក្សររត់ & សេចក្តីជូនដំណឹង' : '2. Marquee & Announcement Banner'}</span>
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                        {language === 'kh' ? 'អក្សររត់គែមខាងលើ (Marquee Scrolling Text)' : 'Scrolling Marquee Text'}
                      </label>
                      <textarea
                        value={portalMarqueeText}
                        onChange={(e) => setPortalMarqueeText(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                        placeholder="សរសេរអក្សររត់ដែលចង់បង្ហាញ..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'ចំណងជើងសេចក្តីជូនដំណឹង' : 'Notice Banner Title'}
                        </label>
                        <input
                          type="text"
                          value={portalNoticeTitle}
                          onChange={(e) => setPortalNoticeTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                          placeholder="សេចក្តីជូនដំណឹងអំពីគណនេយ្យ"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                          {language === 'kh' ? 'អត្ថបទលម្អិតការខ្ចីលុយ' : 'Notice Details Text'}
                        </label>
                        <textarea
                          value={portalNoticeText}
                          onChange={(e) => setPortalNoticeText(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                          placeholder="ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Sponsor Settings Section */}
                  <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Image className="w-4 h-4 text-purple-500" />
                        <span>{language === 'kh' ? '៣. ការកំណត់ Sponsor (កូនបំណុល)' : '3. Borrower Sponsor Banner'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setPortalSponsorEnabled(!portalSponsorEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          portalSponsorEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            portalSponsorEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {portalSponsorEnabled && (
                      <div className="space-y-3.5 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                              {language === 'kh' ? 'ចំណងជើង Sponsor' : 'Sponsor Title'}
                            </label>
                            <input
                              type="text"
                              value={portalSponsorTitle}
                              onChange={(e) => setPortalSponsorTitle(e.target.value)}
                              placeholder="e.g. Lay Mean Telegram"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">
                              {language === 'kh' ? 'តំណភ្ជាប់ / Sponsor Target Link' : 'Sponsor Target Link'}
                            </label>
                            <input
                              type="text"
                              value={portalSponsorLinkUrl}
                              onChange={(e) => setPortalSponsorLinkUrl(e.target.value)}
                              placeholder="e.g. https://t.me/..."
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block">
                            {language === 'kh' ? 'រូបភាព Banner (Landscape)' : 'Banner Image (Landscape)'}
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition border border-slate-200">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{language === 'kh' ? 'ជ្រើសរើសរូបភាព Sponsor' : 'Choose Banner'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePortalSponsorUpload}
                                className="hidden"
                              />
                            </label>
                            {portalSponsorImageUrl && (
                              <button
                                type="button"
                                onClick={() => setPortalSponsorImageUrl('')}
                                className="px-2.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 font-extrabold text-[10px] rounded-lg transition"
                              >
                                {language === 'kh' ? 'លុបចោល' : 'Remove'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={handleSavePortalConfig}
                      disabled={isPortalSaving}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/15 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isPortalSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{language === 'kh' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{language === 'kh' ? 'រក្សាទុកការកំណត់ Link កូនបំណុល' : 'Save Borrower Link Config'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: Beautiful live 📱 Mobile Phone Mock Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 shadow-sm sticky top-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full inline-block mb-3.5">
                      📱 ទិដ្ឋភាពលើទូរស័ព្ទកូនបំណុល (Mobile View Preview)
                    </span>

                    {/* Smartphone Mock Container */}
                    <div className="max-w-[280px] mx-auto bg-slate-900 rounded-[36px] p-2.5 shadow-2xl border-4 border-slate-800 relative ring-8 ring-slate-100 ring-offset-0 overflow-hidden">
                      {/* Notch */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-between px-3">
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                      </div>

                      {/* Screen */}
                      <div className="bg-slate-50 w-full aspect-[9/18.5] rounded-[28px] overflow-y-auto overflow-x-hidden border border-slate-950/20 text-left text-slate-800 flex flex-col pt-5 select-none no-scrollbar text-[10px]">
                        
                        {/* 1. Scrolling Marquee */}
                        <div className="bg-amber-500 text-slate-950 font-bold py-1 overflow-hidden w-full text-[8px] whitespace-nowrap shrink-0">
                          <span className="animate-marquee-smooth inline-block pl-2">
                            {portalMarqueeText || '✨ សរសេរអក្សររត់របស់អ្នកនៅទីនេះ...'}
                          </span>
                        </div>

                        {/* 2. Header */}
                        <div className="bg-slate-900 text-white p-2.5 flex items-center gap-1.5 shadow-sm shrink-0">
                          {portalLogoType === 'text' ? (
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center font-black text-[9px]"
                              style={{ backgroundColor: portalLogoBgColor, color: portalLogoTextColor }}
                            >
                              {portalLogoText || 'LP'}
                            </div>
                          ) : portalLogoImageUrl ? (
                            <img
                              src={portalLogoImageUrl}
                              alt="Logo"
                              className="w-6 h-6 rounded-md object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-black text-white text-[9px]">
                              LP
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold uppercase text-[9px] tracking-wide leading-none">{portalTitle || 'Luypay Ledger'}</p>
                            <p className="text-[6px] text-slate-400 font-semibold leading-none mt-0.5">{language === 'kh' ? 'លិខិតសងប្រាក់អេឡិចត្រូនិច' : 'Digital Debt Receipt'}</p>
                          </div>
                        </div>

                        {/* Screen Content Wrapper */}
                        <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                          
                          {/* 3. Notice Card */}
                          <div className="bg-blue-50 border border-blue-200/50 p-2 rounded-xl flex items-start gap-1.5 shadow-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <h4 className="text-[8px] font-black text-blue-900 uppercase tracking-wider">{portalNoticeTitle || 'សេចក្តីជូនដំណឹងអំពីគណនេយ្យ'}</h4>
                              <p className="text-[7px] text-blue-800 leading-normal font-medium">
                                {portalNoticeText || 'ទំព័រនេះសម្រាប់ត្រួតពិនិត្យសមតុល្យ និងប្រវត្តិសងប្រាក់ផ្ទាល់ខ្លួន។'}
                              </p>
                            </div>
                          </div>

                          {/* 4. Mini Mock Borrower Card */}
                          <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200" />
                              <div>
                                <p className="font-bold text-[8px]">លីសារ (100$)</p>
                                <span className="bg-purple-150 text-purple-700 text-[6px] font-black px-1.5 py-0.5 rounded">GOOD</span>
                              </div>
                            </div>
                          </div>

                          {/* 5. Sponsor Section in Mobile Portal */}
                          {portalSponsorEnabled && (
                            <div className="bg-white border border-slate-200 p-2 rounded-xl shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[6px] font-black text-slate-400 uppercase tracking-wider">Sponsored</span>
                                {portalSponsorTitle && (
                                  <span className="text-[6px] font-extrabold text-indigo-600 truncate max-w-[80px]">{portalSponsorTitle}</span>
                                )}
                              </div>
                              {portalSponsorImageUrl ? (
                                <div className="w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                  <img
                                    src={portalSponsorImageUrl}
                                    alt="Sponsor"
                                    className="w-full h-auto object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-[1200/627] bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-2 text-center text-[6px] text-slate-400">
                                  <span>{language === 'kh' ? 'មិនទាន់អាប់ឡូត Sponsor' : 'No sponsor uploaded'}</span>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-150 text-left text-[11px] text-slate-500 font-medium leading-relaxed mt-4">
                      <p className="font-extrabold text-slate-800">{language === 'kh' ? 'ℹ️ ការផ្សព្វផ្សាយរបស់កូនបំណុល' : 'ℹ️ Borrower Portal View'}</p>
                      <p className="mt-1">{language === 'kh' ? 'រាល់ការកែប្រែទាំងអស់នឹងត្រូវធ្វើបច្ចុប្បន្នភាពភ្លាមៗនៅលើគ្រប់ Link របស់កូនបំណុលទាំងអស់ដោយស្វ័យប្រវត្ត។' : 'All modifications will instantly sync across all shared borrower checklink pages in real-time.'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>កែប្រែព័ត៌មានគណនី @{editingMember.username}</span>
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">ឈ្មោះបង្ហាញ (Display Name)</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                />
              </div>

              <div className="text-left space-y-1.5">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">លេខសម្ងាត់ថ្មី (New Password)</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="ទុកចំហដើម្បីរក្សាទុកលេខសម្ងាត់ចាស់..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                />
              </div>

              {/* Custom QR Code (Control QR) Upload Section */}
              <div className="text-left space-y-1.5 border-t border-slate-100 pt-3">
                <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>QR Code ទទួលប្រាក់ (Control QR)</span>
                </label>
                
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
                    {editPaymentQr ? (
                      <img
                        src={editPaymentQr}
                        alt="Member QR"
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <QrCode className="w-6 h-6 text-slate-300" />
                    )}
                    
                    <label className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer text-white">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
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
                                setEditPaymentQr(base64Str);
                                showToast('បានរក្សាទុក QR code ក្នុងផ្ទាំងកែប្រែ!', 'success');
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
                  
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                      អាប់ឡូត QR កូដសម្រាប់សមាជិកនេះដើម្បីបង្ហាញលើផ្ទាំងកូនបំណុលរបស់ពួកគេ។
                    </p>
                    {editPaymentQr && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditPaymentQr('');
                          showToast('បានដក QR code ចេញ!', 'info');
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[9px] rounded-lg transition"
                      >
                        លុប QR កូដ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-3">
              <button
                onClick={handleSaveMemberEdit}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition cursor-pointer"
              >
                រក្សាទុកការផ្លាស់ប្តូរ
              </button>
              <button
                onClick={() => setEditingMember(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reseller Info Modal */}
      {showResellerInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-left animate-in zoom-in duration-350">
            <button
              onClick={() => setShowResellerInfo(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl transition hover:bg-slate-50 cursor-pointer border-transparent"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">ទិញសិទ្ធិ / ចម្លងប្រព័ន្ធ Luypay Ledger</h3>
              <p className="text-xs text-slate-500 font-bold">
                សម្រាប់អ្នកដែលចង់ទិញប្រព័ន្ធចម្លងទៅដាក់ឈ្មោះយីហោផ្ទាល់ខ្លួន ដើម្បីគ្រប់គ្រងកូនបំណុល ឬលក់បន្ត។
              </p>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 text-sm font-extrabold">✓</span>
                <p>ទទួលបានប្រព័ន្ធគ្រប់គ្រងកូនបំណុលពេញលេញជាមួយឈ្មោះយីហោផ្ទាល់ខ្លួន (White-label brand)</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 text-sm font-extrabold">✓</span>
                <p>ការរៀបចំដំឡើងប្រព័ន្ធ Cloud Firestore & Firebase Auth ដោយឥតគិតថ្លៃ</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 text-sm font-extrabold">✓</span>
                <p>រចនាបញ្ចូលឡូហ្គោ ពណ៌ ភាសា និងឈ្មោះអាជីវកម្មរបស់អ្នកផ្ទាល់</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 text-sm font-extrabold">✓</span>
                <p>ការគាំទ្រការប្រើប្រាស់ និងមើលថែទាំប្រព័ន្ធបច្ចេកទេសប្រចាំខែ</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href="https://t.me/laymeancamera"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-500/15 transition duration-150 flex items-center justify-center gap-1.5 text-center decoration-transparent"
              >
                <span>📩 ផ្ញើសារទាក់ទង Admin តាម Telegram ដើម្បីទិញ</span>
              </a>
              <button
                type="button"
                onClick={() => setShowResellerInfo(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl border border-slate-200 transition duration-150 cursor-pointer"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
