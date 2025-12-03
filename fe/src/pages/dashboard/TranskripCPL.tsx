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
import { cn, getGradeLetter } from "@/lib/utils";
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
        programStudi: string;
        semester: number;
        tahunMasuk?: number;
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
        tahunMasuk?: number;
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
        tahunMasuk?: number;
        angkatanRef?: { tahun: number };
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
    const [totalCurriculumCpl, setTotalCurriculumCpl] = useState<number>(0);

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
            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa, semester, tahunAjaran]); // Removed activeTab dependency

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
                        semester: u.profile.semester,
                        tahunMasuk: u.profile.angkatanRef?.tahun || u.profile.tahunMasuk
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

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTranskrip(),
                fetchTranskripCPMK()
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTranskrip = async () => {
        try {
            const params: any = {};
            if (semester !== 'all') params.semester = semester;
            if (tahunAjaran !== 'all') params.tahunAjaran = tahunAjaran;

            const result = await api.get(`/transkrip-cpl/${selectedMahasiswa}`, { params });
            setTranskripList(result.data?.transkrip || []);
            setTotalCurriculumCpl(result.data?.summary?.totalCurriculumCpl || 0);
            updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            toast.error("Gagal memuat transkrip CPL");
            setTranskripList([]);
        }
    };

    const fetchTranskripCPMK = async () => {
        try {
            const result = await getTranskripCPMK(selectedMahasiswa, semester, tahunAjaran);
            setTranskripCpmkList(result.data?.transkrip || []);
            if (!transkripList.length) updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip CPMK:", error);
            toast.error("Gagal memuat transkrip CPMK");
            setTranskripCpmkList([]);
        }
    };

    const updateStudentInfo = (m: any) => {
        if (m) {
            const programStudi = m.prodi?.nama || m.programStudi;
            setCurrentStudent({
                id: m.userId,
                profile: {
                    namaLengkap: m.namaLengkap,
                    nim: m.nim,
                    programStudi: programStudi,
                    semester: m.semester,
                    tahunMasuk: m.angkatanRef?.tahun || m.tahunMasuk
                }
            });
            if (programStudi) fetchKaprodiData(programStudi);
        }
    };

    const selectedStudent = currentStudent || mahasiswaList.find(m => m.id === selectedMahasiswa);
    const validTranskripList = Array.isArray(transkripList) ? transkripList : [];
    const avgScore = validTranskripList.length > 0
        ? validTranskripList.reduce((sum, item) => sum + item.nilaiAkhir, 0) / validTranskripList.length
        : 0;
    const completedCPL = validTranskripList.filter(item => item.status === 'tercapai').length;

    const handlePrint = () => {
        const originalTitle = document.title;
        const type = activeTab === 'cpl' ? 'Transkrip_CPL' : 'Transkrip_CPMK';
        const nama = selectedStudent?.profile?.namaLengkap?.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || 'Mahasiswa';
        const nim = selectedStudent?.profile?.nim || 'NIM';

        document.title = `${type}_${nama}_${nim}`;
        window.print();

        // Restore title after a delay to ensure print dialog picks up the new name
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
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
                                        <CommandInput
                                            placeholder="Cari nama atau NIM..."
                                            value={searchQuery}
                                            onValueChange={setSearchQuery}
                                            className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none focus:border-none ring-0 outline-none shadow-none !outline-none !border-none !ring-0 !shadow-none"
                                        />
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
                )
                }

                {
                    selectedStudent && (
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
                                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-muted p-1 rounded-xl gap-2 h-auto">
                                    <TabsTrigger
                                        value="cpl"
                                        className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
                                    >
                                        Transkrip CPL
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="cpmk"
                                        className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted-foreground/10 transition-all duration-300 ease-in-out rounded-lg font-medium"
                                    >
                                        Transkrip CPMK
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="cpl" className="animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{avgScore.toFixed(2)}</div></CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">CPL Tercapai</CardTitle></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{completedCPL} / {totalCurriculumCpl || validTranskripList.length}</div></CardContent>
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
                                                            <TableHead className="text-center">Huruf</TableHead>
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
                                                                <TableCell className="text-center font-bold">{getGradeLetter(item.nilaiAkhir)}</TableCell>
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

                                <TabsContent value="cpmk" className="animate-in fade-in slide-in-from-top-4 duration-500">
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
                                                            <TableHead>Kode CPMK</TableHead>
                                                            <TableHead>Mata Kuliah</TableHead>
                                                            <TableHead>Deskripsi</TableHead>
                                                            <TableHead className="text-right">Nilai</TableHead>
                                                            <TableHead className="text-center">Huruf</TableHead>
                                                            <TableHead className="text-center">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {transkripCpmkList.map((item, index) => (
                                                            <TableRow key={index}>
                                                                <TableCell className="font-medium">{item.kodeCpmk}</TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">{item.mataKuliah.namaMk}</div>
                                                                    <div className="text-xs text-muted-foreground">{item.mataKuliah.kodeMk}</div>
                                                                </TableCell>
                                                                <TableCell className="max-w-md">{item.deskripsi}</TableCell>
                                                                <TableCell className="text-right font-medium">{item.nilai.toFixed(2)}</TableCell>
                                                                <TableCell className="text-center font-bold">{getGradeLetter(item.nilai)}</TableCell>
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
                    )
                }
            </div >

            {/* PRINT LAYOUT */}
            {
                selectedStudent && (
                    <div id="print-root" className="hidden print:block bg-white text-black">
                        <style>{`
                        @media print {
                            @page { 
                                margin: 2cm;
                                size: A4;
                            }
                            body, html { 
                                margin: 0; 
                                padding: 0;
                                background-color: white !important;
                                -webkit-print-color-adjust: exact;
                            }
                            
                            /* Use visibility to hide everything but keep the print root visible */
                            body * {
                                visibility: hidden;
                            }
                            
                            /* Make print root and all its children visible */
                            #print-root, #print-root * {
                                visibility: visible;
                            }
                            
                            /* Position the print root to cover the page */
                            #print-root {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                min-height: 100vh;
                                padding: 0;
                                background-color: white !important;
                                z-index: 9999;
                            }
                        }
                    `}</style>
                        <div className="">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2 relative border-b-2 border-black pb-2">
                                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                    <img src={settings.logoUrl || "/logo.png"} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 text-center px-2">
                                    <h1 className="text-base font-bold uppercase tracking-wide leading-tight">{settings.univName}</h1>
                                    <p className="text-[10px] mt-1 leading-tight">{settings.univAddress}</p>
                                    <p className="text-[10px] mt-1 leading-tight">{settings.univContact}</p>
                                </div>
                                <div className="w-20 h-20 flex-shrink-0"></div> {/* Spacer for centering */}
                            </div>

                            <div className="border-b border-black mb-4"></div>

                            <h2 className="text-center text-base font-bold mb-4 uppercase">
                                {activeTab === 'cpl' ? 'TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN' : 'TRANSKRIP CPMK SEMENTARA'}
                            </h2>

                            {/* Student Info */}
                            <div className="grid grid-cols-2 gap-x-8 mb-4 text-[11px]">
                                <div className="space-y-1">
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Program Studi</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">{selectedStudent.profile?.programStudi || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>NIM</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">{selectedStudent.profile?.nim || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Tempat Lahir</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">-</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Tanggal Lahir</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">-</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Jenjang Pendidikan</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">SARJANA</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Nama</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">{selectedStudent.profile?.namaLengkap || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Tahun Masuk</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">{selectedStudent.profile?.tahunMasuk || '-'}</div>
                                    </div>
                                    <div className="grid grid-cols-[100px_5px_1fr]">
                                        <div>Semester</div>
                                        <div>:</div>
                                        <div className="uppercase font-medium">{selectedStudent.profile?.semester || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="mb-4">
                                <table className="w-full border-collapse border border-black text-[10px]">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-black p-1 w-8 text-center">NO</th>
                                            <th className="border border-black p-1 w-20 text-center">KODE</th>
                                            <th className="border border-black p-1 text-left">{activeTab === 'cpl' ? 'CAPAIAN PEMBELAJARAN / MATA KULIAH' : 'CPMK / MATA KULIAH'}</th>
                                            <th className="border border-black p-1 w-12 text-center">NILAI</th>
                                            <th className="border border-black p-1 w-10 text-center">HURUF</th>
                                            <th className="border border-black p-1 w-16 text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeTab === 'cpl' ? (
                                            validTranskripList.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                                    <td className="border border-black p-1 text-center">{item.cpl.kodeCpl}</td>
                                                    <td className="border border-black p-1">
                                                        <div className="font-bold mb-0.5">{item.cpl.deskripsi}</div>
                                                        <div className="text-[9px] text-gray-600">
                                                            MK: {item.mataKuliahList && item.mataKuliahList.length > 0
                                                                ? item.mataKuliahList.map((mk) => mk.namaMk).join(', ')
                                                                : (item.mataKuliah?.namaMk || '-')}
                                                        </div>
                                                    </td>
                                                    <td className="border border-black p-1 text-center font-bold">{item.nilaiAkhir.toFixed(2)}</td>
                                                    <td className="border border-black p-1 text-center font-bold">{getGradeLetter(item.nilaiAkhir)}</td>
                                                    <td className="border border-black p-1 text-center">
                                                        {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            transkripCpmkList.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="border border-black p-1 text-center">{index + 1}</td>
                                                    <td className="border border-black p-1 text-center">{item.kodeCpmk}</td>
                                                    <td className="border border-black p-1">
                                                        <div className="font-bold">{item.mataKuliah.namaMk}</div>
                                                        <div className="text-[9px] mb-0.5">Kode MK: {item.mataKuliah.kodeMk}</div>
                                                        <div className="text-[9px] italic">{item.deskripsi}</div>
                                                    </td>
                                                    <td className="border border-black p-1 text-center font-bold">{item.nilai.toFixed(2)}</td>
                                                    <td className="border border-black p-1 text-center font-bold">{getGradeLetter(item.nilai)}</td>
                                                    <td className="border border-black p-1 text-center">
                                                        {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary & Footer */}
                            <div className="flex justify-between items-end break-inside-avoid mt-8 page-break-inside-avoid">
                                <div className="border border-black p-2 w-56">
                                    <div className="font-bold mb-1 text-[10px]">KETERANGAN</div>
                                    <div className="grid grid-cols-[1fr_auto] gap-2 text-[10px]">
                                        <div>Rata-rata Nilai</div>
                                        <div className="font-bold">: {avgScore.toFixed(2)}</div>
                                        <div>Total {activeTab === 'cpl' ? 'CPL' : 'CPMK'} Tercapai</div>
                                        <div className="font-bold">: {activeTab === 'cpl' ? completedCPL : transkripCpmkList.filter(i => i.status === 'tercapai').length} / {activeTab === 'cpl' ? (totalCurriculumCpl || validTranskripList.length) : transkripCpmkList.length}</div>
                                    </div>
                                </div>

                                <div className="text-center text-[10px]">
                                    <div className="mb-12">
                                        <div>Cilacap, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        <div className="font-bold">Ketua Program Studi</div>
                                        <div className="italic">{selectedStudent?.profile?.programStudi || '........................'}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold underline uppercase">
                                            {kaprodiData?.namaKaprodi || settings.kaprodiName || "( ........................................................ )"}
                                        </div>
                                        <div>
                                            NIDN. {kaprodiData?.nidnKaprodi || settings.kaprodiNip || "........................"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </DashboardPage >
    );
};

export default TranskripCPLPage;

