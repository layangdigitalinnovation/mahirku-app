import { Users, Brain, TrendingUp } from "lucide-react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/ui/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function SuperAdminDashboardLayout() {
  const menuItems = [
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
      icon: Brain,
      title: "Packages Management",
    },
    {
      label: "Manajemen Voucher",
      path: "/admin/dashboard/voucher",
      icon: Brain,
      title: "Voucher Management",
    },
    {
      label: "Manajemen Withdraw",
      path: "/admin/dashboard/withdraw",
      icon: Brain,
      title: "Withdraw Management",
    },
    {
      label: "Manajemen Thinking Style",
      path: "/admin/dashboard/thinking-style",
      icon: Brain,
      title: "Thinking Style Management",
    },
  ];

  return (
    <>
      <SidebarProvider>
        <div className="flex min-h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <AppSidebar menuItems={menuItems} />

          {/* Main content */}
          <main className="flex-1 w-full h-screen overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="w-full h-full p-4">
              <SidebarTrigger className="mb-4" />
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