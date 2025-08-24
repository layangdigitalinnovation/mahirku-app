import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import logo from "@/assets/Logo (1).png"
import { Link } from "react-router-dom";

// Menu items.


export interface MenuItem {
  label : string;
  path : string;
  icon : React.ElementType;
  title?: string;
}

export interface AppSidebarProps {
  menuItems : MenuItem[];
}


export default function AppSidebar({menuItems} : AppSidebarProps) {

  const { state } = useSidebar() // state: "expanded" | "collapsed"

  return (
    <Sidebar collapsible="icon">
 <SidebarHeader className="">
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
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
