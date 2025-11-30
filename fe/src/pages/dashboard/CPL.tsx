import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Loader2, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

import { api } from "@/lib/api-client";

interface CPL {
  id: string;
  kodeCpl: string;
  deskripsi: string;
  kategori: string;
  kategoriId?: string;
  kategoriRef?: { id: string; nama: string };
  prodiId?: string;
  prodi?: { id: string; nama: string; kode?: string };
  createdAt?: string;
  updatedAt?: string;
}

type FormData = {
  kodeCpl: string;
  deskripsi: string;
  kategoriId: string;
  prodiId: string;
};

const CPLPage = () => {
  const navigate = useNavigate();
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCPL, setEditingCPL] = useState<CPL | null>(null);
  const { role } = useUserRole();

  const [formData, setFormData] = useState<FormData>({
    kodeCpl: "",
    deskripsi: "",
    kategoriId: "",
    prodiId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("all");
  const [prodiFilter, setProdiFilter] = useState<string>("all");

  useEffect(() => {
    fetchCPL();
    fetchKategori();
    fetchProdi();
  }, []);

  const fetchProdi = async () => {
    try {
      const result = await api.get('/prodi');
      if (result.data) setProdiList(result.data);
    } catch (error) {
      console.error("Error fetching prodi:", error);
    }
  };

  const fetchKategori = async () => {
    try {
      const result = await api.get('/kategori-cpl');
      if (result.data) setKategoriList(result.data);
    } catch (error) {
      console.error("Error fetching kategori CPL:", error);
    }
  };

  const fetchCPL = async () => {
    try {
      setLoading(true);
      const result = await api.get('/cpl');
      const data = result.data || result;
      setCplList(Array.isArray(data) ? data : []);
      setMeta(result.meta || null);
    } catch (error) {
      console.error('Error fetching CPL:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data CPL');
      setCplList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kodeCpl || !formData.deskripsi || !formData.kategoriId) {
      toast.error("Semua field harus diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        kodeCpl: formData.kodeCpl.trim(),
        deskripsi: formData.deskripsi.trim(),
        kategoriId: formData.kategoriId,
        prodiId: formData.prodiId || null,
      };

      if (editingCPL) {
        await api.put(`/cpl/${editingCPL.id}`, payload);
        toast.success("CPL berhasil diperbarui");
      } else {
        await api.post('/cpl', payload);
        toast.success("CPL berhasil ditambahkan");
      }

      resetForm();
      await fetchCPL();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving CPL:', error);
      toast.error(
        error instanceof Error
          ? `Gagal menyimpan CPL: ${error.message}`
          : 'Terjadi kesalahan saat menyimpan data'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cpl: CPL) => {
    setEditingCPL(cpl);
    setFormData({
      kodeCpl: cpl.kodeCpl,
      deskripsi: cpl.deskripsi,
      kategoriId: cpl.kategoriId || "",
      prodiId: cpl.prodiId || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await api.delete(`/cpl/${deletingId}`);
      toast.success("CPL berhasil dihapus");
      await fetchCPL();
    } catch (error) {
      console.error('Error deleting CPL:', error);
      toast.error(error instanceof Error ? `Gagal menghapus CPL: ${error.message}` : 'Terjadi kesalahan');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      kodeCpl: "",
      deskripsi: "",
      kategoriId: "",
      prodiId: "",
    });
    setEditingCPL(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const canEdit = role === "admin" || role === "kaprodi";

  const kategoriOptions = Array.from(
    new Set(cplList.map((cpl) => cpl.kategoriRef?.nama || cpl.kategori).filter((k) => k && k.trim() !== ""))
  );

  // Filter prodi options based on available CPLs
  const availableProdiIds = new Set(cplList.map(cpl => cpl.prodiId).filter(Boolean));
  const filterProdiOptions = prodiList.filter(p => availableProdiIds.has(p.id));

  const filteredCPLs = cplList.filter((cpl) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      cpl.kodeCpl.toLowerCase().includes(q) ||
      cpl.deskripsi.toLowerCase().includes(q) ||
      (cpl.kategoriRef?.nama || cpl.kategori || "").toLowerCase().includes(q) ||
      (cpl.prodi?.nama || "").toLowerCase().includes(q);

    const matchKategori =
      kategoriFilter === "all" || (cpl.kategoriRef?.nama || cpl.kategori) === kategoriFilter;

    const matchProdi =
      prodiFilter === "all" || cpl.prodiId === prodiFilter;

    return matchSearch && matchKategori && matchProdi;
  });

  const hasActiveFilter = kategoriFilter !== "all" || prodiFilter !== "all";

  if (loading) {
    return (
      <DashboardPage title="Data CPL">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat data CPL...</p>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Data CPL"
      description="Kelola Capaian Pembelajaran Lulusan"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode, deskripsi, atau kategori CPL..."
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
                disabled={kategoriOptions.length === 0}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Kategori</Label>
                <Select
                  value={kategoriFilter}
                  onValueChange={(value) => setKategoriFilter(value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Semua kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {kategoriOptions.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Program Studi</Label>
                <Select
                  value={prodiFilter}
                  onValueChange={(value) => setProdiFilter(value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Semua program studi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua program studi</SelectItem>
                    {filterProdiOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
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
                  onClick={() => {
                    setKategoriFilter("all");
                    setProdiFilter("all");
                  }}
                  disabled={!hasActiveFilter}
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={fetchCPL}>
            Muat Ulang
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base md:text-lg">Daftar CPL</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Menampilkan <span className="font-medium">{filteredCPLs.length}</span> dari {" "}
                <span className="font-medium">{cplList.length}</span> CPL
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
                    Tambah CPL
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCPL ? "Edit CPL" : "Tambah CPL Baru"}</DialogTitle>
                    <DialogDescription>
                      Isi form untuk {editingCPL ? "mengupdate" : "menambahkan"} data CPL
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kodeCpl">Kode CPL</Label>
                      <Input
                        id="kodeCpl"
                        placeholder="Contoh: CPL-01"
                        value={formData.kodeCpl}
                        onChange={(e) => setFormData({ ...formData, kodeCpl: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deskripsi">Deskripsi</Label>
                      <Input
                        id="deskripsi"
                        placeholder="Deskripsi CPL"
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Select
                        value={formData.kategoriId}
                        onValueChange={(val) => setFormData({ ...formData, kategoriId: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {kategoriList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prodi">Program Studi</Label>
                      <Select
                        value={formData.prodiId}
                        onValueChange={(val) => setFormData({ ...formData, prodiId: val })}
                        disabled={role === 'kaprodi'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Program Studi" />
                        </SelectTrigger>
                        <SelectContent>
                          {prodiList.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nama} {p.kode ? `(${p.kode})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingCPL ? "Memperbarui..." : "Menyimpan..."}
                          </>
                        ) : editingCPL ? "Update" : "Simpan"}
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
                  <TableHead>Kode CPL</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Program Studi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCPLs.map((cpl) => (
                  <TableRow key={cpl.id}>
                    <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                    <TableCell>{cpl.deskripsi}</TableCell>
                    <TableCell>{cpl.kategoriRef?.nama || cpl.kategori}</TableCell>
                    <TableCell>{cpl.prodi?.nama || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/cpl/${cpl.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(cpl)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => handleDeleteClick(cpl.id, e)}
                              disabled={deletingId === cpl.id}
                            >
                              {deletingId === cpl.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus CPL. Data yang telah dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardPage>
  );
}

export default CPLPage;