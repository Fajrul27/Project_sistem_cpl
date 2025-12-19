import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, Eye, Search, SlidersHorizontal, List as ListIcon, Table as TableIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useCPL, CPL } from "@/hooks/useCPL";
import { PLMappingMatrix } from "./components/PLMappingMatrix";
import { useProfilLulusan } from "@/hooks/useProfilLulusan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormData = {
  kodeCpl: string;
  deskripsi: string;
  kategoriId: string;
  prodiId: string;
};

const CPLPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUserRole();
  const { can } = usePermission();
  const {
    cplList, // Now filtered
    kategoriList,
    fakultasList,
    prodiList,
    loading,
    fetchCPL,
    fetchKategori,
    fetchFakultas,
    fetchProdi,
    createCPL,
    updateCPL,
    deleteCPL,
    filters: cplFilters,
    setSearchTerm: setCplSearchTerm,
    setFakultasFilter,
    setProdiFilter,
    resetFilters,
    pagination
  } = useCPL();

  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCPL, setEditingCPL] = useState<CPL | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "matrix">("list");

  const [formData, setFormData] = useState<FormData>({
    kodeCpl: "",
    deskripsi: "",
    kategoriId: "",
    prodiId: "",
  });

  // PL Mapping State
  const {
    profilList,
    loading: loadingProfil,
    updateProfil,
    setSelectedProdi: setProfilProdi,
    searchTerm: profilSearchTerm,
    setSearchTerm: setProfilSearchTerm,
    setSearchBy
  } = useProfilLulusan();

  const [searchParams] = useSearchParams();

  // Switch searchBy mode based on view
  useEffect(() => {
    if (viewMode === "matrix") {
      setSearchBy("all");
    } else {
      setSearchBy("all");
    }
  }, [viewMode, setSearchBy]);

  // Sync selected prodi for mapping
  useEffect(() => {
    if (viewMode === "matrix" && cplFilters.prodiFilter !== 'all') {
      setProfilProdi(cplFilters.prodiFilter);
    }
  }, [viewMode, cplFilters.prodiFilter, setProfilProdi]);

  // Reset search terms when switching views
  useEffect(() => {
    if (viewMode === "matrix") {
      setCplSearchTerm(""); // Clear CPL search so all columns show
    } else {
      setProfilSearchTerm(""); // Clear Profil search so list is clean
    }
  }, [viewMode, setCplSearchTerm, setProfilSearchTerm]);

  const currentSearchTerm = viewMode === "matrix" ? profilSearchTerm : cplFilters.searchTerm;
  const handleSearchChange = (val: string) => {
    if (viewMode === "matrix") {
      setProfilSearchTerm(val);
    } else {
      setCplSearchTerm(val);
    }
  };

  // Handle URL params for navigation from other pages
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const fakultasIdParam = searchParams.get("fakultasId");
    const prodiIdParam = searchParams.get("prodiId");

    if (viewParam === "matrix") {
      setViewMode("matrix");
    }

    if (fakultasIdParam) {
      setFakultasFilter(fakultasIdParam);
    }

    if (prodiIdParam) {
      // Small delay to ensure fakultas is set first if needed, though state updates are batched usually.
      // But since prodi list depends on fakultas, we might need to wait for prodi list to load?
      // Actually fetchProdi depends on fakultasFilter.
      // So setting fakultasFilter triggers fetchProdi.
      // We should probably set prodiFilter after a short delay or ensure it persists.
      // For now, let's set it directly.
      setProdiFilter(prodiIdParam);
    }
  }, [searchParams, setFakultasFilter, setProdiFilter]);

  useEffect(() => {
    fetchCPL();
    fetchKategori();
    fetchFakultas();
    fetchProdi();
  }, [fetchCPL, fetchKategori, fetchFakultas, fetchProdi]);

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

      let success = false;
      if (editingCPL) {
        success = await updateCPL(editingCPL.id, payload);
      } else {
        success = await createCPL(payload);
      }

      if (success) {
        resetForm();
        setDialogOpen(false);
      }
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

  // Delete Dialog State
  const [cplToDelete, setCplToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCplToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (cplToDelete) {
      await deleteCPL(cplToDelete);
      setDeleteDialogOpen(false);
      setCplToDelete(null);
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

  const canEdit = can('edit', 'cpl') || can('create', 'cpl') || can('delete', 'cpl'); // Broaden to management rights
  const canViewAll = can('view_all', 'cpl') || role === 'admin';

  // Use full lists for filter options now since we don't have all data client-side
  const kategoriOptions = kategoriList.map(k => k.nama);
  const filterProdiOptions = prodiList;

  const hasActiveFilter = cplFilters.fakultasFilter !== "" || cplFilters.prodiFilter !== "all";

  if (loading && cplList.length === 0) {
    return (
      <DashboardPage title="Data CPL">
        <LoadingScreen fullScreen={false} message="Memuat data CPL..." />
      </DashboardPage>
    );
  }

  const showBackButton = location.state?.from === 'profil-lulusan';

  const actions = showBackButton ? (
    <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/profil-lulusan', { state: { filters: location.state?.filters } })} className="gap-2">
      <ArrowLeft className="w-4 h-4" /> Kembali
    </Button>
  ) : undefined;

  return (
    <DashboardPage
      title="Data CPL & Mapping"
      description="Kelola Capaian Pembelajaran Lulusan dan Mapping ke Profil Lulusan"
      actions={actions}
    >
      <div className="space-y-6">

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-4 border-b pb-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "matrix")} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListIcon className="w-4 h-4" /> Daftar CPL
              </TabsTrigger>
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> Matrix Mapping
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={viewMode === "matrix" ? "Cari Profil atau Program Studi..." : "Cari kode, deskripsi, atau kategori CPL..."}
              value={currentSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilter ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Fakultas</Label>
                <Select
                  value={cplFilters.fakultasFilter}
                  onValueChange={setFakultasFilter}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Semua Fakultas" />
                  </SelectTrigger>
                  <SelectContent>
                    {fakultasList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(canViewAll || role === 'kaprodi') && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Program Studi</Label>
                  <Select
                    value={cplFilters.prodiFilter}
                    onValueChange={setProdiFilter}
                    disabled={!cplFilters.fakultasFilter && canViewAll} // Optional: disable if no fakultas selected
                  // User requested hierarchical, so maybe good to keep it open or dependent.
                  // In PL page we disabled it. Here let's keep it enabled but it will show all if no fakultas selected (or filtered if fakultas selected).
                  // Actually, fetchProdi depends on fakultasFilter. So if no fakultasFilter, it fetches all prodis.
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
              )}
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={!hasActiveFilter && currentSearchTerm === ""}
          >
            Reset Filter
          </Button>
        </div>

        {viewMode === "list" ? (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base md:text-lg">Daftar CPL</CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Menampilkan <span className="font-medium">{cplList.length}</span> dari {pagination.totalItems} CPL
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
                        <Textarea
                          id="deskripsi"
                          placeholder="Deskripsi CPL"
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          required
                          className="min-h-[100px]"
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
                          disabled={!canViewAll}
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
                              <LoadingSpinner size="sm" className="mr-2" />
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Kode CPL</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Program Studi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cplList.map((cpl, index) => (
                      <TableRow key={cpl.id}>
                        <TableCell>
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                        <TableCell className="max-w-md">{cpl.deskripsi}</TableCell>
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {/* Pagination Controls */}
            {
              pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
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
              )
            }
          </Card >
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Matrix Mapping Profil Lulusan - CPL</CardTitle>
              <CardDescription>
                Hubungkan Profil Lulusan dengan CPL menggunakan tabel matrix di bawah ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cplFilters.prodiFilter === 'all' && canViewAll && !currentSearchTerm ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-lg border-dashed">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <TableIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold">Pilih Program Studi</h3>
                  <p className="max-w-sm mt-2">
                    Silakan pilih Program Studi terlebih dahulu pada filter di atas atau gunakan pencarian untuk menampilkan tabel matrix mapping.
                  </p>
                </div>
              ) : (
                <PLMappingMatrix
                  profilList={profilList}
                  cplList={cplList}
                  onUpdate={async (id, cplIds) => {
                    const success = await updateProfil(id, { cplIds });
                    return success;
                  }}
                  loading={loadingProfil}
                  readOnly={!canEdit}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div >


      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Hapus CPL"
        description="Apakah Anda yakin ingin menghapus CPL ini? Data yang telah dihapus tidak dapat dikembalikan."
      />
    </DashboardPage >
  );
}

export default CPLPage;
