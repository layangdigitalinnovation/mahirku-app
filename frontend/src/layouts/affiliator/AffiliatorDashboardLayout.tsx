import { Outlet } from "react-router-dom";
import DashboardLayout from "../DashboardLayout";

export default function AffiliatorDashboardLayout (){

      const menuItems = [ 
    { label: "Beranda", path: "/affiliator/dashboard/overview" },
    { label: "Tarik Saldo", path: "/affiliator/dashboard/withdraw" },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
        <Outlet/>
    </DashboardLayout>
  )

}

