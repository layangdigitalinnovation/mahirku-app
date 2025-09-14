export interface User {
  uid: string;
  email: string;
  role: 'user' | 'affiliator' | 'super_admin';
  createdAt: Date;
  referrerId?: string;
}

export interface TestResult {
  id: string;
  userId: string;
  birthDate: string;
  cognitiveStyle: string;
  numerologyResult: number;
  fingerprintId?: string;
  timestamp: Date;
  qrCodeData?: string;
  referrerId?: string;
}

export interface Commission {
  id: string;
  affiliatorId: string;
  userId: string;
  testId: string;
  amount: number;
  timestamp: Date;
  status: 'pending' | 'paid';
}

export interface AffiliatorStats {
  totalClicks: number;
  totalTests: number;
  totalCommission: number;
  pendingCommission: number;
}

export interface CognitiveStyle {
  id: number;
  name: string;
  description: string;
  traits: string[];
  color: string;
}

export interface AdminStats {
  totalUsers: number;
  totalAffiliators: number;
  totalTests: number;
  totalCommissions: number;
  pendingCommissions: number;
  recentActivity: any[];
}

// Tipe dari backend
export interface BackendRole {
  id: number;
  name: 'user' | 'affiliator' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  fullname: string;
  address: string;
  phoneNumber: string;
  roleId: number;
  role: BackendRole;
  createdAt: string;
  updatedAt: string;
}

export type SectionName = 'beranda' | 'layanan' | 'paket' |  'kontak';

export type UserColumn = {
  id: number;
  email: string;
  fullname: string;
  address: string;
  phoneNumber: string;
  role: BackendRole;
}

// types/package.ts
export interface TokenPackage {
  id: number;
  name: string;
  description: string;
  defaultTokenAmount: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}
