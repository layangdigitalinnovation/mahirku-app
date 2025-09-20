import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import { Home, Wallet } from "lucide-react";

export default function AffiliatorDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/affiliator/dashboard/overview", icon: Home },
    { label: "Tarik Saldo", path: "/affiliator/dashboard/withdraw", icon: Wallet },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}

