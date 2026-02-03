import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, Eye, Search, SlidersHorizontal, List as ListIcon, Table as TableIcon, ArrowLeft, Save, Target, RotateCcw, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useCPL, CPL } from "@/hooks/useCPL";
import { PLMappingMatrix } from "./components/PLMappingMatrix";
import { useProfilLulusan } from "@/hooks/useProfilLulusan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvaluasiCPL } from "@/hooks/useEvaluasiCPL";
import { useAngkatan } from "@/hooks/useAngkatan";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";

type FormData = {
  kodeCpl: string;
  deskripsi: string;
  kategoriId: string;
  prodiId: string;
  kurikulumId: string;
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
    kurikulumList,
    loading,
    fetchCPL,
    fetchKategori,
    fetchFakultas,
    fetchProdi,
    fetchKurikulum,
    createCPL,
    updateCPL,
    deleteCPL,
    filters: cplFilters,
    setSearchTerm: setCplSearchTerm,
    setFakultasFilter,
    setProdiFilter,
    setKategoriFilter,
    setKurikulumFilter,
    resetFilters,
    pagination
  } = useCPL();

  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCPL, setEditingCPL] = useState<CPL | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "matrix" | "target">("list");
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (cplFilters.prodiFilter !== 'all') queryParams.append('prodiId', cplFilters.prodiFilter);
      if (cplFilters.kategoriFilter !== 'all') queryParams.append('kategori', cplFilters.kategoriFilter);
      if (cplFilters.kurikulumFilter !== 'all') queryParams.append('kurikulumId', cplFilters.kurikulumFilter);

      const API_URL = import.meta.env.VITE_API_URL;
      const url = `${API_URL}/cpl/export/excel?${queryParams.toString()}`;

      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Gagal export data');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `cpl_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success('Data CPL berhasil diexport');
    } catch (error) {
      toast.error('Gagal export data CPL');
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
        const response = await fetch(`${API_URL}/cpl/import/excel`, {
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
        toast.error(error.message || 'Gagal import data CPL');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  // Target CPL State
  const {
    loading: loadingTargets,
    targets,
    fetchTargets,
    saveTargets
  } = useEvaluasiCPL();

  const { angkatanList } = useAngkatan();
  const { tahunAjaranList, activeTahunAjaran } = useTahunAjaran();

  const [targetFilters, setTargetFilters] = useState({
    angkatan: "",
    tahunAjaran: ""
  });

  const [targetInputs, setTargetInputs] = useState<Record<string, number>>({});

  // Sync targets to inputs
  useEffect(() => {
    if (targets.length > 0) {
      const inputs: Record<string, number> = {};
      targets.forEach(t => {
        inputs[t.cplId] = t.target;
      });
      setTargetInputs(inputs);
    }
  }, [targets]);

  // Fetch targets when filters change and view is 'target'
  useEffect(() => {
    // Note: We use cplFilters.kurikulumFilter instead of targetFilters.tahunAjaran for cleaner logic
    // But we need targetFilters.tahunAjaran to track the 'period' context if it differs,
    // though we agreed they should be the same.
    // Let's use targetFilters values for fetching targets, which are synced with UI.

    if (viewMode === "target" && cplFilters.prodiFilter && cplFilters.prodiFilter !== 'all' && targetFilters.angkatan && targetFilters.tahunAjaran) {
      fetchTargets({
        prodiId: cplFilters.prodiFilter,
        angkatan: targetFilters.angkatan,
        tahunAjaran: targetFilters.tahunAjaran
      });
    }
  }, [viewMode, cplFilters.prodiFilter, targetFilters, fetchTargets]);

  const handleSaveTargets = async () => {
    const targetData = Object.entries(targetInputs).map(([cplId, target]) => ({
      cplId,
      target
    }));

    await saveTargets({
      prodiId: cplFilters.prodiFilter,
      angkatan: targetFilters.angkatan,
      tahunAjaran: targetFilters.tahunAjaran,
      targets: targetData
    });
  };

  const [formData, setFormData] = useState<FormData>({
    kodeCpl: "",
    deskripsi: "",
    kategoriId: "",
    prodiId: "",
    kurikulumId: "",
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

  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to update URL params
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

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
      updateParams({ q: val });
    }
  };

  const handleFakultasChange = (val: string) => {
    setFakultasFilter(val);
    updateParams({ fakultasId: val, prodiId: null }); // Reset prodi in URL too
  };

  const handleProdiChange = (val: string) => {
    setProdiFilter(val);
    updateParams({ prodiId: val });
  };

  const handleKategoriChange = (val: string) => {
    setKategoriFilter(val);
    updateParams({ kategori: val });
  };

  const handleKurikulumChange = (val: string) => {
    setKurikulumFilter(val);
    updateParams({ kurikulumId: val });
    // Also sync target filter if in target mode or intended to stay in sync
    setTargetFilters(prev => ({ ...prev, tahunAjaran: val }));
  };

  const handleViewChange = (val: string) => {
    const v = val as "list" | "matrix" | "target";
    setViewMode(v);
    updateParams({ view: v });
  };

  const handleResetFilters = () => {
    resetFilters();
    updateParams({
      fakultasId: null,
      prodiId: null,
      q: null,
      angkatan: null,
      tahunAjaran: null,
      kategori: null,
      kurikulumId: null
    });
    setTargetFilters({ angkatan: "", tahunAjaran: "" });
  };

  // Handle URL params for navigation from other pages
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const fakultasIdParam = searchParams.get("fakultasId");
    const prodiIdParam = searchParams.get("prodiId");
    const qParam = searchParams.get("q");
    const kategoriParam = searchParams.get("kategori");
    const kurikulumIdParam = searchParams.get("kurikulumId");

    if (viewParam && (viewParam === "matrix" || viewParam === "target" || viewParam === "list") && viewMode !== viewParam) {
      setViewMode(viewParam as any);
    }

    if (fakultasIdParam && cplFilters.fakultasFilter !== fakultasIdParam) {
      setFakultasFilter(fakultasIdParam);
    }

    if (prodiIdParam && cplFilters.prodiFilter !== prodiIdParam) {
      setProdiFilter(prodiIdParam);
    }

    if (qParam && cplFilters.searchTerm !== qParam) {
      setCplSearchTerm(qParam);
    }

    if (kategoriParam && cplFilters.kategoriFilter !== kategoriParam) {
      setKategoriFilter(kategoriParam);
    }

    if (kurikulumIdParam && cplFilters.kurikulumFilter !== kurikulumIdParam) {
      setKurikulumFilter(kurikulumIdParam);
      setTargetFilters(prev => ({ ...prev, tahunAjaran: kurikulumIdParam }));
    }

    const angkatanParam = searchParams.get("angkatan");
    // const tahunAjaranParam = searchParams.get("tahunAjaran"); // Now using kurikulumId for target too

    if (angkatanParam) {
      setTargetFilters(prev => {
        if (prev.angkatan === angkatanParam) return prev;
        return { ...prev, angkatan: angkatanParam };
      });
    }
  }, [searchParams, viewMode, cplFilters, setViewMode, setFakultasFilter, setProdiFilter, setCplSearchTerm, setKategoriFilter, setKurikulumFilter]);


  useEffect(() => {
    fetchCPL();
    fetchKategori();
    fetchFakultas();
    fetchProdi();
    fetchKurikulum();
  }, [fetchCPL, fetchKategori, fetchFakultas, fetchProdi, fetchKurikulum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kodeCpl || !formData.deskripsi || !formData.kategoriId || !formData.prodiId || !formData.kurikulumId) {
      toast.error("Semua field wajib harus diisi");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        kodeCpl: formData.kodeCpl.trim(),
        deskripsi: formData.deskripsi.trim(),
        kategoriId: formData.kategoriId,
        prodiId: formData.prodiId || null,
        kurikulumId: formData.kurikulumId || null,
      };

      let success = false;
      if (editingCPL) {
        success = await updateCPL(editingCPL.id, payload);
        if (success) {
          toast.success(`CPL "${payload.kodeCpl}" berhasil diupdate`);
        }
      } else {
        success = await createCPL(payload);
        if (success) {
          toast.success(`CPL "${payload.kodeCpl}" berhasil ditambahkan`);
        }
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
      kurikulumId: cpl.kurikulumId || "",
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
      kurikulumId: "",
    });
    setEditingCPL(null);
  };

  const canEdit = can('edit', 'cpl') || can('create', 'cpl') || can('delete', 'cpl'); // Broaden to management rights
  const canViewAll = can('view_all', 'cpl') || role === 'admin';

  // Use full lists for filter options now since we don't have all data client-side
  const kategoriOptions = kategoriList; // .map(k => k.nama); Use full object for SelectItem
  const filterProdiOptions = prodiList;

  const hasActiveFilter = cplFilters.fakultasFilter !== "" || cplFilters.prodiFilter !== "all" || cplFilters.kategoriFilter !== "all" || cplFilters.kurikulumFilter !== "all";

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

          <Tabs value={viewMode} onValueChange={handleViewChange} className="w-[500px]">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListIcon className="w-4 h-4" /> Daftar CPL
              </TabsTrigger>
              {(can('view', 'cpl') || role === 'admin') && (
                <TabsTrigger value="matrix" className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4" /> Matrix Mapping
                </TabsTrigger>
              )}
              <TabsTrigger value="target" className="flex items-center gap-2">
                <Target className="w-4 h-4" /> Target CPL
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode !== 'target' && (
            <>
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
                <PopoverContent align="end" className="w-[320px] space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Fakultas</Label>
                      <Select
                        value={cplFilters.fakultasFilter}
                        onValueChange={handleFakultasChange}
                      >
                        <SelectTrigger className="w-full h-9 pl-2">
                          <SelectValue placeholder="Semua Fakultas" className="truncate" />
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
                          onValueChange={handleProdiChange}
                          disabled={!cplFilters.fakultasFilter && canViewAll}
                        >
                          <SelectTrigger className="w-full h-9 pl-2">
                            <SelectValue placeholder="Semua program studi" className="truncate" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterProdiOptions.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Kurikulum</Label>
                      <Select
                        value={cplFilters.kurikulumFilter}
                        onValueChange={handleKurikulumChange}
                      >
                        <SelectTrigger className="w-full h-9 pl-2">
                          <SelectValue placeholder="Semua Kurikulum" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kurikulum</SelectItem>
                          {kurikulumList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Kategori</Label>
                      <Select
                        value={cplFilters.kategoriFilter}
                        onValueChange={handleKategoriChange}
                      >
                        <SelectTrigger className="w-full h-9 pl-2">
                          <SelectValue placeholder="Semua Kategori" className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {kategoriList.map((k) => (
                            <SelectItem key={k.id} value={k.nama}>
                              {k.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                disabled={!hasActiveFilter && currentSearchTerm === ""}
              >
                Reset Filter
              </Button>
            </>
          )}
        </div>



        {viewMode === "target" ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Target Capaian Pembelajaran Lulusan</CardTitle>
                  <CardDescription>Tentukan target minimal pencapaian untuk setiap CPL</CardDescription>
                </div>
                <Button onClick={handleSaveTargets} disabled={loadingTargets || !cplFilters.prodiFilter || cplFilters.prodiFilter === 'all' || !targetFilters.angkatan}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Target
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 pt-10 bg-muted/30 rounded-lg border">
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 h-8 px-3 text-xs"
                  onClick={() => {
                    resetFilters();
                    setTargetFilters({
                      angkatan: "",
                      tahunAjaran: ""
                    });
                  }}
                  title="Reset Filter"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset Filter
                </Button>

                {/* Fakultas Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Fakultas</Label>
                  <Select
                    value={cplFilters.fakultasFilter}
                    onValueChange={setFakultasFilter}
                  >
                    <SelectTrigger className="w-full h-9 bg-background">
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

                {/* Prodi Filter */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Program Studi</Label>
                  <Select
                    value={cplFilters.prodiFilter}
                    onValueChange={setProdiFilter}
                    disabled={!canViewAll && role !== 'kaprodi'}
                  >
                    <SelectTrigger className="w-full h-9 bg-background">
                      <SelectValue placeholder="Semua Prodi" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterProdiOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Angkatan</Label>
                  <Select
                    value={targetFilters.angkatan}
                    onValueChange={(v) => setTargetFilters({ ...targetFilters, angkatan: v })}
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Pilih Angkatan" />
                    </SelectTrigger>
                    <SelectContent>
                      {angkatanList.filter(a => a.tahun).map(a => (
                        <SelectItem key={a.id} value={a.tahun.toString()}>{a.tahun}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Kurikulum</Label>
                  <Select
                    value={cplFilters.kurikulumFilter}
                    onValueChange={handleKurikulumChange}
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Pilih Kurikulum" />
                    </SelectTrigger>
                    <SelectContent>
                      {kurikulumList
                        .filter(k => k.isActive || k.id === targetFilters.tahunAjaran)
                        .map(k => (
                          <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(!cplFilters.prodiFilter || cplFilters.prodiFilter === 'all' || !targetFilters.angkatan) ? (
                <div className="text-center py-8 text-muted-foreground">
                  Silakan pilih Program Studi dan Angkatan terlebih dahulu
                </div>
              ) : loadingTargets ? (
                <LoadingScreen fullScreen={false} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Kode CPL</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-[150px]">Target (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cplList.map(cpl => (
                      <TableRow key={cpl.id}>
                        <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                        <TableCell>{cpl.deskripsi}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={targetInputs[cpl.id] ?? 75}
                            onChange={(e) => setTargetInputs({
                              ...targetInputs,
                              [cpl.id]: parseFloat(e.target.value)
                            })}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "list" ? (
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base md:text-lg">Daftar CPL</CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground">
                  Menampilkan <span className="font-medium">{cplList.length}</span> dari {pagination.totalItems} CPL
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={handleExport} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {canEdit && (
                  <Button size="sm" variant="outline" onClick={handleImportClick} disabled={importing}>
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Import'}
                  </Button>
                )}
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
                          <RequiredLabel htmlFor="kodeCpl" required>Kode CPL</RequiredLabel>
                          <Input
                            id="kodeCpl"
                            placeholder="Contoh: CPL-01"
                            value={formData.kodeCpl}
                            onChange={(e) => setFormData({ ...formData, kodeCpl: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="deskripsi" required>Deskripsi</RequiredLabel>
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
                          <RequiredLabel htmlFor="kategori" required>Kategori</RequiredLabel>
                          <Select
                            value={formData.kategoriId}
                            onValueChange={(val) => setFormData({ ...formData, kategoriId: val })}
                            required
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
                          <RequiredLabel htmlFor="prodi" required>Program Studi</RequiredLabel>
                          <Select
                            value={formData.prodiId}
                            onValueChange={(val) => setFormData({ ...formData, prodiId: val })}
                            disabled={!canViewAll}
                            required
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
                                .map((k: any) => (
                                  <SelectItem key={k.id} value={k.id}>
                                    {k.nama} {!k.isActive && "(Tidak Aktif)"}
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
              </div>
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
                      <TableHead>Kurikulum</TableHead>
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
                        <TableCell>{cpl.kurikulum?.nama || '-'}</TableCell>
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
