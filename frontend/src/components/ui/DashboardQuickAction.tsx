import React from 'react';
import {
  Download,
  Target,
  Zap,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { ThinkingStyleResult } from '@/services/api';

// Card components defined inline
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
    {children}
  </div>
);


const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>
    {children}
  </div>
);



interface DashboardQuickActionsProps {
  user?: { fullname: string; email?: string; };
  results: ThinkingStyleResult[];
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ user, results }) => {
  const totalTests = results.length;



  const QuickActionCard = ({
    icon: Icon,
    title,
    description,
    action,
    color = "blue",
    badge,
    to
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    title: string;
    description: string;
    action: string;
    color?: "blue" | "green" | "purple" | "orange" | "pink" | "indigo" | "amber";
    badge?: string;
    to?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
      purple: "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200",
      orange: "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200",
      pink: "bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200",
      indigo: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200",
      amber: "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
    };

    const CardWrapper = to ? 'a' : 'div';
    const cardProps = to ? { href: to } : {};

    return (
      <CardWrapper {...cardProps}>
        <Card className={`${colorClasses[color]} border-2 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden`}>
          <CardContent className="p-6">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-white/50 mr-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{title}</h3>
                    {badge && (
                      <span className="inline-block px-2 py-1 bg-white/70 rounded-full text-xs font-medium mt-1">
                        {badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm opacity-80 mb-4 line-clamp-2">{description}</p>

              <div className="flex items-center text-sm font-medium">
                <span>{action}</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 opacity-10 transform rotate-12 translate-x-4 -translate-y-2">
              <Icon className="h-24 w-24" />
            </div>
          </CardContent>
        </Card>
      </CardWrapper>
    );
  };



  return (
    <div className="space-y-6 mb-8">
      {/* Welcome Section dengan Stats */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">
                Selamat Datang, {user?.fullname} 👋
              </h2>
              <p className="text-blue-100 mb-4">
                Temukan wawasan baru tentang diri Anda. Dengan analisis mendalam, kami akan membantu mengungkap potensi tersembunyi dan memberikan panduan untuk pengembangan diri yang lebih baik
              </p>

              <div className="flex flex-wrap gap-3">
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-yellow-300" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Aksi Cepat
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={PlusCircle}
            title="Test Baru"
            description="Mulai analisis cara berfikir anda dan temukan insight terbaru tentang cara berfikir anda"
            action="Mulai Test"
            color="green"
            badge="Populer"
            to="/customer/dashboard/test"
          />

          <QuickActionCard
            icon={Target}
            title="DISC Personality Test"
            description="Temukan tipe kepribadian Anda (Dominance, Influence, Steadiness, Compliance)"
            action="Mulai Test"
            color="purple"
            badge="New"
            to="/customer/dashboard/disc-test"
          />

          <QuickActionCard
            icon={Download}
            title="Download Sertifikat"
            description="Download semua hasil test Anda dalam format PDF untuk arsip pribadi"
            action="Download"
            color="indigo"
            badge={`${totalTests} File`}
            to="/numerology/export"
          />
        </div>
      </div>

      {/* Tips Section */}
      {totalTests === 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-yellow-600 mt-1" />
              </div>
              <div className="ml-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Tips untuk Memulai</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Siapkan tanggal lahir lengkap Anda</li>
                  <li>• Simpan hasil untuk referensi masa depan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};