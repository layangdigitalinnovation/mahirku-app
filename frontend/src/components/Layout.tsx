import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Brain, User, LogOut, Home, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';

export const Layout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'super_admin':
        return '/admin/dashboard';
      case 'affiliator':
        return '/affiliator/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'affiliator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return Shield;
      case 'affiliator':
        return User;
      default:
        return User;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Mahirku</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" icon={Home} size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {React.createElement(getRoleIcon(user.role), { size: 16 })}
                    <span>{user.email}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      {user.role === 'super_admin' ? 'Super Admin' : user.role}
                    </span>
                  </div>
                  <Button variant="ghost" icon={LogOut} size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <div className="space-x-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>
    </div>
  );
};