import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, Settings, User, ChevronDown, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/api-client";
import { useTheme } from "@/components/ThemeProvider";

interface NavbarProps {
  title?: string;
  actions?: React.ReactNode;
  user: any;
  profile: any;
  role?: string;
}

export function DashboardNavbar({ title, actions, user, profile, role }: NavbarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Navbar baru dengan design yang lebih bersih
  console.log("🎨 DashboardNavbar loaded!", { title, user: user?.email, role });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logout berhasil");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal logout");
    }
  };

  const getUserInitial = () => {
    if (profile?.namaLengkap) {
      return profile.namaLengkap.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    return profile?.namaLengkap || user?.email?.split("@")[0] || "User";
  };

  const getUserIdentifier = () => {
    if (profile?.nim) return `NIM: ${profile.nim}`;
    if (profile?.nip) return `NIP: ${profile.nip}`;
    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1 hover:bg-accent rounded-md transition-colors" />

        {/* Page Title */}
        <div className="flex-1 overflow-hidden">
          {title && (
            <h1 className="text-lg md:text-xl font-semibold tracking-tight truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="hidden sm:flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Theme Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full mr-1 hover:bg-accent"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 gap-2 rounded-full px-2 md:px-3 hover:bg-accent"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-medium">
                  {getUserInitial()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-left">
                <span className="text-sm font-medium leading-none">
                  {getDisplayName()}
                </span>
                <span className="text-xs text-muted-foreground leading-none mt-1 capitalize">
                  {role || "User"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {getUserIdentifier() && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {getUserIdentifier()}
                  </p>
                )}
                {role && (
                  <div className="pt-1">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                      {role}
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/dashboard/profile")}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/dashboard/settings")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Pengaturan</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/15 focus:bg-red-500/15 dark:focus:bg-red-400/20 active:bg-red-500/20 dark:active:bg-red-400/25"
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Actions */}
      {actions && (
        <div className="flex sm:hidden items-center gap-2 px-4 pb-3 border-t pt-3">
          {actions}
        </div>
      )}
    </header>
  );
}
