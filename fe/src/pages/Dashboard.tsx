
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, fetchMahasiswaList } from "@/lib/api-client";
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
  const { role } = useUserRole();

  useEffect(() => {
    checkUser();
    fetchDashboardData();

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
      const profileData = (userData.user as any)?.profile;
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }

    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch CPL stats
      const { data: cplData, error: cplError } = await (supabase.from("cpl").select("*") as any);
      if (!cplError && cplData) {
        setCplStats({ total: cplData.length, avgScore: 0 });
      }

      // Create CPL Map for lookup
      const cplMap = new Map();
      if (cplData) {
        cplData.forEach((cpl: any) => {
          cplMap.set(cpl.id, cpl);
        });
      }

      // Fetch Mata Kuliah stats
      const { data: mkData, error: mkError } = await (supabase.from("mata_kuliah").select("*") as any);
      if (!mkError && mkData) {
        setMkStats({ total: mkData.length });
      }

      // Fetch student stats
      try {
        const studentData = await fetchMahasiswaList();
        if (studentData && studentData.data) {
          setStudentStats({ total: studentData.data.length });
        }
      } catch (error) {
        console.error("Error fetching student stats:", error);
      }

      // Fetch CPL achievement data for charts
      // Note: Our custom API client doesn't support joins like supabase-js
      // So we fetch raw data and map it manually
      const { data: nilaiData, error: nilaiError } = await (supabase
        .from("nilai_cpl")
        .select("*") as any);

      if (!nilaiError && nilaiData) {
        // Process data for bar chart (average per CPL)
        const cplAverage: any = {};
        nilaiData.forEach((item: any) => {
          // Map cplId to CPL data using the map we created
          const cpl = cplMap.get(item.cplId || item.cpl_id);
          const kode = cpl?.kodeCpl || cpl?.kode_cpl || "Unknown";

          if (!cplAverage[kode]) {
            cplAverage[kode] = { total: 0, count: 0, kode };
          }
          cplAverage[kode].total += parseFloat(item.nilai);
          cplAverage[kode].count += 1;
        });

        const chartData = Object.values(cplAverage).map((item: any) => ({
          name: item.kode,
          nilai: parseFloat((item.total / item.count).toFixed(2)),
        }));
        setChartData(chartData);

        // Calculate overall average
        if (chartData.length > 0) {
          const avg = chartData.reduce((sum: number, item: any) => sum + item.nilai, 0) / chartData.length;
          setCplStats({ total: cplData?.length || 0, avgScore: parseFloat(avg.toFixed(2)) });
        }

        // Process data for trend line (semester-wise)
        const semesterAvg: any = {};
        nilaiData.forEach((item: any) => {
          const sem = item.semester;
          if (!semesterAvg[sem]) {
            semesterAvg[sem] = { total: 0, count: 0, semester: sem };
          }
          semesterAvg[sem].total += parseFloat(item.nilai);
          semesterAvg[sem].count += 1;
        });

        const trendData = Object.values(semesterAvg)
          .map((item: any) => ({
            semester: `Sem ${item.semester} `,
            nilai: parseFloat((item.total / item.count).toFixed(2)),
          }))
          .sort((a: any, b: any) => a.semester.localeCompare(b.semester));
        setTrendData(trendData);

        // Process distribution data (range based)
        const ranges = {
          excellent: { min: 85, max: 100, count: 0, label: "Sangat Baik (85-100)" },
          good: { min: 70, max: 84, count: 0, label: "Baik (70-84)" },
          fair: { min: 60, max: 69, count: 0, label: "Cukup (60-69)" },
          poor: { min: 0, max: 59, count: 0, label: "Kurang (<60)" }
        };

        nilaiData.forEach((item: any) => {
          const nilai = parseFloat(item.nilai);
          if (nilai >= ranges.excellent.min) ranges.excellent.count++;
          else if (nilai >= ranges.good.min) ranges.good.count++;
          else if (nilai >= ranges.fair.min) ranges.fair.count++;
          else ranges.poor.count++;
        });

        const distribution = Object.values(ranges).map((r: any) => ({
          name: r.label,
          value: r.count,
          percentage: ((r.count / nilaiData.length) * 100).toFixed(1)
        }));
        setDistributionData(distribution);

        // Performance data by CPL (top 5)
        const performance = chartData
          .sort((a: any, b: any) => b.nilai - a.nilai)
          .slice(0, 5)
          .map((item: any) => ({
            ...item,
            status: item.nilai >= 80 ? "Excellent" : item.nilai >= 70 ? "Good" : "Need Improvement"
          }));
        setPerformanceData(performance);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
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
      title: "Total CPL",
      value: cplStats.total.toString(),
      description: "Capaian Pembelajaran terdaftar",
      icon: GraduationCap,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Mata Kuliah",
      value: mkStats.total.toString(),
      description: "Mata kuliah aktif",
      icon: BookOpen,
      gradient: "bg-gradient-secondary",
    },
    {
      title: "Mahasiswa",
      value: studentStats.total.toString(),
      description: "Mahasiswa terdaftar",
      icon: Users,
      gradient: "bg-gradient-primary",
    },
    {
      title: "Rata-rata CPL",
      value: cplStats.avgScore > 0 ? `${cplStats.avgScore}% ` : "N/A",
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
            <div className={`h - 2 ${stat.gradient} `} />
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
                  <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Rata-rata Nilai" />
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
            <CardTitle>Tren Semester</CardTitle>
            <CardDescription>Perkembangan nilai rata-rata</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
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
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Nilai</CardTitle>
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
                    label={({ name, percentage }) => `${name}: ${percentage}% `}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {distributionData.map((entry: any, index: number) => (
                      <Cell key={`cell - ${index} `} fill={['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'][index]} />
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
