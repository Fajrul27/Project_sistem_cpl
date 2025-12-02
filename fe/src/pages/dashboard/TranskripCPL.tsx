import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer, FileText, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchMahasiswaList, api, getTranskripCPMK } from "@/lib/api-client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TranskripItem {
    cplId: string;
    nilaiAkhir: number;
    status: 'tercapai' | 'belum_tercapai';
    cpl: {
        kodeCpl: string;
        deskripsi: string;
        kategori: string;
    };
    mataKuliahList?: {
        id: string;
        kodeMk: string;
        namaMk: string;
    }[];
    mahasiswa?: any;
    mataKuliah?: any;
}

interface TranskripCpmkItem {
    id: string;
    kodeCpmk: string;
    deskripsi: string;
    nilai: number;
    status: 'tercapai' | 'belum_tercapai';
    mataKuliah: {
        kodeMk: string;
        namaMk: string;
        sks: number;
        semester: number;
    };
    tahunAjaran: string;
}

interface Mahasiswa {
    id: string;
    profile: {
        namaLengkap: string;
        nim: string;
        programStudi: string;
        semester: number;
    };
}

interface KaprodiData {
    namaKaprodi: string;
    nidnKaprodi: string;
}

interface User {
    id: string;
    profile?: {
        namaLengkap: string;
        nim: string;
        prodi?: { nama: string };
        programStudi?: string;
        semester: number;
    };
}

const TranskripCPLPage = () => {
    const { role, userId, loading: roleLoading } = useUserRole();
    const isMahasiswa = role === "mahasiswa";

    const [transkripList, setTranskripList] = useState<TranskripItem[]>([]);
    const [transkripCpmkList, setTranskripCpmkList] = useState<TranskripCpmkItem[]>([]);
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>("");
    const [currentStudent, setCurrentStudent] = useState<Mahasiswa | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [kaprodiData, setKaprodiData] = useState<KaprodiData | null>(null);

    const [semester, setSemester] = useState<string>("all");
    const [tahunAjaran, setTahunAjaran] = useState<string>("all");
    const [activeTab, setActiveTab] = useState("cpl");

    // Combobox state
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [settings, setSettings] = useState({
        univName: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
        univAddress: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
        univContact: "Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415",
        kaprodiName: "( ........................................................ )",
        kaprodiNip: "",
        logoUrl: "/logo.png"
    });

    useEffect(() => {
        if (isMahasiswa && userId) {
            setSelectedMahasiswa(userId);
        }
    }, [isMahasiswa, userId]);

    useEffect(() => {
        if (roleLoading) return;
        if (!isMahasiswa) fetchMahasiswaOptions();
        fetchSettings();
    }, [isMahasiswa, roleLoading]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (roleLoading) return;
        if (!isMahasiswa) fetchMahasiswaOptions(debouncedSearch);
    }, [debouncedSearch, roleLoading, isMahasiswa]);

    useEffect(() => {
        if (selectedMahasiswa) {
            if (activeTab === 'cpl') fetchTranskrip();
            else fetchTranskripCPMK();
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa, semester, tahunAjaran, activeTab]);

    const fetchSettings = async () => {
        try {
            const result = await api.get('/settings');
            if (result.data) setSettings(prev => ({ ...prev, ...result.data }));
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchKaprodiData = async (programStudi: string) => {
        try {
            const result = await api.get(`/kaprodi-data/${programStudi}`);
            setKaprodiData(result.data);
        } catch (error) {
            console.error("Error fetching kaprodi data:", error);
        }
    };

    const fetchMahasiswaOptions = async (query: string = "") => {
        try {
            if (query) setLoading(true);
            const response = await fetchMahasiswaList({ q: query, limit: 20 });
            const users = response?.data || [];
            const mapped: Mahasiswa[] = users
                .filter((u: User) => u.profile && u.profile.nim)
                .map((u: User) => ({
                    id: u.id,
                    profile: {
                        namaLengkap: u.profile.namaLengkap,
                        nim: u.profile.nim,
                        programStudi: u.profile.prodi?.nama || u.profile.programStudi,
                        semester: u.profile.semester
                    }
                }));
            setMahasiswaList(mapped);
        } catch (error) {
            console.error("Error fetching mahasiswa:", error);
            toast.error("Gagal memuat daftar mahasiswa");
        } finally {
            if (query) setLoading(false);
        }
    };

    const fetchTranskrip = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (semester !== 'all') params.semester = semester;
            if (tahunAjaran !== 'all') params.tahunAjaran = tahunAjaran;

            const result = await api.get(`/transkrip-cpl/${selectedMahasiswa}`, { params });
            setTranskripList(result.data?.transkrip || []);
            updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            toast.error("Gagal memuat transkrip CPL");
            setTranskripList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTranskripCPMK = async () => {
        try {
            setLoading(true);
            const result = await getTranskripCPMK(selectedMahasiswa, semester, tahunAjaran);
            setTranskripCpmkList(result.data?.transkrip || []);
            updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip CPMK:", error);
            toast.error("Gagal memuat transkrip CPMK");
            setTranskripCpmkList([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStudentInfo = (m: any) => {
        if (m) {
            setCurrentStudent({
                id: m.userId,
                profile: {
                    namaLengkap: m.namaLengkap,
                    nim: m.nim,
                    programStudi: m.programStudi,
                    semester: m.semester
                }
            });
            if (m.programStudi) fetchKaprodiData(m.programStudi);
        }
    };

    const selectedStudent = currentStudent || mahasiswaList.find(m => m.id === selectedMahasiswa);
    const validTranskripList = Array.isArray(transkripList) ? transkripList : [];
    const avgScore = validTranskripList.length > 0
        ? validTranskripList.reduce((sum, item) => sum + item.nilaiAkhir, 0) / validTranskripList.length
        : 0;
    const completedCPL = validTranskripList.filter(item => item.status === 'tercapai').length;

    const handlePrint = () => {
        window.print();
    };

    if (loading && !selectedStudent) {
        return (
            <DashboardPage title="Transkrip">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage title="Transkrip Akademik" description="Lihat capaian pembelajaran CPL dan CPMK">
            <div className="space-y-6 print:hidden">
                {!isMahasiswa && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pilih Mahasiswa</CardTitle>
                            <CardDescription>Cari mahasiswa berdasarkan Nama atau NIM</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between">
                                        {selectedMahasiswa ? mahasiswaList.find((mhs) => mhs.id === selectedMahasiswa)?.profile.namaLengkap : "Pilih Mahasiswa..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput placeholder="Cari nama atau NIM..." value={searchQuery} onValueChange={setSearchQuery} />
                                        <CommandList>
                                            {loading && searchQuery && <div className="py-6 text-center text-sm text-muted-foreground">Mencari...</div>}
                                            {!loading && mahasiswaList.length === 0 && <CommandEmpty>Mahasiswa tidak ditemukan.</CommandEmpty>}
                                            <CommandGroup>
                                                {mahasiswaList.map((mhs) => (
                                                    <CommandItem key={mhs.id} value={mhs.id} onSelect={(val) => { setSelectedMahasiswa(val === selectedMahasiswa ? "" : val); setOpenCombobox(false); }}>
                                                        <Check className={cn("mr-2 h-4 w-4", selectedMahasiswa === mhs.id ? "opacity-100" : "opacity-0")} />
                                                        <div className="flex flex-col">
                                                            <span>{mhs.profile.namaLengkap}</span>
                                                            <span className="text-xs text-muted-foreground">{mhs.profile.nim} - {mhs.profile.programStudi}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                )}

                {selectedStudent && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-base">Filter Tahun Ajaran</CardTitle></CardHeader>
                                <CardContent>
                                    <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Tahun Ajaran" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Periode</SelectItem>
                                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-base">Filter Semester</CardTitle></CardHeader>
                                <CardContent>
                                    <Select value={semester} onValueChange={setSemester}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Semester" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Semester</SelectItem>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="cpl">Transkrip CPL</TabsTrigger>
                                <TabsTrigger value="cpmk">Transkrip CPMK</TabsTrigger>
                            </TabsList>

                            <TabsContent value="cpl">
                                <div className="grid gap-4 md:grid-cols-3 mb-6">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">{avgScore.toFixed(2)}</div></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CPL Tercapai</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">{completedCPL} / {validTranskripList.length}</div></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Persentase Kelulusan</CardTitle></CardHeader>
                                        <CardContent><div className="text-2xl font-bold">{validTranskripList.length > 0 ? ((completedCPL / validTranskripList.length) * 100).toFixed(0) : 0}%</div></CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Transkrip CPL</CardTitle>
                                            <CardDescription>{selectedStudent.profile?.nim} - {selectedStudent.profile?.namaLengkap}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : validTranskripList.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada data transkrip CPL</p></div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Kode CPL</TableHead>
                                                        <TableHead>Deskripsi</TableHead>
                                                        <TableHead>Kategori</TableHead>
                                                        <TableHead className="text-right">Nilai</TableHead>
                                                        <TableHead className="text-center">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {validTranskripList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-medium">{item.cpl.kodeCpl}</TableCell>
                                                            <TableCell className="max-w-md">{item.cpl.deskripsi}</TableCell>
                                                            <TableCell><Badge variant="outline">{item.cpl.kategori}</Badge></TableCell>
                                                            <TableCell className="text-right font-medium">{item.nilaiAkhir.toFixed(2)}</TableCell>
                                                            <TableCell className="text-center">
                                                                {item.status === 'tercapai' ? <Badge className="bg-green-500">Tercapai</Badge> : <Badge variant="destructive">Belum Tercapai</Badge>}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="cpmk">
                                <div className="grid gap-4 md:grid-cols-3 mb-6">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {transkripCpmkList.length > 0
                                                    ? (transkripCpmkList.reduce((sum, item) => sum + item.nilai, 0) / transkripCpmkList.length).toFixed(2)
                                                    : "0.00"}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CPMK Tercapai</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {transkripCpmkList.filter(item => item.status === 'tercapai').length} / {transkripCpmkList.length}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Persentase Kelulusan</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {transkripCpmkList.length > 0
                                                    ? ((transkripCpmkList.filter(item => item.status === 'tercapai').length / transkripCpmkList.length) * 100).toFixed(0)
                                                    : 0}%
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Transkrip CPMK</CardTitle>
                                            <CardDescription>{selectedStudent.profile?.nim} - {selectedStudent.profile?.namaLengkap}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : transkripCpmkList.length === 0 ? (
                                            <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada data transkrip CPMK</p></div>
                                        ) : (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Mata Kuliah</TableHead>
                                                        <TableHead>Kode CPMK</TableHead>
                                                        <TableHead>Deskripsi</TableHead>
                                                        <TableHead className="text-right">Nilai</TableHead>
                                                        <TableHead className="text-center">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transkripCpmkList.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <div className="font-medium">{item.mataKuliah.namaMk}</div>
                                                            </TableCell>
                                                            <TableCell className="font-medium">{item.kodeCpmk}</TableCell>
                                                            <TableCell className="max-w-md">{item.deskripsi}</TableCell>
                                                            <TableCell className="text-right font-medium">{item.nilai.toFixed(2)}</TableCell>
                                                            <TableCell className="text-center">
                                                                {item.status === 'tercapai' ? <Badge className="bg-green-500">Tercapai</Badge> : <Badge variant="destructive">Belum Tercapai</Badge>}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </div>

            {/* PRINT LAYOUT */}
            {selectedStudent && (
                <div className="hidden print:block bg-white text-black">
                    <style>{`
                        @media print {
                            @page { margin: 0; }
                            body { margin: 0; }
                        }
                    `}</style>
                    <div className="p-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 relative border-b-4 border-black pb-2">
                            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
                                <img src={settings.logoUrl || "/logo.png"} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 text-center px-4">
                                <h1 className="text-xl font-bold uppercase tracking-wide leading-tight">{settings.univName}</h1>
                                <p className="text-sm mt-1 leading-tight">{settings.univAddress}</p>
                                <p className="text-sm mt-1 leading-tight">{settings.univContact}</p>
                            </div>
                            <div className="w-24 h-24 flex-shrink-0"></div> {/* Spacer for centering */}
                        </div>

                        <div className="border-b border-black mb-6"></div>

                        <h2 className="text-center text-xl font-bold mb-8 uppercase">
                            {activeTab === 'cpl' ? 'TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN' : 'TRANSKRIP CPMK SEMENTARA'}
                        </h2>

                        {/* Student Info */}
                        <div className="grid grid-cols-2 gap-x-12 mb-8 text-sm">
                            <div className="space-y-2">
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Program Studi</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">{selectedStudent.profile?.programStudi || '-'}</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>NIM</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">{selectedStudent.profile?.nim || '-'}</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Tempat Lahir</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">-</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Tanggal Lahir</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">-</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Jenjang Pendidikan</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">SARJANA</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Nama</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">{selectedStudent.profile?.namaLengkap || '-'}</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Tahun Masuk</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">-</div>
                                </div>
                                <div className="grid grid-cols-[120px_10px_1fr]">
                                    <div>Semester</div>
                                    <div>:</div>
                                    <div className="uppercase font-medium">{selectedStudent.profile?.semester || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="mb-8">
                            <table className="w-full border-collapse border border-black text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black p-2 w-10 text-center">NO</th>
                                        <th className="border border-black p-2 w-24 text-center">KODE</th>
                                        <th className="border border-black p-2 text-left">{activeTab === 'cpl' ? 'CAPAIAN PEMBELAJARAN / MATA KULIAH' : 'MATA KULIAH / CPMK'}</th>
                                        <th className="border border-black p-2 w-20 text-center">NILAI</th>
                                        <th className="border border-black p-2 w-24 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeTab === 'cpl' ? (
                                        validTranskripList.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                                <td className="border border-black p-2 text-center">{item.cpl.kodeCpl}</td>
                                                <td className="border border-black p-2">
                                                    <div className="font-bold mb-1">{item.cpl.deskripsi}</div>
                                                    <div className="text-xs text-gray-600">
                                                        MK: {item.mataKuliahList && item.mataKuliahList.length > 0
                                                            ? item.mataKuliahList.map((mk) => mk.namaMk).join(', ')
                                                            : (item.mataKuliah?.namaMk || '-')}
                                                    </div>
                                                </td>
                                                <td className="border border-black p-2 text-center font-bold">{item.nilaiAkhir.toFixed(2)}</td>
                                                <td className="border border-black p-2 text-center">
                                                    {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        transkripCpmkList.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                                <td className="border border-black p-2 text-center">{item.mataKuliah.kodeMk}</td>
                                                <td className="border border-black p-2">
                                                    <div className="font-bold">{item.mataKuliah.namaMk}</div>
                                                    <div className="text-xs mb-1">Kode CPMK: {item.kodeCpmk}</div>
                                                    <div className="text-xs italic">{item.deskripsi}</div>
                                                </td>
                                                <td className="border border-black p-2 text-center font-bold">{item.nilai.toFixed(2)}</td>
                                                <td className="border border-black p-2 text-center">
                                                    {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary & Footer */}
                        <div className="flex justify-between items-end break-inside-avoid">
                            <div className="border border-black p-4 w-64">
                                <div className="font-bold mb-2">KETERANGAN</div>
                                <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
                                    <div>Rata-rata Nilai</div>
                                    <div className="font-bold">: {avgScore.toFixed(2)}</div>
                                    <div>Total {activeTab === 'cpl' ? 'CPL' : 'CPMK'} Tercapai</div>
                                    <div className="font-bold">: {activeTab === 'cpl' ? completedCPL : transkripCpmkList.filter(i => i.status === 'tercapai').length} / {activeTab === 'cpl' ? validTranskripList.length : transkripCpmkList.length}</div>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="mb-20">
                                    <div className="text-sm">Cilacap, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    <div className="font-bold text-sm">Ketua Program Studi</div>
                                    <div className="text-sm italic">Informatika / Informatika</div>
                                </div>
                                <div>
                                    <div className="font-bold underline uppercase">
                                        {kaprodiData?.namaKaprodi || settings.kaprodiName || "( ........................................................ )"}
                                    </div>
                                    <div className="text-sm">
                                        NIDN. {kaprodiData?.nidnKaprodi || settings.kaprodiNip || "........................"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardPage>
    );
};

export default TranskripCPLPage;

