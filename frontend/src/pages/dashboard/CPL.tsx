import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CPL {
  id: string;
  kodeCpl: string;
  deskripsi: string;
  kategori: string;
  bobot: number;
  createdAt?: string;
  updatedAt?: string;
}

type FormData = {
  kodeCpl: string;
  deskripsi: string;
  kategori: string;
  bobot: string;
};

const CPLPage = () => {
  const navigate = useNavigate();
  const [cplList, setCplList] = useState<CPL[]>([]);
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
    kategori: "",
    bobot: "1.0",
  });

  useEffect(() => {
    fetchCPL();
  }, []);

  const fetchCPL = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/cpl`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Gagal memuat data CPL`);
      }

      const result = await response.json();
      const data = result.data || result;
      setCplList(Array.isArray(data) ? data : []);
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
    if (!formData.kodeCpl || !formData.deskripsi || !formData.kategori) {
      toast.error("Semua field harus diisi");
      return;
    }

    const bobotValue = parseFloat(formData.bobot);
    if (isNaN(bobotValue) || bobotValue <= 0) {
      toast.error("Bobot harus berupa angka positif");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (editingCPL) {
        const response = await fetch(`${API_URL}/cpl/${editingCPL.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            kodeCpl: formData.kodeCpl.trim(),
            deskripsi: formData.deskripsi.trim(),
            kategori: formData.kategori.trim(),
            bobot: bobotValue,
          })
        });

        if (!response.ok) throw new Error('Gagal update CPL');
        toast.success("CPL berhasil diperbarui");
      } else {
        const response = await fetch(`${API_URL}/cpl`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            kodeCpl: formData.kodeCpl.trim(),
            deskripsi: formData.deskripsi.trim(),
            kategori: formData.kategori.trim(),
            bobot: bobotValue,
          })
        });

        if (!response.ok) throw new Error('Gagal tambah CPL');
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
      kategori: cpl.kategori,
      bobot: cpl.bobot.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/cpl/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) throw new Error('Gagal hapus CPL');
      
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
      kategori: "",
      bobot: "1.0",
    });
    setEditingCPL(null);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const canEdit = role === "admin" || role === "dosen";

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
      actions={
        canEdit ? (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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
                  <Input
                    id="kategori"
                    placeholder="Contoh: Sikap, Pengetahuan, Keterampilan"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bobot">Bobot</Label>
                  <Input
                    id="bobot"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="1.0"
                    value={formData.bobot}
                    onChange={(e) => setFormData({ ...formData, bobot: e.target.value })}
                    required
                  />
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
        ) : null
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Daftar CPL</CardTitle>
          <CardDescription>Total: {cplList.length} CPL</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode CPL</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cplList.map((cpl) => (
                <TableRow key={cpl.id}>
                  <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                  <TableCell>{cpl.deskripsi}</TableCell>
                  <TableCell>{cpl.kategori}</TableCell>
                  <TableCell>{cpl.bobot}</TableCell>
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
    </DashboardPage>
  );
};

export default CPLPage;
