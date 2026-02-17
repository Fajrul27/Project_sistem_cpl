import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { FilterRequiredState } from "@/components/common/FilterRequiredState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Search, TrendingUp, SlidersHorizontal, Download, Upload } from "lucide-react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMahasiswa, Profile } from "@/hooks/useMahasiswa";
import { usePermission } from "@/contexts/PermissionContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";

const MahasiswaPage = () => {
  const { can } = usePermission();
  const { role } = useUserRole();
  const {
    profiles,
    fakultasList,
    loading,
    filters,
    uniqueOptions,
    studentProgress,
    selectedStudent,
    progressLoading,
    user: currentUser,
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

  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.fakultasFilter !== 'all') queryParams.append('fakultasId', filters.fakultasFilter);
      if (filters.prodiFilter !== 'all') queryParams.append('prodiId', filters.prodiFilter);
      if (filters.semesterFilter !== 'all') queryParams.append('semester', filters.semesterFilter);
      if (filters.kelasFilter !== 'all') queryParams.append('kelas', filters.kelasFilter);

      const API_URL = import.meta.env.VITE_API_URL;
      const url = `${API_URL}/users/export/mahasiswa?${queryParams.toString()}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Gagal export data');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `mahasiswa_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success('Data Mahasiswa berhasil diexport');
    } catch (error) {
      toast.error('Gagal export data Mahasiswa');
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/users/import/mahasiswa`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Gagal import data');

        toast.success(result.message || 'Data berhasil diimport');
        if (result.errors && result.errors.length > 0) {
          result.errors.slice(0, 3).forEach((err: string) => toast.error(err));
        }

        window.location.reload();
      } catch (error: any) {
        toast.error(error.message || 'Gagal import data Mahasiswa');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

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

  // Const for checks
  const isDosen = role === 'dosen';

  return (
    <DashboardPage
      title="Data Mahasiswa"
      description="Direktori data dan monitoring perkembangan kompetensi mahasiswa"
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
                <LoadingSpinner size="sm" className="text-muted-foreground" />
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
              {/* Fakultas Filter (Admin Only/Can View All) */}
              {can('view_all', 'fakultas') && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Fakultas</Label>
                  <Select value={filters.fakultasFilter} onValueChange={setFakultasFilter}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih Fakultas" />
                    </SelectTrigger>
                    <SelectContent>
                      {fakultasList.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Prodi Filter */}
              {true && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Program Studi</Label>
                  <Select value={filters.prodiFilter} onValueChange={setProdiFilter}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih Program Studi" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueOptions.semesters.map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
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
              setSemesterFilter("");
              setProdiFilter("");
              setKelasFilter("");
              setFakultasFilter("");
            }}
            disabled={!hasActiveFilter && localSearch === ""}
          >
            Reset
          </Button>
        </div>

        {/* List Card */}
        {(() => {
          const isFilterComplete = (() => {
            // Logic:
            // 1. Dosen: Always show default data (derived from taught courses)
            // 2. Others: Require specific filters

            if (isDosen || role === 'kaprodi') return true;

            let complete = !!filters.semesterFilter;

            if (can('view_all', 'fakultas')) {
              complete = complete && !!filters.fakultasFilter;
            }

            if (!isDosen) {
              complete = complete && !!filters.prodiFilter;
            }

            return complete;
          })();

          if (!isFilterComplete) {
            return (
              <Card>
                <CardContent className="pt-6">
                  <FilterRequiredState
                    message={`Silakan pilih ${can('view_all', 'fakultas') ? "Fakultas, " : ""}${!isDosen ? "Program Studi, dan " : ""}Semester untuk menampilkan data mahasiswa.`}
                  />
                </CardContent>
              </Card>
            );
          }

          return (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle>Daftar Mahasiswa</CardTitle>
                  <CardDescription>
                    Menampilkan {profiles.length} mahasiswa terdaftar dari total {pagination?.totalItems || 0}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={handleExport} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {(role === 'admin' || role === 'kaprodi') && (
                    <Button size="sm" variant="outline" onClick={handleImportClick} disabled={importing}>
                      <Upload className="h-4 w-4 mr-2" />
                      {importing ? 'Importing...' : 'Import'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">No</TableHead>
                        <TableHead>NIM</TableHead>
                        <TableHead>Nama Mahasiswa</TableHead>
                        <TableHead>Program Studi</TableHead>
                        <TableHead className="text-center">Sem</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <LoadingScreen fullScreen={false} message="Memuat data mahasiswa..." />
                          </TableCell>
                        </TableRow>
                      ) : profiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {filters.searchTerm ? "Tidak ada mahasiswa ditemukan" : "Belum ada data mahasiswa"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        profiles.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell>{(pagination.page - 1) * pagination.limit + index + 1}</TableCell>
                            <TableCell className="font-medium">{student.nim || "-"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{student.full_name}</span>
                                <span className="text-xs text-muted-foreground">{student.kelasName !== "-" ? `Kelas ${student.kelasName}` : ""}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{student.prodi || "-"}</span>
                                <span className="text-xs text-muted-foreground">{student.fakultasName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className={getSemesterBadgeColor(student.semester)}>
                                {student.semester || "?"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleShowProgress(student)}>
                                Lihat Progress
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.setPage}
                />

              </CardContent>
            </Card>
          );
        })()}

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
              <LoadingScreen fullScreen={false} message="Menghitung progress..." />
            ) : studentProgress ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-sm">
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

                  <Card className="shadow-sm border-green-200 dark:border-green-800">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card className="shadow-sm bg-card">
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
                  <Card className="shadow-sm bg-card">
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
      </div >
    </DashboardPage >
  );
};

export default MahasiswaPage;
