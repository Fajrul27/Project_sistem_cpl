import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useAnalisis } from "@/hooks/useAnalisis";
import { SlidersHorizontal, RotateCcw, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";


const AnalisisiPage = () => {
  const { can } = usePermission();
  const canManage = can('access', 'kaprodi') || can('access', 'admin');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    cplData,
    radarData,
    distributionData,
    semester,
    setSemester,
    fakultasFilter,
    setFakultasFilter,
    jenjangFilter,
    setJenjangFilter,
    prodiFilter,
    setProdiFilter,
    fakultasList,
    jenjangList,
    prodiList,
    loading,
    resetFilters
  } = useAnalisis();



  const isFilterComplete = semester && fakultasFilter && jenjangFilter && prodiFilter && semester !== 'all' && fakultasFilter !== 'all' && jenjangFilter !== 'all' && prodiFilter !== 'all';

  // Standard colors for distribution chart: Reversed to match Top (Green) -> Bottom (Red)
  const chartColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

  const totalData = distributionData.reduce((acc, curr) => acc + curr.count, 0);

  const getLabel = (rangeName: string) => {
    switch (rangeName) {
      case '90-100': return 'Sangat Baik (A) (90-100)';
      case '80-89': return 'Baik (B) (80-89)';
      case '70-79': return 'Cukup (C) (70-79)';
      case '60-69': return 'Kurang (D) (60-69)';
      default: return 'Sangat Kurang (E) (<60)';
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <DashboardPage
      title="Analisis CPL"
      description="Visualisasi performa dan statistik capaian pembelajaran"
    >
      <div className="space-y-6">
        {canManage && (
          <CollapsibleGuide title="Panduan Analisis Capaian">
            <div className="space-y-3">
              <p>Halaman ini menyajikan statistik performa akademik secara agregat untuk membantu evaluasi kurikulum dan kualitas pembelajaran.</p>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                <li><strong>Rata-rata CPL:</strong> Melihat performa rata-rata mahasiswa pada setiap poin Capaian Pembelajaran Lulusan.</li>
                <li><strong>Distribusi Nilai:</strong> Sebaran perolehan grade (A-E) untuk seluruh evaluasi yang telah dilakukan.</li>
                <li><strong>Radar Chart:</strong> Visualisasi kekuatan dan kelemahan kompetensi secara holistik dalam satu tampilan.</li>
              </ul>
            </div>
          </CollapsibleGuide>
        )}

        {/* Filters Toolbar */}
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[400px]">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filter Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Sesuaikan tampilan data analisis
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={semester} onValueChange={setSemester}>
                      <SelectTrigger id="semester" className="h-10">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="fakultas">Fakultas</Label>
                    <Select value={fakultasFilter} onValueChange={setFakultasFilter}>
                      <SelectTrigger id="fakultas" className="h-10">
                        <SelectValue placeholder="Pilih Fakultas" />
                      </SelectTrigger>
                      <SelectContent>
                        {fakultasList.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jenjang">Jenjang</Label>
                    <Select value={jenjangFilter} onValueChange={setJenjangFilter}>
                      <SelectTrigger id="jenjang" className="h-10">
                        <SelectValue placeholder="Pilih Jenjang" />
                      </SelectTrigger>
                      <SelectContent>
                        {jenjangList.map((j) => (
                          <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prodi">Program Studi</Label>
                    <Select value={prodiFilter} onValueChange={setProdiFilter}>
                      <SelectTrigger id="prodi" className="h-10">
                        <SelectValue placeholder="Pilih Prodi" />
                      </SelectTrigger>
                      <SelectContent>
                        {prodiList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {isFilterComplete && (
            <Button variant="outline" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
              Reset Filter
            </Button>
          )}
        </div>

        <div className={`grid gap-6 md:grid-cols-2 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {!isFilterComplete ? (
            <div className="md:col-span-2 py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-lg bg-muted/30">
              <div className="p-4 rounded-full bg-muted">
                <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Filter Data Diperlukan</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Silakan pilih Semester, Fakultas, Jenjang, atau Program Studi pada menu filter di atas untuk menampilkan data analisis.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Card className="md:col-span-2">
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
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          maxWidth: '400px',
                          whiteSpace: 'normal'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        labelStyle={{
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                          color: 'hsl(var(--foreground))',
                          whiteSpace: 'normal',
                          lineHeight: '1.4'
                        }}
                        formatter={(value: number) => [value, 'Rata-rata Nilai']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const desc = payload[0].payload.description;
                            return `${label}: ${desc}`;
                          }
                          return label;
                        }}
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

              <div className="md:col-span-2 grid gap-6 md:grid-cols-3">
                {/* Radar Chart - Takes up 2 columns */}
                <Card className="md:col-span-2">
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

                {/* Ringkasan Statistik - Takes up 1 column */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Statistik</CardTitle>
                    <CardDescription>Data agregat pencapaian CPL</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Total CPL</p>
                        <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">{cplData.length}</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Rata-rata Keseluruhan</p>
                        <p className="text-3xl font-black text-blue-700 dark:text-blue-300">
                          {cplData.length > 0
                            ? (
                              cplData.reduce((sum, item) => sum + parseFloat(item.nilai), 0) /
                              cplData.length
                            ).toFixed(2)
                            : 0}
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">CPL Tertinggi</p>
                        <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                          {cplData.length > 0
                            ? Math.max(...cplData.map((item) => parseFloat(item.nilai))).toFixed(2)
                            : 0}
                        </p>
                      </div>
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg shadow-sm">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">CPL Terendah</p>
                        <p className="text-3xl font-black text-rose-700 dark:text-rose-300">
                          {cplData.length > 0
                            ? Math.min(...cplData.map((item) => parseFloat(item.nilai))).toFixed(2)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardPage>
  );
};

export default AnalisisiPage;
