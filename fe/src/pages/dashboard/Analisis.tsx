import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { FilterRequiredState } from "@/components/common/FilterRequiredState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine } from "recharts";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useAnalisis } from "@/hooks/useAnalisis";
import { SlidersHorizontal, RotateCcw, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";
import { useUserRole } from "@/hooks/useUserRole";


const AnalisisiPage = () => {
  const { role } = useUserRole();
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
    semesterList,
    loading,
    resetFilters
  } = useAnalisis();



  const isFilterComplete = semester && fakultasFilter && jenjangFilter && prodiFilter && fakultasFilter !== 'all' && jenjangFilter !== 'all' && prodiFilter !== 'all';

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
                <li><strong>Rata-rata CPL:</strong> Menampilkan rata-rata nilai mahasiswa pada tiap CPL. Batang grafik akan <strong>berwarna merah</strong> jika nilainya di bawah target yang ditetapkan.</li>
                <li><strong>Distribusi Mutu CPL:</strong> Menampilkan sebaran grade (A-E). Angka yang muncul adalah <strong>Jumlah Evaluasi Capaian</strong> (Total CPL yang diujikan), <em>bukan</em> jumlah kepala mahasiswa.</li>
                <li><strong>Radar Chart:</strong> Visualisasi jaring laba-laba untuk melihat kekuatan dan kelemahan kompetensi angkatan secara menyeluruh dalam satu pandangan.</li>
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
                        {semesterList.map((sem: any) => (
                          <SelectItem key={sem.id} value={sem.id}>{sem.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(role === 'admin' || role === 'dosen') && (
                    <>
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
                    </>
                  )}
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
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <FilterRequiredState
                  message={`Silakan pilih ${role === 'admin' ? "Semester, Fakultas, Jenjang, atau Program Studi" : "Semester"} pada menu filter di atas untuk menampilkan data analisis.`}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Rata-rata Nilai per CPL</CardTitle>
                  <CardDescription>Pencapaian rata-rata setiap CPL</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activeCplData = cplData.filter(c => Number(c.nilai) > 0);
                    const hiddenCplCount = cplData.length - activeCplData.length;

                    return (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={activeCplData}>
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
                      <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" />
                      <Bar
                        dataKey="nilai"
                        name="Rata-rata Nilai"
                        radius={[6, 6, 0, 0]}
                        animationDuration={2000}
                        animationEasing="ease-out"
                        barSize={40}
                      >
                        {activeCplData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={(Number(entry.nilai) || 0) >= 75 ? "url(#colorCplAnalisis)" : "#ef4444"} 
                            />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                          <div className="w-5 border-t-2 border-dashed" style={{ borderColor: '#ef4444' }}></div>
                          <span>Target Ketercapaian (75)</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(var(--primary))" }}></div>
                          <span>Tercapai</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                          <span>Belum Tercapai</span>
                      </div>
                  </div>

                  {hiddenCplCount > 0 && (
                      <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-md text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <p>
                              Terdapat <strong>{hiddenCplCount} CPL</strong> yang disembunyikan dari grafik karena belum memiliki data nilai pada kriteria filter yang Anda pilih.
                          </p>
                      </div>
                  )}
                </>
              );
            })()}
                </CardContent>
              </Card>

              {/* Distribusi Nilai */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Distribusi Mutu CPL</CardTitle>
                  <CardDescription>Sebaran perolehan nilai/grade mahasiswa di seluruh CPL</CardDescription>
                </CardHeader>
                <CardContent>
                  {totalData > 0 ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      <div className="w-full md:w-1/2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              outerRadius={120}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="count"
                              animationDuration={1500}
                            >
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [value, 'Jumlah Evaluasi CPL']}
                              labelFormatter={(label) => `Range Nilai: ${label}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full md:w-1/3 flex flex-col gap-3">
                        {distributionData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: chartColors[index % chartColors.length] }}
                              />
                              <span className="text-sm font-medium">{getLabel(entry.name)}</span>
                            </div>
                            <span className="font-bold text-lg">{entry.count}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-2 mt-2 rounded-md bg-primary/10 border border-primary/20">
                          <span className="text-sm font-bold text-primary">Total Evaluasi</span>
                          <span className="font-black text-lg text-primary">{totalData}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                      <p className="text-muted-foreground">Belum ada data distribusi nilai</p>
                    </div>
                  )}
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
