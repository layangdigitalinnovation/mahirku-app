export interface LandingPageThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  buttonTextColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  cardBorderColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  fontFamily?: string;
  buttonRadius?: string;
  cardRadius?: string;
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'radial-glow';
  sectionSpacing?: 'compact' | 'normal' | 'spacious';
  showUrgencyBar?: boolean;
  urgencyBarText?: string;
  urgencyMinutes?: number;
  urgencyBarBgFrom?: string;
  urgencyBarBgTo?: string;
  urgencyBarTextColor?: string;
  headerLogoUrl?: string;
  footerText?: string;
}

export interface LandingPagePixelConfig {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleTagId?: string;
}

export type SectionType =
  | 'hero'
  | 'video'
  | 'mediaContent'
  | 'gallery'
  | 'painPoints'
  | 'characterArchetypes'
  | 'benefits'
  | 'orderForm'
  | 'testimonials'
  | 'faq'
  | 'ctaBanner'
  | 'stickyMobileCta'
  | 'custom';

export type CustomFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'tel'
  | 'email'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface CustomFormField {
  id: string;
  label: string;
  placeholder?: string;
  type: CustomFieldType;
  required: boolean;
  enabled: boolean;
  options?: string[];
}

export interface SectionBlock {
  id: string;
  type: SectionType;
  title?: string;
  enabled: boolean;
  order: number;
  data: Record<string, any>;
}

export interface LandingPage {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  themeConfig: LandingPageThemeConfig;
  pixelConfig: LandingPagePixelConfig;
  sections: SectionBlock[];
  formConfig: Record<string, any>;
  isPublished: boolean;
  viewsCount: number;
  conversionsCount: number;
  totalLeads?: number;
  totalPaid?: number;
  totalRevenue?: number;
  conversionRate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPageSubmission {
  id: number;
  landingPageId: number;
  fullName: string;
  whatsapp: string;
  email: string;
  additionalData: Record<string, any>;
  packageId?: number | null;
  amount: number;
  invoiceId?: number | null;
  paymentMethod: 'gateway' | 'whatsapp';
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  referralCode?: string | null;
  userId?: number | null;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: number;
    status: string;
    tokenAmount: number;
    paymentDate?: string | null;
  };
  package?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface DbPackage {
  id: number;
  name: string;
  description?: string;
  defaultTokenAmount: number;
  price: number;
  commissionRate?: number;
}

export interface DbVoucher {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive?: boolean;
}

export interface RecentOrderNotification {
  fullName: string;
  city?: string;
  amount?: number;
  packageName?: string;
  timeAgo?: string;
  createdAt?: string;
  package?: {
    name: string;
    defaultTokenAmount: number;
  };
}

export interface PublicLandingPageResponse {
  data: LandingPage;
  availablePackages: DbPackage[];
  availableVouchers: DbVoucher[];
  recentOrders?: RecentOrderNotification[];
}

export interface CheckoutPayload {
  fullName: string;
  whatsapp: string;
  email: string;
  packageId?: number | null;
  customPackageData?: {
    id?: number;
    name: string;
    price: number;
    tokens: number;
  };
  voucherCode?: string;
  referralCode?: string;
  paymentMethod: 'gateway' | 'whatsapp';
  additionalData?: Record<string, any>;
}

export interface CheckoutResponse {
  success: boolean;
  paymentMethod?: 'gateway' | 'whatsapp';
  paymentUrl?: string | null;
  whatsappUrl?: string;
  invoiceId?: number;
  submissionId?: number;
  isFree?: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    isNewUser: boolean;
    temporaryPassword?: string | null;
  };
}

