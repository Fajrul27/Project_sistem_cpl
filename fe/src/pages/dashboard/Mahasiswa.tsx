import { useState, useEffect } from "react";
import { fetchMahasiswaList, fetchMataKuliahPengampu, api, getUser } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, TrendingUp, SlidersHorizontal } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Profile {
  id: string;
  full_name: string;
  nim: string | null;
  prodi: string | null;
  semester: number | null;
}

interface StudentProgress {
  avgScore: number;
  totalCPL: number;
  completedCPL: number;
  cplDetails: { kode: string; nilai: number; status?: string }[];
}

interface User {
  id: string;
  profile?: {
    nim: string | null;
    namaLengkap: string | null;
    prodi?: { nama: string };
    programStudi?: string;
    semester: number | null;
  };
}

interface TranskripItem {
  cpl?: { kodeCpl: string };
  nilaiAkhir: string;
  status?: string;
}

interface MataKuliah {
  id: string;
  kodeMk: string;
  namaMk: string;
  semester: number;
  prodi?: { nama: string };
}

interface MataKuliahPengampu {
  id: string;
  mataKuliahId: string;
  dosenId: string;
  isPengampu: boolean;
  mataKuliah: MataKuliah;
}

const MahasiswaPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [prodiFilter, setProdiFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliahPengampu[]>([]);
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    const user = getUser();
    if (user) {
      setCurrentUser(user);
      setUserRole(user.role || "");
      
      // If user is dosen, fetch mata kuliah yang diampu
      if (user.role === 'dosen') {
        await fetchMataKuliahForDosen(user.id);
      } else {
        // For other roles, fetch all mahasiswa
        await fetchProfiles();
      }
    } else {
      // Fallback: fetch all mahasiswa
      await fetchProfiles();
    }
  };

  const fetchMataKuliahForDosen = async (dosenId: string) => {
    try {
      const response = await fetchMataKuliahPengampu(dosenId);
      const mataKuliahData = response?.data || [];
      setMataKuliahList(mataKuliahData);
      
      // Auto-select "all" if available
      if (mataKuliahData.length > 0) {
        setSelectedMataKuliah("all");
        await fetchProfilesForAllMataKuliah();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching mata kuliah:', error);
      toast.error("Gagal memuat data mata kuliah");
      setLoading(false);
    }
  };

  const fetchProfiles = async (mataKuliahId?: string) => {
    try {
      // Ambil daftar mahasiswa dari backend: /api/users?role=mahasiswa
      const params: any = { limit: -1 };
      if (mataKuliahId) {
        params.mataKuliahId = mataKuliahId;
      }
      
      const response = await fetchMahasiswaList(params);
      const users = response?.data || [];

      const mappedProfiles: Profile[] = users
        .filter((user: User) => user.profile && user.profile.nim)
        .map((user: User) => ({
          id: user.id, // Use User ID, not Profile ID
          full_name: user.profile.namaLengkap || "",
          nim: user.profile.nim,
          prodi: user.profile.prodi?.nama || user.profile.programStudi,
          semester: user.profile.semester,
        }));

      setProfiles(mappedProfiles);
    } catch (error: any) {
      toast.error("Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId: string) => {
    setProgressLoading(true);
    try {
      // Fetch student's transkrip CPL from backend
      const result = await api.get('/transkrip-cpl', { params: { mahasiswaId: studentId } });
      const transkripList = result.data || [];

      // Fetch total CPL count
      const cplResult = await api.get('/cpl');
      const totalCPL = cplResult.data?.length || 0;

      if (transkripList.length > 0) {
        // Map to cplDetails
        const cplDetails = transkripList.map((item: TranskripItem) => ({
          kode: item.cpl?.kodeCpl || "Unknown",
          nilai: parseFloat(item.nilaiAkhir) || 0,
          status: item.status || 'belum_tercapai'
        }));

        const avgScore =
          cplDetails.reduce((sum: number, item: { nilai: number }) => sum + item.nilai, 0) / cplDetails.length;
        const completedCPL = cplDetails.filter((item: { status?: string }) => item.status === 'tercapai').length;

        setStudentProgress({
          avgScore: parseFloat(avgScore.toFixed(2)),
          totalCPL,
          completedCPL,
          cplDetails,
        });
      } else {
        setStudentProgress({
          avgScore: 0,
          totalCPL,
          completedCPL: 0,
          cplDetails: [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching student progress:', error);
      toast.error("Gagal memuat progress mahasiswa");
    } finally {
      setProgressLoading(false);
    }
  };

  const handleViewProgress = async (student: Profile) => {
    setSelectedStudent(student);
    setDialogOpen(true);
    await fetchStudentProgress(student.id);
  };

  const handleMataKuliahChange = async (mataKuliahId: string) => {
    setSelectedMataKuliah(mataKuliahId);
    setLoading(true);
    if (mataKuliahId === "all") {
      // Fetch mahasiswa dari semua mata kuliah yang diampu
      await fetchProfilesForAllMataKuliah();
    } else {
      // Fetch mahasiswa dari mata kuliah spesifik
      await fetchProfiles(mataKuliahId);
    }
  };

  const fetchProfilesForAllMataKuliah = async () => {
    try {
      // Ambil daftar mahasiswa dari backend: /api/users?role=mahasiswa (tanpa mataKuliahId untuk role dosen)
      const response = await fetchMahasiswaList({ limit: -1 });
      const users = response?.data || [];

      const mappedProfiles: Profile[] = users
        .filter((user: User) => user.profile && user.profile.nim)
        .map((user: User) => ({
          id: user.id,
          full_name: user.profile.namaLengkap || "",
          nim: user.profile.nim,
          prodi: user.profile.prodi?.nama || user.profile.programStudi,
          semester: user.profile.semester,
        }));

      setProfiles(mappedProfiles);
    } catch (error: any) {
      toast.error("Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  const semesterOptions = Array.from(
    new Set(profiles.map((p) => p.semester).filter((s) => s !== null && s !== undefined))
  ).sort((a, b) => Number(a) - Number(b));

  const prodiOptions = Array.from(
    new Set(profiles.map((p) => p.prodi).filter((p): p is string => !!p && p.trim() !== ""))
  );

  const filteredProfiles = profiles.filter((profile) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      profile.full_name.toLowerCase().includes(q) ||
      (profile.nim || "").toLowerCase().includes(q) ||
      (profile.prodi || "").toLowerCase().includes(q);

    const matchSemester =
      semesterFilter === "all" ||
      (profile.semester !== null && profile.semester !== undefined && String(profile.semester) === semesterFilter);

    const matchProdi =
      prodiFilter === "all" || profile.prodi === prodiFilter;

    return matchSearch && matchSemester && matchProdi;
  });

  const hasActiveFilter = semesterFilter !== "all" || prodiFilter !== "all";

  if (loading) {
    return (
      <DashboardPage title="Data Mahasiswa">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardPage>
    );
  }

  // Show message for dosen with no mata kuliah
  if (userRole === 'dosen' && mataKuliahList.length === 0) {
    return (
      <DashboardPage title="Data Mahasiswa">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Tidak Ada Mata Kuliah
              </h3>
              <p className="text-sm text-muted-foreground">
                Anda belum ditugaskan sebagai pengampu pada mata kuliah manapun.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Data Mahasiswa"
      description={userRole === 'dosen' 
        ? "Daftar mahasiswa yang mengikuti mata kuliah Anda" 
        : "Daftar mahasiswa terdaftar dengan progress CPL"
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIM, atau prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Filter Button - Only Mata Kuliah for Dosen */}
          {userRole === 'dosen' && mataKuliahList.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedMataKuliah ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Mata Kuliah</span>
                  <span className="sm:hidden">MK</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 space-y-4">
                {/* Mata Kuliah Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Mata Kuliah</Label>
                  <Select
                    value={selectedMataKuliah}
                    onValueChange={handleMataKuliahChange}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Pilih Mata Kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                      {mataKuliahList.map((mk) => (
                        <SelectItem key={mk.mataKuliah.id} value={mk.mataKuliah.id}>
                          {mk.mataKuliah.kodeMk} - {mk.mataKuliah.namaMk} (Semester {mk.mataKuliah.semester})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {/* Filter Button for Non-Dosen Roles */}
          {userRole !== 'dosen' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilter ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  disabled={semesterOptions.length === 0 && prodiOptions.length === 0}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  <span className="sm:hidden">Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-4">
                {/* Semester Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Semester</Label>
                  <Select
                    value={semesterFilter}
                    onValueChange={(value) => setSemesterFilter(value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua semester</SelectItem>
                      {semesterOptions.map((s) => (
                        <SelectItem key={String(s)} value={String(s)}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Program Studi Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Program Studi</Label>
                  <Select
                    value={prodiFilter}
                    onValueChange={(value) => setProdiFilter(value)}
                    disabled={prodiOptions.length === 0}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua prodi</SelectItem>
                      {prodiOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset Button */}
              <div className="flex justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSemesterFilter("all");
                    setProdiFilter("all");
                    setSearchTerm("");
                  }}
                  disabled={!hasActiveFilter}
                >
                  Reset Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          )}
          
          <Button variant="outline" onClick={() => {
            if (userRole === 'dosen' && selectedMataKuliah) {
              if (selectedMataKuliah === "all") {
                fetchProfilesForAllMataKuliah();
              } else {
                fetchProfiles(selectedMataKuliah);
              }
            } else {
              fetchProfiles();
            }
          }}>
            Muat Ulang
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Mahasiswa</CardTitle>
            <CardDescription>
              Menampilkan {filteredProfiles.length} dari {profiles.length} mahasiswa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIM</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Program Studi</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada data mahasiswa
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.nim || "-"}</TableCell>
                      <TableCell>{profile.full_name}</TableCell>
                      <TableCell>
                        {profile.prodi ? (
                          <Badge variant="secondary">{profile.prodi}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.semester ? `Semester ${profile.semester}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewProgress(profile)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Progress
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Student Progress Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Progress CPL - {selectedStudent?.full_name}
              </DialogTitle>
              <DialogDescription>
                {selectedStudent?.nim} | {selectedStudent?.prodi}
              </DialogDescription>
            </DialogHeader>

            {progressLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : studentProgress ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{studentProgress.avgScore.toFixed(2)}</div>
                      <Progress value={studentProgress.avgScore} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">CPL Tercapai</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {studentProgress.completedCPL} / {studentProgress.totalCPL}
                      </div>
                      <Progress
                        value={(studentProgress.completedCPL / studentProgress.totalCPL) * 100}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        variant={studentProgress.avgScore >= 75 ? "default" : "secondary"}
                        className="text-lg px-3 py-1"
                      >
                        {studentProgress.avgScore >= 75 ? "Baik" : "Perlu Peningkatan"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {studentProgress.cplDetails.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Detail Nilai per CPL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={studentProgress.cplDetails}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="kode" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="nilai" fill="hsl(var(--primary))" name="Nilai" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12">
                      <p className="text-center text-muted-foreground">
                        Belum ada data nilai untuk mahasiswa ini
                      </p>
                    </CardContent>
                  </Card>
                )}

                {studentProgress.cplDetails.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Daftar Nilai CPL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {studentProgress.cplDetails
                          .sort((a, b) => b.nilai - a.nilai)
                          .map((cpl, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{cpl.kode}</Badge>
                                <span className="font-medium">{cpl.nilai.toFixed(2)}</span>
                              </div>
                              <Progress value={cpl.nilai} className="w-48" />
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPage>
  );
};

export default MahasiswaPage;
