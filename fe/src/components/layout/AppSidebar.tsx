import { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Users,
  ClipboardList,
  ChevronRight,
  School,
  Database,
  UserCog,
  BookCheck,
  LayoutDashboard,
  Shield,
  Settings
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserRole, type UserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";

import { MENU_ITEMS } from "@/constants/menu";

export function AppSidebar() {
  const { open, isMobile, openMobile, toggleSidebar, setOpen } = useSidebar();
  const location = useLocation();
  const { role } = useUserRole();

  // Define hierarchical menu structure
  const menuStructure = useMemo(() => {
    return MENU_ITEMS;
  }, []);


  // Filter menu based on role


  const { can } = usePermission();

  // Filter menu based on role AND permission
  const filteredMenu = useMemo(() => {
    if (!role) return [];

    return menuStructure.map(group => {
      // If it's a single link (Dashboard)
      if (!group.items) {
        // If resource is defined, use permission check strictly. Otherwise fallback to roles.
        const isVisible = group.resource
          ? can('view', group.resource)
          : group.roles.includes(role as UserRole);

        return isVisible ? group : null;
      }

      // If it's a group, filter its items
      const visibleItems = group.items.filter(item => {
        // If resource is defined, use permission check strictly. Otherwise fallback to roles.
        return item.resource
          ? can('view', item.resource)
          : item.roles.includes(role as UserRole);
      });

      // If user has access to group AND it has visible items, show it
      // For the group header itself, we check if it has a resource (rare) or if at least one child is visible
      // OR if the group itself has strict role requirements (fallback)
      const isGroupVisible = (group.resource ? can('view', group.resource) : group.roles.includes(role as UserRole))
        && visibleItems.length > 0;

      if (isGroupVisible) {
        return { ...group, items: visibleItems };
      }

      return null;
    }).filter(Boolean);
  }, [menuStructure, role, can]);

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
        <div className="flex h-14 items-center border-b border-sidebar-border/40 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              SC
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold leading-tight tracking-tight text-sidebar-foreground">
                Sistem CPL
              </span>
              <span className="text-[11px] text-sidebar-foreground/60 leading-tight">
                Pengukuran CPL
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2 group-data-[collapsible=icon]:px-0">
          <SidebarMenu>
            {filteredMenu.map((item: any) => (
              <div key={item.title}>
                {/* Single Item (Dashboard) */}
                {!item.items && (
                  open ? (
                    // Expanded: show normal link with text
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={item.url.includes('?') ? (location.pathname + location.search) === item.url : location.pathname === item.url}
                        asChild
                        tooltip={item.title}
                      >
                        <NavLink to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : (
                    // Collapsed: show centered icon button
                    <SidebarMenuItem>
                      <NavLink to={item.url}>
                        <button
                          className={`peer/menu-button flex w-full items-center justify-center rounded-md p-2 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ${(item.url.includes('?') ? (location.pathname + location.search) === item.url : location.pathname === item.url)
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : ''
                            }`}
                          title={item.title}
                          aria-label={item.title}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                        </button>
                      </NavLink>
                    </SidebarMenuItem>
                  )
                )}

                {/* Collapsible Group */}
                {item.items && (
                  open ? (
                    // When sidebar is open, show collapsible menu
                    <Collapsible className="group/collapsible" asChild defaultOpen={false}>
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
                                  isActive={subItem.url.includes('?') ? (location.pathname + location.search) === subItem.url : location.pathname === subItem.url}
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
                  ) : (
                    // When sidebar is collapsed, show popover with submenu
                    <SidebarMenuItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "peer/menu-button flex w-full items-center justify-center rounded-md p-2 h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                              // Highlight parent if any submenu is active
                              item.items?.some((subItem: any) =>
                                subItem.url.includes('?')
                                  ? (location.pathname + location.search) === subItem.url
                                  : location.pathname === subItem.url
                              ) && "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                            title={item.title}
                            aria-label={item.title}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="right"
                          align="start"
                          sideOffset={8}
                          className="w-56 p-2 bg-sidebar border-sidebar-border"
                        >
                          <div className="space-y-1">
                            <div className="px-2 py-1.5 text-sm font-semibold text-sidebar-foreground">
                              {item.title}
                            </div>
                            <div className="space-y-0.5">
                              {item.items.map((subItem: any) => (
                                <NavLink
                                  key={subItem.title}
                                  to={subItem.url}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                                      isActive || (subItem.url.includes('?') ? (location.pathname + location.search) === subItem.url : location.pathname === subItem.url)
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )
                                  }
                                >
                                  <span>{subItem.title}</span>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </SidebarMenuItem>
                  )
                )}
              </div>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

