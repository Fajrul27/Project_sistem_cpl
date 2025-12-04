import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Search, Eye, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";
import { MultiTaxonomySelect } from "@/components/MultiTaxonomySelect";
import { Badge } from "@/components/ui/badge";

import { api, fetchFakultasList, fetchProdiList, fetchMataKuliahPengampu, getUser } from "@/lib/api-client";

interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    semester: number;
}

interface Cpmk {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    mataKuliahId: string;
    mataKuliah: MataKuliah;
    cplMappings: any[];
    teknikPenilaian: any[];
}

const CPMKPage = () => {
    const navigate = useNavigate();
    const [cpmkList, setCpmkList] = useState<Cpmk[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCpmk, setEditingCpmk] = useState<Cpmk | null>(null);
    const { role } = useUserRole();

    const [formData, setFormData] = useState({
        kodeCpmk: "",
        deskripsi: "",
        levelTaksonomi: [] as string[], // Array for multi-select
        mataKuliahId: "",
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [mataKuliahFilter, setMataKuliahFilter] = useState<string>("all");
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchProdi();
    }, [selectedFakultas]);

    useEffect(() => {
        fetchMataKuliah();
    }, [selectedProdi]);

    useEffect(() => {
        fetchCpmk();
    }, [selectedFakultas, selectedProdi, mataKuliahFilter]);

    const fetchInitialData = async () => {
        try {
            const [fakultasRes, prodiRes] = await Promise.all([
                fetchFakultasList(),
                fetchProdiList()
            ]);
            setFakultasList(fakultasRes.data || []);
            setProdiList(prodiRes.data || []);

            // If user is dosen, fetch taught courses
            const user = getUser();
            if (user && user.role === 'dosen') {
                const mkRes = await fetchMataKuliahPengampu(user.id);
                setMataKuliahList(mkRes.data || []);
            } else {
                fetchMataKuliah();
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchProdi = async () => {
        try {
            const fakultasId = selectedFakultas !== 'all' ? selectedFakultas : undefined;
            const res = await fetchProdiList(fakultasId);
            setProdiList(res.data || []);

            // Reset selected Prodi if not in new list
            if (selectedProdi !== 'all') {
                const exists = (res.data || []).find((p: any) => p.id === selectedProdi);
                if (!exists) setSelectedProdi("all");
            }
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    };

    const fetchMataKuliah = async () => {
        // Skip if user is dosen (already fetched in initialData)
        const user = getUser();
        if (user && user.role === 'dosen') return;

        try {
            const params: any = {};
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;

            const result = await api.get('/mata-kuliah', { params });
            const data = result.data || result;
            setMataKuliahList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching mata kuliah:', error);
            toast.error('Gagal memuat data mata kuliah');
        }
    };

    const fetchCpmk = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (mataKuliahFilter !== 'all') params.mataKuliahId = mataKuliahFilter;

            const result = await api.get('/cpmk', { params });
            const data = result.data || result;
            setCpmkList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching CPMK:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
            setCpmkList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kodeCpmk || !formData.mataKuliahId) {
            toast.error("Kode CPMK dan Mata Kuliah harus diisi");
            return;
        }

        setSubmitting(true);

        try {
            if (editingCpmk) {
                await api.put(`/cpmk/${editingCpmk.id}`, {
                    kodeCpmk: formData.kodeCpmk.trim(),
                    deskripsi: formData.deskripsi.trim() || null,
                    levelTaksonomi: formData.levelTaksonomi.length > 0 ? formData.levelTaksonomi.join(',') : null,
                });
                toast.success("CPMK berhasil diupdate");
            } else {
                await api.post('/cpmk', {
                    kodeCpmk: formData.kodeCpmk.trim(),
                    deskripsi: formData.deskripsi.trim() || null,
                    levelTaksonomi: formData.levelTaksonomi.length > 0 ? formData.levelTaksonomi.join(',') : null,
                    mataKuliahId: formData.mataKuliahId,
                });
                toast.success("CPMK berhasil ditambahkan");
            }

            resetForm();
            await fetchCpmk();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving CPMK:', error);
            toast.error(
                error instanceof Error
                    ? `Gagal menyimpan: ${error.message}`
                    : 'Terjadi kesalahan saat menyimpan data'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (cpmk: Cpmk) => {
        setEditingCpmk(cpmk);
        // Convert comma-separated string to array
        const levels = cpmk.levelTaksonomi
            ? cpmk.levelTaksonomi.split(',').map(l => l.trim()).filter(Boolean)
            : [];
        setFormData({
            kodeCpmk: cpmk.kodeCpmk,
            deskripsi: cpmk.deskripsi || "",
            levelTaksonomi: levels,
            mataKuliahId: cpmk.mataKuliahId,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus CPMK ini?")) return;

        try {
            await api.delete(`/cpmk/${id}`);

            // if (!response.ok) throw new Error('Gagal hapus CPMK');

            toast.success("CPMK berhasil dihapus");
            await fetchCpmk();
        } catch (error) {
            console.error('Error deleting CPMK:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    const handleViewDetail = (id: string) => {
        navigate(`/dashboard/cpmk/${id}`);
    };

    const resetForm = () => {
        setFormData({
            kodeCpmk: "",
            deskripsi: "",
            levelTaksonomi: [],
            mataKuliahId: "",
        });
        setEditingCpmk(null);
    };

    const canEdit = role === "admin" || role === "dosen";

    const filteredCpmk = cpmkList.filter((cpmk) => {
        const q = searchTerm.toLowerCase();
        const matchSearch =
            cpmk.kodeCpmk.toLowerCase().includes(q) ||
            cpmk.deskripsi?.toLowerCase().includes(q) ||
            cpmk.mataKuliah.namaMk.toLowerCase().includes(q) ||
            cpmk.mataKuliah.kodeMk.toLowerCase().includes(q);

        const matchMataKuliah =
            mataKuliahFilter === "all" || cpmk.mataKuliahId === mataKuliahFilter;

        return matchSearch && matchMataKuliah;
    });

    if (loading) {
        return (
            <DashboardPage title="Data CPMK">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title="Data CPMK"
            description="Kelola Capaian Pembelajaran Mata Kuliah (CPMK)"
        >
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau deskripsi CPMK..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>


                    {role !== 'dosen' && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={selectedFakultas !== "all" || selectedProdi !== "all" ? "default" : "outline"}
                                    className="gap-2"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filter
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Fakultas</Label>
                                    <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Semua Fakultas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Fakultas</SelectItem>
                                            {fakultasList.map((fak) => (
                                                <SelectItem key={fak.id} value={fak.id}>
                                                    {fak.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Program Studi</Label>
                                    <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Semua Prodi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Prodi</SelectItem>
                                            {prodiList.map((prodi) => (
                                                <SelectItem key={prodi.id} value={prodi.id}>
                                                    {prodi.nama}
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
                                            setSelectedFakultas("all");
                                            setSelectedProdi("all");
                                        }}
                                        disabled={selectedFakultas === "all" && selectedProdi === "all"}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {role === 'dosen' ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={mataKuliahFilter !== "all" ? "default" : "outline"}
                                    className="gap-2 w-[200px] justify-between"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <SlidersHorizontal className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {mataKuliahFilter === 'all'
                                                ? "Filter Mata Kuliah"
                                                : mataKuliahList.find(mk => (mk.mataKuliah?.id || mk.id) === mataKuliahFilter)?.mataKuliah?.namaMk ||
                                                mataKuliahList.find(mk => (mk.mataKuliah?.id || mk.id) === mataKuliahFilter)?.namaMk ||
                                                "Filter Mata Kuliah"
                                            }
                                        </span>
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Mata Kuliah</Label>
                                    <Select
                                        value={mataKuliahFilter}
                                        onValueChange={setMataKuliahFilter}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                            {(() => {
                                                // Deduplicate mataKuliahList based on unique ID
                                                const uniqueMK = mataKuliahList.reduce((acc: any[], current) => {
                                                    const id = current.mataKuliah?.id || current.id;
                                                    if (!acc.find(item => (item.mataKuliah?.id || item.id) === id)) {
                                                        acc.push(current);
                                                    }
                                                    return acc;
                                                }, []);

                                                return uniqueMK.map((mk: any) => {
                                                    // Handle both structure types (direct MK or MKPengampu)
                                                    const id = mk.mataKuliah?.id || mk.id;
                                                    const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                    const semester = mk.mataKuliah?.semester || mk.semester;

                                                    return (
                                                        <SelectItem key={id} value={id}>
                                                            {nama} {semester ? `(Semester ${semester})` : ''}
                                                        </SelectItem>
                                                    );
                                                });
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setMataKuliahFilter("all")}
                                        disabled={mataKuliahFilter === "all"}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Select value={mataKuliahFilter} onValueChange={setMataKuliahFilter}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {mataKuliahList.map((mk) => (
                                    <SelectItem key={mk.id} value={mk.id}>
                                        {mk.namaMk}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <Button variant="outline" onClick={fetchCpmk}>
                        Muat Ulang
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-base md:text-lg">Daftar CPMK</CardTitle>
                            <CardDescription className="text-xs md:text-sm text-muted-foreground">
                                Menampilkan <span className="font-medium">{filteredCpmk.length}</span> dari{" "}
                                <span className="font-medium">{cpmkList.length}</span> CPMK
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
                                        Tambah CPMK
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingCpmk ? "Edit CPMK" : "Tambah CPMK Baru"}</DialogTitle>
                                        <DialogDescription>
                                            Isi form untuk {editingCpmk ? "mengupdate" : "menambahkan"} data CPMK
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="kodeCpmk">Kode CPMK</Label>
                                            <Input
                                                id="kodeCpmk"
                                                placeholder="Contoh: CPMK 1"
                                                value={formData.kodeCpmk}
                                                onChange={(e) => setFormData({ ...formData, kodeCpmk: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Level Taksonomi (Opsional)</Label>
                                            <MultiTaxonomySelect
                                                value={formData.levelTaksonomi.join(',')}
                                                onChange={(levels) => setFormData({ ...formData, levelTaksonomi: levels })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mataKuliah">Mata Kuliah</Label>
                                            <Select
                                                value={formData.mataKuliahId}
                                                onValueChange={(value) => setFormData({ ...formData, mataKuliahId: value })}
                                                disabled={!!editingCpmk}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mataKuliahList.map((mk) => {
                                                        const id = mk.mataKuliah?.id || mk.id;
                                                        const kode = mk.mataKuliah?.kodeMk || mk.kodeMk;
                                                        const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                        return (
                                                            <SelectItem key={id} value={id}>
                                                                {kode} - {nama}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deskripsi">Deskripsi</Label>
                                            <Textarea
                                                id="deskripsi"
                                                placeholder="Deskripsi capaian pembelajaran"
                                                value={formData.deskripsi}
                                                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" className="flex-1" disabled={submitting}>
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        {editingCpmk ? "Memperbarui..." : "Menyimpan..."}
                                                    </>
                                                ) : editingCpmk ? "Update" : "Simpan"}
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
                                    <TableHead>Kode CPMK</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Mata Kuliah</TableHead>
                                    <TableHead className="text-center">Mapping CPL</TableHead>
                                    <TableHead className="text-center">Teknik Penilaian</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCpmk.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Tidak ada data CPMK
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCpmk.map((cpmk) => (
                                        <TableRow key={cpmk.id}>
                                            <TableCell className="font-medium">{cpmk.kodeCpmk}</TableCell>
                                            <TableCell>
                                                {cpmk.levelTaksonomi ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {cpmk.levelTaksonomi.split(',').map((level) => (
                                                            <Badge key={level.trim()} variant="secondary" className="text-xs">
                                                                {level.trim()}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {cpmk.deskripsi || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{cpmk.mataKuliah.kodeMk}</div>
                                                    <div className="text-muted-foreground">{cpmk.mataKuliah.namaMk}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                                    {cpmk.cplMappings?.length || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                    {cpmk.teknikPenilaian?.length || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetail(cpmk.id)}
                                                        title="Lihat Detail & Mapping"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {canEdit && (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => handleEdit(cpmk)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/rubrik/${cpmk.id}`)} title="Kelola Rubrik">
                                                                <SlidersHorizontal className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(cpmk.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardPage >
    );
}

export default CPMKPage;
