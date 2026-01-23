// src/services/api/types.ts

import { ThinkingStyle } from "./thinkingStylesAdmin";

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  roleId?: number;
  mitraId?: string; // Optional Mitra ID for member registration
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  // referrerId dihapus karena backend menggunakan cookie
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PackagePayload {
  name: string;
  description : string;
  defaultTokenAmount: number;
  commissionRate: number;
  mitraCommissionRate?: number;
  price: number;
}

export interface VoucherPayload {
  code: string;
  type : "percentage" | "fixed";
  value: number;
  isActive: boolean;
}

export interface AffiliatorRegisterPayload {
  email: string;
  username: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
}

export interface ThinkingStyleTestResponse {
  message: string;
  data: ThinkingStyleResult;
}

export interface ThinkingStyleResult {
  id: number;
  userId: number;
  fullname: string;
  birthdate?: string | null; // ISO date string
  resultDigit: number;
  thinkingStyleId : number;
  thinkingStyle : ThinkingStyle
  fingerprintId: string;
  referrerId: number | null;
  updatedAt: string; // ISO datetime
  createdAt: string; // ISO datetime
  testType?: 'THINKING_STYLE' | 'DISC';
  // DISC fields (optional)
  dScore?: number;
  iScore?: number;
  sScore?: number;
  cScore?: number;
  dominantType?: string;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roleId: number;
  fullname: string;
  address: string;
  phoneNumber: string;
  tokens: number;
  parentId?: number;
  packageId?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  parent?: User; // Mitra/Affiliator yang mereferensikan
}
