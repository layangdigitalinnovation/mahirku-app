import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Brain, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { getReferralId } from '../../utils/referral';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'affiliator'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const referrerId = getReferralId();

      await register(email, password, role, referrerId, {
        username,
        fullname,
        address,
        phoneNumber,
      });

      navigate(role === 'affiliator' ? '/affiliator/dashboard' : '/user/dashboard');
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900">Join Mahirku</h2>
            <p className="text-gray-600">Create your account to get started</p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" value={fullname} onChange={setFullname} required />
              <Input label="Username" value={username} onChange={setUsername} required />
              <Input label="Address" value={address} onChange={setAddress} required />
              <Input label="Phone Number" value={phoneNumber} onChange={setPhoneNumber} required />
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Password" type="password" value={password} onChange={setPassword} required />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      role === 'user'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <User className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">User</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('affiliator')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      role === 'affiliator'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <UserPlus className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Affiliator</div>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading} icon={loading ? undefined : UserPlus}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
