import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Search, TrendingUp, SlidersHorizontal, Loader2 } from "lucide-react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMahasiswa, Profile } from "@/hooks/useMahasiswa";

const MahasiswaPage = () => {
  const {
    profiles,
    fakultasList,
    loading,
    filters,
    uniqueOptions,
    studentProgress,
    selectedStudent,
    progressLoading,
    currentUser,
    setSearchTerm,
    setSemesterFilter,
    setProdiFilter,
    setKelasFilter,
    setFakultasFilter,
    setSelectedStudent,
    initializeData,
    loadFakultas,
    fetchStudentProgressData,
    pagination
  } = useMahasiswa();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);

  useEffect(() => {
    initializeData();
    loadFakultas();
  }, [initializeData, loadFakultas]);

  // Sync local search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, setSearchTerm]);

  // Sync filter change from outside (reset button)
  useEffect(() => {
    if (filters.searchTerm !== localSearch && filters.searchTerm === "") {
      setLocalSearch("");
    }
  }, [filters.searchTerm]);

  const handleShowProgress = async (student: Profile) => {
    setSelectedStudent(student);
    setDialogOpen(true);
    if (student.id) {
      await fetchStudentProgressData(student.id);
    }
  };

  const getSemesterBadgeColor = (semester: number | null) => {
    if (!semester) return "bg-gray-500";
    if (semester <= 2) return "bg-green-500";
    if (semester <= 4) return "bg-blue-500";
    if (semester <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const hasActiveFilter =
    filters.semesterFilter !== "all" ||
    filters.prodiFilter !== "all" ||
    filters.kelasFilter !== "all" ||
    filters.fakultasFilter !== "all";

  // Removed blocking loader

  return (
    <DashboardPage
      title="Data Mahasiswa"
      description="Monitoring data dan progress capaian pembelajaran mahasiswa"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau NIM..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilter ? "default" : "outline"}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
              {/* Fakultas Filter (Admin Only) */}
              {currentUser?.role === 'admin' && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Fakultas</Label>
                  <Select value={filters.fakultasFilter} onValueChange={setFakultasFilter}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua Fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Fakultas</SelectItem>
                      {fakultasList.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Prodi Filter */}
              {currentUser?.role !== 'dosen' && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Program Studi</Label>
                  <Select value={filters.prodiFilter} onValueChange={setProdiFilter}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua Prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Prodi</SelectItem>
                      {uniqueOptions.prodis.map((p) => (
                        <SelectItem key={String(p)} value={String(p)}>{String(p)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Semester Filter */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Semester</Label>
                <Select value={filters.semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Semua Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {uniqueOptions.semesters.map((s) => (
                      <SelectItem key={String(s)} value={String(s)}>Semester {String(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kelas Filter */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Kelas</Label>
                <Select value={filters.kelasFilter} onValueChange={setKelasFilter}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {uniqueOptions.kelas.map((k) => (
                      <SelectItem key={String(k)} value={String(k)}>{String(k)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={() => {
              setLocalSearch("");
              setSemesterFilter("all");
              setProdiFilter("all");
              setKelasFilter("all");
              setFakultasFilter("all");
            }}
            disabled={!hasActiveFilter && localSearch === ""}
          >
            Reset
          </Button>
        </div>

        {/* List Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Mahasiswa</CardTitle>
            <CardDescription>
              Menampilkan {profiles.length} mahasiswa terdaftar dari total {pagination?.totalItems || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat data mahasiswa...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Prodi</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Tidak ada data mahasiswa yang cocok dengan filter
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell>{student.nim || "-"}</TableCell>
                          <TableCell>{student.prodi || "-"}</TableCell>
                          <TableCell>{student.kelasName || "-"}</TableCell>
                          <TableCell>
                            <Badge className={getSemesterBadgeColor(student.semester)}>
                              Semester {student.semester || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowProgress(student)}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Progress
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let p = i + 1;
                        if (pagination.totalPages > 5 && pagination.page > 3) {
                          p = pagination.page - 2 + i;
                        }

                        let start = Math.max(1, pagination.page - 2);
                        if (start + 4 > pagination.totalPages) {
                          start = Math.max(1, pagination.totalPages - 4);
                        }

                        // Recalculate p based on new logic
                        // Wait, simpler approach: just render window directly
                        // But sticking to the loop
                        p = start + i;

                        if (p > pagination.totalPages) return null;

                        return (
                          <Button
                            key={p}
                            variant={pagination.page === p ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => pagination.setPage(p)}
                          >
                            {p}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Progress Capaian Pembelajaran</DialogTitle>
              <DialogDescription>
                Detail capaian CPL untuk {selectedStudent?.full_name} ({selectedStudent?.nim})
              </DialogDescription>
            </DialogHeader>

            {progressLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Menghitung progress...</p>
              </div>
            ) : studentProgress ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">Rata-rata CPL</span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {studentProgress.avgScore.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Skala 0-100</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-sm dark:from-green-900/10 dark:to-green-900/5 dark:border-green-800">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Total CPL</span>
                        <div className="h-4 w-4 rounded-full bg-green-500/20" />
                      </div>
                      <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                        {studentProgress.completedCPL} <span className="text-lg font-normal text-muted-foreground">/ {studentProgress.totalCPL}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">CPL Terpenuhi (Nilai &ge; 70)</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="pt-6 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Persentase Kelulusan</span>
                        <div className="h-4 w-4" />
                      </div>
                      <div className="text-3xl font-bold">
                        {Math.round((studentProgress.completedCPL / (studentProgress.totalCPL || 1)) * 100)}%
                      </div>
                      <Progress
                        value={(studentProgress.completedCPL / (studentProgress.totalCPL || 1)) * 100}
                        className="h-2 mt-3 bg-secondary"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Chart Section */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Grafik Pencapaian CPL</CardTitle>
                    <CardDescription>Visualisasi nilai rata-rata per Capaian Pembelajaran Lulusan</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={studentProgress.cplDetails} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCplProgress" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                          <XAxis
                            dataKey="kode"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            className="font-medium"
                          />
                          <YAxis
                            domain={[0, 100]}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickCount={6}
                          />
                          <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border rounded-lg shadow-lg p-3 max-w-[300px] z-50">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                      <p className="font-bold text-sm text-foreground">{data.kode}</p>
                                      <Badge variant={data.nilai >= 70 ? "default" : "destructive"} className="text-[10px] px-1.5 h-5">
                                        {data.nilai >= 70 ? "Tercapai" : "Belum"}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed border-b pb-2">
                                      {data.deskripsi}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-muted-foreground">Nilai Rata-rata:</span>
                                      <span className="font-bold text-primary">{Number(data.nilai).toFixed(2)}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar
                            dataKey="nilai"
                            fill="url(#colorCplProgress)"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            animationDuration={1500}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis & Recommendations */}
                {/* Analysis & Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card className="shadow-sm border-l-4 border-l-green-500 bg-card">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        Kompetensi Dominan (Highest)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {studentProgress.cplDetails.some(c => c.nilai >= 80) ? (
                          studentProgress.cplDetails
                            .filter(c => c.nilai >= 80)
                            .sort((a, b) => b.nilai - a.nilai)
                            .slice(0, 3)
                            .map(c => (
                              <div key={c.id} className="flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold">
                                    {c.kode}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">
                                      {c.nilai.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-green-600 font-semibold bg-green-100 px-1.5 rounded-sm">
                                      Tercapai
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {c.deskripsi}
                                  </p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                            <p className="text-sm">Tidak ada CPL dengan nilai &ge; 80.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Improvements */}
                  <Card className="shadow-sm border-l-4 border-l-orange-500 bg-card">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          <SlidersHorizontal className="h-4 w-4" />
                        </div>
                        Identifikasi Kelemahan (Lowest)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {studentProgress.cplDetails.some(c => c.nilai < 70) ? (
                          studentProgress.cplDetails
                            .filter(c => c.nilai < 70)
                            .sort((a, b) => a.nilai - b.nilai) // Lowest first
                            .slice(0, 3)
                            .map(c => (
                              <div key={c.id} className="flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold">
                                    {c.kode}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-destructive">
                                      {c.nilai.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-orange-600 font-semibold bg-orange-100 px-1.5 rounded-sm">
                                      Di Bawah Standar
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {c.deskripsi}
                                  </p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border border-dashed rounded-md bg-muted/5">
                            <span className="text-green-600 font-medium text-sm mb-1">Status: Aman</span>
                            <p className="text-xs">Seluruh capaian memenuhi ambang batas minimum (70.00).</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
                <p>Belum ada data nilai CPL yang tersedia.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPage>
  );
};

export default MahasiswaPage;
