import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";
import { BookOpenCheck, HomeIcon, UserIcon, ScrollText } from "lucide-react";

export default function CustomerDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/customer/dashboard/overview", icon : HomeIcon },
    { label: "Daftar User", path: "/customer/dashboard/users", icon : UserIcon },
    { label : "Tes", path: "/customer/dashboard/test", icon : BookOpenCheck },
    { label : "Invoice", path: "/customer/dashboard/invoice", icon : ScrollText },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}

