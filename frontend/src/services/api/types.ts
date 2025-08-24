// src/services/api/types.ts

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  roleId?: number;
  referrerId?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}