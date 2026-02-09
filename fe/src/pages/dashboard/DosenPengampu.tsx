import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useDosenPengampu } from "@/hooks/useDosenPengampu";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";

const DosenPengampuPage = () => {
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');
    const {
        mataKuliahList,
        dosenList,
        pengampuList,
        fakultasList,
        prodiList,
        semesterList,
        loading,
        loadingPengampu,
        adding,
        selectedFakultas,
        selectedProdi,
        selectedSemester,
        selectedMk,
        selectedDosen,
        setSelectedFakultas,
        setSelectedProdi,
        setSelectedSemester,
        setSelectedMk,
        setSelectedDosen,
        handleAddPengampu,
        handleDeletePengampu,
        allPengampuList // Added from hook
    } = useDosenPengampu();

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const initiateDelete = (id: string) => {
        setIdToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (idToDelete) {
            await handleDeletePengampu(idToDelete);
            setDeleteDialogOpen(false);
            setIdToDelete(null);
        }
    };

    if (loading) {
        return (
            <DashboardPage title="Manajemen Dosen Pengampu">
                <LoadingScreen fullScreen={false} message="Memuat data..." />
            </DashboardPage>
        );
    }

    return (
        <DashboardPage title="Penetapan Dosen Pengampu" description="Kelola dosen pengampu untuk setiap mata kuliah">
            <div className="space-y-6">
                {canManage && (
                    <CollapsibleGuide title="Panduan Dosen Pengampu">
                        <div className="space-y-3">
                            <p>Halaman ini digunakan untuk menetapkan dosen yang bertanggung jawab atas mata kuliah tertentu pada semester yang berjalan.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Pemilihan MK:</strong> Gunakan filter prodi dan semester untuk mempersempit daftar mata kuliah.</li>
                                <li><strong>Tambah Pengampu:</strong> Pilih dosen dari daftar pencarian dan klik 'Tambah' untuk memberikan akses nilai pada mata kuliah tersebut.</li>
                                <li><strong>Multiple Lecturer:</strong> Satu mata kuliah dapat diampu oleh lebih dari satu dosen (Tim Teaching).</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Selection */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Filter Mata Kuliah</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fakultas</label>
                                    <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Fakultas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fakultasList?.map((f: any) => (
                                                <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Program Studi</label>
                                    <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Program Studi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prodiList?.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Semester</label>
                                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Mata Kuliah</CardTitle>
                                <CardDescription>Pilih mata kuliah untuk dikelola</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SearchableSelect
                                    value={selectedMk}
                                    onValueChange={setSelectedMk}
                                    options={mataKuliahList.map((mk) => ({
                                        value: mk.id,
                                        label: `${mk.kodeMk} - ${mk.namaMk}`
                                    }))}
                                    placeholder="Cari Mata Kuliah..."
                                    searchPlaceholder="Cari kode atau nama mata kuliah..."
                                    emptyMessage="Mata kuliah tidak ditemukan."
                                />
                            </CardContent>
                        </Card>

                        {selectedMk && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tambah Pengampu</CardTitle>
                                    <CardDescription>Tetapkan dosen ke mata kuliah ini</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pilih Dosen</label>
                                        <SearchableSelect
                                            value={selectedDosen}
                                            onValueChange={setSelectedDosen}
                                            options={dosenList.map((dosen) => ({
                                                value: dosen.id,
                                                label: dosen.profile?.namaLengkap || dosen.email
                                            }))}
                                            placeholder="Cari Dosen..."
                                            searchPlaceholder="Cari nama atau NIP/NIDN..."
                                            emptyMessage="Dosen tidak ditemukan."
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleAddPengampu}
                                        disabled={adding || !selectedDosen}
                                    >
                                        {adding ? (
                                            <LoadingSpinner size="sm" className="mr-2" />
                                        ) : (
                                            <UserPlus className="h-4 w-4 mr-2" />
                                        )}
                                        Tambah Pengampu
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: List */}
                    <div className="md:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Daftar Dosen Pengampu</CardTitle>
                                <CardDescription>
                                    {selectedMk
                                        ? `Dosen pengampu untuk ${mataKuliahList.find(m => m.id === selectedMk)?.namaMk}`
                                        : "Pilih mata kuliah terlebih dahulu"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!selectedMk ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <UserPlus className="h-12 w-12 mb-4 opacity-20" />
                                        <p>Silakan pilih mata kuliah di sebelah kiri</p>
                                    </div>
                                ) : loadingPengampu ? (
                                    <LoadingScreen fullScreen={false} message="Memuat pengampu..." />
                                ) : pengampuList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                        <p>Belum ada dosen pengampu untuk mata kuliah ini</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nama Dosen</TableHead>
                                                    <TableHead>NIDN / NIP</TableHead>
                                                    <TableHead className="text-right">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pengampuList.map((pengampu) => (
                                                    <TableRow key={pengampu.id}>
                                                        <TableCell className="font-medium">
                                                            {pengampu.dosen.namaLengkap || pengampu.dosen.user.email}
                                                        </TableCell>
                                                        <TableCell>
                                                            {pengampu.dosen.nidn || pengampu.dosen.nip || "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => initiateDelete(pengampu.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Added: Tabel Kelas Perkuliahan */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Tabel Kelas Perkuliahan</CardTitle>
                        <CardDescription>
                            Daftar semua kelas perkuliahan beserta dosen pengampu sesuai filter yang dipilih.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">No</TableHead>
                                        <TableHead>Kode MK</TableHead>
                                        <TableHead>Nama MK</TableHead>
                                        <TableHead className="text-center">Sem</TableHead>
                                        <TableHead className="text-center">Kelas</TableHead>
                                        <TableHead>Dosen Pengampu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allPengampuList && allPengampuList.length > 0 ? (
                                        allPengampuList.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell>{(item as any).mataKuliah?.kodeMk || '-'}</TableCell>
                                                <TableCell>{(item as any).mataKuliah?.namaMk || '-'}</TableCell>
                                                <TableCell className="text-center">{(item as any).mataKuliah?.semester || '-'}</TableCell>
                                                <TableCell className="text-center">{(item as any).kelas?.nama || '-'}</TableCell>
                                                <TableCell>{item.dosen?.namaLengkap || item.dosen?.user?.email || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                                Tidak ada data kelas perkuliahan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={confirmDelete}
                    title="Hapus Pengampu"
                    description="Apakah Anda yakin ingin menghapus dosen pengampu ini dari mata kuliah?"
                />
            </div >
        </DashboardPage >
    );
};

export default DosenPengampuPage;
