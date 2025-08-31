import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";

export default function CustomerDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/customer/dashboard/overview" },
    { label: "Daftar User", path: "/customer/dashboard/users" },
    { label : "Tes", path: "/customer/dashboard/test" }
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}

