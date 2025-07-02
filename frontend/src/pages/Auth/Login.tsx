import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Brain, } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      const storedUser = localStorage.getItem('neuroscan-user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
            switch (parsedUser.role) {
              case 'super_admin':
                navigate('/admin/dashboard');
              break;
              case 'affiliator':
                navigate('/affiliator/dashboard');
              break;
              case 'user':
                navigate('/user/dashboard');
              break;
              default:
                navigate('/');
          }
        }
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // const fillDemoCredentials = () => {
  //   setEmail('admin@neuroscan.demo');
  //   setPassword('admin123');
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your NeuroScan account</p>
          </CardHeader>
          
          <CardContent>
          {/* Admin Demo Only */}
          {/* <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Admin Demo Account:</h3>
            <div className="space-y-2">
              <Button
                onClick={fillDemoCredentials}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <Shield size={16} className="mr-2" />
                Super Admin (admin@neuroscan.demo)
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Admin password: admin123
            </p>
          </div> */}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              icon={loading ? undefined : Mail}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};