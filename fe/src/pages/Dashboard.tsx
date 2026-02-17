import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, BarChart3, TrendingUp, ChevronDown, Star, History, Trophy } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
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
  const { role, profile: contextProfile, userId, loading: roleLoading } = useUserRole();
  const { can } = usePermission();

  const canEdit = can('edit', 'dashboard');
  const canVerify = can('verify', 'dashboard');
  const isStaff = canEdit || canVerify;

  // Handle case where profile might be nested or direct
  const profileData = contextProfile?.userId ? contextProfile : (contextProfile || user?.profile || user);

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
    recentAssessments,
    studentInfo,
    alerts,
    insights,
    completeness,
    dosenAnalysis,
    studentEvaluation,
    profilLulusanData
  } = useDashboardStats(role, profileData, activeFilters);

  const displaySemester = studentInfo?.profile?.semester || profileData?.semester || contextProfile?.semester || user?.profile?.semester || '-';

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
      if (session?.user) {
        setUser(session.user);
      }
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
      description: role === 'mahasiswa' ? `Semester ${displaySemester}` : "Mahasiswa terdaftar",
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
            <CardTitle className="text-base md:text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              onClick={() => navigate('/dashboard/nilai-teknik')}
              className="w-full sm:w-auto justify-start"
            >
              <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Input Nilai CPL</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/mata-kuliah')}
              className="w-full sm:w-auto justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Mata Kuliah Saya</span>
            </Button>
          </CardContent>
        </Card>
      )
      }

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>
                {role === 'mahasiswa' ? "Kecocokan Profil Lulusan" : "Tren Semester"}
              </CardTitle>
              <CardDescription className="text-xs">
                {role === 'mahasiswa'
                  ? "Analisis kesiapan karier berdasarkan kompetensi akademik"
                  : "Perkembangan nilai rata-rata kolektif"}
              </CardDescription>
            </div>
            {role === 'mahasiswa' && (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
              </div>
            )}
          </CardHeader>
          <CardContent>
            {role === 'mahasiswa' ? (
              profilLulusanData.length > 0 ? (
                <div className="space-y-6 pt-2">
                  {/* Hero Match for Top Result - Refined & Tidied */}
                  {[...profilLulusanData].sort((a, b) => b.nilai - a.nilai).slice(0, 1).map((top, i) => (
                    <div key={i} className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-card border border-primary/20 shadow-sm overflow-hidden group/hero">
                      {/* Subtle Background Accent */}
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/hero:opacity-20 transition-opacity pointer-events-none">
                        <Trophy className="h-16 w-16 text-primary" fill="currentColor" />
                      </div>

                      <div className="relative">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-primary/15 text-primary uppercase tracking-[0.15em] mb-4">
                          Best Fit Recommendation
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <h4 className="text-2xl font-black tracking-tight text-foreground leading-none">{top.name}</h4>
                            <p className="text-xs text-muted-foreground font-medium">Profil ini memiliki keselarasan tertinggi dengan kompetensi Anda.</p>
                          </div>
                          <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0 h-fit">
                            <span className="text-4xl font-black text-primary tracking-tighter">{top.nilai}%</span>
                            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Match Score</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* List of all matches - Icons removed for cleaner look */}
                  <div className="grid gap-5 px-1">
                    {[...profilLulusanData].sort((a, b) => b.nilai - a.nilai).map((pl, index) => {
                      return (
                        <div key={index} className="group/item relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-foreground/90 group-hover/item:text-primary transition-colors">
                              {pl.name}
                            </span>
                            <span className="text-xs font-black text-muted-foreground group-hover/item:text-foreground transition-colors tabular-nums">
                              {pl.nilai}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner border border-muted/20">
                            <div
                              className={`h-full bg-gradient-to-r ${pl.nilai >= 80 ? 'from-primary to-blue-500' : pl.nilai >= 70 ? 'from-emerald-500 to-teal-400' : 'from-orange-400 to-amber-300'} transition-all duration-1000 ease-out`}
                              style={{ width: `${pl.nilai}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg text-muted-foreground text-center p-6">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-10" />
                  <p className="text-sm font-medium">Data Profil Lulusan belum tersedia</p>
                  <p className="text-[10px] opacity-60">Hubungi admin untuk konfigurasi pemetaan PL</p>
                </div>
              )
            ) : (
              trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                    <XAxis dataKey="semester" className="text-xs font-medium" axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 100]} className="text-xs font-medium" axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      type="monotone"
                      dataKey="nilai"
                      stroke="url(#lineGradient)"
                      strokeWidth={4}
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Rata-rata Nilai"
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground font-medium">Belum ada data tren</p>
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
          <div className="grid gap-4 animate-in fade-in duration-1000">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top 5 Capaian Teratas
                </CardTitle>
                <CardDescription>Kompetensi dengan performa terbaik Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <div className="space-y-3">
                    {performanceData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">{item.nilai}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">Belum ada data performa</p>
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
