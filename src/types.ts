export type FrequencyType = 'daily' | 'weekly' | 'monthly';
export type CurrencyType = 'USD' | 'KHR';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  installmentIndex: number; // 0-based index of the installment slot (e.g., Slot 0 for Day 1)
  note?: string;
}

export interface Borrower {
  id: string;
  name: string;
  phone: string;
  loanDate: string;
  principal: number;
  totalToPay: number;
  installmentAmount: number;
  frequency: FrequencyType;
  duration: number; // total number of installments (e.g., 20, 24, 30)
  currency: CurrencyType;
  notes?: string;
  payments: Payment[];
  isArchived?: boolean; // to archive completed/old loans
  interestType?: 'percent' | 'fixed';
  interestValue?: number;
  paymentMode?: 'all' | 'interest-only';
  interestCalculation?: 'flat' | 'per-period';
  statusTag?: 'good' | 'late' | 'regular';
  autoCheckIn?: boolean;
  dueTime?: string; // custom cutoff/due time, e.g. "17:00"
  noticeMessage?: string; // custom announcement/alert notice for the borrower
  chatMessages?: ChatMessage[]; // live chat/discussion with borrower
  profilePhoto?: string; // base64 encoded profile photo string
  avatarFrame?: string; // custom avatar animated frame template ID
  coverPhoto?: string; // base64 encoded cover photo string
  paymentQr?: string; // base64 encoded payment QR code image URL
  userId?: string; // The username of the member who owns this borrower
}

export interface ChatMessage {
  id: string;
  sender: 'lender' | 'borrower';
  message: string;
  timestamp: string; // ISO string
}

export interface LedgerStats {
  totalActiveLoansCount: number;
  totalCompletedLoansCount: number;
  totalPrincipalUSD: number;
  totalPrincipalKHR: number;
  totalExpectedUSD: number;
  totalExpectedKHR: number;
  totalCollectedUSD: number;
  totalCollectedKHR: number;
}

export interface Member {
  username: string;
  email: string;
  password?: string;
  displayName: string;
  createdAt: string;
  invitesCount: number;
  inviteLink?: string;
  isBlocked?: boolean;
  subscriptionExpires?: string; // ISO date string
  photoURL?: string; // Optional custom base64 or URL profile photo
  paymentQr?: string; // Optional custom global/default payment QR code image URL
}

export interface SubscriptionRequest {
  id: string;
  username: string;
  displayName: string;
  plan: '1_month' | '3_months' | '1_year';
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface QRConfig {
  qrType: 'generated' | 'uploaded';
  qrString: string;
  qrImageUrl: string;
  accountName: string;
  accountId: string;
  bankName: string;
  bankLogoText: string;
  bankColor: string;
}
