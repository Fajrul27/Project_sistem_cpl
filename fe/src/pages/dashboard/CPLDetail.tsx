import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/api-client";
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
  kode_cpl: string;
  deskripsi: string;
  kategori: string;
  bobot: number;
}

interface CPLStats {
  avgNilai: number;
  totalMahasiswa: number;
  totalMK: number;
  trend: string;
  distribution: { range: string; count: number }[];
  semesterData: { semester: string; nilai: number }[];
  mkData: { name: string; nilai: number }[];
}

const CPLDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cpl, setCpl] = useState<CPLData | null>(null);
  const [stats, setStats] = useState<CPLStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCPLDetail();
    }
  }, [id]);

  const fetchCPLDetail = async () => {
    try {
      const supabaseClient = supabase as any;
      
      // Fetch CPL data
      const { data: cplData, error: cplError } = await supabaseClient
        .from("cpl")
        .select("*")
        .eq("id", id)
        .single();

      if (cplError) throw cplError;
      setCpl(cplData);

      // Fetch nilai data
      const { data: nilaiData, error: nilaiError } = await supabaseClient
        .from("nilai_cpl")
        .select(`
          nilai,
          semester,
          mahasiswa_id,
          mata_kuliah:mata_kuliah_id (kode_mk, nama_mk)
        `)
        .eq("cpl_id", id);

      if (nilaiError) throw nilaiError;

      // Calculate statistics
      if (nilaiData && nilaiData.length > 0) {
        const avgNilai = nilaiData.reduce((sum, item) => sum + parseFloat(item.nilai.toString()), 0) / nilaiData.length;
        const uniqueStudents = new Set(nilaiData.map((item) => item.mahasiswa_id));
        const uniqueMK = new Set(nilaiData.map((item) => item.mata_kuliah?.kode_mk));

        // Distribution
        const ranges = [
          { range: "0-59", min: 0, max: 59, count: 0 },
          { range: "60-69", min: 60, max: 69, count: 0 },
          { range: "70-79", min: 70, max: 79, count: 0 },
          { range: "80-89", min: 80, max: 89, count: 0 },
          { range: "90-100", min: 90, max: 100, count: 0 },
        ];

        nilaiData.forEach((item) => {
          const nilai = parseFloat(item.nilai.toString());
          const range = ranges.find((r) => nilai >= r.min && nilai <= r.max);
          if (range) range.count++;
        });

        // Semester data
        const semesterAvg: any = {};
        nilaiData.forEach((item) => {
          if (!semesterAvg[item.semester]) {
            semesterAvg[item.semester] = { total: 0, count: 0 };
          }
          semesterAvg[item.semester].total += parseFloat(item.nilai.toString());
          semesterAvg[item.semester].count += 1;
        });

        const semesterData = Object.entries(semesterAvg)
          .map(([sem, data]: [string, any]) => ({
            semester: `Sem ${sem}`,
            nilai: parseFloat((data.total / data.count).toFixed(2)),
          }))
          .sort((a, b) => a.semester.localeCompare(b.semester));

        // MK data
        const mkAvg: any = {};
        nilaiData.forEach((item) => {
          const mkName = item.mata_kuliah?.kode_mk || "Unknown";
          if (!mkAvg[mkName]) {
            mkAvg[mkName] = { total: 0, count: 0 };
          }
          mkAvg[mkName].total += parseFloat(item.nilai.toString());
          mkAvg[mkName].count += 1;
        });

        const mkData = Object.entries(mkAvg)
          .map(([name, data]: [string, any]) => ({
            name,
            nilai: parseFloat((data.total / data.count).toFixed(2)),
          }))
          .sort((a, b) => b.nilai - a.nilai)
          .slice(0, 10);

        // Trend calculation
        let trend = "stable";
        if (semesterData.length >= 2) {
          const lastTwo = semesterData.slice(-2);
          const diff = lastTwo[1].nilai - lastTwo[0].nilai;
          if (diff > 5) trend = "up";
          else if (diff < -5) trend = "down";
        }

        setStats({
          avgNilai: parseFloat(avgNilai.toFixed(2)),
          totalMahasiswa: uniqueStudents.size,
          totalMK: uniqueMK.size,
          trend,
          distribution: ranges,
          semesterData,
          mkData,
        });
      } else {
        setStats({
          avgNilai: 0,
          totalMahasiswa: 0,
          totalMK: 0,
          trend: "stable",
          distribution: [],
          semesterData: [],
          mkData: [],
        });
      }
    } catch (error: any) {
      toast.error("Gagal memuat data CPL");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (!stats) return null;
    switch (stats.trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!stats) return "secondary";
    switch (stats.trend) {
      case "up":
        return "default";
      case "down":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <DashboardPage title="Detail CPL">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardPage>
    );
  }

  if (!cpl) {
    return (
      <DashboardPage title="CPL Tidak Ditemukan">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">CPL tidak ditemukan</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => navigate("/dashboard/cpl")}>Kembali ke Daftar CPL</Button>
            </div>
          </CardContent>
        </Card>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={`Detail ${cpl.kode_cpl}`}
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
              <div className="text-2xl font-bold">{stats?.avgNilai.toFixed(2) || "N/A"}</div>
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
              <div className="text-2xl font-bold">{cpl.kategori}</div>
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
