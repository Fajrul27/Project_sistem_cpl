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

    const exportToPDF = async () => {
        if (!selectedStudent) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        if (activeTab === 'cpmk') {
            toast.info("Fitur export PDF untuk transkrip CPMK belum tersedia. Silakan gunakan fitur Print.");
            return;
        }

        if (validTranskripList.length === 0) {
            toast.error("Tidak ada data CPL untuk diexport");
            return;
        }

        setExporting(true);

        try {
            const doc = new jsPDF();

            // Function to load image
            const loadImage = (url: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = url;
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL("image/png"));
                        } else {
                            reject(new Error("Canvas context is null"));
                        }
                    };
                    img.onerror = (err) => reject(err);
                });
            };

            // Try loading logo from settings or fallback
            let logoData = '';
            try {
                logoData = await loadImage(settings.logoUrl || '/logo.png');
            } catch (err) {
                console.warn("Failed to load logo, trying fallback...", err);
                try {
                    logoData = await loadImage("https://lp3.unugha.ac.id/wp-content/uploads/2021/11/cropped-cropped-unugha-Transparan-glow2.png");
                } catch (err2) {
                    console.error("Failed to load logo for PDF:", err2);
                }
            }

            // Layout Constants
            const MARGIN_LEFT = 20;
            const HEADER_CENTER_X = 105; // Center of A4 (210mm / 2)
            const COL_1_LABEL_X = 20;
            const COL_1_SEP_X = 55;
            const COL_1_VAL_X = 58;
            const COL_2_LABEL_X = 120;
            const COL_2_SEP_X = 155;
            const COL_2_VAL_X = 158;

            if (logoData) {
                doc.addImage(logoData, 'PNG', MARGIN_LEFT, 10, 25, 25);
            }

            // Header Text
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(settings.univName, HEADER_CENTER_X, 18, { align: 'center' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            // Split address if too long
            const addressLines = doc.splitTextToSize(settings.univAddress, 150);
            doc.text(addressLines, HEADER_CENTER_X, 24, { align: 'center' });

            doc.text(settings.univContact, HEADER_CENTER_X, 29 + (addressLines.length - 1) * 4, { align: 'center' });

            // Line separator
            const lineY = 35 + (addressLines.length - 1) * 4;
            doc.setDrawColor(0);
            doc.setLineWidth(1);
            doc.line(10, lineY, 200, lineY);
            doc.setLineWidth(0.5);
            doc.line(10, lineY + 2, 200, lineY + 2);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN', HEADER_CENTER_X, lineY + 13, { align: 'center' });

            // Student Info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const startY = lineY + 25;

            // Left Column
            doc.text(`Program Studi`, COL_1_LABEL_X, startY);
            doc.text(`:`, COL_1_SEP_X, startY);
            doc.text(`${selectedStudent.profile?.programStudi?.toUpperCase() || '-'}`, COL_1_VAL_X, startY);

            doc.text(`NIM`, COL_1_LABEL_X, startY + 6);
            doc.text(`:`, COL_1_SEP_X, startY + 6);
            doc.text(`${selectedStudent.profile?.nim || '-'}`, COL_1_VAL_X, startY + 6);

            // Right Column
            doc.text(`Jenjang Pendidikan`, COL_2_LABEL_X, startY);
            doc.text(`:`, COL_2_SEP_X, startY);
            doc.text(`SARJANA`, COL_2_VAL_X, startY);

            doc.text(`Nama`, COL_2_LABEL_X, startY + 6);
            doc.text(`:`, COL_2_SEP_X, startY + 6);
            doc.text(`${selectedStudent.profile?.namaLengkap?.toUpperCase() || '-'}`, COL_2_VAL_X, startY + 6);

            doc.text(`Semester`, COL_2_LABEL_X, startY + 12);
            doc.text(`:`, COL_2_SEP_X, startY + 12);
            doc.text(`${selectedStudent.profile?.semester || '-'}`, COL_2_VAL_X, startY + 12);

            // CPL Table
            const tableStartY = startY + 20;
            autoTable(doc, {
                startY: tableStartY,
                head: [['NO', 'KODE', 'CAPAIAN PEMBELAJARAN / MATA KULIAH', 'NILAI', 'STATUS']],
                body: validTranskripList.map((item, index) => [
                    index + 1,
                    item.cpl.kodeCpl,
                    `${item.cpl.deskripsi}\nMK: ${item.mataKuliahList && item.mataKuliahList.length > 0
                        ? item.mataKuliahList.map((mk) => mk.namaMk).join(', ')
                        : (item.mataKuliah?.namaMk || '-')}`,
                    item.nilaiAkhir.toFixed(2),
                    item.status === 'tercapai' ? 'Tercapai' : 'Belum'
                ]),
                theme: 'plain',
                styles: {
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    fontSize: 9,
                    textColor: [0, 0, 0],
                    valign: 'top'
                },
                headStyles: {
                    fillColor: [240, 240, 240], // Light gray like print view
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0]
                },
                columnStyles: {
                    0: { cellWidth: 10, halign: 'center' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
                    4: { cellWidth: 25, halign: 'center' }
                },
                didParseCell: function (data) {
                    // Add borders to every cell
                    data.cell.styles.lineWidth = 0.1;
                    data.cell.styles.lineColor = [0, 0, 0];
                }
            });

            // Summary
            const finalY = (doc as any).lastAutoTable.finalY + 10;

            // Draw box for summary
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.rect(20, finalY - 5, 80, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Rata-rata Nilai : ${avgScore.toFixed(2)}`, 25, finalY);
            doc.text(`Total CPL Tercapai : ${completedCPL} dari ${validTranskripList.length}`, 25, finalY + 8);

            // Footer
            const pageHeight = doc.internal.pageSize.height;

            // Signature section
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Cilacap, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 130, pageHeight - 50);
            doc.text('Ketua Program Studi,', 130, pageHeight - 44);

            // Signature Name from Kaprodi Data
            doc.setFont('helvetica', 'bold');
            if (kaprodiData && kaprodiData.namaKaprodi) {
                const kaprodiName = kaprodiData.namaKaprodi.toUpperCase();
                const kaprodiNameLines = doc.splitTextToSize(kaprodiName, 60);
                doc.text(kaprodiNameLines, 130, pageHeight - 20);

                // NIDN
                if (kaprodiData.nidnKaprodi) {
                    doc.setFont('helvetica', 'normal');
                    doc.text(`NIDN. ${kaprodiData.nidnKaprodi}`, 130, pageHeight - 15);
                }
            } else {
                // Fallback to settings
                const kaprodiNameFallback = settings.kaprodiName || "( ........................................................ )";
                const kaprodiNameLines = doc.splitTextToSize(kaprodiNameFallback, 60);
                doc.text(kaprodiNameLines, 130, pageHeight - 20);

                if (settings.kaprodiNip) {
                    doc.setFont('helvetica', 'normal');
                    doc.text(`NIP. ${settings.kaprodiNip}`, 130, pageHeight - 15);
                }
            }

            // Save
            doc.save(`Transkrip-CPL-${selectedStudent.profile?.nim || 'unknown'}-${selectedStudent.profile?.namaLengkap || 'unknown'}.pdf`);
            toast.success("PDF berhasil diunduh");
        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast.error("Gagal export PDF");
        } finally {
            setExporting(false);
        }
    };

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
                            <TabsList className="grid w-full grid-cols-2">
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
                                            <Button size="sm" onClick={exportToPDF} disabled={exporting || validTranskripList.length === 0}>
                                                {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                Export PDF
                                            </Button>
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
                                                                <div className="text-xs text-muted-foreground">{item.mataKuliah.kodeMk} - Sem {item.mataKuliah.semester}</div>
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

            {/* Print View - Simplified for now, just showing active tab content logic would be needed for full print support */}
            {/* Ideally, we should have separate print components or conditional rendering based on activeTab */}
        </DashboardPage>
    );
};

export default TranskripCPLPage;
