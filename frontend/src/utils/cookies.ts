/**
 * Utility functions untuk mengelola cookies di frontend
 */

/**
 * Set cookie dengan nama, value, dan options
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 30
): void => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

/**
 * Get cookie value berdasarkan nama
 */
export const getCookie = (name: string): string | null => {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
};

/**
 * Delete cookie berdasarkan nama
 */
export const deleteCookie = (name: string): void => {
  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.error('Error deleting cookie:', error);
  }
};

/**
 * Check apakah cookie tersedia (untuk SSR compatibility)
 */
export const isCookieAvailable = (): boolean => {
  return typeof document !== 'undefined';
};

/**
 * Get all cookies sebagai object
 */
export const getAllCookies = (): Record<string, string> => {
  try {
    if (!isCookieAvailable()) {
      return {};
    }
    
    const cookies: Record<string, string> = {};
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      
      const eqIndex = c.indexOf('=');
      if (eqIndex > 0) {
        const name = c.substring(0, eqIndex);
        const value = c.substring(eqIndex + 1);
        cookies[name] = value;
      }
    }
    
    return cookies;
  } catch (error) {
    console.error('Error getting all cookies:', error);
    return {};
  }
};

/**
 * Clear all cookies (untuk testing/debugging)
 */
export const clearAllCookies = (): void => {
  try {
    if (!isCookieAvailable()) {
      return;
    }
    
    const cookies = getAllCookies();
    Object.keys(cookies).forEach(cookieName => {
      deleteCookie(cookieName);
    });
  } catch (error) {
    console.error('Error clearing all cookies:', error);
  }
};