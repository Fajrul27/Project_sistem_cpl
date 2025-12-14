import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useAnalisis } from "@/hooks/useAnalisis";

const AnalisisiPage = () => {
  const {
    cplData,
    radarData,
    distributionData,
    semester,
    setSemester,
    loading
  } = useAnalisis();

  if (loading) {
    return (
      <DashboardPage title="Analisis CPL">
        <LoadingScreen fullScreen={false} message="Memuat data analisis..." />
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
                  <defs>
                    <linearGradient id="colorCplAnalisis" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#colorCplAnalisis)"
                    name="Rata-rata Nilai"
                    radius={[6, 6, 0, 0]}
                    animationDuration={2000}
                    animationEasing="ease-out"
                    barSize={40}
                  />
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
                    fill="hsl(var(--primary))"
                    dataKey="count"
                    animationDuration={2000}
                    animationEasing="ease-out"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
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
                      animationDuration={2000}
                      animationEasing="ease-out"
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
