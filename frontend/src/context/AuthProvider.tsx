/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, registerUser, registerAffiliator } from '../services/api';
import { clearAllCookies } from '@/utils/cookies';
import { useCacheManager } from '@/hooks/useCacheManager';

// Simplified User interface for frontend
interface SimpleUser {
  id: number;
  email: string;
  username: string;
  fullname: string;
  role: string;
  createdAt: Date;
}

// Registration details interface
interface RegisterDetails {
  username?: string;
  fullname?: string;
  address?: string;
  phoneNumber?: string;
  mitraId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'user' | 'affiliator',
    details?: RegisterDetails
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAllCache } = useCacheManager();

  // Dashboard routing based on user role
  const getDashboardPath = (role: string): string => {
    const dashboardRoutes = {
      super_admin: '/admin/dashboard',
      affiliator: '/affiliator/dashboard',
      user: '/customer/dashboard',
      mitra: '/mitra/dashboard/overview'
    };
    return dashboardRoutes[role as keyof typeof dashboardRoutes] || '/login';
  };

  // Initialize user from localStorage
  useEffect(() => {
    const initializeUser = () => {
      try {
        const storedUser = localStorage.getItem('neuroscan-user');
        if (storedUser) {
          const parsedUser: SimpleUser = JSON.parse(storedUser);
          parsedUser.createdAt = new Date(parsedUser.createdAt);
          setUser(parsedUser);
          
          // Auto-redirect from public pages if already logged in
          const publicPaths = ['/', '/login', '/register', '/kontak', '/faq', '/privacy-policy', '/terms'];
          if (publicPaths.includes(location.pathname)) {
            navigate(getDashboardPath(parsedUser.role), { replace: true });
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear corrupted data
        localStorage.removeItem('neuroscan-user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [navigate, location.pathname]);

  // Enhanced logout with complete cache clearing
  const logout = useCallback(async () => {
    try {
      // Clear all React Query cache
      clearAllCache();

      // Clear all authentication-related data
      const keysToRemove = [
        'neuroscan-user',
        'token',
        'authToken',
        'refreshToken',
        'userSession',
        'userPreferences'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear all cst: cached data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cst:')) {
          localStorage.removeItem(key);
        }
      });

      // Clear cookies using utility function
      clearAllCookies();

      // Reset user state
      setUser(null);
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [clearAllCache, navigate]);

  // Listen for auth-error event (from axios interceptor)
  useEffect(() => {
    const handleAuthError = () => {
      // Hanya tampilkan alert jika user sedang login
      const storedUser = localStorage.getItem('neuroscan-user');
      if (storedUser) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        logout();
      }
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]);

  // Implement inactivity timeout
  useEffect(() => {
    if (!user) return; // Only start timer if user is logged in

    // 60 minutes inactivity timeout
    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
        logout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Events to listen to for resetting the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Setup initial timer and event listeners
    resetTimer();
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user, logout]);

  // Login function
  const loginUser = async (email: string, password: string) => {
    try {
      const response = await login({ email, password });
      const { token, user: backendUser } = response;

      // Create simplified user object
      const simpleUser: SimpleUser = {
        id: backendUser.id,
        email: backendUser.email,
        username: backendUser.username,
        fullname: backendUser.fullname,
        role: backendUser.role.name,
        createdAt: new Date(backendUser.createdAt),
      };

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('neuroscan-user', JSON.stringify(simpleUser));
      
      setUser(simpleUser);
      
      // Redirect to appropriate dashboard
      navigate(getDashboardPath(simpleUser.role), { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Email atau password tidak valid');
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    role: 'user' | 'affiliator',
    details: RegisterDetails = {}
  ) => {
    try {
      if (role === 'affiliator') {
        // Gunakan endpoint khusus untuk affiliator
        await registerAffiliator({
          email,
          password,
          username: details.username || email.split('@')[0],
          fullname: details.fullname || '',
          address: details.address || '',
          phoneNumber: details.phoneNumber || '',
          bankAccountName: details.bankAccountName || '',
          bankAccountNumber: details.bankAccountNumber || '',
          bankName: details.bankName || '',
        });
      } else {
        // Gunakan endpoint untuk user biasa
        const roleId = 3; // User role ID
        await registerUser({
          email,
          password,
          username: details.username || email.split('@')[0],
          fullname: details.fullname || '',
          address: details.address || '',
          phoneNumber: details.phoneNumber || '',
          mitraId: details.mitraId,
          bankAccountName: details.bankAccountName || '',
          bankAccountNumber: details.bankAccountNumber || '',
          bankName: details.bankName || '',
          roleId
        });
      }

      // Auto-login after successful registration
      await loginUser(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registrasi gagal. Silakan coba lagi.');
    }
  };


  const contextValue: AuthContextType = {
    user,
    loading,
    loginUser,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
