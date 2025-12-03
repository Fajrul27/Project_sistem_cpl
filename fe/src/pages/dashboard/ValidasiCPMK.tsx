import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Loader2, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

import { api, fetchFakultasList, fetchProdiList, fetchMataKuliahPengampu, getUser } from "@/lib/api-client";

interface CPMK {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    levelTaksonomiRef?: {
        kode: string;
        deskripsi: string;
    };
    statusValidasi: 'draft' | 'validated' | 'active';
    validatedAt: string | null;
    createdAt: string;
    mataKuliah: {
        id: string;
        kodeMk: string;
        namaMk: string;
        semester: number;
    };
    creator?: {
        profile?: {
            namaLengkap: string;
        };
    };
}

const ValidasiCPMKPage = () => {
    const { role } = useUserRole();
    const canValidate = role === "admin" || role === "kaprodi";

    const [cpmkList, setCpmkList] = useState<CPMK[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [updating, setUpdating] = useState<string | null>(null);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");
    const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
    const [selectedMataKuliah, setSelectedMataKuliah] = useState<string>("all");

    useEffect(() => {
        fetchInitialData();
        fetchCPMK();
    }, []);

    useEffect(() => {
        fetchProdi();
    }, [selectedFakultas]);

    useEffect(() => {
        fetchCPMK();
    }, [selectedFakultas, selectedProdi, selectedMataKuliah]);

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

    const fetchCPMK = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (selectedMataKuliah !== 'all') params.mataKuliahId = selectedMataKuliah;

            const result = await api.get('/cpmk', { params });
            setCpmkList(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            console.error("Error fetching CPMK:", error);
            toast.error("Gagal memuat data CPMK");
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (cpmkId: string, newStatus: 'draft' | 'validated' | 'active') => {
        try {
            setUpdating(cpmkId);
            await api.put(`/cpmk/${cpmkId}/validate`, { statusValidasi: newStatus });

            toast.success(`Status berhasil diubah menjadi ${newStatus}`);
            await fetchCPMK();
            await fetchCPMK();
        } catch (error) {
            console.error('Error updating validation:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal mengubah status validasi');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'validated':
                return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Tervalidasi</Badge>;
            case 'active':
                return <Badge className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" />Aktif</Badge>;
            case 'draft':
            default:
                return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
        }
    };

    const filteredCPMK = cpmkList.filter((cpmk) => {
        if (filterStatus === "all") return true;
        return cpmk.statusValidasi === filterStatus;
    });

    if (loading) {
        return (
            <DashboardPage title="Validasi CPMK">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title="Validasi CPMK"
            description="Kelola validasi CPMK dari dosen"
        >
            <div className="space-y-6">
                <div className="flex gap-2">
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

                    {/* Filter Mata Kuliah for Dosen */}
                    {role === 'dosen' && mataKuliahList.length > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={selectedMataKuliah !== "all" ? "default" : "outline"}
                                    className="gap-2 w-[200px] justify-between"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <SlidersHorizontal className="h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {selectedMataKuliah === 'all'
                                                ? "Filter Mata Kuliah"
                                                : mataKuliahList.find(mk => mk.mataKuliah.id === selectedMataKuliah)?.mataKuliah.namaMk || "Filter Mata Kuliah"
                                            }
                                        </span>
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Mata Kuliah</Label>
                                    <Select
                                        value={selectedMataKuliah}
                                        onValueChange={setSelectedMataKuliah}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                            {(() => {
                                                // Deduplicate mataKuliahList based on unique ID
                                                const uniqueMK = mataKuliahList.reduce((acc: any[], current) => {
                                                    const id = current.mataKuliah?.id;
                                                    if (!acc.find(item => item.mataKuliah?.id === id)) {
                                                        acc.push(current);
                                                    }
                                                    return acc;
                                                }, []);

                                                return uniqueMK.map((mk: any) => (
                                                    <SelectItem key={mk.mataKuliah.id} value={mk.mataKuliah.id}>
                                                        {mk.mataKuliah.namaMk} (Semester {mk.mataKuliah.semester})
                                                    </SelectItem>
                                                ));
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedMataKuliah("all")}
                                        disabled={selectedMataKuliah === "all"}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="validated">Tervalidasi</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                <Card>
                    <CardHeader>
                        <CardTitle>Daftar CPMK</CardTitle>
                        <CardDescription>
                            Klik tombol aksi untuk mengubah status validasi CPMK
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredCPMK.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Tidak ada CPMK dengan filter yang dipilih
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode CPMK</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Mata Kuliah</TableHead>
                                        <TableHead>Pembuat</TableHead>
                                        <TableHead>Status</TableHead>
                                        {canValidate && <TableHead>Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCPMK.map((cpmk) => (
                                        <TableRow key={cpmk.id}>
                                            <TableCell className="font-medium">{cpmk.kodeCpmk}</TableCell>
                                            <TableCell>
                                                {cpmk.levelTaksonomiRef ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {cpmk.levelTaksonomiRef.kode}
                                                    </Badge>
                                                ) : cpmk.levelTaksonomi ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {cpmk.levelTaksonomi}
                                                    </Badge>
                                                ) : "-"}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {cpmk.deskripsi || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {cpmk.mataKuliah.kodeMk} - {cpmk.mataKuliah.namaMk}
                                                <div className="text-xs text-muted-foreground">
                                                    Semester {cpmk.mataKuliah.semester}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {cpmk.creator?.profile?.namaLengkap || '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(cpmk.statusValidasi)}</TableCell>
                                            {canValidate && (
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {cpmk.statusValidasi !== 'validated' && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleValidate(cpmk.id, 'validated')}
                                                                disabled={updating === cpmk.id}
                                                            >
                                                                {updating === cpmk.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                        Validasi
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        {cpmk.statusValidasi === 'validated' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleValidate(cpmk.id, 'active')}
                                                                disabled={updating === cpmk.id}
                                                            >
                                                                Aktifkan
                                                            </Button>
                                                        )}
                                                        {cpmk.statusValidasi !== 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleValidate(cpmk.id, 'draft')}
                                                                disabled={updating === cpmk.id}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Batalkan
                                                            </Button>
                                                        )}
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
        </DashboardPage>
    );
};

export default ValidasiCPMKPage;
