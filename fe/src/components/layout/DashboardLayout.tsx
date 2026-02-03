import {
  ReactNode,
  useEffect,
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/lib/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useUserRole } from "@/hooks/useUserRole";
import { useImpersonation } from "@/hooks/useImpersonation";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardLayoutProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

interface DashboardPageMeta {
  title?: string;
  description?: string;
  actions?: ReactNode;
}

interface DashboardLayoutContextValue {
  setMeta: (meta: DashboardPageMeta) => void;
  resetMeta: () => void;
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(
  null
);

export function useDashboardLayoutContext() {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error(
      "useDashboardLayoutContext must be used within DashboardLayout"
    );
  }
  return context;
}

export function DashboardLayout({ children, title, description, actions }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useUserRole();
  const { isImpersonating, originalAdmin, returnToAdmin, loading: impersonationLoading } = useImpersonation();
  const [pageMeta, setPageMeta] = useState<DashboardPageMeta>({
    title,
    description,
    actions,
  });

  useEffect(() => {
    setPageMeta({ title, description, actions });
  }, [title, description, actions]);

  const setMeta = useCallback((meta: DashboardPageMeta) => {
    setPageMeta(meta);
  }, []);

  const resetMeta = useCallback(() => {
    setPageMeta({ title, description, actions });
  }, [title, description, actions]);

  const contextValue = useMemo(
    () => ({
      setMeta,
      resetMeta,
    }),
    [setMeta, resetMeta]
  );

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    // Fetch user profile from backend
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setProfile(userData.user.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    setLoading(false);
  };


  if (loading) {
    return <LoadingScreen message="Memuat dashboard..." />;
  }

  const content = children ?? <Outlet />;

  return (
    <DashboardLayoutContext.Provider value={contextValue}>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          {/* Sidebar */}
          <div className="print:hidden">
            <AppSidebar />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Impersonation Banner */}
            {isImpersonating && originalAdmin && (
              <div className="print:hidden bg-warning border-b border-warning-foreground/20">
                <Alert className="rounded-none border-0 bg-transparent items-start">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm">
                      Anda sedang login sebagai user lain. Admin asli: <strong>{originalAdmin.email}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={returnToAdmin}
                      disabled={impersonationLoading}
                      className="ml-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {impersonationLoading ? 'Loading...' : 'Kembali ke Admin'}
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navbar */}
            <div className="print:hidden">
              <DashboardNavbar
                title={pageMeta.title}
                actions={pageMeta.actions}
                user={user}
                profile={profile}
                role={role}
              />
            </div>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-3 py-4 sm:p-4 md:p-6 lg:p-8">
                {pageMeta.description && (
                  <div className="mb-6 print:hidden">
                    <p className="text-sm md:text-base text-muted-foreground">
                      {pageMeta.description}
                    </p>
                  </div>
                )}
                <div className="">
                  {content}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardLayoutContext.Provider>
  );
}

interface DashboardPageProps extends DashboardPageMeta {
  children: ReactNode;
}

export function DashboardPage({ title, description, actions, children }: DashboardPageProps) {
  const { setMeta, resetMeta } = useDashboardLayoutContext();

  useEffect(() => {
    setMeta({ title, description, actions });
    return () => {
      resetMeta();
    };
  }, [title, description, actions, setMeta, resetMeta]);

  return <>{children}</>;
}
