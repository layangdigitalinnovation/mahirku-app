import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import { Home, Users } from "lucide-react";

export default function MitraDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/mitra/dashboard/overview", icon: Home },
    { label: "Anggota", path: "/mitra/dashboard/members", icon: Users },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}
