/* eslint-disable @typescript-eslint/no-explicit-any */
import { Users,  TrendingUp, Package, Gift, Wallet, Lightbulb, List } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/ui/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export interface MenuItem {
  label: string;
  path: string;
  icon: any;
  title: string;
}

export default function SuperAdminDashboardLayout() {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      label: "Ringkasan",
      path: "/admin/dashboard/overview",
      icon: TrendingUp,
      title: "Dashboard Overview",
    },
    {
      label: "Pengguna",
      path: "/admin/dashboard/users",
      icon: Users,
      title: "Users Management",
    },
    {
      label: "Manajemen Paket",
      path: "/admin/dashboard/packages",
      icon: Package,
      title: "Manajemen Paket",
    },
    {
      label: "Manajemen Voucher",
      path: "/admin/dashboard/voucher",
      icon: Gift,
      title: "Manajemen Voucher",
    },
    {
      label: "Manajemen Withdraw",
      path: "/admin/dashboard/withdraw",
      icon: Wallet,
      title: "Manajemen Withdraw",
    },
    {
      label: "Manajemen Thinking Style",
      path: "/admin/dashboard/thinking-style",
      icon: Lightbulb,
      title: "Manajemen Thinking Style",
    },
    {
      label: "Manajemen Invoice",
      path: "/admin/dashboard/invoice",
      icon: List,
      title: "Manajemen Invoice",
    }
  ];

  // Get current page title based on location
const getCurrentPageTitle = () => {
  // Cari menu item yang path-nya paling panjang dan tetap cocok dengan pathname
  const currentItem = menuItems
    .filter(item => location.pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]; // ambil yang paling spesifik
  
  return currentItem ? currentItem.title : "Dashboard";
};

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <AppSidebar menuItems={menuItems} />

          {/* Main content */}
          <main className="flex-1 w-full h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full h-full">
              <div className="w-full py-8 px-6 flex items-center justify-between mb-6 bg-white shadow-md">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="border-l border-gray-300 h-8"></div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {getCurrentPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {location.pathname.split('/').slice(1).join(' / ')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-full">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}