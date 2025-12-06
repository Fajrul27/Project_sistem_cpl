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
              <div className="container mx-auto p-4 md:p-6 lg:p-8">
                {pageMeta.description && (
                  <div className="mb-6 print:hidden">
                    <p className="text-sm md:text-base text-muted-foreground">
                      {pageMeta.description}
                    </p>
                  </div>
                )}
                <div className="animate-in fade-in duration-500">
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
