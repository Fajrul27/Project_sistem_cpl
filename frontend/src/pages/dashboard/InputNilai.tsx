import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { FileText, AlertCircle } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const InputNilaiPage = () => {
  const { role } = useUserRole();
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [cplList, setCplList] = useState<any[]>([]);
  const [mkList, setMkList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    mahasiswaId: "",
    cplId: "",
    mataKuliahId: "",
    nilai: "",
    semester: "1",
    tahunAjaran: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const token = getToken();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const [mahasiswaRes, cplRes, mkRes] = await Promise.all([
        fetch(`${API_URL}/users?role=mahasiswa`, { headers }),
        fetch(`${API_URL}/cpl`, { headers }),
        fetch(`${API_URL}/mata-kuliah`, { headers }),
      ]);

      if (!mahasiswaRes.ok || !cplRes.ok || !mkRes.ok) {
        throw new Error('Gagal memuat data');
      }

      const mahasiswaData = await mahasiswaRes.json();
      const cplData = await cplRes.json();
      const mkData = await mkRes.json();

      setMahasiswaList(mahasiswaData.data || []);
      setCplList(cplData.data || []);
      setMkList(mkData.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error("Gagal memuat data: " + error.message);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.mahasiswaId || !formData.cplId || !formData.mataKuliahId || !formData.nilai) {
      toast.error("Semua field harus diisi");
      return;
    }

    setLoading(true);
    setSubmitSuccess(false);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Session expired. Silahkan login ulang");
        return;
      }

      const response = await fetch(`${API_URL}/nilai-cpl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: formData.mahasiswaId,
          cplId: formData.cplId,
          mataKuliahId: formData.mataKuliahId,
          nilai: parseFloat(formData.nilai),
          semester: parseInt(formData.semester),
          tahunAjaran: formData.tahunAjaran,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal menyimpan nilai');
      }

      const result = await response.json();
      
      toast.success("✅ Nilai berhasil disimpan!");
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        mahasiswaId: "",
        cplId: "",
        mataKuliahId: "",
        nilai: "",
        semester: "1",
        tahunAjaran: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardPage
      title="Input Nilai CPL"
      description="Form input penilaian capaian pembelajaran"
    >
      <div className="space-y-6">
        {submitSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Nilai berhasil disimpan! Data akan muncul di dashboard dalam beberapa saat.
            </AlertDescription>
          </Alert>
        )}

        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Form Penilaian</CardTitle>
                <CardDescription>Masukkan nilai CPL mahasiswa per mata kuliah</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mahasiswa">Mahasiswa</Label>
                  <Select
                    value={formData.mahasiswaId}
                    onValueChange={(value) => setFormData({ ...formData, mahasiswaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mahasiswa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mahasiswaList.map((mhs) => (
                        <SelectItem key={mhs.id} value={mhs.id}>
                          {mhs.profile?.nim || "N/A"} - {mhs.profile?.namaLengkap || mhs.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mata_kuliah">Mata Kuliah</Label>
                  <Select
                    value={formData.mataKuliahId}
                    onValueChange={(value) => setFormData({ ...formData, mataKuliahId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata kuliah" />
                    </SelectTrigger>
                    <SelectContent>
                      {mkList.map((mk) => (
                        <SelectItem key={mk.id} value={mk.id}>
                          {mk.kodeMk} - {mk.namaMk}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpl">CPL</Label>
                  <Select
                    value={formData.cplId}
                    onValueChange={(value) => setFormData({ ...formData, cplId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih CPL" />
                    </SelectTrigger>
                    <SelectContent>
                      {cplList.map((cpl) => (
                        <SelectItem key={cpl.id} value={cpl.id}>
                          {cpl.kodeCpl} - {cpl.deskripsi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nilai">Nilai (0-100)</Label>
                    <Input
                      id="nilai"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="85.5"
                      value={formData.nilai}
                      onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tahun_ajaran">Tahun Ajaran</Label>
                  <Input
                    id="tahun_ajaran"
                    placeholder="2024/2025"
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
};

export default InputNilaiPage;
