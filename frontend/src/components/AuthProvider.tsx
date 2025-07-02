import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, BackendUser } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    const stored = localStorage.getItem('neuroscan-user');
    if (stored) {
      const parsed: User = JSON.parse(stored);
      parsed.createdAt = new Date(parsed.createdAt);
      setUser(parsed);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post<{ token: string; user: BackendUser }>(
        'http://localhost:5000/api/auth/login',
        { email, password }
      );

      const { token, user: backendUser } = res.data;

      const frontendUser: User = {
        uid: `user-${backendUser.id}`, // generate dari id backend
        email: backendUser.email,
        role: backendUser.role.name,
        createdAt: new Date(backendUser.createdAt),
      };


      localStorage.setItem('neuroscan-token', token);
      localStorage.setItem('neuroscan-user', JSON.stringify(frontendUser));

      setUser(frontendUser);
    } catch (err) {
      console.error('Login error:', err);
      throw new Error('Invalid email or password');
    }
  };

  const register = async (
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
  ) => {
  try {
    const roleId = role === 'affiliator' ? 2 : 3;

    await axios.post('http://localhost:5000/api/auth/register', {
      email,
      password,
      username: details?.username || email.split('@')[0],
      fullname: details?.fullname || '',
      address: details?.address || '',
      phoneNumber: details?.phoneNumber || '',
      roleId,
      referrerId: referrerId || undefined,
    });

    await login(email, password);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
