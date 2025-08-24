import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";


export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      const storedUser = localStorage.getItem("neuroscan-user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        switch (parsedUser.role) {
          case "super_admin":
            navigate("/admin/dashboard");
            break;
          case "user":
            navigate("/user/dashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (error: any) {
      setError(error.message || "Gagal masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Selamat Datang Kembali" subtitle="Masuk ke akun Mahirku Anda">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="text-body2 font-body font-medium text-gray-700" htmlFor="email">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Masukkan email Anda"
          required
        />
        <label className="text-body2 font-body font-medium text-gray-700" htmlFor="password">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Masukkan kata sandi"
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Masuk Sekarang"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
