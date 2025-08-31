// src/config/xenditConfig.ts
export const xenditConfig = {
  apiKey: process.env.XENDIT_API_KEY!,
  publicKey: process.env.XENDIT_PUBLIC_KEY!,
  baseUrl: process.env.XENDIT_BASE_URL!,
  callbackUrl: process.env.XENDIT_CALLBACK_URL!,
  successRedirectUrl: process.env.XENDIT_SUCCESS_REDIRECT_URL!,
  failureRedirectUrl: process.env.XENDIT_FAILURE_REDIRECT_URL!
};