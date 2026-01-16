import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useMataKuliah, MataKuliah, MataKuliahFormData } from "@/hooks/useMataKuliah";
import { LoadingSpinner, LoadingScreen } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";

const MataKuliahPage = () => {
  const navigate = useNavigate();
  const { role, profile } = useUserRole();
  const {
    mkList,
    loading,
    submitting,
    initialForm,
    filters,
    setSemesterFilter,
    setFakultasFilter,
    setProdiFilter,
    setKurikulumFilter,
    resetFilters,
    prodiList,
    kurikulumList,
    jenisMkList,
    fakultasList,
    semesterList,
    createMataKuliah,
    updateMataKuliah,
    deleteMataKuliah,
    pagination,
    setSearchTerm
  } = useMataKuliah();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMK, setEditingMK] = useState<MataKuliah | null>(null);
  const [formData, setFormData] = useState<MataKuliahFormData>(initialForm);

  // No need for localSearch/debouncing here as hook handles it, 
  // OR if we want local UI delay, we can keep it but hook setters now reset page.
  // The Mahasiswa pattern often drives filter directly or waits for input.
  // We'll trust the input calls hook's setter.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi field required
    if (!formData.kodeMk || !formData.namaMk || !formData.sks || !formData.prodiId || !formData.kurikulumId || !formData.jenisMkId || !formData.semesterId) {
      toast.error("Semua field wajib harus diisi");
      return;
    }



    let success = false;
    if (editingMK) {
      success = await updateMataKuliah(editingMK.id, formData);
      if (success) {
        toast.success(`Mata Kuliah "${formData.kodeMk} - ${formData.namaMk}" berhasil diupdate`);
      }
    } else {
      success = await createMataKuliah(formData);
      if (success) {
        toast.success(`Mata Kuliah "${formData.kodeMk} - ${formData.namaMk}" berhasil ditambahkan`);
      }
    }

    if (success) {
      resetForm();
      setDialogOpen(false);
    }
  };

  const handleEdit = (mk: MataKuliah) => {
    setEditingMK(mk);
    setFormData({
      kodeMk: mk.kodeMk,
      namaMk: mk.namaMk,
      sks: mk.sks.toString(),
      semester: mk.semester.toString(),
      prodiId: mk.prodiId || "",
      kurikulumId: mk.kurikulumId || "",
      jenisMkId: mk.jenisMkId || "",
      semesterId: mk.semesterId || ""
    });
    setDialogOpen(true);
  };

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mkToDelete, setMkToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setMkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (mkToDelete) {
      await deleteMataKuliah(mkToDelete);
      setDeleteDialogOpen(false);
      setMkToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingMK(null);
  };

  const { can } = usePermission();
  const showActions = can('edit', 'mata_kuliah') || can('delete', 'mata_kuliah') || can('edit', 'cpmk');

  // Static semester options 1-8 (fallback if list empty)
  const semesterOptions = semesterList.length > 0 ? semesterList.map(s => s.angka) : [1, 2, 3, 4, 5, 6, 7, 8];

  // Filtered prodi options based on role and selected fakultas
  const filteredProdiOptions = (() => {
    let prodis = prodiList;

    // First filter by Role
    if (role === 'kaprodi' && profile?.prodiId) {
      prodis = prodiList.filter(p => p.id === profile.prodiId);
    } else if (role === 'dosen') {
      // Get unique prodi IDs from taught courses
      const taughtProdiIds = new Set(mkList
        .filter(mk => mk.prodiId)
        .map(mk => mk.prodiId));

      if (taughtProdiIds.size > 0) {
        prodis = prodiList.filter(p => taughtProdiIds.has(p.id));
      }
      // If no courses found yet or no prodi attached, might show empty or all? 
      // Sticking to "taught courses" restriction means showing only those.
    }

    // Then filter by Faculty (Admin only usually, but good to keep logic consistent)
    if (filters.fakultasFilter !== 'all') {
      prodis = prodis.filter(p => p.fakultasId === filters.fakultasFilter);
    }

    return prodis;
  })();

  const hasActiveFilter = filters.semesterFilter !== "all" || filters.fakultasFilter !== "all" || filters.prodiFilter !== "all" || filters.kurikulumFilter !== "all";

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
              value={filters.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
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
            <PopoverContent align="end" className="w-80 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                {role === 'admin' && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Fakultas</Label>
                    <Select
                      value={filters.fakultasFilter}
                      onValueChange={(value) => {
                        setFakultasFilter(value);
                      }}
                    >
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

                {role !== 'dosen' && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Program Studi</Label>
                    <Select
                      value={filters.prodiFilter}
                      onValueChange={(value) => setProdiFilter(value)}
                      disabled={filters.fakultasFilter === 'all' && false} // Optional: disable if no fakultas selected? No, allow global prodi filter
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Semua Program Studi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Program Studi</SelectItem>
                        {filteredProdiOptions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Semester</Label>
                  <Select
                    value={filters.semesterFilter}
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

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Kurikulum</Label>
                  <Select
                    value={filters.kurikulumFilter}
                    onValueChange={(value) => setKurikulumFilter(value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Semua Kurikulum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kurikulum</SelectItem>
                      {kurikulumList.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama} {!k.isActive && "(Tidak Aktif)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </PopoverContent>
          </Popover >
          <Button
            type="button"
            variant="outline"
            onClick={resetFilters}
            disabled={
              !hasActiveFilter &&
              filters.searchTerm === ""
            }
          >
            Reset Filter
          </Button>
        </div >

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base md:text-lg">Daftar Mata Kuliah</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Menampilkan <span className="font-medium">{mkList.length}</span> dari {" "}
                <span className="font-medium">{pagination.totalItems}</span> mata kuliah
              </CardDescription>
            </div>
            {can('create', 'mata_kuliah') && (
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
                      <RequiredLabel htmlFor="kodeMk" required>Kode MK</RequiredLabel>
                      <Input
                        id="kodeMk"
                        placeholder="Contoh: IF-101"
                        value={formData.kodeMk}
                        onChange={(e) => setFormData({ ...formData, kodeMk: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="namaMk" required>Nama Mata Kuliah</RequiredLabel>
                      <Input
                        id="namaMk"
                        placeholder="Nama mata kuliah"
                        value={formData.namaMk}
                        onChange={(e) => setFormData({ ...formData, namaMk: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <RequiredLabel htmlFor="prodi" required>Program Studi</RequiredLabel>
                      <Select
                        value={formData.prodiId}
                        onValueChange={(val) => setFormData({ ...formData, prodiId: val })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Program Studi" />
                        </SelectTrigger>
                        <SelectContent>
                          {prodiList.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="kurikulum" required>Kurikulum</RequiredLabel>
                        <Select
                          value={formData.kurikulumId}
                          onValueChange={(val) => setFormData({ ...formData, kurikulumId: val })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Kurikulum" />
                          </SelectTrigger>
                          <SelectContent>
                            {kurikulumList
                              .filter(k => k.isActive || k.id === formData.kurikulumId)
                              .map((k) => (
                                <SelectItem key={k.id} value={k.id}>
                                  {k.nama} {!k.isActive && "(Tidak Aktif)"}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="jenisMk" required>Jenis MK</RequiredLabel>
                        <Select
                          value={formData.jenisMkId}
                          onValueChange={(val) => setFormData({ ...formData, jenisMkId: val })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Jenis MK" />
                          </SelectTrigger>
                          <SelectContent>
                            {jenisMkList.map((j) => (
                              <SelectItem key={j.id} value={j.id}>{j.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="sks" required>SKS</RequiredLabel>
                        <Input
                          id="sks"
                          type="number"
                          min="1"
                          max="6"
                          placeholder="Contoh: 3"
                          value={formData.sks}
                          onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="semester" required>Semester</RequiredLabel>
                        <Select
                          value={formData.semesterId}
                          onValueChange={(val) => {
                            const selected = semesterList.find(s => s.id === val);
                            setFormData({
                              ...formData,
                              semesterId: val,
                              semester: selected?.angka.toString() || "1"
                            });
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {semesterList.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Kode MK</TableHead>
                    <TableHead>Nama MK</TableHead>
                    <TableHead>SKS</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Kurikulum</TableHead>
                    {showActions && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && mkList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                        <LoadingScreen fullScreen={false} message="Memuat data mata kuliah..." />
                      </TableCell>
                    </TableRow>
                  ) : mkList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showActions ? 6 : 5} className="text-center py-8 text-muted-foreground">
                        Tidak ada data mata kuliah.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {loading && (
                        <TableRow className="absolute w-full h-full bg-background/50 z-10 flex items-center justify-center pointer-events-none inset-0">
                          {/* Optional: Overlay loader or just use opacity on rows */}
                        </TableRow>
                      )}
                      {mkList.map((mk, index) => (
                        <TableRow key={mk.id} className={loading ? "opacity-50 pointer-events-none" : ""}>
                          <TableCell>
                            {(pagination.page - 1) * pagination.limit + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{mk.kodeMk}</TableCell>
                          <TableCell className="min-w-[200px]">{mk.namaMk}</TableCell>
                          <TableCell>{mk.sks}</TableCell>
                          <TableCell>Semester {mk.semester}</TableCell>
                          <TableCell>{mk.kurikulum?.nama || "-"}</TableCell>
                          {showActions && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {can('edit', 'mata_kuliah') && (
                                  <Button size="sm" variant="outline" onClick={() => handleEdit(mk)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {can('edit', 'cpmk') && (
                                  <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/evaluasi/${mk.id}`)} title="Evaluasi / CQI">
                                    <SlidersHorizontal className="h-4 w-4" />
                                  </Button>
                                )}
                                {can('delete', 'mata_kuliah') && (
                                  <Button size="sm" variant="destructive" onClick={() => handleDelete(mk.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.setPage(Math.max(1, pagination.page - 1));
                  }}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let start = Math.max(1, pagination.page - 2);
                    if (start + 4 > pagination.totalPages) {
                      start = Math.max(1, pagination.totalPages - 4);
                    }
                    const p = start + i;
                    if (p > pagination.totalPages) return null;

                    return (
                      <Button
                        key={p}
                        variant={pagination.page === p ? "default" : "outline"}
                        size="sm"
                        type="button"
                        className="w-8 h-8 p-0"
                        onClick={(e) => {
                          e.preventDefault();
                          pagination.setPage(p);
                        }}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1));
                  }}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div >
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Hapus Mata Kuliah"
        description="Apakah Anda yakin ingin menghapus mata kuliah ini? Data yang dihapus tidak dapat dikembalikan."
      />
    </DashboardPage >
  );
}

export default MataKuliahPage;

