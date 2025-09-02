import { Request, Response, NextFunction } from 'express';

/**
 * Middleware untuk menangani referral link
 * Mendeteksi query parameter 'ref' dan menyimpannya dalam cookie
 */
export const referralMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const referralCode = req.query.ref as string;
    
    if (referralCode) {
      // Validasi format referral code (harus dimulai dengan 'aff' diikuti angka)
      const referralPattern = /^aff\d+$/;
      
      if (referralPattern.test(referralCode)) {
        // Set cookie dengan referral code
        // Cookie akan expire dalam 30 hari
        res.cookie('mahirku_referral', referralCode, {
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari dalam milliseconds
          httpOnly: false, // Biarkan accessible dari frontend untuk debugging
          secure: process.env.NODE_ENV === 'production', // HTTPS only di production
          sameSite: 'lax', // CSRF protection
          path: '/' // Available untuk semua routes
        });
        
        console.log(`Referral cookie set: ${referralCode}`);
      } else {
        console.log(`Invalid referral code format: ${referralCode}`);
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in referral middleware:', error);
    // Jangan block request jika ada error di middleware
    next();
  }
};

/**
 * Helper function untuk mengambil referral code dari cookie
 */
export const getReferralFromCookie = (req: Request): string | null => {
  try {
    const referralCode = req.cookies?.mahirku_referral;
    
    if (referralCode && typeof referralCode === 'string') {
      // Validasi format sebelum return
      const referralPattern = /^aff\d+$/;
      if (referralPattern.test(referralCode)) {
        return referralCode;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting referral from cookie:', error);
    return null;
  }
};

/**
 * Helper function untuk clear referral cookie (digunakan setelah registrasi berhasil)
 */
export const clearReferralCookie = (res: Response): void => {
  try {
    res.clearCookie('mahirku_referral', {
      path: '/'
    });
    console.log('Referral cookie cleared');
  } catch (error) {
    console.error('Error clearing referral cookie:', error);
  }
};