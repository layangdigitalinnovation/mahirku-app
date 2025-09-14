import { getCookie, setCookie, deleteCookie } from './cookies';

/**
 * Konstanta untuk nama cookie referral
 */
const REFERRAL_COOKIE_NAME = 'mahirku_referral';

/**
 * Ambil referral ID dari URL parameter atau cookie
 * Prioritas: URL parameter > Cookie
 */
export const getReferralId = (): string | null => {
  try {
    // Cek URL parameter terlebih dahulu
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref');
    
    if (refFromUrl) {
      // Validasi format referral code
      const referralPattern = /^aff\d+$/;
      if (referralPattern.test(refFromUrl)) {
        // Set cookie jika valid (backend juga akan set, tapi ini untuk backup)
        setCookie(REFERRAL_COOKIE_NAME, refFromUrl, 30);
        return refFromUrl;
      } else {
        console.warn('Invalid referral code format:', refFromUrl);
        return null;
      }
    }
    
    // Jika tidak ada di URL, ambil dari cookie
    return getCookie(REFERRAL_COOKIE_NAME);
  } catch (error) {
    console.error('Error getting referral ID:', error);
    return null;
  }
};

export const generateReferralLink = (affiliatorId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${affiliatorId}`;
};

/**
 * Clear referral ID dari cookie
 */
export const clearReferralId = (): void => {
  try {
    deleteCookie(REFERRAL_COOKIE_NAME);
  } catch (error) {
    console.error('Error clearing referral ID:', error);
  }
};

/**
 * Validasi format referral code
 */
export const isValidReferralCode = (code: string): boolean => {
  const referralPattern = /^aff\d+$/;
  return referralPattern.test(code);
};

/**
 * Extract user ID dari referral code
 */
export const extractUserIdFromReferral = (referralCode: string): number | null => {
  try {
    if (!isValidReferralCode(referralCode)) {
      return null;
    }
    
    const userId = referralCode.replace('aff', '');
    const parsedId = parseInt(userId, 10);
    
    return isNaN(parsedId) ? null : parsedId;
  } catch (error) {
    console.error('Error extracting user ID from referral:', error);
    return null;
  }
};

/**
 * Check apakah ada referral aktif
 */
export const hasActiveReferral = (): boolean => {
  const referralId = getReferralId();
  return referralId !== null && isValidReferralCode(referralId);
};