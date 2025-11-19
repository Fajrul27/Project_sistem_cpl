import { useState, useEffect } from "react";
import { supabase } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { toast } from "sonner";
import { DashboardPage } from "@/components/DashboardLayout";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AnalisisiPage = () => {
  const [cplData, setCplData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [semester, setSemester] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysisData();
  }, [semester]);

  const fetchAnalysisData = async () => {
    try {
      const supabaseClient = supabase as any;
      let query = supabaseClient
        .from("nilai_cpl")
        .select(`
          nilai,
          semester,
          cpl:cpl_id (kode_cpl, deskripsi)
        `);

      if (semester !== "all") {
        query = query.eq("semester", parseInt(semester));
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data for CPL average
      const cplAverage: any = {};
      data?.forEach((item: any) => {
        const kode = item.cpl?.kode_cpl || "Unknown";
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

      setCplData(chartData);

      // Prepare radar data (limit to top 8 CPL for better visualization)
      const radarChartData = chartData.slice(0, 8).map((item: any) => ({
        subject: item.name,
        nilai: item.nilai,
        fullMark: 100,
      }));
      setRadarData(radarChartData);

      // Process distribution data
      const ranges = [
        { name: "0-59", min: 0, max: 59, count: 0 },
        { name: "60-69", min: 60, max: 69, count: 0 },
        { name: "70-79", min: 70, max: 79, count: 0 },
        { name: "80-89", min: 80, max: 89, count: 0 },
        { name: "90-100", min: 90, max: 100, count: 0 },
      ];

      data?.forEach((item: any) => {
        const nilai = parseFloat(item.nilai);
        const range = ranges.find((r) => nilai >= r.min && nilai <= r.max);
        if (range) range.count++;
      });

      setDistributionData(ranges);
    } catch (error: any) {
      toast.error("Gagal memuat data analisis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardPage title="Analisis CPL">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Analisis CPL"
      description="Visualisasi pencapaian pembelajaran"
      actions={
        <div className="w-48">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={sem.toString()}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Rata-rata Nilai per CPL</CardTitle>
              <CardDescription>Pencapaian rata-rata setiap CPL</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cplData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Rata-rata Nilai" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Nilai</CardTitle>
              <CardDescription>Sebaran nilai mahasiswa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar Chart CPL</CardTitle>
              <CardDescription>Visualisasi performa CPL (Top 8)</CardDescription>
            </CardHeader>
            <CardContent>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="Nilai CPL"
                      dataKey="nilai"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data untuk radar chart</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Statistik</CardTitle>
            <CardDescription>Data agregat pencapaian CPL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total CPL</p>
                <p className="text-2xl font-bold">{cplData.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rata-rata Keseluruhan</p>
                <p className="text-2xl font-bold">
                  {cplData.length > 0
                    ? (
                        cplData.reduce((sum, item) => sum + parseFloat(item.nilai), 0) /
                        cplData.length
                      ).toFixed(2)
                    : 0}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">CPL Tertinggi</p>
                <p className="text-2xl font-bold">
                  {cplData.length > 0
                    ? Math.max(...cplData.map((item) => parseFloat(item.nilai))).toFixed(2)
                    : 0}
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">CPL Terendah</p>
                <p className="text-2xl font-bold">
                  {cplData.length > 0
                    ? Math.min(...cplData.map((item) => parseFloat(item.nilai))).toFixed(2)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
};

export default AnalisisiPage;
