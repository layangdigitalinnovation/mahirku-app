

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import logo from "@/assets/Logo (1).png"
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MenuItem } from "@/layouts/DashboardLayout";

// Menu items.




export interface AppSidebarProps {
  menuItems : MenuItem[];
}


export default function AppSidebar({menuItems} : AppSidebarProps) {

  const { state } = useSidebar() // state: "expanded" | "collapsed"

  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
 <SidebarHeader className="font-body">
  <div className="flex w-fit items-center justify-center gap-2 pt-2 pb-12 px-1">
    <img
      src={logo}
      alt="Logo Mahirku"
      className="flex-shrink-0"
    />
    {state === "expanded" && (
      <h1 className="text-heading6 font-heading font-bold text-primary-900 truncate">
        Mahirku
      </h1>
    )}
  </div>
</SidebarHeader>


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton size={"lg"} className="text-primary-900 font-semibold" asChild>
                    <Link to={item.path}>
                      
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
                  <SidebarFooter>
              <SidebarMenuButton onClick={logout}>
                <LogOut/>
                Logout
              </SidebarMenuButton>
            </SidebarFooter>
    </Sidebar>
  )
}
