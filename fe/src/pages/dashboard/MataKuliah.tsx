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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, SlidersHorizontal, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { ImportResultDialog } from "@/components/common/ImportResultDialog";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { useMataKuliah, MataKuliah, MataKuliahFormData } from "@/hooks/useMataKuliah";
import { LoadingSpinner, LoadingScreen } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List as ListIcon } from "lucide-react";
import { CPLMKWeightMatrix } from "./components/CPLMKWeightMatrix";

import { useCPL } from "@/hooks/useCPL";
import { Pagination } from "@/components/common/Pagination";

const MataKuliahPage = () => {
  const navigate = useNavigate();
  const { role, profile } = useUserRole();
  const { can } = usePermission();
  const canManage = can('access', 'kaprodi') || can('access', 'admin');
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
    fetchMataKuliah,
    pagination,
    setSearchTerm
  } = useMataKuliah();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMK, setEditingMK] = useState<MataKuliah | null>(null);
  const [formData, setFormData] = useState<MataKuliahFormData>(initialForm);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const [currentTab, setCurrentTab] = useState("list");

  // CPL & Mapping State for Weight Matrix Tab
  const { cplList, fetchCPL, setProdiFilter: setCplProdiFilter, setKurikulumFilter: setCplKurikulumFilter } = useCPL();
  const [cplMkMappings, setCplMkMappings] = useState<Record<string, number>>({});
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errors?: string[] } | null>(null);

  // Helper validation for filter completeness
  const isFilterComplete = (() => {
    const normalizedRole = role?.toLowerCase();
    if (normalizedRole === 'mahasiswa') return true;
    if (normalizedRole === 'admin') {
      return filters.fakultasFilter && filters.prodiFilter && filters.semesterFilter;
    }
    if (normalizedRole === 'dosen') {
      return true;
    }
    // Kaprodi
    return filters.prodiFilter && filters.semesterFilter;
  })();

  // Auto-initialize filters for mahasiswa from profile
  useEffect(() => {
    if (role?.toLowerCase() === 'mahasiswa' && profile) {
      if (profile.prodiId && !filters.prodiFilter) {
        setProdiFilter(profile.prodiId);
      }
      if (profile.semester && !filters.semesterFilter) {
        setSemesterFilter(profile.semester.toString());
      }
      if (profile.angkatanRef?.kurikulumId && !filters.kurikulumFilter) {
        setKurikulumFilter(profile.angkatanRef.kurikulumId);
      }
    }
  }, [role, profile, filters.prodiFilter, filters.semesterFilter, filters.kurikulumFilter, setProdiFilter, setSemesterFilter, setKurikulumFilter]);

  // Sync filters to useCPL (to filter columns in Matrix)
  useEffect(() => {
    if (filters.prodiFilter && filters.prodiFilter !== 'all') {
      setCplProdiFilter(filters.prodiFilter);
    } else {
      setCplProdiFilter("all");
    }

    if (filters.kurikulumFilter && filters.kurikulumFilter !== 'all') {
      setCplKurikulumFilter(filters.kurikulumFilter);
    } else {
      setCplKurikulumFilter("all");
    }
  }, [filters.prodiFilter, filters.kurikulumFilter, setCplProdiFilter, setCplKurikulumFilter]);


  const fetchMappings = async () => {
    setLoadingMappings(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/cpl-mata-kuliah`, { credentials: 'include' });
      if (!response.ok) throw new Error('Gagal fetch mappings');
      const json = await response.json();
      const map: Record<string, number> = {};
      json.data.forEach((m: any) => {
        // Use underscore to separate UUIDs because UUIDs contain dashes
        map[`${m.cplId}_${m.mataKuliahId}`] = Number(m.bobotKontribusi);
      });
      setCplMkMappings(map);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data mapping");
    } finally {
      setLoadingMappings(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'weight-matrix') {
      fetchMappings();
    }
  }, [currentTab, filters.prodiFilter, filters.kurikulumFilter]);

  const handleSaveWeights = async (updates: any[]) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/cpl-mata-kuliah/batch-update-weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mappings: updates })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      fetchMappings();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan bobot");
      return false;
    }
  };

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

  // Export handler  
  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.semesterFilter !== 'all') queryParams.append('semester', filters.semesterFilter);
      if (filters.prodiFilter !== 'all') queryParams.append('prodiId', filters.prodiFilter);
      if (filters.fakultasFilter !== 'all') queryParams.append('fakultasId', filters.fakultasFilter);
      if (filters.kurikulumFilter !== 'all') queryParams.append('kurikulumId', filters.kurikulumFilter);

      const API_URL = import.meta.env.VITE_API_URL;
      const url = `${API_URL}/mata-kuliah/export/excel?${queryParams.toString()}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Gagal export data');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `mata_kuliah_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success('Data Mata Kuliah berhasil diexport');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data Mata Kuliah');
    }
  };

  // Import handler
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
        const response = await fetch(`${API_URL}/mata-kuliah/import/excel`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();

        setImportResult({
          successCount: result.successCount || 0,
          errors: result.errors
        });

        if (!response.ok) throw new Error(result.error || 'Gagal import data');

        if (result.errors && result.errors.length > 0) {
          toast.warning(`Import selesai: ${result.successCount || 0} berhasil, ${result.errors.length} gagal.`);
        } else {
          toast.success(result.message || 'Data berhasil diimport');
        }

        // Refresh data
        fetchMataKuliah(true);
      } catch (error: any) {
        console.error('Import error:', error);
        toast.error(error.message || 'Gagal import data Mata Kuliah');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };


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
      title="Mata Kuliah"
      description={role === 'mahasiswa'
        ? "Daftar mata kuliah program studi Anda"
        : "Kelola daftar mata kuliah dan struktur kurikulum"
      }
    >
      <div className="flex flex-col gap-6">
        {canManage && (
          <CollapsibleGuide title="Panduan Manajemen Mata Kuliah">
            <div className="space-y-3">
              <p>Halaman ini digunakan untuk mengelola data master Mata Kuliah yang berlaku di program studi. Anda dapat menambahkan data satu per satu atau melakukan import massal melalui Excel.</p>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                <li>Setiap mata kuliah harus memiliki <strong>Kode MK</strong> unik dan terhubung ke <strong>Kurikulum</strong> tertentu.</li>
                <li>Untuk import, pastikan kolom <strong>Nama MK, Kode MK, SKS, Semester, Prodi, Kurikulum,</strong> dan <strong>Jenis MK</strong> sesuai dengan data master.</li>
                <li><strong>Bobot MK:</strong> Gunakan tab ini untuk memetakan kontribusi mata kuliah terhadap Capaian Pembelajaran Lulusan (CPL). Pastikan Anda telah memilih Prodi dan Kurikulum pada filter untuk menampilkan matriks pemetaan.</li>
                <li>Filter prodi dan kurikulum akan membantu membatasi tampilan data yang relevan agar pemetaan CPL lebih akurat.</li>
              </ul>
            </div>
          </CollapsibleGuide>
        )}

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            {role !== 'mahasiswa' && (
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <ListIcon className="w-4 h-4" /> Daftar Mata Kuliah
                </TabsTrigger>
                {(can('edit', 'cpl') || role === 'admin' || role === 'kaprodi') && (
                  <TabsTrigger value="weight-matrix" className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Bobot MK
                  </TabsTrigger>
                )}
              </TabsList>
            )}
          </div>

          {/* Search and Filter - Shared across tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={role === 'admin' ? "Cari kode, nama, atau semester mata kuliah..." : "Cari kode atau nama mata kuliah..."}
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
                  {role?.toLowerCase() === 'admin' && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Fakultas</Label>
                      <Select
                        value={filters.fakultasFilter}
                        onValueChange={(value) => {
                          setFakultasFilter(value);
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Pilih Fakultas" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {fakultasList.map((f: any) => (
                            <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(role?.toLowerCase() === 'admin' || filteredProdiOptions.length > 1) && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Program Studi</Label>
                      <Select
                        value={filters.prodiFilter}
                        onValueChange={(value) => setProdiFilter(value)}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Pilih Program Studi" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {filteredProdiOptions.map((p: any) => (
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
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Semester</SelectItem>
                        {semesterList.map((s: any) => (
                          <SelectItem key={s.id || s} value={s.id?.toString() || s.toString()}>{s.nama || `Semester ${s}`}</SelectItem>
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
          </div>

          <TabsContent value="list" className="mt-0 space-y-6">
            {/* Search and Filter - Hidden for mahasiswa */}


            {/* Search and Filter - Hidden for mahasiswa */}
            {!isFilterComplete ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="p-4 bg-muted rounded-full">
                    <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Filter Data Diperlukan</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Silakan pilih {role === 'admin' ? "Fakultas, Program Studi, dan " : (role !== 'dosen' ? "Program Studi dan " : "")}Semester untuk menampilkan data mata kuliah.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (


              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base md:text-lg">Daftar Mata Kuliah</CardTitle>
                    <CardDescription className="text-xs md:text-sm text-muted-foreground">
                      Menampilkan <span className="font-medium">{mkList.length}</span> dari {" "}
                      <span className="font-medium">{pagination.totalItems}</span> mata kuliah
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {can('view', 'mata_kuliah') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                    {can('edit', 'mata_kuliah') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleImportClick}
                        disabled={importing}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {importing ? 'Importing...' : 'Import'}
                      </Button>
                    )}
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
                  </div>
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


                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="weight-matrix" className="mt-0">
            {(!filters.prodiFilter || filters.prodiFilter === 'all' || !filters.kurikulumFilter || filters.kurikulumFilter === 'all') ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="p-4 bg-muted rounded-full">
                    <SlidersHorizontal className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Pilih Program Studi & Kurikulum</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Silakan pilih Program Studi dan Kurikulum terlebih dahulu pada filter di atas untuk menampilkan matrix bobot mata kuliah.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CPLMKWeightMatrix
                cplList={cplList}
                mkList={mkList}
                initialMappings={cplMkMappings}
                onSave={handleSaveWeights}
                loading={loading || loadingMappings}
                readOnly={!can('edit', 'cpl')}
              />
            )}
          </TabsContent>

        </Tabs >

        {/* Shared Pagination Controls */}
        {/* Only show pagination if filters completed AND we have data AND more than 1 page */}
        {
          isFilterComplete && mkList.length > 0 && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          )
        }

        <ImportResultDialog
          open={!!importResult}
          onOpenChange={(open) => !open && setImportResult(null)}
          result={importResult}
          title="Hasil Import Mata Kuliah"
          description="Proses import data mata kuliah telah selesai dengan rincian berikut."
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Hapus Mata Kuliah"
          description="Apakah Anda yakin ingin menghapus mata kuliah ini? Data yang dihapus tidak dapat dikembalikan."
        />
      </div>
    </DashboardPage >
  );
};

export default MataKuliahPage;

