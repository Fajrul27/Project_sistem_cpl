import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { CheckCircle2, XCircle, Clock, Loader2, SlidersHorizontal, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useValidasiCPMK } from "@/hooks/useValidasiCPMK";
import { useUserRole } from "@/hooks/useUserRole";

const ValidasiCPMKPage = () => {
    const { role, profile } = useUserRole();
    const {
        cpmkList,
        loading,
        updating,
        fakultasList,
        prodiList,
        mataKuliahList,
        canValidate,
        filters,
        setFilterStatus,
        setSelectedFakultas,
        setSelectedProdi,
        setSelectedMataKuliah,
        setSelectedSemester,
        setSearchTerm,
        resetFilters,
        fetchInitialData,
        fetchProdi,
        fetchCPMK,
        handleValidate,
        pagination
    } = useValidasiCPMK();

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchProdi();
    }, [filters.selectedFakultas, fetchProdi]);

    useEffect(() => {
        fetchCPMK();
    }, [fetchCPMK]);

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

    const hasActiveFilter =
        filters.selectedFakultas !== "all" ||
        filters.selectedProdi !== "all" ||
        filters.selectedSemester !== "all" ||
        filters.selectedMataKuliah !== "all" ||
        filters.filterStatus !== "all";

    return (
        <DashboardPage
            title="Validasi CPMK"
            description="Kelola validasi CPMK dari dosen"
        >
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari kode atau deskripsi CPMK..."
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
                                className="gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 space-y-4" onClick={(e) => e.stopPropagation()}>
                            {/* Fakultas & Prodi (Admin & Kaprodi) */}
                            {(role === 'admin' || role === 'kaprodi') && (
                                <>
                                    {role === 'admin' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Fakultas</Label>
                                            <Select value={filters.selectedFakultas} onValueChange={setSelectedFakultas}>
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
                                    )}

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Program Studi</Label>
                                        <Select value={filters.selectedProdi} onValueChange={setSelectedProdi}>
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Semua Prodi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Prodi</SelectItem>
                                                {(() => {
                                                    let accessibleProdis = prodiList;

                                                    // Kaprodi restriction
                                                    if (role === 'kaprodi' && profile?.prodiId) {
                                                        accessibleProdis = prodiList.filter(p => p.id === profile.prodiId);
                                                    }

                                                    // Admin selected fakultas filter
                                                    if (role === 'admin' && filters.selectedFakultas !== 'all') {
                                                        accessibleProdis = accessibleProdis.filter(p => p.fakultasId === filters.selectedFakultas);
                                                    }

                                                    return accessibleProdis.map((prodi) => (
                                                        <SelectItem key={prodi.id} value={prodi.id}>
                                                            {prodi.nama}
                                                        </SelectItem>
                                                    ));
                                                })()}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Semester Filter (All Roles) */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Semester</Label>
                                <Select value={filters.selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Semua Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Semester</SelectItem>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <SelectItem key={sem} value={sem.toString()}>
                                                Semester {sem}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mata Kuliah Filter (Dosen Only) */}
                            {role === 'dosen' && mataKuliahList.length > 0 && (
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Mata Kuliah</Label>
                                    <Select
                                        value={filters.selectedMataKuliah}
                                        onValueChange={setSelectedMataKuliah}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Pilih Mata Kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                            {(() => {
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
                            )}

                            {/* Status Filter */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Status Validasi</Label>
                                <Select value={filters.filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="validated">Tervalidasi</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>


                        </PopoverContent>
                    </Popover>

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

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar CPMK</CardTitle>
                        <CardDescription>
                            Menampilkan {cpmkList.length} dari {pagination.totalItems} data CPMK
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={canValidate ? 8 : 7} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                                Loading data...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : cpmkList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canValidate ? 8 : 7} className="text-center py-8 text-muted-foreground">
                                            Tidak ada CPMK dengan filter yang dipilih
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cpmkList.map((cpmk, index) => (
                                        <TableRow key={cpmk.id}>
                                            <TableCell>
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </TableCell>
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
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
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
                                                onClick={() => pagination.setPage(p)}
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
                                    onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
};

export default ValidasiCPMKPage;
