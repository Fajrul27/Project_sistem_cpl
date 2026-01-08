import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useCPLDetail } from "@/hooks/useCPLDetailHook";

const CPLDetailPage = () => {
  const {
    cpl,
    stats,
    loading,
    navigate,
    getTrendColor
  } = useCPLDetail();

  const getTrendIcon = () => {
    if (stats?.trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (stats?.trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <DashboardPage title="Detail CPL">
        <LoadingScreen fullScreen={false} message="Memuat data CPL..." />
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
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                    <XAxis
                      dataKey="semester"
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      tickFormatter={(val) => val.replace(' - Sem ', ' S')} // Shorten label: 2024/2025 S1
                    />
                    <YAxis
                      domain={[0, 100]}
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      label={{ value: 'Nilai Rata-rata', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                              <p className="text-sm font-semibold mb-1">{label}</p>
                              <p className="text-sm text-primary">
                                Rata-rata: <span className="font-bold">{payload[0].value}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Nilai rata-rata mahasiswa pada semester ini
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nilai"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Nilai Rata-rata"
                      dot={{ r: 4, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 6 }}
                      animationDuration={2000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data historis</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Nilai</CardTitle>
              <CardDescription>Sebaran kemampuan mahasiswa</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.distribution && stats.distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.distribution}>
                    <defs>
                      <linearGradient id="colorDistCPL" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                    <XAxis
                      dataKey="range"
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      className="text-xs font-medium"
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      label={{ value: 'Jml Mahasiswa', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                              <p className="text-sm font-semibold mb-1">Rentang Nilai: {label}</p>
                              <p className="text-sm text-primary">
                                Jumlah: <span className="font-bold">{payload[0].value} Mahasiswa</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {Number(payload[0].value) > 0 ? 'Mahasiswa di range ini' : 'Tidak ada mahasiswa'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#colorDistCPL)"
                      name="Jumlah Mahasiswa"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                      animationDuration={2000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Belum ada data distribusi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* MK Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Pencapaian per Mata Kuliah</CardTitle>
            <CardDescription>Top 10 mata kuliah dengan kontribusi nilai tertinggi terhadap CPL ini</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.mkData && stats.mkData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.mkData} layout="vertical" margin={{ left: 20 }}>
                  <defs>
                    <linearGradient id="colorMKCPL" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    className="text-xs font-medium"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={180}
                    className="text-xs font-medium"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-popover border border-border p-3 rounded-lg shadow-lg">
                            <p className="text-sm font-semibold mb-1">{label}</p>
                            <p className="text-sm text-primary">
                              Rata-rata: <span className="font-bold">{payload[0].value}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Kontribusi nilai rata-rata dari mata kuliah ini
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="nilai"
                    fill="url(#colorMKCPL)"
                    name="Rata-rata Nilai"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                    animationDuration={2000}
                  />
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
