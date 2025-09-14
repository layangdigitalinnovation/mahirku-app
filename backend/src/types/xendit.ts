// Xendit API Types

export interface PayoutRequest {
  reference_id: string;
  channel_code: string;
  channel_properties: {
    account_holder_name: string;
    account_number: string;
  };
  amount: number;
  description: string;
  currency?: string;
}

export interface PayoutResponse {
  success: boolean;
  message: string;
  id?: string;
  external_id?: string;
  amount?: number;
  status?: PayoutStatus;
  created?: string;
  reference_id?: string;
  channel_code?: string;
  channel_properties?: {
    account_holder_name?: string;
    account_number?: string;
  };
  description?: string;
  currency?: string;
  metadata?: {
    [key: string]: any;
  };
}

export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PayoutCallback {
  id: string;
  external_id: string;
  user_id: string;
  amount: number;
  status: PayoutStatus;
  channel_code: string;
  created: string;
  updated: string;
  reference_id: string;
  currency: string;
  failure_reason?: string;
}

export interface InvoiceRequest {
  external_id: string;
  amount: number;
  description: string;
  invoice_duration: number;
  customer: {
    given_names: string;
    surname?: string;
    email: string;
    mobile_number?: string;
  };
  customer_notification_preference?: {
    invoice_created: string[];
    invoice_reminder: string[];
    invoice_paid: string[];
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  currency?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  url?: string;
}

export interface InvoiceResponse {
  id: string;
  external_id: string;
  user_id: string;
  status: InvoiceStatus;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  description: string;
  expiry_date: string;
  invoice_url: string;
  available_banks: Bank[];
  available_retail_outlets: RetailOutlet[];
  available_ewallets: Ewallet[];
  should_exclude_credit_card: boolean;
  should_send_email: boolean;
  created: string;
  updated: string;
  currency: string;
}

export type InvoiceStatus = 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED';

export interface Bank {
  bank_code: string;
  collection_type: string;
  bank_account_number: string;
  transfer_amount: number;
  bank_branch: string;
  account_holder_name: string;
  identity_amount: number;
}

export interface RetailOutlet {
  retail_outlet_name: string;
  payment_code: string;
  transfer_amount: number;
  merchant_name: string;
  expiry_date: string;
}

export interface Ewallet {
  ewallet_type: string;
  actions?: {
    name: string;
    method: string;
    url: string;
  };
}

export interface XenditConfig {
  apiKey: string;
  publicKey: string;
  baseUrl: string;
  callbackUrl: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface XenditError {
  error_code: string;        // ex: "SERVER_ERROR", "VALIDATION_ERROR", dll
  error_message: string;     // pesan detail error
}

