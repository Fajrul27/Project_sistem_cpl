import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchMahasiswaList } from "@/lib/api-client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface TranskripItem {
    mahasiswaId: string;
    cplId: string;
    nilaiAkhir: number;
    status: 'tercapai' | 'belum_tercapai';
    mahasiswa: {
        namaLengkap: string;
        nim: string;
        programStudi: string;
        semester: number;
    };
    cpl: {
        kodeCpl: string;
        deskripsi: string;
        kategori: string;
    };
    mataKuliah: {
        kodeMk: string;
        namaMk: string;
    } | null;
    mataKuliahList?: {
        id: string;
        kodeMk: string;
        namaMk: string;
    }[];
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
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [kaprodiData, setKaprodiData] = useState<KaprodiData | null>(null);
    const [settings, setSettings] = useState({
        univName: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
        univAddress: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
        univContact: "Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415",
        kaprodiName: "( ........................................................ )",
        kaprodiNip: "",
        logoUrl: "/logo.png"
    });

    // Update selectedMahasiswa when userId is available for mahasiswa
    useEffect(() => {
        if (isMahasiswa && userId) {
            setSelectedMahasiswa(userId);
        }
    }, [isMahasiswa, userId]);

    useEffect(() => {
        if (roleLoading) return;

        if (!isMahasiswa) {
            fetchMahasiswaOptions();
        }
        fetchSettings();
    }, [isMahasiswa, roleLoading]);

    useEffect(() => {
        if (selectedMahasiswa) {
            fetchTranskrip();
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.data && Object.keys(result.data).length > 0) {
                    setSettings(prev => ({ ...prev, ...result.data }));
                }
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchKaprodiData = async (programStudi: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/kaprodi-data/${programStudi}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                setKaprodiData(result.data);
            }
        } catch (error) {
            console.error("Error fetching kaprodi data:", error);
        }
    };

    const fetchMahasiswaOptions = async () => {
        try {
            const response = await fetchMahasiswaList();
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
        }
    };

    const fetchTranskrip = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/transkrip-cpl?mahasiswaId=${selectedMahasiswa}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Gagal memuat transkrip');

            const result = await response.json();
            setTranskripList(result.data || []);

            // Fetch kaprodi data based on student's program studi
            if (result.data && result.data.length > 0 && result.data[0].mahasiswa?.programStudi) {
                fetchKaprodiData(result.data[0].mahasiswa.programStudi);
            }
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            toast.error("Gagal memuat transkrip CPL");
            setTranskripList([]);
        } finally {
            setLoading(false);
        }
    };

    const selectedStudent = mahasiswaList.find(m => m.id === selectedMahasiswa) ||
        (transkripList[0]?.mahasiswa ? {
            id: selectedMahasiswa,
            profile: transkripList[0].mahasiswa
        } : null);

    const avgScore = transkripList.length > 0
        ? transkripList.reduce((sum, item) => sum + item.nilaiAkhir, 0) / transkripList.length
        : 0;

    const completedCPL = transkripList.filter(item => item.status === 'tercapai').length;

    const exportToPDF = async () => {
        if (!selectedStudent || transkripList.length === 0) {
            toast.error("Tidak ada data untuk diexport");
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
                body: transkripList.map((item, index) => [
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
            doc.text(`Total CPL Tercapai : ${completedCPL} dari ${transkripList.length}`, 25, finalY + 8);

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
            <DashboardPage title="Transkrip CPL">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title="Transkrip CPL"
            description="Transkrip Capaian Pembelajaran Lulusan"
        >
            <div className="space-y-6 print:hidden">
                {/* Mahasiswa Selector (for non-mahasiswa) */}
                {!isMahasiswa && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pilih Mahasiswa</CardTitle>
                            <CardDescription>Pilih mahasiswa untuk melihat transkrip CPL</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedMahasiswa} onValueChange={setSelectedMahasiswa}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih Mahasiswa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mahasiswaList.map((mhs) => (
                                        <SelectItem key={mhs.id} value={mhs.id}>
                                            {mhs.profile.nim} - {mhs.profile.namaLengkap}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}

                {selectedStudent && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{avgScore.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">CPL Tercapai</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completedCPL} / {transkripList.length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Persentase Kelulusan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {transkripList.length > 0 ? ((completedCPL / transkripList.length) * 100).toFixed(0) : 0}%
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Transkrip Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Transkrip CPL</CardTitle>
                                    <CardDescription>
                                        {selectedStudent.profile?.nim} - {selectedStudent.profile?.namaLengkap}
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrint}
                                    >
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={exportToPDF}
                                        disabled={exporting || transkripList.length === 0}
                                    >
                                        {exporting ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-2" />
                                        )}
                                        Export PDF
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : transkripList.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Belum ada data transkrip CPL</p>
                                        <p className="text-sm mt-2">Transkrip akan muncul setelah nilai CPL tersedia</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Kode CPL</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Mata Kuliah</TableHead>
                                                <TableHead className="text-right">Nilai</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transkripList.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.cpl.kodeCpl}</TableCell>
                                                    <TableCell className="max-w-md">{item.cpl.deskripsi}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{item.cpl.kategori}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.mataKuliahList && item.mataKuliahList.length > 0 ? (
                                                            item.mataKuliahList.length === 1 ? (
                                                                item.mataKuliahList[0].namaMk
                                                            ) : (
                                                                <div className="flex flex-col gap-1">
                                                                    {item.mataKuliahList.slice(0, 2).map((mk, idx: number) => (
                                                                        <div key={idx} className="text-xs">
                                                                            {mk.kodeMk} - {mk.namaMk}
                                                                        </div>
                                                                    ))}
                                                                    {item.mataKuliahList.length > 2 && (
                                                                        <div className="text-xs text-muted-foreground">
                                                                            +{item.mataKuliahList.length - 2} lainnya
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        ) : (
                                                            item.mataKuliah?.namaMk || '-'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {item.nilaiAkhir.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.status === 'tercapai' ? (
                                                            <Badge className="bg-green-500">Tercapai</Badge>
                                                        ) : (
                                                            <Badge variant="destructive">Belum Tercapai</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {!selectedStudent && !isMahasiswa && (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Pilih mahasiswa untuk melihat transkrip CPL</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Print View (Hidden by default, visible on print) */}
            {selectedStudent && (
                <div className="hidden print:block fixed inset-0 z-[9999] bg-white p-8 overflow-visible text-black">
                    <style>{`
                        @media print {
                            @page {
                                size: auto;
                                margin: 0mm;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color: black !important;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                color: black !important;
                            }
                        }
                    `}</style>
                    <div className="max-w-[210mm] mx-auto pt-8">
                        {/* Header with Logo */}
                        <div className="flex items-center justify-center gap-4 mb-2 border-b-4 border-double border-black pb-4">
                            <img
                                src={settings.logoUrl || "/logo.png"}
                                alt="Logo UNUGHA"
                                className="w-24 h-auto"
                                onError={(e) => {
                                    // Fallback to external URL if local fails
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('logo.png')) {
                                        target.src = "https://lp3.unugha.ac.id/wp-content/uploads/2021/11/cropped-cropped-unugha-Transparan-glow2.png";
                                    }
                                }}
                            />
                            <div className="text-center flex-1">
                                <h1 className="text-xl font-bold uppercase tracking-wide text-black">{settings.univName}</h1>
                                <p className="text-sm text-black whitespace-pre-wrap">{settings.univAddress}</p>
                                <p className="text-sm text-black">{settings.univContact}</p>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-lg font-bold uppercase border-b-2 border-black inline-block px-4 pb-1 text-black">TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN</h2>
                        </div>

                        {/* Student Info */}
                        <div className="mb-6 text-sm grid grid-cols-2 gap-x-12">
                            <div className="space-y-1">
                                <div className="flex">
                                    <div className="w-[35mm] text-black">Program Studi</div>
                                    <div className="w-[4mm] text-black">:</div>
                                    <div className="flex-1 font-medium uppercase text-black">{selectedStudent.profile?.programStudi}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-[35mm] text-black">NIM</div>
                                    <div className="w-[4mm] text-black">:</div>
                                    <div className="flex-1 font-medium text-black">{selectedStudent.profile?.nim}</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex">
                                    <div className="w-[35mm] text-black">Jenjang Pendidikan</div>
                                    <div className="w-[4mm] text-black">:</div>
                                    <div className="flex-1 font-medium text-black">SARJANA</div>
                                </div>
                                <div className="flex">
                                    <div className="w-[35mm] text-black">Nama</div>
                                    <div className="w-[4mm] text-black">:</div>
                                    <div className="flex-1 font-medium uppercase text-black">{selectedStudent.profile?.namaLengkap}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-[35mm] text-black">Semester</div>
                                    <div className="w-[4mm] text-black">:</div>
                                    <div className="flex-1 font-medium text-black">{selectedStudent.profile?.semester}</div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full border-collapse border border-black text-sm mb-6">
                            <thead>
                                <tr className="bg-gray-100 print:bg-gray-100">
                                    <th className="border border-black p-2 text-center w-12 text-black">NO</th>
                                    <th className="border border-black p-2 text-center w-24 text-black">KODE</th>
                                    <th className="border border-black p-2 text-left text-black">CAPAIAN PEMBELAJARAN / MATA KULIAH</th>
                                    <th className="border border-black p-2 text-center w-16 text-black">NILAI</th>
                                    <th className="border border-black p-2 text-center w-24 text-black">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transkripList.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-2 text-center align-top text-black">{index + 1}</td>
                                        <td className="border border-black p-2 text-center align-top text-black">{item.cpl.kodeCpl}</td>
                                        <td className="border border-black p-2 align-top text-black">
                                            <div className="font-bold mb-1">{item.cpl.deskripsi}</div>
                                            <div className="text-xs text-gray-600 pl-4 print:text-black">
                                                MK: {item.mataKuliahList && item.mataKuliahList.length > 0
                                                    ? item.mataKuliahList.map(mk => mk.namaMk).join(', ')
                                                    : (item.mataKuliah?.namaMk || '-')}
                                            </div>
                                        </td>
                                        <td className="border border-black p-2 text-center align-top font-bold text-black">{item.nilaiAkhir.toFixed(2)}</td>
                                        <td className="border border-black p-2 text-center align-top text-black">
                                            {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="mb-8 text-sm border border-black p-4 inline-block">
                            <p className="font-bold text-black">Rata-rata Nilai : {avgScore.toFixed(2)}</p>
                            <p className="font-bold text-black">Total CPL Tercapai : {completedCPL} dari {transkripList.length}</p>
                        </div>

                        {/* Footer & Signature */}
                        <div className="flex justify-end mt-12 text-sm">
                            <div className="text-center w-64">
                                <p className="mb-1 text-black">Cilacap, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="font-bold mb-20 text-black">Ketua Program Studi,</p>
                                {kaprodiData && kaprodiData.namaKaprodi ? (
                                    <>
                                        <p className="border-b border-black inline-block min-w-[200px] font-bold uppercase text-black">
                                            {kaprodiData.namaKaprodi}
                                        </p>
                                        {kaprodiData.nidnKaprodi && (
                                            <p className="mt-1 text-black">NIDN. {kaprodiData.nidnKaprodi}</p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="border-b border-black inline-block min-w-[200px] font-bold uppercase text-black">
                                            {settings.kaprodiName || "( ........................................................ )"}
                                        </p>
                                        {settings.kaprodiNip && (
                                            <p className="mt-1 text-black">NIP. {settings.kaprodiNip}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardPage>
    );
};
export default TranskripCPLPage;

