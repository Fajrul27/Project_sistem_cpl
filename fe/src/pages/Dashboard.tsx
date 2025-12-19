import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, BarChart3, TrendingUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePermission } from "@/contexts/PermissionContext";

import { DashboardFilterBar } from "@/components/layout/DashboardFilterBar";

import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { CompletenessCard } from "@/components/dashboard/CompletenessCard";
import { DosenAnalysisTable } from "@/components/dashboard/DosenAnalysisTable";
import { StudentEvaluationTable } from "@/components/dashboard/StudentEvaluationTable";
import { LoadingScreen } from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { role, loading: roleLoading } = useUserRole();
  const { can } = usePermission();

  const canEdit = can('edit', 'dashboard');
  const canVerify = can('verify', 'dashboard');
  const isStaff = canEdit || canVerify;

  // Filter State
  const [activeFilters, setActiveFilters] = useState<any>({});

  // Sort State
  const [cplSortMode, setCplSortMode] = useState<'default' | 'asc' | 'desc'>('default');

  const {
    loading,
    cplStats,
    mkStats,
    studentStats,
    chartData,
    trendData,
    distributionData,
    performanceData,
    alerts,
    insights,
    completeness,
    dosenAnalysis,
    studentEvaluation
  } = useDashboardStats(role, user, activeFilters);

  // Derived sorted data
  const sortedChartData = [...chartData].sort((a, b) => {
    if (cplSortMode === 'asc') return a.nilai - b.nilai;
    if (cplSortMode === 'desc') return b.nilai - a.nilai;
    // Default: Natural sort by name (e.g. CPL-2 before CPL-10)
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

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
  };

  if (roleLoading) {
    return <LoadingScreen message="Memuat akses pengguna..." fullScreen />;
  }

  // Initial loading (no data yet) could still be handled, or just show skeleton.
  // We'll let the UI render and show "0" or empty charts if loading.
  // Better: Show loading overlay if needed.

  const stats = [
    {
      title: role === 'mahasiswa' ? "CPL Tercapai" : "Total CPL",
      value: role === 'mahasiswa' ? `${cplStats.tercapai}/${cplStats.totalCurriculum}` : cplStats.total.toString(),
      description: role === 'mahasiswa' ? "CPL Tercapai" : "Capaian Pembelajaran terdaftar",
      icon: GraduationCap,
      gradient: "bg-gradient-primary",
      resource: 'cpl' // Optional resource mapping
    },
    {
      title: role === 'mahasiswa' ? "Mata Kuliah" : "Mata Kuliah",
      value: mkStats.total.toString(),
      description: role === 'mahasiswa' ? "Mata kuliah diambil" : "Mata kuliah aktif",
      icon: BookOpen,
      gradient: "bg-gradient-secondary",
      resource: 'mata_kuliah'
    },
    {
      title: role === 'mahasiswa' ? "Status" : "Mahasiswa",
      value: role === 'mahasiswa' ? "Aktif" : studentStats.total.toString(),
      description: role === 'mahasiswa' ? "Semester 5" : "Mahasiswa terdaftar",
      icon: Users,
      gradient: "bg-gradient-primary",
      resource: 'mahasiswa'
    },
    {
      title: role === 'mahasiswa' ? "Rata-rata Nilai" : "Rata-rata CPL",
      value: cplStats.avgScore > 0 ? `${cplStats.avgScore}` : "N/A",
      description: "Pencapaian keseluruhan",
      icon: BarChart3,
      gradient: "bg-gradient-secondary",
      resource: role === 'mahasiswa' ? 'transkrip_cpl' : 'analisis_cpl'
    },
  ].filter(stat => {
    // If explicit resource defined, check permission. 
    // For Mahasiswa, mostly they see "Self Data".
    // But if we want to respect Role Access settings:
    if (stat.resource === 'mata_kuliah') return can('view', 'mata_kuliah');
    if (stat.resource === 'mahasiswa' && role !== 'mahasiswa') return can('view', 'mahasiswa');
    // For CPL, Mahasiswa has 'transkrip_cpl'.
    // Keep others visible for now or map stricter.
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {isStaff && (
        <DashboardFilterBar
          role={role || ''}
          filters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      )}
      {canEdit && (
        <Card className="mb-6 animate-in fade-in slide-in-from-top-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate('/dashboard/nilai-teknik')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Input Nilai CPL
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/mata-kuliah')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Mata Kuliah Saya
            </Button>
          </CardContent>
        </Card>
      )
      }

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

      {
        isStaff && (
          <div className="grid gap-6 animate-in fade-in duration-800">
            <div className="grid gap-6 md:grid-cols-2">
              {completeness && <CompletenessCard data={completeness} />}
              <DashboardInsights insights={insights} />
            </div>
          </div>
        )
      }

      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rata-rata Nilai per CPL</CardTitle>
              <CardDescription>
                {activeFilters['cplId']
                  ? "Menampilkan tren untuk CPL terpilih (Klik lagi untuk reset)"
                  : "Klik pada batang grafik untuk melihat detail tren per CPL"}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Urutkan
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Urutkan Berdasarkan</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCplSortMode('default')}>
                  Default (Kode CPL)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCplSortMode('asc')}>
                  Nilai Terendah
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCplSortMode('desc')}>
                  Nilai Tertinggi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={sortedChartData}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                      const clickedCplName = data.activePayload[0].payload.name;
                      toast.info(`Filter trend untuk ${clickedCplName} (Fitur Drill-down)`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <defs>
                    <linearGradient id="colorCpl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                  <XAxis
                    dataKey="name"
                    className="text-xs font-medium"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 100]}
                    className="text-xs font-medium"
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar
                    dataKey="nilai"
                    fill="url(#colorCpl)"
                    name="Nilai Rata-rata"
                    radius={[6, 6, 0, 0]}
                    animationDuration={2000}
                    animationEasing="ease-out"
                    barSize={40}
                  />
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

      {
        canVerify && (
          <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
            <DosenAnalysisTable data={dosenAnalysis} />
            <StudentEvaluationTable data={studentEvaluation} />
          </div>
        )
      }

      {
        role === 'mahasiswa' && (
          <div className="grid gap-4 md:grid-cols-1 animate-in fade-in duration-1000">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 CPL Terbaik</CardTitle>
                <CardDescription>Pencapaian teratas Anda</CardDescription>
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
        )
      }
    </div >
  );
};

export default Dashboard;
