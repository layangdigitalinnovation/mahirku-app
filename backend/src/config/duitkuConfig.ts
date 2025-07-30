// src/config/duitkuConfig.ts
export const duitkuConfig = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE!,
  apiKey: process.env.DUITKU_API_KEY!,
  baseUrl: process.env.DUITKU_BASE_URL!,
  callbackUrl: process.env.DUITKU_CALLBACK_URL!,
  returnUrl: process.env.DUITKU_RETURN_URL!
};
