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
import { Link, matchPath, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MenuItem } from "@/layouts/DashboardLayout";
import { Separator } from "./separator";

export interface AppSidebarProps {
  menuItems : MenuItem[];
}

export default function AppSidebar({menuItems} : AppSidebarProps) {
  const { state } = useSidebar() // state: "expanded" | "collapsed"
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="font-body flex justify-center items-center w-full">
        <div className="flex flex-col justify-center w-fit items-center gap-2 pt-2 pb-2 px-1">
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
      <Separator className="w-full"/>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
               const isActive = !!matchPath({ path: item.path, end: false }, location.pathname);
                
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      size={"lg"} 
                      className={`font-semibold transition-all duration-300 ${
                        isActive 
                          ? "text-primary-900 bg-primary-300! hover:bg-primary-100!" 
                          : "text-primary-700 hover:text-primary-900"
                      }`} 
                      asChild
                    >
                      <Link 
                        className={`${state === "collapsed" && "flex justify-center items-center"}`} 
                        to={item.path}
                      >
                        {item.icon && (
                          <item.icon 
                            className={`w-5 h-5 ${
                              isActive ? "text-primary-600" : ""
                            }`} 
                          />
                        )}
                        {state === "expanded" && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
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