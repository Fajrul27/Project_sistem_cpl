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
        profile: {
            namaLengkap: string;
            nim: string;
            programStudi: string;
            semester: number;
        };
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

const TranskripCPLPage = () => {
    const { role, userId } = useUserRole();
    const isMahasiswa = role === "mahasiswa";

    const [transkripList, setTranskripList] = useState<TranskripItem[]>([]);
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Update selectedMahasiswa when userId is available for mahasiswa
    useEffect(() => {
        if (isMahasiswa && userId) {
            setSelectedMahasiswa(userId);
        }
    }, [isMahasiswa, userId]);

    useEffect(() => {
        if (!isMahasiswa) {
            fetchMahasiswaOptions();
        }
    }, [isMahasiswa]);

    useEffect(() => {
        if (selectedMahasiswa) {
            fetchTranskrip();
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa]);

    const fetchMahasiswaOptions = async () => {
        try {
            const response = await fetchMahasiswaList();
            const users = response?.data || [];
            const mapped: Mahasiswa[] = users
                .filter((u: any) => u.profile && u.profile.nim)
                .map((u: any) => ({
                    id: u.id,
                    profile: {
                        namaLengkap: u.profile.namaLengkap,
                        nim: u.profile.nim,
                        programStudi: u.profile.programStudi,
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
            profile: transkripList[0].mahasiswa.profile
        } : null);

    const avgScore = transkripList.length > 0
        ? transkripList.reduce((sum, item) => sum + item.nilaiAkhir, 0) / transkripList.length
        : 0;

    const completedCPL = transkripList.filter(item => item.status === 'tercapai').length;

    const exportToPDF = () => {
        if (!selectedStudent || transkripList.length === 0) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        setExporting(true);

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI', 105, 15, { align: 'center' });
            doc.text('CILACAP', 105, 22, { align: 'center' });

            doc.setFontSize(12);
            doc.text('TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN', 105, 32, { align: 'center' });

            // Line separator
            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(20, 38, 190, 38);

            // Student Info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const startY = 48;
            doc.text(`NIM`, 20, startY);
            doc.text(`: ${selectedStudent.profile.nim}`, 55, startY);
            doc.text(`Nama`, 20, startY + 6);
            doc.text(`: ${selectedStudent.profile.namaLengkap}`, 55, startY + 6);
            doc.text(`Program Studi`, 20, startY + 12);
            doc.text(`: ${selectedStudent.profile.programStudi}`, 55, startY + 12);
            doc.text(`Semester`, 20, startY + 18);
            doc.text(`: ${selectedStudent.profile.semester}`, 55, startY + 18);

            // CPL Table
            const tableStartY = startY + 28;
            autoTable(doc, {
                startY: tableStartY,
                head: [['Kode CPL', 'Deskripsi', 'Mata Kuliah', 'Nilai', 'Status']],
                body: transkripList.map(item => [
                    item.cpl.kodeCpl,
                    item.cpl.deskripsi.substring(0, 40) + (item.cpl.deskripsi.length > 40 ? '...' : ''),
                    item.mataKuliahList && item.mataKuliahList.length > 0
                        ? item.mataKuliahList.map((mk: any) => mk.kodeMk).join(', ')
                        : (item.mataKuliah?.kodeMk || '-'),
                    item.nilaiAkhir.toFixed(2),
                    item.status === 'tercapai' ? '✓' : '✗'
                ]),
                theme: 'striped',
                headStyles: {
                    fillColor: [30, 58, 138], // Navy blue
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9
                },
                bodyStyles: {
                    fontSize: 8
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 20, halign: 'right' },
                    4: { cellWidth: 20, halign: 'center' }
                }
            });

            // Summary
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Rata-rata Nilai: ${avgScore.toFixed(2)}`, 20, finalY);
            doc.text(`CPL Tercapai: ${completedCPL}/${transkripList.length}`, 20, finalY + 6);

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}`, 20, pageHeight - 20);

            // Signature section
            doc.setFont('helvetica', 'normal');
            doc.text('Cilacap, ________________', 130, pageHeight - 40);
            doc.text('Ketua Program Studi,', 130, pageHeight - 34);
            doc.text('_______________________', 130, pageHeight - 10);

            // Save
            doc.save(`Transkrip-CPL-${selectedStudent.profile.nim}-${selectedStudent.profile.namaLengkap}.pdf`);
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
            <div className="space-y-6">
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
                                        {selectedStudent.profile.nim} - {selectedStudent.profile.namaLengkap}
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
                                                                    {item.mataKuliahList.slice(0, 2).map((mk: any, idx: number) => (
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
        </DashboardPage>
    );
};

export default TranskripCPLPage;
