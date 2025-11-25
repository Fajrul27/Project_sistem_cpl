import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Plus, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardLayoutContext } from "@/components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CPL {
  id: string;
  kodeCpl: string;
  deskripsi: string;
}

interface MataKuliah {
  id: string;
  kodeMk: string;
  namaMk: string;
  semester: number;
}

interface CPLMapping {
  id: string;
  cplId: string;
  mataKuliahId: string;
  bobotKontribusi: number;
}

const CPLMappingPage = () => {
  // Panggil semua hook di bagian atas komponen
  const { setMeta } = useDashboardLayoutContext();
  const { role } = useUserRole();
  const canEdit = role === "admin" || role === "kaprodi";

  // State management
  const [cplList, setCplList] = useState<CPL[]>([]);
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [mappings, setMappings] = useState<CPLMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMK, setSelectedMK] = useState<string | null>(null);
  const [selectedCPLs, setSelectedCPLs] = useState<Set<string>>(new Set());
  const [bobot, setBobot] = useState<{ [key: string]: number }>({});
  const [filterSemester, setFilterSemester] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Atur metadata halaman (hanya title & description, tanpa tombol di navbar)
  useEffect(() => {
    if (setMeta) {
      setMeta({
        title: 'Mapping CPL - Mata Kuliah',
        description: 'Kelola pemetaan CPL ke Mata Kuliah',
      });

      // Reset saat komponen di-unmount
      return () => setMeta({});
    }
  }, [setMeta]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [cplRes, mkRes, mappingRes] = await Promise.all([
        fetch(`${API_URL}/cpl`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/mata-kuliah`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/cpl-mata-kuliah`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const cplData = await cplRes.json();
      const mkData = await mkRes.json();
      const mappingData = await mappingRes.json();

      setCplList(Array.isArray(cplData.data) ? cplData.data : []);
      setMkList(Array.isArray(mkData.data) ? mkData.data : []);
      setMappings(Array.isArray(mappingData.data) ? mappingData.data : []);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data mapping");
    } finally {
      setLoading(false);
    }
  };

  const isMapped = (cplId: string, mkId: string) => {
    return mappings.some((m) => m.cplId === cplId && m.mataKuliahId === mkId);
  };

  const handleToggleCPL = (cplId: string) => {
    const newSelectedCPLs = new Set(selectedCPLs);
    if (newSelectedCPLs.has(cplId)) {
      newSelectedCPLs.delete(cplId);
      // Hapus bobot saat CPL di-uncheck
      const newBobot = { ...bobot };
      delete newBobot[cplId];
      setBobot(newBobot);
    } else {
      newSelectedCPLs.add(cplId);
      // Set nilai default bobot 100% (disimpan sebagai 1.0)
      setBobot(prev => ({
        ...prev,
        [cplId]: prev[cplId] || 1.0
      }));
    }
    setSelectedCPLs(newSelectedCPLs);
  };

  const handleBobotChange = (cplId: string, value: string) => {
    // Bobot input sebagai persentase (0-100), disimpan sebagai desimal (0.0-1.0)
    if (value === '') {
      setBobot(prev => ({
        ...prev,
        [cplId]: 0
      }));
      return;
    }

    // Validasi input hanya angka dan titik desimal
    if (!/^\d*\.?\d*$/.test(value)) return;

    const percentValue = parseFloat(value);
    // Bobot range: 0-100%
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) return;

    // Konversi ke desimal (0.0-1.0) untuk disimpan
    const decimalValue = percentValue / 100;

    setBobot(prev => ({
      ...prev,
      [cplId]: parseFloat(decimalValue.toFixed(4))
    }));
  };

  const handleBatchMapping = async () => {
    if (!selectedMK || selectedCPLs.size === 0) {
      toast.error('Pilih setidaknya satu CPL untuk dipetakan');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      // Hapus mapping yang sudah ada untuk mata kuliah terpilih
      const mappingsToDelete = mappings.filter(m => m.mataKuliahId === selectedMK);
      for (const m of mappingsToDelete) {
        await fetch(`${API_URL}/cpl-mata-kuliah/${m.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // Tambahkan mapping baru
      const newMappings = Array.from(selectedCPLs).map(cplId => ({
        cplId,
        mataKuliahId: selectedMK,
        bobotKontribusi: bobot[cplId] && bobot[cplId] > 0 ? bobot[cplId] : 1.0,
      }));

      // Validasi bobot tidak boleh 0 atau negatif
      const invalidBobot = newMappings.find(m => m.bobotKontribusi <= 0);
      if (invalidBobot) {
        toast.error('Bobot kontribusi harus lebih besar dari 0');
        setSubmitting(false);
        return;
      }

      // Validasi total bobot kontribusi harus = 100% (Opsi 2)
      const totalBobot = newMappings.reduce((sum, item) => sum + Number(item.bobotKontribusi), 0);
      if (Math.abs(totalBobot - 1.0) > 0.01) {
        toast.error(
          `Total bobot kontribusi harus = 100%. ` +
          `Saat ini: ${(totalBobot * 100).toFixed(2)}%`
        );
        setSubmitting(false);
        return;
      }

      // Create batch mappings
      const response = await fetch(`${API_URL}/cpl-mata-kuliah/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mappings: newMappings })
      });

      if (!response.ok) throw new Error('Gagal menyimpan mapping');

      toast.success('Mapping berhasil disimpan');
      setDialogOpen(false);
      setSelectedCPLs(new Set());
      setBobot({});
      await fetchData();
    } catch (error: any) {
      console.error('Error saving mapping:', error);
      toast.error(error.message || 'Gagal menyimpan mapping');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMKMappings = async (mkId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mapping untuk mata kuliah ini?')) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const mappingsToDelete = mappings.filter(m => m.mataKuliahId === mkId);

      for (const m of mappingsToDelete) {
        const response = await fetch(`${API_URL}/cpl-mata-kuliah/${m.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Gagal hapus mapping');
      }

      toast.success('Mapping berhasil dihapus');
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting mapping:', error);
      toast.error(error.message || 'Gagal menghapus mapping');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderSemesterFilter = () => {
    const semesters = Array.from(new Set(mkList.map(mk => mk.semester))).sort((a, b) => a - b);

    return (
      <select
        value={filterSemester || ''}
        onChange={(e) => setFilterSemester(e.target.value ? parseInt(e.target.value) : null)}
        className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
      >
        <option value="">Semua Semester</option>
        {semesters.map(sem => (
          <option key={sem} value={sem}>
            Semester {sem}
          </option>
        ))}
      </select>
    );
  };

  const filteredMK = mkList.filter((mk) => {
    const matchSemester =
      filterSemester !== null ? mk.semester === filterSemester : true;

    const q = searchTerm.toLowerCase();
    const matchSearch =
      mk.kodeMk.toLowerCase().includes(q) ||
      mk.namaMk.toLowerCase().includes(q);

    return matchSemester && matchSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3">Memuat data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-4">

      {/* Dialog untuk mapping baru */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Batch Mapping CPL</DialogTitle>
            <DialogDescription>
              Pilih mata kuliah dan CPL yang akan dipetakan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mata Kuliah</Label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                value={selectedMK || ""}
                onChange={(e) => setSelectedMK(e.target.value || null)}
              >
                <option value="">Pilih Mata Kuliah</option>
                {mkList.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.kodeMk} - {mk.namaMk} (Sem {mk.semester})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>CPL</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {cplList.map((cpl) => (
                  <div key={cpl.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cpl-${cpl.id}`}
                      checked={selectedCPLs.has(cpl.id)}
                      onCheckedChange={() => handleToggleCPL(cpl.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`cpl-${cpl.id}`} className="text-sm font-medium">
                        {cpl.kodeCpl}: {cpl.deskripsi}
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">Bobot Kontribusi:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="100"
                          className="w-20 p-1 text-sm border rounded bg-background text-foreground"
                          value={selectedCPLs.has(cpl.id) ? (bobot[cpl.id] ? Math.round(bobot[cpl.id] * 100) : "") : ""}
                          onChange={(e) => handleBobotChange(cpl.id, e.target.value)}
                          disabled={!selectedCPLs.has(cpl.id)}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Progress Bar */}
            {selectedMK && Array.from(selectedCPLs).length > 0 && (() => {
              const total = Array.from(selectedCPLs).reduce((sum, cplId) =>
                sum + (bobot[cplId] || 1.0), 0
              );
              const percentage = total * 100;
              const isValid = Math.abs(total - 1.0) < 0.01;

              return (
                <div className="space-y-2 pt-4 pb-2 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Total Bobot Kontribusi</span>
                    <span className={`font-bold ${isValid ? 'text-green-600' : percentage > 100 ? 'text-red-600' : 'text-orange-600'
                      }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 flex items-center justify-center text-white text-sm font-medium ${isValid
                        ? 'bg-green-500'
                        : percentage > 100
                          ? 'bg-red-500'
                          : 'bg-orange-500'
                        }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      {percentage > 10 && `${percentage.toFixed(1)}%`}
                    </div>
                    {percentage > 100 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white/90 font-semibold drop-shadow-md">
                        !
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {isValid ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Total sudah sesuai (100%)
                      </span>
                    ) : percentage < 100 ? (
                      <span className="text-orange-600">
                        Masih kurang {(100 - percentage).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Kelebihan {(percentage - 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                type="button"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleBatchMapping}
                disabled={!selectedMK || selectedCPLs.size === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Mapping
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kode atau nama mata kuliah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {renderSemesterFilter()}
          <Button variant="outline" onClick={fetchData}>
            Muat Ulang
          </Button>
        </div>
      </div>

      {/* Tabel mapping */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base md:text-lg">Daftar Mapping CPL - Mata Kuliah</CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground">
              Daftar pemetaan CPL ke Mata Kuliah yang tersedia
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {canEdit && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Mapping
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredMK.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {mkList.length === 0
                ? 'Tidak ada data mata kuliah'
                : 'Tidak ada data yang sesuai dengan filter'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Mata Kuliah</TableCell>
                  <TableCell>CPL</TableCell>
                  <TableCell>Bobot Kontribusi</TableCell>
                  {canEdit && <TableCell>Aksi</TableCell>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMK.map((mk) => (
                  <TableRow key={mk.id}>
                    <TableCell>
                      {mk.kodeMk} - {mk.namaMk} (Sem {mk.semester})
                    </TableCell>
                    <TableCell>
                      {mappings
                        .filter(m => m.mataKuliahId === mk.id)
                        .map(m => {
                          const cpl = cplList.find(c => c.id === m.cplId);
                          return cpl ? (
                            <div key={m.cplId} className="mb-1">
                              {cpl.kodeCpl}
                            </div>
                          ) : null;
                        })}
                    </TableCell>
                    <TableCell>
                      {mappings
                        .filter(m => m.mataKuliahId === mk.id)
                        .map(m => (
                          <div key={m.cplId} className="mb-1">
                            {(Number(m.bobotKontribusi ?? 1.0) * 100).toFixed(1)}%
                          </div>
                        ))}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMK(mk.id);
                              // Set selected CPLs and their weights
                              const mkMappings = mappings.filter(m => m.mataKuliahId === mk.id);
                              const newSelectedCPLs = new Set(mkMappings.map(m => m.cplId));
                              const newBobot = mkMappings.reduce((acc: { [key: string]: number }, curr) => ({
                                ...acc,
                                [curr.cplId]: curr.bobotKontribusi
                              }), {});

                              setSelectedCPLs(newSelectedCPLs);
                              setBobot(newBobot);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMKMappings(mk.id)}
                            disabled={isDeleting}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CPLMappingPage;
