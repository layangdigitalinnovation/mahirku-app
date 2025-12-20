import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// PublicRoute Component - untuk halaman yang hanya bisa diakses user yang belum login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Jika user sudah login, redirect ke dashboard sesuai role
  if (user) {
    switch (user.role) {
      case 'super_admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'affiliator':
        return <Navigate to="/affiliator/dashboard" replace />;
      case 'mitra':
        return <Navigate to="/mitra/dashboard/overview" replace />;
      case 'user':
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Jika user belum login, tampilkan halaman publik
  return <>{children}</>;
};

export default PublicRoute;
