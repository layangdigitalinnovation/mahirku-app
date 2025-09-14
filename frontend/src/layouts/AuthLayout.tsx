import React from "react";
import { Link } from "react-router-dom";
import mahirkuLogo from "@/assets/Logo (1).png";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Kolom kiri - branding */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary-400 text-white p-12 relative">
        <div className="absolute top-6 left-6 flex items-center space-x-2">
          <img src={mahirkuLogo} alt="Mahirku Logo" />
          <span className="font-bold text-lg">Mahirku</span>
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-4">
            Temukan Potensi Diri Anda dengan Mahirku
          </h1>
          <p className="text-lg text-blue-100">
            Temukan potensi dan arah karir Anda melalui tes kepribadian yang
            terpercaya.
          </p>
        </div>
      </div>

      {/* Kolom kanan - form */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {children}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
