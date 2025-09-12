import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import { BookOpenCheck, HomeIcon, UserIcon } from "lucide-react";

export default function CustomerDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/customer/dashboard/overview", icon : HomeIcon },
    { label: "Daftar User", path: "/customer/dashboard/users", icon : UserIcon },
    { label : "Tes", path: "/customer/dashboard/test", icon : BookOpenCheck }
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}

