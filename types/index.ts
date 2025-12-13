// types/index.ts - Centralized type definitions for the research platform

// ===== CURRENCY TYPES =====
export type Currency = "NGN" | "USD" | "EUR" | "GBP";

export interface CurrencyWallets {
  NGN: number;
  USD: number;
  EUR: number;
  GBP: number;
}

// ===== BASELINE SURVEY TYPES =====
export type MonthlyIncome = "below_30k" | "30k_100k" | "100k_300k" | "above_300k";
export type CurrentSavings = "none" | "below_1month" | "1_3months" | "3_6months" | "above_6months";
export type SavingsFrequency = "never" | "monthly" | "weekly" | "daily";
export type ROSCAParticipation = "yes_active" | "yes_not_current" | "no_never" | "no_interested";
export type BorrowingFrequency = "never" | "rarely" | "sometimes" | "often" | "very_often";
export type BorrowingSource = "family_friends" | "banks" | "microfinance" | "money_lenders" | "mobile_apps";
export type InvestmentExperience = "yes_current" | "yes_not_anymore" | "no_never" | "no_interested";
export type FinancialGoal = "emergency_savings" | "specific_purchase" | "pay_debt" | "business" | "invest" | "send_money_home";
export type SavingsChallenge = "low_income" | "unexpected_expenses" | "supporting_family" | "lack_discipline" | "dont_know_how" | "dont_trust";
export type AgeRange = "18_24" | "25_34" | "35_44" | "45_54" | "55_plus";
export type EmploymentStatus = "employed_fulltime" | "employed_parttime" | "self_employed" | "student" | "unemployed";

export interface BaselineSurvey {
  // Financial Situation
  monthlyIncome: MonthlyIncome;
  currentSavings: CurrentSavings;
  savingsFrequency: SavingsFrequency;

  // Current Behaviors
  participatesInROSCA: ROSCAParticipation;
  borrowingFrequency: BorrowingFrequency;
  borrowingSources: BorrowingSource[];
  hasInvested: InvestmentExperience;

  // Goals & Challenges
  financialGoal: FinancialGoal;
  savingsChallenges: SavingsChallenge[];

  // Demographics
  ageRange: AgeRange;
  employmentStatus: EmploymentStatus;
  location: string;
}

// ===== ROSCA TYPES =====
export interface ROSCAGroup {
  id: string;
  n: string; // name
  a: number; // amount
  f: string; // frequency
  d: string; // duration
  m: number; // max members
  c: number; // current members
  ad: string; // admin
  r: number; // completion rate
  started: boolean;
  startDate: string | null;
  currency?: Currency;
  members?: string[]; // user IDs
  weeksPaid?: number;
  payoutWeek?: number;
  pos?: number; // position
  nextDeduction?: string;
  jAt?: string; // joined at
  paid?: boolean;
  totalPayout?: number;
  hadBalance?: boolean;
  tookLoan?: boolean;
}

// ===== LOAN TYPES =====
export interface Loan {
  id: string;
  amt: number; // amount
  pur: string; // purpose
  ir: number; // interest rate
  tot: number; // total repayment
  repayBy: string; // repayment date
  groupId?: string;
  isRoscaAdvance?: boolean;
  status?: "active" | "repaid";
}

// ===== SAVINGS TYPES =====
export interface FixedSavings {
  id: string;
  amt: number;
  dur: string; // duration
  rt: number; // rate
  ret: number; // returns
  maturity: string;
  status?: "active" | "matured";
}

export interface TargetSavings {
  id: string;
  n: string; // name
  tg: number; // target amount
  cur: number; // current amount
  wk: number; // weekly amount
  wks: number; // total weeks
  wkD: number; // weeks done
  status: "Active" | "Completed";
  contributions: Array<{
    amount: number;
    date: string;
    week: number;
  }>;
}

// ===== INVESTMENT TYPES =====
export interface Investment {
  id: string;
  n: string; // name
  t: string; // type
  amt: number; // amount
  r: string; // returns percentage
  d: string; // duration
  ri: string; // risk
  maturity: string;
  status?: "active" | "matured";
}

// ===== USER DATA TYPES =====
export interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: "user" | "admin" | "superadmin";

  // Multi-currency wallets
  wallets: CurrencyWallets;
  wb: number; // legacy wallet balance (for backward compatibility)
  selectedCurrency: Currency;

  // Financial data
  at: number; // available tokens
  cs: number; // credit score helper
  hC: boolean; // has claimed
  jG: ROSCAGroup[]; // joined groups
  gR: ROSCAGroup[]; // group requests
  ln: Loan[]; // loans
  fS: FixedSavings[]; // fixed savings
  tS: TargetSavings[]; // target savings
  inv: Investment[]; // investments

  // KYC and verification
  kycComplete: boolean;

  // Timestamps
  createdAt: string;

  // Trust and credit scores
  trustScore: number;
  creditScore: number;

  // Baseline survey data (for research)
  baselineSurvey: BaselineSurvey | null;
  surveyCompletedAt: string | null;
  baselineSurveySkipped: boolean;
}

// ===== FORM TYPES =====
export interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  preferredCurrency: Currency;
  role: "user";
}

export interface LoginForm {
  email: string;
  password: string;
}

// ===== COMPONENT PROP TYPES =====
export interface WelcomeProps {
  onSignup: (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: string,
    currency: Currency
  ) => Promise<{ success: boolean; error?: any }>;
  onLogin: (
    email: string,
    password: string
  ) => Promise<{ success: boolean }>;
}

export interface BaselineSurveyProps {
  onComplete: () => void;
  saveData: (data: Partial<UserData>) => Promise<void>;
}

export interface DashboardProps {
  userData: UserData;
  setCurrentScreen: (screen: string) => void;
  saveUserData: (data: Partial<UserData>) => Promise<void>;
  handleLogout: () => Promise<void>;
}

// ===== ANALYTICS TYPES =====
export interface ActionMetadata {
  [key: string]: any;
}

export interface UserAction {
  userId: string;
  userName: string;
  userEmail: string;
  actionType: string;
  metadata: ActionMetadata;
  timestamp: any; // Firebase serverTimestamp
  sessionId: string;
  deviceInfo: string;
}

// ===== HELPER TYPES =====
export type Screen =
  | "splash"
  | "welcome"
  | "kyc"
  | "dashboard"
  | "rosca"
  | "loans"
  | "savings"
  | "investments"
  | "trust"
  | "profile";

export interface CurrencySymbols {
  NGN: "₦";
  USD: "$";
  EUR: "€";
  GBP: "£";
}

export const CURRENCY_SYMBOLS: CurrencySymbols = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};
