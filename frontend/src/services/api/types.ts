// src/services/api/types.ts

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  roleId?: number;
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
  price: number;
}

export interface VoucherPayload {
  code: string;
  type : "percentage" | "fixed";
  value: number;
  isActive: boolean;
}

export interface ThinkingStyleTestResponse {
  message: string;
  data: ThinkingStyleResult;
}

export interface ThinkingStyleResult {
  id: number;
  userId: number;
  fullname: string;
  birthdate: string; // ISO date string
  resultDigit: number;
  resultType: string;
  resultCode: string;
  description: string;
  theory: string;
  fingerprintId: string;
  referrerId: number | null;
  updatedAt: string; // ISO datetime
  createdAt: string; // ISO datetime
}
