import { useState, useEffect } from "react";
import { supabase, fetchMahasiswaList } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, TrendingUp } from "lucide-react";
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
  cplDetails: { kode: string; nilai: number }[];
}

const MahasiswaPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const supabaseClient = supabase as any;

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      // Ambil daftar mahasiswa dari backend: /api/users?role=mahasiswa
      const response = await fetchMahasiswaList();
      const users = response?.data || [];

      const mappedProfiles: Profile[] = users
        .map((user: any) => user.profile)
        .filter((p: any) => p && p.nim)
        .map((p: any) => ({
          id: p.id,
          full_name: p.namaLengkap || "",
          nim: p.nim,
          prodi: p.programStudi,
          semester: p.semester,
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
      // Fetch student's CPL scores
      const { data: nilaiData, error: nilaiError } = await supabaseClient
        .from("nilai_cpl")
        .select(`
          nilai,
          cpl:cpl_id (kode_cpl, deskripsi)
        `)
        .eq("mahasiswa_id", studentId);

      if (nilaiError) throw nilaiError;

      // Fetch total CPL count
      const { data: cplData, error: cplError } = await supabaseClient.from("cpl").select("id");
      if (cplError) throw cplError;

      if (nilaiData && nilaiData.length > 0) {
        // Calculate average per CPL
        const cplAvg: any = {};
        nilaiData.forEach((item: any) => {
          const kode = item.cpl?.kode_cpl || "Unknown";
          if (!cplAvg[kode]) {
            cplAvg[kode] = { total: 0, count: 0 };
          }
          cplAvg[kode].total += parseFloat(item.nilai);
          cplAvg[kode].count += 1;
        });

        const cplDetails = Object.entries(cplAvg).map(([kode, data]: [string, any]) => ({
          kode,
          nilai: parseFloat((data.total / data.count).toFixed(2)),
        }));

        const avgScore =
          cplDetails.reduce((sum, item) => sum + item.nilai, 0) / cplDetails.length;
        const completedCPL = cplDetails.filter((item) => item.nilai >= 60).length;

        setStudentProgress({
          avgScore: parseFloat(avgScore.toFixed(2)),
          totalCPL: cplData?.length || 0,
          completedCPL,
          cplDetails,
        });
      } else {
        setStudentProgress({
          avgScore: 0,
          totalCPL: cplData?.length || 0,
          completedCPL: 0,
          cplDetails: [],
        });
      }
    } catch (error: any) {
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

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.prodi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardPage title="Data Mahasiswa">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Data Mahasiswa"
      description="Daftar mahasiswa terdaftar dengan progress CPL"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, NIM, atau prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
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
