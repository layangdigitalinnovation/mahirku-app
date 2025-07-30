import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { getReferralId } from '../../utils/referral';
import mahirkuLogo from '../../assets/logo_mahirku.png';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      const referrerId = getReferralId();

      await register(email, password, 'user', referrerId, {
        username,
        fullname,
        address,
        phoneNumber,
      });

      navigate('/user/dashboard');
    } catch (error: any) {
      setError(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center px-4 py-12 relative">
      {/* Tombol kembali ke beranda */}
      <Link
        to="/"
        className="absolute top-4 left-4 flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <img src={mahirkuLogo} className="w-32 mx-auto" alt="Mahirku Logo" />
            <h2 className="text-2xl font-bold text-gray-900">Daftar Akun Baru</h2>
            <p className="text-gray-600 text-sm">Gabung dan mulai belajar bersama Mahirku</p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Nama Lengkap" value={fullname} onChange={setFullname} required />
              <Input label="Username" value={username} onChange={setUsername} required />
              <Input label="Alamat" value={address} onChange={setAddress} required />
              <Input label="No. HP" value={phoneNumber} onChange={setPhoneNumber} required />
              <Input label="Email" type="email" value={email} onChange={setEmail} required />
              <Input label="Kata Sandi" type="password" value={password} onChange={setPassword} required />
              <Input
                label="Konfirmasi Sandi"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              <Button type="submit" className="w-full mt-4" icon={loading ? undefined : UserPlus} disabled={loading}>
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Masuk di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
