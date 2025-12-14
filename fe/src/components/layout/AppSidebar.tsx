import { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Settings,
  Users,
  ClipboardList,
  ChevronRight,
  School,
  Database,
  UserCog,
  BookCheck,
  LayoutDashboard
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";

export function AppSidebar() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { role } = useUserRole();

  // Define hierarchical menu structure
  const menuStructure = useMemo(() => {
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "dosen", "mahasiswa", "kaprodi"] as UserRole[],
      },
      {
        title: "Master Data & Perencanaan",
        icon: Database,
        roles: ["admin", "kaprodi", "dosen", "mahasiswa"] as UserRole[],
        items: [
          { title: "Visi & Misi", url: "/dashboard/visi-misi", roles: ["admin", "dosen", "kaprodi", "mahasiswa"] },
          { title: "Profil Lulusan", url: "/dashboard/profil-lulusan", roles: ["admin", "dosen", "kaprodi", "mahasiswa"] },
          { title: "CPL", url: "/dashboard/cpl", roles: ["admin", "dosen", "kaprodi"] },
          { title: "Mata Kuliah", url: "/dashboard/mata-kuliah", roles: ["admin", "kaprodi", "dosen"] },
        ]
      },
      {
        title: "Persiapan & Pembelajaran",
        icon: School,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
          { title: "CPMK & Mapping", url: "/dashboard/cpmk", roles: ["admin", "dosen", "kaprodi"] },

          { title: "Input Nilai Teknik", url: "/dashboard/nilai-teknik", roles: ["dosen"] },
          // Mahasiswa sees questionnaires here as part of learning process/feedback? Or separately?
          // Keeping consistent with previous "Pembelajaran" group
          { title: "Isi Kuesioner CPL", url: "/dashboard/kuesioner", roles: ["mahasiswa"] },
        ]
      },
      {
        title: "Manajemen Pengguna",
        icon: UserCog,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[], // Mahasiswa usually doesn't need to manage users
        items: [
          { title: "Dosen Pengampu", url: "/dashboard/dosen-pengampu", roles: ["admin"] },
          { title: "Data Kaprodi", url: "/dashboard/kaprodi-data", roles: ["admin"] },
          { title: "Mahasiswa", url: "/dashboard/mahasiswa", roles: ["admin", "dosen", "kaprodi"] },
          { title: "Pengguna Sistem", url: "/dashboard/users", roles: ["admin"] },
        ]
      },
      {
        title: "Laporan & Evaluasi",
        icon: BarChart3,
        roles: ["admin", "dosen", "kaprodi", "mahasiswa"] as UserRole[],
        items: [
          { title: "Transkrip CPL", url: "/dashboard/transkrip-cpl", roles: ["admin", "dosen", "kaprodi", "mahasiswa"] },
          { title: "Analisis CPL", url: "/dashboard/analisis", roles: ["admin", "dosen", "kaprodi"] },
          { title: "Rekap Kuesioner", url: "/dashboard/rekap-kuesioner", roles: ["admin", "kaprodi"] },
        ]
      },
      {
        title: "Sistem",
        icon: Settings,
        roles: ["admin", "dosen", "kaprodi"] as UserRole[],
        items: [
          { title: "Pengaturan", url: "/dashboard/settings", roles: ["admin", "dosen", "kaprodi"] },
        ]
      }
    ];
  }, [role]);

  // Filter menu based on role
  const filteredMenu = useMemo(() => {
    if (!role) return [];

    return menuStructure.map(group => {
      // If it's a single link (Dashboard)
      if (!group.items) {
        return group.roles.includes(role as UserRole) ? group : null;
      }

      // If it's a group, filter its items
      const visibleItems = group.items.filter(item => item.roles.includes(role as UserRole));

      // If user has access to group AND it has visible items, show it
      if (group.roles.includes(role as UserRole) && visibleItems.length > 0) {
        return { ...group, items: visibleItems };
      }

      return null;
    }).filter(Boolean);
  }, [menuStructure, role]);

  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  }, [location.pathname]);

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Brand / Logo */}
        <div className="flex h-14 items-center border-b border-sidebar-border/40 px-3">
          <div className={cn("flex items-center gap-2", !open && "w-full justify-center")}>
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

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <SidebarMenu>
            {filteredMenu.map((item: any) => (
              <div key={item.title}>
                {/* Single Item (Dashboard) */}
                {!item.items && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location.pathname === item.url}
                      asChild
                      tooltip={item.title}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Collapsible Group */}
                {item.items && (
                  <Collapsible defaultOpen className="group/collapsible" asChild>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem: any) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === subItem.url}
                              >
                                <NavLink to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}
              </div>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

