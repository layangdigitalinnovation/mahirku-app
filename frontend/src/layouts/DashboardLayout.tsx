import { FC, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar, { AppSidebarProps } from "@/components/ui/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardLayoutProps = AppSidebarProps & {
  children: ReactNode;
};

const DashboardLayout: FC<DashboardLayoutProps> = ({ menuItems, children }) => {
  const location = useLocation();

  // cari menuItem yang path-nya cocok dengan route sekarang
  const activeItem = menuItems.find((item) => item.path === location.pathname);

  return (
    <SidebarProvider>
      {/* Bagi layout jadi 2 kolom */}
      <div className="flex min-h-screen w-full">
        {/* Kolom kiri = Sidebar */}
        <AppSidebar menuItems={menuItems} />

        {/* Kolom kanan = Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-screen-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 py-10 px-6 bg-primary-100">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeItem ? activeItem.title : "Dashboard"}
                </h1>
              </div>
            </div>

            {/* Isi halaman */}
            <div className="px-6 pb-10">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
