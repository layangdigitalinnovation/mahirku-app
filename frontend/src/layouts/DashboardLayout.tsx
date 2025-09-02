import { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/Logo (1).png";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { useMeQuery } from "@/hooks/useAuthQuery";

export interface MenuItem {
  label: string;
  path: string;
  icon?: React.ElementType;
  title?: string;
}

type DashboardLayoutProps = {
  menuItems: MenuItem[];
  children: ReactNode;
};

const DashboardLayout: FC<DashboardLayoutProps> = ({ menuItems, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data } = useMeQuery();
 const user = data?.user
  // cari menuItem aktif berdasarkan path sekarang
  const activeItem = menuItems.find((item) => item.path === location.pathname);

  const handleLogout = () => {
    // TODO: implement logout sesuai logic auth Anda
    console.log("Logout clicked");
    logout();

    navigate("/login");
    toast.success("Logout berhasil");
  };

  return (
    <div className="bg-gray-50 font-heading">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full bg-primary-600 text-body2 text-white z-50">
        <div className="mx-auto flex justify-between items-center px-6 h-18 border-b-2 border-neutral-400">
          {/* Left = Navigation */}
          <nav className="flex mx-auto justify-between items-center gap-6 h-full container max-w-screen-xl">
            <div className="flex gap-28 items-center h-full">
              <div className="flex gap-2 items-center">
                <img src={logo} alt="logo" />
                <h1 className="text-heading6 font-heading font-bold">
                  Mahirku
                </h1>
              </div>
              <div className="flex gap-6 h-full">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative min-w-fit w-18 text-center justify-center h-full flex items-center gap-2 font-medium transition-colors ${
                      activeItem === item
                        ? "text-white"
                        : "text-primary-200 hover:text-white"
                    }`}
                  >
                    {/* Icon jika ada */}
                    {item.icon && <item.icon className="w-5 h-5" />}
                    {item.label}
                    {/* Active Indicator */}
                    {item.path === location.pathname && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 -bottom-1 h-[5px] w-full bg-secondary-300 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right = Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none focus:outline-none">
                  <Avatar className="cursor-pointer ring-2 ring-white hover:ring-primary-200 transition-all">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary-900 text-white">{user?.fullname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-[280px] bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-[9999]"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullname}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-red-50 focus:bg-red-50 px-4 py-2 text-sm text-red-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4">🚪</div>
                      Logout
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>

      {/* Page Content with Animation */}
      <main className="w-full mx-auto min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-indigo-50">
        {/* Isi Halaman */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;