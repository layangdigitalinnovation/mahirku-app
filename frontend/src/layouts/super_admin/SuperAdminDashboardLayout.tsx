import { Users, Brain,  TrendingUp } from "lucide-react";
import DashboardLayout from "../DashboardLayout";
import { Outlet } from "react-router-dom";

export default function SuperAdminDashboardLayout() {
  const menuItems = [
    { label: "Overview", path: "/admin/dashboard/overview", icon: TrendingUp, title : "Dashboard Overview" },
    { label: "Users", path: "/admin/dashboard/users", icon: Users, title : "Users Management" },
    { label : "Manajemen Paket", path: "/admin/dashboard/packages", icon: Brain, title : "Packages Management" },
    { label : "Manajemen Voucher", path: "/admin/dashboard/voucher", icon: Brain, title : "Voucher Management" },
    { label : "Manajemen Withdraw", path: "/admin/dashboard/withdraw", icon: Brain, title : "Withdraw Management" },
    { label : "Manajemen Thinking Style", path: "/admin/dashboard/thinking-style", icon: Brain, title : "Thinking Style Management" },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  );
}
