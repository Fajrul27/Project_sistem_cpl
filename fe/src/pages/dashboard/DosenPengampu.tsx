import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserPlus } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { useDosenPengampu } from "@/hooks/useDosenPengampu";

const DosenPengampuPage = () => {
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
        handleDeletePengampu
    } = useDosenPengampu();

    if (loading) {
        return (
            <DashboardPage title="Manajemen Dosen Pengampu">
                <LoadingScreen fullScreen={false} message="Memuat data..." />
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title="Manajemen Dosen Pengampu"
            description="Atur penugasan dosen untuk setiap mata kuliah"
        >
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Program Studi</label>
                                <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Program Studi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Program Studi</SelectItem>
                                        {prodiList.map((prodi) => (
                                            <SelectItem key={prodi.id} value={prodi.id}>
                                                {prodi.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Semester</SelectItem>
                                        {semesterList.map((sem) => (
                                            <SelectItem key={sem.id} value={String(sem.angka)}>
                                                Semester {sem.angka}
                                            </SelectItem>
                                        ))}
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
                            <Select value={selectedMk} onValueChange={setSelectedMk}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mataKuliahList.map((mk) => (
                                        <SelectItem key={mk.id} value={mk.id}>
                                            {mk.kodeMk} - {mk.namaMk}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    <Select value={selectedDosen} onValueChange={setSelectedDosen}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Dosen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dosenList.map((dosen) => (
                                                <SelectItem key={dosen.id} value={dosen.id}>
                                                    {dosen.profile?.namaLengkap || dosen.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                                        onClick={() => handleDeletePengampu(pengampu.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardPage>
    );
};

export default DosenPengampuPage;
