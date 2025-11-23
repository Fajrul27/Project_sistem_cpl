import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface MataKuliah {
  id: string;
  kodeMk: string;
  namaMk: string;
  sks: number;
  semester: number;
  createdBy: string;
}

const MataKuliahPage = () => {
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMK, setEditingMK] = useState<MataKuliah | null>(null);
  const { role } = useUserRole();

  const [formData, setFormData] = useState({
    kodeMk: "",
    namaMk: "",
    sks: "3",
    semester: "1",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  const fetchMataKuliah = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/mata-kuliah`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat data mata kuliah`);
      }

      const result = await response.json();
      const data = result.data || result;
      setMkList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching mata kuliah:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
      setMkList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kodeMk || !formData.namaMk) {
      toast.error("Kode MK dan Nama MK harus diisi");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (editingMK) {
        const response = await fetch(`${API_URL}/mata-kuliah/${editingMK.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            kodeMk: formData.kodeMk.trim(),
            namaMk: formData.namaMk.trim(),
            sks: parseInt(formData.sks),
            semester: parseInt(formData.semester),
          })
        });

        if (!response.ok) throw new Error('Gagal update mata kuliah');
        toast.success("Mata kuliah berhasil diupdate");
      } else {
        const response = await fetch(`${API_URL}/mata-kuliah`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            kodeMk: formData.kodeMk.trim(),
            namaMk: formData.namaMk.trim(),
            sks: parseInt(formData.sks),
            semester: parseInt(formData.semester),
          })
        });

        if (!response.ok) throw new Error('Gagal tambah mata kuliah');
        toast.success("Mata kuliah berhasil ditambahkan");
      }

      resetForm();
      await fetchMataKuliah();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving mata kuliah:', error);
      toast.error(
        error instanceof Error 
          ? `Gagal menyimpan: ${error.message}`
          : 'Terjadi kesalahan saat menyimpan data'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (mk: MataKuliah) => {
    setEditingMK(mk);
    setFormData({
      kodeMk: mk.kodeMk,
      namaMk: mk.namaMk,
      sks: mk.sks.toString(),
      semester: mk.semester.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus mata kuliah ini?")) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/mata-kuliah/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Gagal hapus mata kuliah');
      
      toast.success("Mata kuliah berhasil dihapus");
      await fetchMataKuliah();
    } catch (error) {
      console.error('Error deleting mata kuliah:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      kodeMk: "",
      namaMk: "",
      sks: "3",
      semester: "1",
    });
    setEditingMK(null);
  };

  const canEdit = role === "admin" || role === "dosen";

  const semesterOptions = Array.from(
    new Set(mkList.map((mk) => mk.semester).filter((s) => s !== null && s !== undefined))
  ).sort((a, b) => Number(a) - Number(b));

  const filteredMK = mkList.filter((mk) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      mk.kodeMk.toLowerCase().includes(q) ||
      mk.namaMk.toLowerCase().includes(q) ||
      String(mk.semester).includes(q);

    const matchSemester =
      semesterFilter === "all" || String(mk.semester) === semesterFilter;

    return matchSearch && matchSemester;
  });

  const hasActiveFilter = semesterFilter !== "all";

  if (loading) {
    return (
      <DashboardPage title="Data Mata Kuliah">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Data Mata Kuliah"
      description="Kelola mata kuliah program studi"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode, nama, atau semester mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilter ? "default" : "outline"}
                size="sm"
                className="gap-2"
                disabled={semesterOptions.length === 0}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
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
              <div className="flex justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSemesterFilter("all")}
                  disabled={!hasActiveFilter}
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={fetchMataKuliah}>
            Muat Ulang
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base md:text-lg">Daftar Mata Kuliah</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Menampilkan <span className="font-medium">{filteredMK.length}</span> dari {" "}
                <span className="font-medium">{mkList.length}</span> mata kuliah
              </CardDescription>
            </div>
            {canEdit && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => { resetForm(); setDialogOpen(true); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Mata Kuliah
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMK ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}</DialogTitle>
                    <DialogDescription>
                      Isi form untuk {editingMK ? "mengupdate" : "menambahkan"} data mata kuliah
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kodeMk">Kode MK</Label>
                      <Input
                        id="kodeMk"
                        placeholder="Contoh: IF-101"
                        value={formData.kodeMk}
                        onChange={(e) => setFormData({ ...formData, kodeMk: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="namaMk">Nama Mata Kuliah</Label>
                      <Input
                        id="namaMk"
                        placeholder="Nama mata kuliah"
                        value={formData.namaMk}
                        onChange={(e) => setFormData({ ...formData, namaMk: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sks">SKS</Label>
                        <Input
                          id="sks"
                          type="number"
                          min="1"
                          max="6"
                          value={formData.sks}
                          onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input
                          id="semester"
                          type="number"
                          min="1"
                          max="8"
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingMK ? "Memperbarui..." : "Menyimpan..."}
                          </>
                        ) : editingMK ? "Update" : "Simpan"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode MK</TableHead>
                  <TableHead>Nama Mata Kuliah</TableHead>
                  <TableHead>SKS</TableHead>
                  <TableHead>Semester</TableHead>
                  {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMK.map((mk) => (
                  <TableRow key={mk.id}>
                    <TableCell className="font-medium">{mk.kodeMk}</TableCell>
                    <TableCell>{mk.namaMk}</TableCell>
                    <TableCell>{mk.sks}</TableCell>
                    <TableCell>Semester {mk.semester}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(mk)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(mk.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}

export default MataKuliahPage;
