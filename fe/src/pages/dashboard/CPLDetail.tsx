import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";
import { toast } from "sonner";

interface CPLData {
  id: string;
  kodeCpl: string;
  deskripsi: string;
  kategori: string;
  kategoriRef?: { id: string; nama: string };
  bobot: number;
  mataKuliah?: any[];
}

const CPLDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cpl, setCpl] = useState<CPLData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCPL = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/cpl/${id}`);
        if (response.data) {
          setCpl(response.data);

          // Fetch real stats from backend
          try {
            const statsResponse = await api.get(`/cpl/${id}/stats`);
            setStats(statsResponse);
          } catch (statsError) {
            console.error("Error fetching stats:", statsError);
            // Fallback to empty stats if fetch fails
            setStats({
              avgNilai: 0,
              trend: "stable",
              totalMahasiswa: 0,
              totalMK: response.data.mataKuliah?.length || 0,
              semesterData: [],
              distribution: [],
              mkData: []
            });
          }
        }
      } catch (error) {
        console.error("Error fetching CPL:", error);
        toast.error("Gagal memuat detail CPL");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCPL();
    }
  }, [id]);

  const getTrendIcon = () => {
    if (stats?.trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (stats?.trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (stats?.trend === "up") return "success";
    if (stats?.trend === "down") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <DashboardPage title="Detail CPL">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data CPL...</p>
        </div>
      </DashboardPage>
    );
  }

  if (!cpl) {
    return (
      <DashboardPage title="Detail CPL">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">CPL tidak ditemukan</p>
          <Button onClick={() => navigate("/dashboard/cpl")}>Kembali ke Daftar</Button>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={`Detail ${cpl.kodeCpl}`}
      description={cpl.deskripsi}
      actions={
        <Button variant="outline" onClick={() => navigate("/dashboard/cpl")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              {getTrendIcon()}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgNilai?.toFixed(2) || "N/A"}</div>
              <Progress value={stats?.avgNilai || 0} className="mt-2" />
              <Badge variant={getTrendColor() as any} className="mt-2">
                Trend: {stats?.trend === "up" ? "Naik" : stats?.trend === "down" ? "Turun" : "Stabil"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMahasiswa || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Mahasiswa yang dinilai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mata Kuliah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMK || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">MK terkait CPL ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cpl.kategoriRef?.nama || cpl.kategori || "-"}</div>
              <p className="text-xs text-muted-foreground mt-2">Bobot: {cpl.bobot}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tren per Semester</CardTitle>
              <CardDescription>Perkembangan nilai CPL dari waktu ke waktu</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.semesterData && stats.semesterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.semesterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nilai" stroke="hsl(var(--primary))" strokeWidth={2} name="Nilai" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Nilai</CardTitle>
              <CardDescription>Sebaran nilai mahasiswa</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.distribution && stats.distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="Jumlah Mahasiswa" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MK Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Pencapaian per Mata Kuliah</CardTitle>
            <CardDescription>Top 10 mata kuliah dengan rata-rata nilai tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.mkData && stats.mkData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.mkData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Rata-rata Nilai" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">Belum ada data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
};

export default CPLDetailPage;
