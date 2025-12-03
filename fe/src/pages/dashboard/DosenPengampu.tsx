import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { api, fetchKelas, fetchProdiList, fetchSemesters, fetchFakultasList } from "@/lib/api-client";

interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    sks: number;
    semester: number;
    programStudi: string;
}

interface Dosen {
    id: string;
    email: string;
    profile: {
        namaLengkap: string;
        nip: string;
        nidn: string;
    };
}

interface Pengampu {
    id: string;
    dosenId: string;
    mataKuliahId: string;
    dosen: {
        userId: string;
        namaLengkap: string;
        nip: string;
        nidn: string;
        user: {
            email: string;
        };
    };
    kelas?: {
        id: string;
        nama: string;
    };
}

const DosenPengampuPage = () => {
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
    const [dosenList, setDosenList] = useState<Dosen[]>([]);
    const [selectedMk, setSelectedMk] = useState<string>("");
    const [pengampuList, setPengampuList] = useState<Pengampu[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingPengampu, setLoadingPengampu] = useState(false);
    const [selectedDosen, setSelectedDosen] = useState<string>("");
    const [adding, setAdding] = useState(false);
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [selectedKelas, setSelectedKelas] = useState<string>("");
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedMk) {
            fetchPengampu(selectedMk);
        } else {
            setPengampuList([]);
        }
    }, [selectedMk]);

    useEffect(() => {
        fetchMataKuliah();
    }, [selectedProdi, selectedSemester]);

    useEffect(() => {
        fetchProdi();
    }, [selectedFakultas]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [dosenRes, kelasRes, semesterRes, fakultasRes] = await Promise.all([
                api.get('/users?role=dosen&limit=-1'),
                fetchKelas(),
                fetchSemesters(),
                fetchFakultasList()
            ]);

            setDosenList(dosenRes.data || []);
            setKelasList(kelasRes.data || []);
            setSemesterList(semesterRes.data || []);
            setFakultasList(fakultasRes.data || []);

            // Initial fetch for Prodi (all)
            fetchProdi();

            // Initial fetch for MK
            fetchMataKuliah();
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
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
        try {
            const params: any = {};
            if (selectedProdi && selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (selectedSemester && selectedSemester !== 'all') params.semester = selectedSemester;

            const mkRes = await api.get('/mata-kuliah', { params });
            setMataKuliahList(mkRes.data || []);

            // Reset selected MK if it's not in the new list
            if (selectedMk) {
                const exists = (mkRes.data || []).find((mk: any) => mk.id === selectedMk);
                if (!exists) setSelectedMk("");
            }
        } catch (error) {
            console.error("Error fetching mata kuliah:", error);
        }
    };

    const fetchPengampu = async (mkId: string) => {
        try {
            setLoadingPengampu(true);
            const response = await api.get(`/mata-kuliah-pengampu/mata-kuliah/${mkId}`);
            setPengampuList(response.data || []);
        } catch (error) {
            console.error("Error fetching pengampu:", error);
            toast.error("Gagal memuat data pengampu");
        } finally {
            setLoadingPengampu(false);
        }
    };

    const handleAddPengampu = async () => {
        if (!selectedMk || !selectedDosen) {
            toast.error("Pilih mata kuliah dan dosen terlebih dahulu");
            return;
        }

        // Check if already assigned
        // Check if already assigned
        if (pengampuList.some(p => p.dosenId === selectedDosen)) {
            toast.error("Dosen sudah menjadi pengampu mata kuliah ini");
            return;
        }

        try {
            setAdding(true);
            await api.post('/mata-kuliah-pengampu', {
                mataKuliahId: selectedMk,
                dosenId: selectedDosen,
                kelasId: null
            });

            toast.success("Berhasil menambahkan dosen pengampu");
            fetchPengampu(selectedMk);
            setSelectedDosen("");
            setSelectedKelas("");
        } catch (error: any) {
            console.error("Error adding pengampu:", error);
            toast.error(error.message || "Gagal menambahkan pengampu");
        } finally {
            setAdding(false);
        }
    };

    const handleDeletePengampu = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengampu ini?")) return;

        try {
            await api.delete(`/mata-kuliah-pengampu/${id}`);
            toast.success("Pengampu berhasil dihapus");
            fetchPengampu(selectedMk);
        } catch (error) {
            console.error("Error deleting pengampu:", error);
            toast.error("Gagal menghapus pengampu");
        }
    };

    if (loading) {
        return (
            <DashboardPage title="Manajemen Dosen Pengampu">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
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
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
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
