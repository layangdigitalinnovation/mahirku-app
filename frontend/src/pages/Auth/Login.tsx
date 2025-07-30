import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import mahirkuLogo from '../../assets/logo_mahirku.png';

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
          case 'user':
            navigate('/user/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Tombol Kembali ke Beranda */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <img src={mahirkuLogo} className="w-32 mx-auto" alt="Mahirku Logo" />
            <h2 className="text-3xl font-bold text-gray-900">Selamat Datang Kembali</h2>
            <p className="text-gray-600">Masuk ke akun Mahirku Anda</p>
          </CardHeader>

          <CardContent>
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
                placeholder="Masukkan email Anda"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Masukkan kata sandi"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                icon={loading ? undefined : Mail}
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
