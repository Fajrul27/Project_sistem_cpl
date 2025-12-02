
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, fetchMahasiswaList, fetchDashboardStats, fetchTranskripCPL } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, BarChart3, LogOut, TrendingUp, Settings, User as UserIcon, ChevronDown, TrendingDown, Award } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserRole } from "@/hooks/useUserRole";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cplStats, setCplStats] = useState({ total: 0, avgScore: 0 });
  const [mkStats, setMkStats] = useState({ total: 0 });
  const [studentStats, setStudentStats] = useState({ total: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const { role, loading: roleLoading } = useUserRole();

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

  useEffect(() => {
    if (!roleLoading && role) {
      if (role === 'mahasiswa') {
        fetchStudentDashboardData();
      } else {
        fetchDashboardData();
      }
    }
  }, [role, roleLoading, user]);

  const fetchStudentDashboardData = async () => {
    if (!user?.id) return;

    try {
      const response = await fetchTranskripCPL(user.id);
      const data = response.data;

      if (data && data.summary) {
        // Set basic stats for student
        setCplStats({
          total: data.summary.totalCpl || 0,
          avgScore: data.summary.avgScore || 0
        });
        // For student, MK total could be count of transkrip items or just 0 if not available
        setMkStats({ total: data.transkrip?.length || 0 });
        setStudentStats({ total: 1 }); // Just themselves

        // Map transkrip data to charts
        if (data.transkrip) {
          // Bar Chart: CPL Scores
          const cplChartData = data.transkrip.map((t: any) => ({
            name: t.cpl.kodeCpl,
            nilai: t.nilaiAkhir
          }));
          setChartData(cplChartData);

          // Performance: Top 5 CPL
          const perfData = [...cplChartData]
            .sort((a: any, b: any) => b.nilai - a.nilai)
            .slice(0, 5)
            .map((item: any) => ({
              ...item,
              status: item.nilai >= 80 ? "Excellent" : item.nilai >= 70 ? "Good" : "Need Improvement"
            }));
          setPerformanceData(perfData);

          // Distribution
          const dist = [
            { name: "Sangat Baik (>85)", value: 0 },
            { name: "Baik (70-85)", value: 0 },
            { name: "Cukup (60-70)", value: 0 },
            { name: "Kurang (<60)", value: 0 },
          ];

          data.transkrip.forEach((t: any) => {
            const n = t.nilaiAkhir;
            if (n >= 85) dist[0].value++;
            else if (n >= 70) dist[1].value++;
            else if (n >= 60) dist[2].value++;
            else dist[3].value++;
          });

          const total = data.transkrip.length;
          const distData = dist.map(d => ({
            ...d,
            percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0"
          })).filter(d => d.value > 0);

          setDistributionData(distData);
        }
      }
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      toast.error("Gagal memuat data dashboard mahasiswa");
    } finally {
      setLoading(false);
    }
  };

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
      const profileData = (userData.user as any)?.profile;
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    // Don't set loading false here, wait for data fetch
    if (!role) setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetchDashboardStats();
      const data = response.data;

      if (data) {
        // Set basic stats
        if (data.stats) {
          setCplStats({
            total: data.stats.cpl || 0,
            avgScore: data.stats.avgScore || 0
          });
          setMkStats({ total: data.stats.mataKuliah || 0 });
          setStudentStats({ total: data.stats.users || 0 });
        }

        // Set chart data directly from backend response
        setChartData(data.chartData || []);
        setTrendData(data.trendData || []);
        setDistributionData(data.distributionData || []);
        setPerformanceData(data.performanceData || []);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
    } else {
      toast.success("Logout berhasil");
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: role === 'mahasiswa' ? "CPL Saya" : "Total CPL",
      value: cplStats.total.toString(),
      description: role === 'mahasiswa' ? "CPL yang diambil" : "Capaian Pembelajaran terdaftar",
      icon: GraduationCap,
      gradient: "bg-gradient-primary",
    },
    {
      title: role === 'mahasiswa' ? "Mata Kuliah" : "Mata Kuliah",
      value: mkStats.total.toString(),
      description: role === 'mahasiswa' ? "Mata kuliah diambil" : "Mata kuliah aktif",
      icon: BookOpen,
      gradient: "bg-gradient-secondary",
    },
    {
      title: role === 'mahasiswa' ? "Status" : "Mahasiswa",
      value: role === 'mahasiswa' ? "Aktif" : studentStats.total.toString(),
      description: role === 'mahasiswa' ? "Semester 5" : "Mahasiswa terdaftar",
      icon: Users,
      gradient: "bg-gradient-primary",
    },
    {
      title: role === 'mahasiswa' ? "Rata-rata Nilai" : "Rata-rata CPL",
      value: cplStats.avgScore > 0 ? `${cplStats.avgScore}` : "N/A",
      description: "Pencapaian keseluruhan",
      icon: BarChart3,
      gradient: "bg-gradient-secondary",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <div className={`h-2 ${stat.gradient}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 group">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
        <Card>
          <CardHeader>
            <CardTitle>Rata-rata Nilai per CPL</CardTitle>
            <CardDescription>Pencapaian rata-rata setiap CPL</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Nilai" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">Belum ada data nilai</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{role === 'mahasiswa' ? "Distribusi Nilai" : "Tren Semester"}</CardTitle>
            <CardDescription>{role === 'mahasiswa' ? "Sebaran nilai CPL Anda" : "Perkembangan nilai rata-rata"}</CardDescription>
          </CardHeader>
          <CardContent>
            {role === 'mahasiswa' ? (
              distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {distributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} CPL`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data distribusi</p>
                </div>
              )
            ) : (
              trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="semester" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nilai"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Rata-rata Nilai"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data tren</p>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Nilai (Global)</CardTitle>
            <CardDescription>Sebaran kategori pencapaian</CardDescription>
          </CardHeader>
          <CardContent>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} nilai`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">Belum ada data distribusi</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 CPL Terbaik</CardTitle>
            <CardDescription>Pencapaian teratas</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <div className="space-y-4">
                {performanceData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{item.nilai}</p>
                      <p className="text-xs text-muted-foreground">nilai</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">Belum ada data performa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
