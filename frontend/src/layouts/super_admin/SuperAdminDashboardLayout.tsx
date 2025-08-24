import { Users, Brain,  TrendingUp } from "lucide-react";
import DashboardLayout from "../DashboardLayout";
import { Outlet } from "react-router-dom";

export default function SuperAdminDashboardLayout() {
  const menuItems = [
    { label: "Overview", path: "/admin/dashboard/overview", icon: TrendingUp, title : "Dashboard Overview" },
    { label: "Users", path: "/admin/dashboard/users", icon: Users, title : "Users Management" },
    { label : "Manajemen Paket", path: "/admin/dashboard/packages", icon: Brain, title : "Packages Management" },
    { label : "Manajemen Voucher", path: "/admin/dashboard/voucher", icon: Brain, title : "Voucher Management" },
    { label : "Manajemen Transaksi", path: "/admin/dashboard/transactions", icon: Brain, title : "Transactions Management" },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  );
}
