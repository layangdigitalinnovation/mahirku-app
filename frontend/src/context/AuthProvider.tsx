import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';// gunakan axios instance yang sudah dibuat
import {  login, registerUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: 'user' | 'affiliator',
    referrerId?: string | null,
    details?: {
      username: string;
      fullname: string;
      address: string;
      phoneNumber: string;
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function untuk mendapatkan dashboard path berdasarkan role
  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'affiliator':
        return '/affiliator/dashboard';
      case 'user':
        return '/customer/dashboard';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('neuroscan-user');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      parsed.createdAt = new Date(parsed.createdAt);
      setUser(parsed);
      
      // Auto-redirect jika user sudah login dan berada di halaman publik
      const publicPaths = ['/', '/login', '/register', '/kontak', '/faq', '/privacy-policy', '/terms'];
      if (publicPaths.includes(location.pathname)) {
        navigate(getDashboardPath(parsed.role), { replace: true });
      }
    }
    setLoading(false);
  }, [navigate, location.pathname]);

   const loginUser = async (email: string, password: string) => {
    try {
     const res = await login({email, password});

      const { token, user: backendUser } = res;


      const frontendUser: User = {
        uid: `user-${backendUser.id}`,
        email: backendUser.email,
        role: backendUser.role.name,
        createdAt: new Date(backendUser.createdAt),
      };

      localStorage.setItem('neuroscan-token', token);
      localStorage.setItem('neuroscan-user', JSON.stringify(frontendUser));

      setUser(frontendUser);
      
      // Auto-redirect ke dashboard setelah login berhasil
      navigate(getDashboardPath(frontendUser.role), { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      throw new Error('Invalid email or password');
    }
  };

  const register = async (
    email: string,
    password: string,
    role: 'user' | 'affiliator',
    referrerId?: string | null, // Parameter ini tetap ada untuk backward compatibility tapi tidak digunakan
    details?: {
      username: string;
      fullname: string;
      address: string;
      phoneNumber: string;
    }
  ) => {
    try {
      const roleId = role === 'affiliator' ? 2 : 3;

      // Tidak perlu kirim referrerId karena backend akan ambil dari cookie
      await registerUser({
        email,
        password,
        username: details?.username || email.split('@')[0],
        fullname: details?.fullname || '',
        address: details?.address || '',
        phoneNumber: details?.phoneNumber || '',
        roleId
        // referrerId dihapus karena backend menggunakan cookie
      });

      await loginUser(email, password);
    } catch (err) {
      console.error('Register error:', err);
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    localStorage.removeItem('neuroscan-user');
    localStorage.removeItem('neuroscan-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
