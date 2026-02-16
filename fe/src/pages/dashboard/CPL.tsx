import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
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
import { Plus, Edit, Trash2, Eye, Search, SlidersHorizontal, List as ListIcon, Table as TableIcon, ArrowLeft, Save, Target, RotateCcw, Download, Upload, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useCPL, CPL } from "@/hooks/useCPL";
import { PLMappingMatrix } from "./components/PLMappingMatrix";
import { useProfilLulusan } from "@/hooks/useProfilLulusan";
import { FloatingBackButton } from "@/components/common/FloatingBackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvaluasiCPL } from "@/hooks/useEvaluasiCPL";
import { useAngkatan } from "@/hooks/useAngkatan";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";
import { ImportResultDialog } from "@/components/common/ImportResultDialog";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { Pagination } from "@/components/common/Pagination";


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
  const canManage = can('access', 'kaprodi') || can('access', 'admin');
  const {
    cplList,
    fullCplList, // Add this
    kategoriList,
    fakultasList,
    prodiList,
    kurikulumList,
    kategoriOptions,
    kurikulumOptions,
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
    pagination,
    accessibleProdis
  } = useCPL();

  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCPL, setEditingCPL] = useState<CPL | null>(null);

  // Initialize viewMode from URL to prevent flash
  const [searchParams, setSearchParams] = useSearchParams();
  const initialViewMode = (searchParams.get("view") as "list" | "matrix" | "target" | "weight-matrix") || "list";
  const [viewMode, setViewMode] = useState<"list" | "matrix" | "target" | "weight-matrix">(initialViewMode);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errors?: string[] } | null>(null);

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (cplFilters.prodiFilter !== 'all') queryParams.append('prodiId', cplFilters.prodiFilter);
      if (cplFilters.kategoriFilter !== 'all') queryParams.append('kategori', cplFilters.kategoriFilter);
      if (cplFilters.kurikulumFilter !== 'all') queryParams.append('kurikulumId', cplFilters.kurikulumFilter);

      const url = `/api/cpl/export/excel?${queryParams.toString()}`;

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

        const response = await fetch(`/api/cpl/import/excel`, {
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

        fetchCPL();
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
  const [isTargetLocked, setIsTargetLocked] = useState(true);

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



  // Sync targets to inputs
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

  // Debounced Search Logic
  const initialSearchTerm = viewMode === "matrix" ? profilSearchTerm : (cplFilters.searchTerm || "");
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

  // Sync local state when external search term changes (e.g. from URL or reset)
  useEffect(() => {
    const term = viewMode === "matrix" ? profilSearchTerm : cplFilters.searchTerm;
    if (term !== localSearchTerm) {
      setLocalSearchTerm(term || "");
    }
  }, [viewMode, profilSearchTerm, cplFilters.searchTerm]);

  const handleSearchChange = (val: string) => {
    setLocalSearchTerm(val);
  };

  // Trigger search when debounced value changes
  useEffect(() => {
    // Prevent trigger on mount matching initial
    const currentActualTerm = viewMode === "matrix" ? profilSearchTerm : cplFilters.searchTerm;
    if (debouncedSearchTerm === currentActualTerm) return;

    if (viewMode === "matrix") {
      setProfilSearchTerm(debouncedSearchTerm);
    } else {
      // setCplSearchTerm(debouncedSearchTerm); // Removed to prevent loop. State syncs from URL.
      updateParams({ q: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, viewMode, setProfilSearchTerm]);

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

  const handleAngkatanChange = (val: string) => {
    setTargetFilters(prev => ({ ...prev, angkatan: val }));
    updateParams({ angkatan: val });
  };

  const handleViewChange = (val: string) => {
    const v = val as "list" | "matrix" | "target" | "weight-matrix";
    // setViewMode(v); // Removed optimistic update to prevent race condition with useEffect
    updateParams({ view: v });
  };

  const handleResetFilters = () => {
    resetFilters();
    setCplSearchTerm(""); // Also clear search term
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

    if (viewParam && (viewParam === "matrix" || viewParam === "target" || viewParam === "list" || viewParam === "weight-matrix") && viewMode !== viewParam) {
      setViewMode(viewParam as any);
    }

    // Reset fakultas filter if param is removed
    if (!fakultasIdParam && cplFilters.fakultasFilter !== "") {
      setFakultasFilter("");
    } else if (fakultasIdParam && cplFilters.fakultasFilter !== fakultasIdParam) {
      setFakultasFilter(fakultasIdParam);
    }

    // Reset prodi filter if param is removed
    if (!prodiIdParam && cplFilters.prodiFilter !== "all") {
      // For restricted roles (like Dosen), don't reset to "all" if they have a default
      if (role === 'dosen' && accessibleProdis.length === 1) {
        if (!accessibleProdis.some(p => p.id === cplFilters.prodiFilter)) {
          setProdiFilter(accessibleProdis[0].id);
        }
      } else {
        setProdiFilter("all");
      }
    } else if (prodiIdParam && cplFilters.prodiFilter !== prodiIdParam) {
      setProdiFilter(prodiIdParam);
    }

    // Reset search term if param is removed
    if (!qParam && cplFilters.searchTerm !== "") {
      setCplSearchTerm("");
    } else if (qParam && cplFilters.searchTerm !== qParam) {
      setCplSearchTerm(qParam);
    }

    // Reset kategori filter if param is removed
    if (!kategoriParam && cplFilters.kategoriFilter !== "all") {
      setKategoriFilter("all");
    } else if (kategoriParam && cplFilters.kategoriFilter !== kategoriParam) {
      setKategoriFilter(kategoriParam);
    }

    // Reset kurikulum filter if param is removed
    if (!kurikulumIdParam && cplFilters.kurikulumFilter !== "all") {
      setKurikulumFilter("all");
    } else if (kurikulumIdParam && cplFilters.kurikulumFilter !== kurikulumIdParam) {
      setKurikulumFilter(kurikulumIdParam);
      setTargetFilters(prev => {
        if (prev.tahunAjaran === kurikulumIdParam) return prev;
        return { ...prev, tahunAjaran: kurikulumIdParam };
      });
    }

    const angkatanParam = searchParams.get("angkatan");
    // const tahunAjaranParam = searchParams.get("tahunAjaran"); // Now using kurikulumId for target too

    if (angkatanParam) {
      setTargetFilters(prev => {
        if (prev.angkatan === angkatanParam) return prev;
        return { ...prev, angkatan: angkatanParam };
      });
    } else if (!angkatanParam && targetFilters.angkatan !== "") {
      setTargetFilters(prev => ({ ...prev, angkatan: "" }));
    }
  }, [searchParams, viewMode, cplFilters, targetFilters.angkatan, role, accessibleProdis, setViewMode, setFakultasFilter, setProdiFilter, setCplSearchTerm, setKategoriFilter, setKurikulumFilter]);

  // Safety effect: Ensure Dosen with single prodi has it selected if currently 'all' or empty
  useEffect(() => {
    if (role === 'dosen' && accessibleProdis.length === 1) {
      const singleProdiId = accessibleProdis[0].id;
      if (cplFilters.prodiFilter === 'all' || cplFilters.prodiFilter === '') {
        setProdiFilter(singleProdiId);
        // Also ensure fakultas is set if available
        if (accessibleProdis[0].fakultasId && cplFilters.fakultasFilter !== accessibleProdis[0].fakultasId) {
          setFakultasFilter(accessibleProdis[0].fakultasId);
        }
      }
    }
  }, [role, accessibleProdis, cplFilters.prodiFilter, cplFilters.fakultasFilter, setProdiFilter, setFakultasFilter]);


  // Removed redundant useEffect. Data fetching is now handled internally by useCPL hook.

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
  const filterProdiOptions = prodiList;


  const hasActiveFilter = (cplFilters.fakultasFilter && cplFilters.fakultasFilter !== "all") ||
    (cplFilters.prodiFilter && cplFilters.prodiFilter !== "all") ||
    (cplFilters.kategoriFilter && cplFilters.kategoriFilter !== "all") ||
    (cplFilters.kurikulumFilter && cplFilters.kurikulumFilter !== "all");

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

  if (initialLoad) {
    return (
      <DashboardPage title="Data CPL">
        <LoadingScreen fullScreen={false} message="Memuat data CPL..." />
      </DashboardPage >
    );
  }

  const showBackButton = location.state?.from === 'profil-lulusan';



  return (
    <DashboardPage
      title="Data CPL"
      description="Manajemen Capaian Pembelajaran Lulusan (CPL) dan Pemetaan Capaian"
    >
      <FloatingBackButton
        onClick={() => navigate('/dashboard/profil-lulusan', { state: { filters: location.state?.filters } })}
        hideBackButton={!showBackButton}
      >
        <div className="space-y-6">
          {canManage && (
            <CollapsibleGuide title="Panduan Manajemen CPL & Mapping">
              <div className="space-y-3">
                <p>Halaman ini digunakan untuk mengelola Capaian Pembelajaran Lulusan (CPL) dan menghubungkannya dengan Profil Lulusan serta menetapkan target pencapaian.</p>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                  <li><strong>Matrix Profil:</strong> Gunakan tab ini untuk memetakan CPL mana saja yang mendukung setiap Profil Lulusan.</li>
                  <li><strong>Target CPL:</strong> Tetapkan target minimal untuk setiap angkatan agar evaluasi ketercapaian dapat diukur.</li>
                  <li><strong>Import CPL:</strong> Pastikan kolom <strong>Kode CPL, Deskripsi, Kategori, Prodi,</strong> dan <strong>Kurikulum</strong> sesuai dengan data master saat melakukan import massal.</li>
                </ul>
              </div>
            </CollapsibleGuide>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-4 border-b pb-4">

            <Tabs value={viewMode} onValueChange={handleViewChange} className="w-[500px]">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <ListIcon className="w-4 h-4" /> Daftar CPL
                </TabsTrigger>
                {(can('view', 'cpl') || role === 'admin') && (
                  <TabsTrigger value="matrix" className="flex items-center gap-2">
                    <TableIcon className="w-4 h-4" /> Matrix Profil
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
                    placeholder={viewMode === "matrix" ? "Cari Profil..." : "Cari kode, deskripsi, atau kategori CPL..."}
                    value={localSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {(role === 'admin' || role === 'dosen' || role === 'kaprodi' || role === 'dekan') && (
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
                    <PopoverContent align="end" className="w-80 p-4">
                      <div className="space-y-4">
                        {(role === 'admin' || (role === 'dosen' && accessibleProdis && accessibleProdis.length > 1)) && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Fakultas</Label>
                            <Select
                              value={cplFilters.fakultasFilter}
                              onValueChange={handleFakultasChange}
                              disabled={role === 'dosen'}
                            >
                              <SelectTrigger className="w-full">
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
                        {(canViewAll || role === 'kaprodi' || role === 'dosen') && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Program Studi</Label>
                            <Select
                              value={cplFilters.prodiFilter}
                              onValueChange={handleProdiChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Program Studi" />
                              </SelectTrigger>
                              <SelectContent>
                                {!(role === 'dosen' && accessibleProdis.length === 1) && <SelectItem value="all">Semua Program Studi</SelectItem>}
                                {filterProdiOptions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Kurikulum</Label>
                          <Select
                            value={cplFilters.kurikulumFilter}
                            onValueChange={handleKurikulumChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Semua Kurikulum" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kurikulum</SelectItem>
                              {kurikulumOptions.map((k) => (
                                <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Kategori</Label>
                          <Select
                            value={cplFilters.kategoriFilter}
                            onValueChange={handleKategoriChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kategori</SelectItem>
                              {kategoriOptions.map((k) => (
                                <SelectItem key={k.id} value={k.nama}>{k.nama}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {(role === 'admin' || role === 'dosen' || role === 'kaprodi' || role === 'dekan') && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilter && localSearchTerm === ""}
                  >
                    Reset Filter
                  </Button>
                )}
              </>
            )}
          </div>



          {viewMode === "target" ? (
            <>
              {/* Search and Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode, deskripsi, atau kategori CPL..."
                    value={localSearchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {(role === 'admin' || role === 'dosen' || role === 'kaprodi' || role === 'dekan') && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={(cplFilters.fakultasFilter && cplFilters.fakultasFilter !== 'all') ||
                          (cplFilters.prodiFilter && cplFilters.prodiFilter !== 'all') ||
                          (cplFilters.kurikulumFilter && cplFilters.kurikulumFilter !== 'all') ||
                          targetFilters.angkatan ? "default" : "outline"}
                        className="gap-2"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-80 p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-4">
                        {(role === 'admin' || (role === 'dosen' && accessibleProdis && accessibleProdis.length > 1)) && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Fakultas</Label>
                            <Select
                              value={cplFilters.fakultasFilter}
                              onValueChange={handleFakultasChange}
                              disabled={role === 'dosen'}
                            >
                              <SelectTrigger className="w-full">
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

                        {(canViewAll || role === 'kaprodi' || role === 'dosen') && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Program Studi</Label>
                            <Select
                              value={cplFilters.prodiFilter}
                              onValueChange={handleProdiChange}
                              disabled={!canViewAll && role !== 'kaprodi' && role !== 'dosen'}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Semua Program Studi" />
                              </SelectTrigger>
                              <SelectContent>
                                {(!(role === 'dosen' && accessibleProdis.length === 1) || cplFilters.prodiFilter === 'all') && <SelectItem value="all">Semua Program Studi</SelectItem>}
                                {filterProdiOptions.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Angkatan</Label>
                          <Select
                            value={targetFilters.angkatan}
                            onValueChange={handleAngkatanChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih Angkatan" />
                            </SelectTrigger>
                            <SelectContent>
                              {angkatanList.filter(a => a.tahun).map(a => (
                                <SelectItem key={a.id} value={a.tahun.toString()}>{a.tahun}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Kurikulum</Label>
                          <Select
                            value={cplFilters.kurikulumFilter}
                            onValueChange={handleKurikulumChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Semua Kurikulum" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Semua Kurikulum</SelectItem>
                              {kurikulumList
                                .filter(k => k.isActive || k.id === targetFilters.tahunAjaran)
                                .map(k => (
                                  <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetFilters}
                  disabled={
                    (!cplFilters.fakultasFilter || cplFilters.fakultasFilter === 'all') &&
                    (!cplFilters.prodiFilter || cplFilters.prodiFilter === 'all') &&
                    (!cplFilters.kurikulumFilter || cplFilters.kurikulumFilter === 'all') &&
                    !targetFilters.angkatan &&
                    cplFilters.searchTerm === ""
                  }
                >
                  Reset Filter
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Target Capaian Pembelajaran Lulusan</CardTitle>
                      <CardDescription>Tentukan target minimal pencapaian untuk setiap CPL</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {canManage && (
                        <>
                          <Button
                            variant={isTargetLocked ? "outline" : "secondary"}
                            onClick={() => setIsTargetLocked(!isTargetLocked)}
                            className="gap-2"
                          >
                            {isTargetLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {isTargetLocked ? "Buka Kunci" : "Kunci Data"}
                          </Button>
                          <Button onClick={handleSaveTargets} disabled={loadingTargets || !cplFilters.prodiFilter || cplFilters.prodiFilter === 'all' || !targetFilters.angkatan || isTargetLocked}>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Target
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>

                  {(!cplFilters.prodiFilter || cplFilters.prodiFilter === 'all' || !targetFilters.angkatan) ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-lg border-dashed animate-in fade-in duration-500">
                      <div className="p-4 bg-muted/50 rounded-full mb-4">
                        <SlidersHorizontal className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Filter Data Diperlukan</h3>
                      <p className="max-w-sm mt-2">
                        Silakan pilih <strong>Program Studi</strong> dan <strong>Angkatan</strong> terlebih dahulu pada filter di atas untuk menampilkan target CPL.
                      </p>
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
                      <TableBody className={(loadingTargets || loading) ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
                        {fullCplList.map(cpl => (
                          <TableRow key={cpl.id}>
                            <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                            <TableCell>{cpl.deskripsi}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                disabled={isTargetLocked || !canManage}
                                value={targetInputs[cpl.id] ?? 75}
                                onChange={(e) => setTargetInputs({
                                  ...targetInputs,
                                  [cpl.id]: parseFloat(e.target.value) || 0
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
            </>
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
                  <Button size="sm" variant="outline" onClick={handleExport}>
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
                    <TableBody className={loading ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
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
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.setPage}
                  />
                )
              }
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Matrix Mapping Profil Lulusan - CPL</CardTitle>
                <CardDescription>
                  Hubungkan Profil Lulusan dengan CPL menggunakan tabel matrix di bawah ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cplFilters.prodiFilter === 'all' && canViewAll && !localSearchTerm ? (
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
                    cplList={fullCplList}
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
        </div>


        <ImportResultDialog
          open={!!importResult}
          onOpenChange={(open) => !open && setImportResult(null)}
          result={importResult}
          title="Hasil Import CPL"
          description="Proses import data CPL telah selesai dengan rincian berikut."
        />

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Hapus CPL"
          description="Apakah Anda yakin ingin menghapus CPL ini? Data yang telah dihapus tidak dapat dikembalikan."
        />
      </FloatingBackButton>
    </DashboardPage >
  );
}

export default CPLPage;
