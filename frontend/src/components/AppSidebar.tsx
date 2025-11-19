import { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, FileText, GraduationCap, Home, Link2, Settings, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";

type MenuItem = {
  title: string;
  url: string;
  icon: typeof Home;
  roles: UserRole[];
};

const MENU_ITEMS: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ["admin", "dosen", "mahasiswa"] },
  { title: "CPL", url: "/dashboard/cpl", icon: GraduationCap, roles: ["admin", "dosen"] },
  { title: "Mata Kuliah", url: "/dashboard/mata-kuliah", icon: BookOpen, roles: ["admin"] },
  { title: "Mapping CPL", url: "/dashboard/cpl-mapping", icon: Link2, roles: ["admin"] },
  { title: "Mahasiswa", url: "/dashboard/mahasiswa", icon: Users, roles: ["admin", "dosen"] },
  { title: "Pengguna", url: "/dashboard/users", icon: Users, roles: ["admin"] },
  { title: "Input Nilai", url: "/dashboard/nilai", icon: FileText, roles: ["dosen"] },
  { title: "Analisis CPL", url: "/dashboard/analisis", icon: BarChart3, roles: ["admin", "dosen", "mahasiswa"] },
  { title: "Pengaturan", url: "/dashboard/settings", icon: Settings, roles: ["admin", "dosen", "mahasiswa"] },
];

export function AppSidebar() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { role } = useUserRole();

  const visibleMenuItems = useMemo(
    () => (role ? MENU_ITEMS.filter((item) => item.roles.includes(role)) : []),
    [role]
  );

  // Auto-tutup sidebar di mobile setiap kali ganti halaman
  useEffect(() => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  }, [isMobile, openMobile, location.pathname, toggleSidebar]);

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Brand / Logo */}
        <div className="flex h-14 items-center border-b border-sidebar-border/40 px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              SC
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground">
                  Sistem CPL
                </span>
                <span className="text-[11px] text-sidebar-foreground/60 leading-tight">
                  Pengukuran CPL
                </span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2 py-3">
          <SidebarGroupLabel
            className={cn(
              "px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-sidebar-foreground/50",
              !open && "text-center px-0",
            )}
          >
            {open ? "Navigasi" : "⋯"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 space-y-1 px-0.5">
              {visibleMenuItems.map((item) => {
                const isDashboardRoot = item.url === "/dashboard";
                const pathname = location.pathname;
                const isActive = isDashboardRoot
                  ? pathname === "/dashboard"
                  : pathname === item.url || pathname.startsWith(`${item.url}/`);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="default"
                      className="w-full transition-none"
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
