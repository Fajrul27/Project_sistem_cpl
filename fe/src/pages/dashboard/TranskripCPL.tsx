import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Printer, FileText, Check, ChevronsUpDown, Briefcase, Eye, Filter, Info, ChevronDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranskripCPL } from "@/hooks/useTranskripCPL";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from "@/lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";


const TranskripCPLPage = () => {
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');

    const {
        transkripList,
        transkripCpmkList,
        profilLulusanList,
        mahasiswaList,
        loading,
        searchLoading,
        kaprodiData,
        settings,
        selectedMahasiswa,
        setSelectedMahasiswa,


        searchQuery,
        setSearchQuery,
        selectedStudent,
        validTranskripList,
        avgScore,
        completedCPL,
        totalCurriculumCpl,

        isMahasiswa,
        isDosen,
        // Filter props
        selectedFakultas,
        setSelectedFakultas,
        selectedProdi,
        setSelectedProdi,
        fakultasList,
        prodiList,
        selectedSemester,
        setSelectedSemester
    } = useTranskripCPL();

    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("cpl");
    const [openCombobox, setOpenCombobox] = useState(false);





    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && (tab === "cpl" || tab === "cpmk")) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSearchParams({ tab: val });
    };

    // Calculate RowSpans for CPMK Table
    const processedCpmkList = useMemo(() => {
        // 1. Sort by Kode MK then Kode CPMK
        const sorted = [...transkripCpmkList].sort((a, b) =>
            a.mataKuliah.kodeMk.localeCompare(b.mataKuliah.kodeMk) ||
            a.kodeCpmk.localeCompare(b.kodeCpmk)
        );

        // 2. Add rowSpan information and numbering
        const result: (typeof transkripCpmkList[0] & { rowSpan?: number, courseNumber?: number, isLastInGroup?: boolean, courseScore?: number })[] = [];
        let i = 0;
        let courseCounter = 1;

        while (i < sorted.length) {
            const current = sorted[i];

            // Calculate group size & total score
            let count = 1;
            let totalScore = current.nilai;

            // Check subsequent items for same Mata Kuliah
            for (let j = i + 1; j < sorted.length; j++) {
                if (sorted[j].mataKuliah.kodeMk === current.mataKuliah.kodeMk) {
                    count++;
                    totalScore += sorted[j].nilai;
                } else {
                    break;
                }
            }

            // Calculate Average Score
            const avgScore = totalScore / count;

            // Push items with metadata
            for (let k = 0; k < count; k++) {
                const item = sorted[i + k];
                const isFirst = k === 0;
                const isLast = k === count - 1;

                result.push({
                    ...item,
                    rowSpan: isFirst ? count : 0,
                    courseNumber: isFirst ? courseCounter : undefined, // Only set for first item
                    isLastInGroup: isLast,
                    courseScore: avgScore
                });
            }

            courseCounter++;
            i += count;
        }
        return result;
    }, [transkripCpmkList]);

    const handlePrint = () => {
        const originalTitle = document.title;
        const type = activeTab === 'cpl' ? 'Transkrip_CPL' : 'Transkrip_Capaian_Makul';
        const rawName = selectedStudent?.profile?.namaLengkap || 'Mahasiswa';
        // Keep alphanumeric and underscores, remove others
        const nama = rawName.replace(/[^a-zA-Z0-9]/g, '_');
        const nim = selectedStudent?.profile?.nim || 'NIM';
        const sem = selectedStudent?.profile?.semester ?? 'X';

        const printTitle = `${type}_${nama}_${nim}_Semester_${sem}`;

        // Force update both property and DOM element
        document.title = printTitle;
        const titleTag = document.querySelector('title');
        if (titleTag) titleTag.innerText = printTitle;

        window.print();
        document.title = originalTitle;
    };

    // Detail View State for Profil Lulusan
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedProfilDetail, setSelectedProfilDetail] = useState<any | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<any[]>([]);

    const handleViewDetail = async (profil: any) => {
        if (!selectedStudent) return;

        setSelectedProfilDetail(profil);
        setDetailDialogOpen(true);
        setDetailLoading(true);

        try {
            // Use selectedStudent.id which should be the userId
            const res = await api.get(`/transkrip-cpl/${selectedStudent.id}`);
            const transkripCpl = res.data?.transkrip || [];

            // Filter only CPLs that are in this Profil
            const profilCplIds = profil.cplMappings?.map((m: any) => m.cplId) || [];

            const filteredDetails = transkripCpl.filter((item: any) =>
                profilCplIds.includes(item.cplId)
            );

            setDetailData(filteredDetails);

        } catch (error) {
            console.error("Error fetching detail:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <DashboardPage
            title="Transkrip Akademik & CPL"
            description="Rekapitulasi nilai dan capaian pembelajaran"
        >
            <div className="space-y-6">
                {canManage && (
                    <CollapsibleGuide title="Panduan Transkrip & Capaian">
                        <div className="space-y-3">
                            <p>Transkrip ini menyajikan ringkasan performa akademik yang dipetakan langsung ke standar kompetensi lulusan (OBE).</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Tab CPL:</strong> Menampilkan rata-rata nilai untuk setiap Capaian Pembelajaran Lulusan beserta grafik radarnya.</li>
                                <li><strong>Tab CPMK:</strong> Menampilkan detail nilai pendukung dari setiap mata kuliah yang berkontribusi pada CPL.</li>
                                <li><strong>Cetak:</strong> Gunakan tombol ikon printer untuk mengunduh versi PDF transkrip yang telah diformat secara profesional.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}
                {
                    !isMahasiswa && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Mahasiswa</CardTitle>
                                <CardDescription>Cari mahasiswa berdasarkan Nama atau NIM</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 items-center">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="gap-2 relative h-10 w-auto px-3">
                                                <Filter className="h-4 w-4" />
                                                <span className="hidden sm:inline">Filter</span>
                                                {(selectedFakultas || selectedProdi || selectedSemester) &&
                                                    (selectedFakultas !== 'all' || selectedProdi !== 'all' || selectedSemester !== 'all') && (
                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                        </span>
                                                    )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px]" align="start">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium leading-none">Filter Pencarian</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Filter daftar mahasiswa berdasarkan kriteria
                                                    </p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="filter-fakultas">Fakultas</Label>
                                                    <Select value={selectedFakultas || 'all'} onValueChange={setSelectedFakultas}>
                                                        <SelectTrigger id="filter-fakultas">
                                                            <SelectValue placeholder="Pilih Fakultas" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Fakultas</SelectItem>
                                                            {fakultasList.map((f) => (
                                                                <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="filter-prodi">Program Studi</Label>
                                                    <Select value={selectedProdi || 'all'} onValueChange={setSelectedProdi}>
                                                        <SelectTrigger id="filter-prodi">
                                                            <SelectValue placeholder="Pilih Prodi" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Prodi</SelectItem>
                                                            {prodiList.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="filter-semester">Semester</Label>
                                                    <Select value={selectedSemester || 'all'} onValueChange={setSelectedSemester}>
                                                        <SelectTrigger id="filter-semester">
                                                            <SelectValue placeholder="Pilih Semester" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Semester</SelectItem>
                                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedFakultas('all');
                                                        setSelectedProdi('all');
                                                        setSelectedSemester('all');
                                                    }}
                                                    className="w-full text-muted-foreground hover:text-foreground"
                                                >
                                                    Reset Filter
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <div className="flex-1">
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-full justify-between h-10">
                                                    <span className={selectedMahasiswa ? "" : "text-muted-foreground"}>
                                                        {selectedMahasiswa ? mahasiswaList.find((mhs) => mhs.id === selectedMahasiswa)?.profile.namaLengkap : "Cari mahasiswa..."}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Ketik nama atau NIM..."
                                                        value={searchQuery}
                                                        onValueChange={setSearchQuery}
                                                        className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none focus:border-none ring-0 outline-none shadow-none !outline-none !border-none !ring-0 !shadow-none"
                                                    />
                                                    <CommandList>
                                                        {searchLoading && <div className="py-6 text-center text-sm text-muted-foreground">Mencari...</div>}
                                                        {!searchLoading && mahasiswaList.length === 0 && <CommandEmpty>Mahasiswa tidak ditemukan.</CommandEmpty>}
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
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                }

                {
                    selectedStudent && (
                        <>


                            {/* Empty Sate Check */}

                            <Tabs defaultValue="cpl" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="cpl">Capaian Lulusan (CPL)</TabsTrigger>
                                    <TabsTrigger value="cpmk">Capaian Mata Kuliah (CPMK)</TabsTrigger>
                                </TabsList>

                                <TabsContent value="cpl" className="animate-in fade-in slide-in-from-top-4 duration-500">



                                    {/* CPL Chart & Analysis */}
                                    <div className="grid gap-4 md:grid-cols-7 mb-6">
                                        <Card className="md:col-span-3">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium">Analisis Capaian</CardTitle>
                                                <CardDescription>CPL Tertinggi & Terendah</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {validTranskripList.length > 0 ? (() => {
                                                    const sorted = [...validTranskripList].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
                                                    const highest = sorted[0];
                                                    const lowest = sorted[sorted.length - 1];
                                                    return (
                                                        <>
                                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                                                                <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">CPL Tertinggi</div>
                                                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{highest.nilaiAkhir.toFixed(2)}</div>
                                                                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{highest.cpl.kodeCpl}</div>
                                                                <div className="text-[10px] text-green-600/80 dark:text-green-400/80 line-clamp-2 mt-1">{highest.cpl.deskripsi}</div>
                                                            </div>
                                                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900">
                                                                <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">CPL Terendah</div>
                                                                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{lowest.nilaiAkhir.toFixed(2)}</div>
                                                                <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{lowest.cpl.kodeCpl}</div>
                                                                <div className="text-[10px] text-red-600/80 dark:text-red-400/80 line-clamp-2 mt-1">{lowest.cpl.deskripsi}</div>
                                                            </div>
                                                        </>
                                                    );
                                                })() : <div className="text-muted-foreground text-sm">Belum ada data</div>}
                                            </CardContent>
                                        </Card>
                                        <Card className="md:col-span-4">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium">Peta Radar CPL</CardTitle>
                                                <CardDescription>Visualisasi sebaran capaian lulusan</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[300px] w-full">
                                                    {validTranskripList.length > 0 ? (
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={validTranskripList.map(i => ({ subject: i.cpl.kodeCpl, A: Number(i.nilaiAkhir) || 0, fullMark: 100 }))}>
                                                                <PolarGrid stroke="#e5e7eb" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} />
                                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                                                                <Radar name="Capaian" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.5} />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                    itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                                                                />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                                            Data tidak tersedia untuk visualisasi
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Profil Lulusan Section */}
                                    <Card className="mb-6">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium">Daftar Profil Lulusan</CardTitle>
                                            <CardDescription>Menampilkan {profilLulusanList.length} dari {profilLulusanList.length} Profil Lulusan</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50px]">No</TableHead>
                                                        <TableHead>Kode</TableHead>
                                                        <TableHead>Nama Profil</TableHead>
                                                        <TableHead>Deskripsi</TableHead>
                                                        <TableHead>Ketercapaian</TableHead>
                                                        <TableHead>Capaian Pembelajaran</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {profilLulusanList.length > 0 ? (
                                                        profilLulusanList.map((profil, idx) => (
                                                            <TableRow key={profil.id}>
                                                                <TableCell>{idx + 1}</TableCell>
                                                                <TableCell>{profil.kode}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                                                            <Briefcase size={16} />
                                                                        </div>
                                                                        <span className="font-medium">{profil.nama}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="max-w-xs text-xs text-muted-foreground line-clamp-2">{profil.deskripsi}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex justify-between text-xs">
                                                                            <span>{profil.percentage.toFixed(2)}%</span>
                                                                            <span className={profil.percentage >= ((profil as any).targetKetercapaian || 70) ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                                                                                {profil.percentage >= ((profil as any).targetKetercapaian || 70) ? "Tercapai" : "Belum Tercapai"}
                                                                            </span>
                                                                        </div>
                                                                        <Progress value={profil.percentage} className="h-2" />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center justify-center">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleViewDetail(profil)}
                                                                            title="Lihat Detail Kalkulasi"
                                                                        >
                                                                            <Eye className="w-4 h-4 text-primary" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                                Belum ada data profil lulusan
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Capaian OBE</CardTitle>
                                                <CardDescription>{selectedStudent.profile?.nim} - {selectedStudent.profile?.namaLengkap}</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <LoadingScreen fullScreen={false} message="Memuat data transkrip..." />
                                            ) : validTranskripList.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada data transkrip CPL</p></div>
                                            ) : (
                                                <div className="overflow-x-auto">
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
                                                                    <TableCell className="text-center font-bold">{item.huruf || '-'}</TableCell>
                                                                    <TableCell className="text-center">
                                                                        {item.status === 'tercapai' ? <Badge className="bg-green-500">Tercapai</Badge> : <Badge variant="destructive">Belum Tercapai</Badge>}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="cpmk" className="animate-in fade-in slide-in-from-top-4 duration-500">

                                    {/* CPMK Chart & Analysis */}
                                    <div className="grid gap-4 md:grid-cols-7 mb-6">
                                        <Card className="md:col-span-3">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium">Analisis Mata Kuliah</CardTitle>
                                                <CardDescription>Nilai Mata Kuliah Tertinggi & Terendah</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {transkripCpmkList.length > 0 ? (() => {
                                                    // Aggregate CPMK data by Mata Kuliah
                                                    const makulMap = new Map();
                                                    transkripCpmkList.forEach(item => {
                                                        const key = item.mataKuliah.kodeMk;
                                                        if (!makulMap.has(key)) {
                                                            makulMap.set(key, {
                                                                kodeMk: key,
                                                                namaMk: item.mataKuliah.namaMk,
                                                                totalNilai: 0,
                                                                count: 0
                                                            });
                                                        }
                                                        const entry = makulMap.get(key);
                                                        entry.totalNilai += item.nilai;
                                                        entry.count += 1;
                                                    });

                                                    const makulList = Array.from(makulMap.values()).map((m: any) => ({
                                                        ...m,
                                                        average: m.totalNilai / m.count
                                                    }));

                                                    const sorted = makulList.sort((a: any, b: any) => b.average - a.average);
                                                    const highest = sorted[0];
                                                    const lowest = sorted[sorted.length - 1];

                                                    return (
                                                        <>
                                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-900">
                                                                <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Nilai Makul Tertinggi</div>
                                                                <div className="text-3xl font-bold text-green-700 dark:text-green-300">{highest.average.toFixed(2)}</div>
                                                                <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">{highest.kodeMk}</div>
                                                                <div className="text-[10px] text-green-600/80 dark:text-green-400/80 line-clamp-2 mt-1">{highest.namaMk}</div>
                                                            </div>
                                                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900">
                                                                <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Nilai Makul Terendah</div>
                                                                <div className="text-3xl font-bold text-red-700 dark:text-red-300">{lowest.average.toFixed(2)}</div>
                                                                <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{lowest.kodeMk}</div>
                                                                <div className="text-[10px] text-red-600/80 dark:text-red-400/80 line-clamp-2 mt-1">{lowest.namaMk}</div>
                                                            </div>
                                                        </>
                                                    );
                                                })() : <div className="text-muted-foreground text-sm">Belum ada data</div>}
                                            </CardContent>
                                        </Card>
                                        <Card className="md:col-span-4">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium">Peta Radar Mata Kuliah</CardTitle>
                                                <CardDescription>Sebaran rata-rata nilai per Mata Kuliah (Sample 10 Data)</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[300px] w-full">
                                                    {transkripCpmkList.length > 0 ? (() => {
                                                        const makulMap = new Map();
                                                        transkripCpmkList.forEach(item => {
                                                            const key = item.mataKuliah.kodeMk;
                                                            if (!makulMap.has(key)) {
                                                                makulMap.set(key, {
                                                                    subject: key,
                                                                    totalNilai: 0,
                                                                    count: 0
                                                                });
                                                            }
                                                            const entry = makulMap.get(key);
                                                            entry.totalNilai += item.nilai;
                                                            entry.count += 1;
                                                        });

                                                        const radarData = Array.from(makulMap.values())
                                                            .map((m: any) => ({
                                                                subject: m.subject,
                                                                A: Number((m.totalNilai / m.count).toFixed(2)) || 0,
                                                                fullMark: 100
                                                            }))
                                                            .slice(0, 10);

                                                        return (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                                    <PolarGrid stroke="#e5e7eb" />
                                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} />
                                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                                                                    <Radar name="Rata-rata Nilai" dataKey="A" stroke="#8b5cf6" fill="#a78bfa" fillOpacity={0.5} />
                                                                    <Tooltip
                                                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                        itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
                                                                    />
                                                                </RadarChart>
                                                            </ResponsiveContainer>
                                                        );
                                                    })() : (

                                                        <div className="flex h-full items-center justify-center text-muted-foreground">
                                                            Data tidak tersedia untuk visualisasi
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>



                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Capaian Makul</CardTitle>
                                                <CardDescription>{selectedStudent.profile?.nim} - {selectedStudent.profile?.namaLengkap}</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />Print</Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <LoadingScreen fullScreen={false} message="Memuat data transkrip Capaian Makul..." />
                                            ) : transkripCpmkList.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada data transkrip Capaian Makul</p></div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Mata Kuliah</TableHead>
                                                                <TableHead>Kode CPMK</TableHead>
                                                                <TableHead className="text-right">Nilai</TableHead>
                                                                <TableHead className="text-center">Huruf</TableHead>
                                                                <TableHead className="text-center">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {processedCpmkList.map((item, index) => (
                                                                <TableRow key={index} className={item.isLastInGroup ? "" : "border-b-0"}>
                                                                    {item.rowSpan !== 0 && (
                                                                        <>
                                                                            <TableCell rowSpan={item.rowSpan} className="align-top border-r text-center font-medium">
                                                                                {item.courseNumber}
                                                                            </TableCell>
                                                                            <TableCell rowSpan={item.rowSpan} className="align-top border-r">
                                                                                <div className="font-medium">{item.mataKuliah.kodeMk} - {item.mataKuliah.namaMk}</div>
                                                                            </TableCell>
                                                                        </>
                                                                    )}
                                                                    <TableCell className={item.isLastInGroup ? "" : "border-b-0"}>
                                                                        <div className="font-medium">{item.kodeCpmk}</div>
                                                                        <div className="text-xs text-muted-foreground mt-1">{item.deskripsi}</div>
                                                                    </TableCell>
                                                                    {item.rowSpan !== 0 && (
                                                                        <>
                                                                            <TableCell rowSpan={item.rowSpan} className="align-top border-r text-right font-medium">
                                                                                {item.courseScore?.toFixed(2)}
                                                                            </TableCell>
                                                                            <TableCell rowSpan={item.rowSpan} className="align-top border-r text-center font-bold">
                                                                                {item.huruf || '-'}
                                                                            </TableCell>
                                                                            <TableCell rowSpan={item.rowSpan} className="align-top border-r text-center">
                                                                                {item.status === 'tercapai'
                                                                                    ? <Badge className="bg-green-500">Tercapai</Badge>
                                                                                    : <Badge variant="destructive">Belum Tercapai</Badge>}
                                                                            </TableCell>
                                                                        </>
                                                                    )}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>

                        </>
                    )
                }

                {/* Detail View Dialog */}
                <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Detail Kalkulasi Profil Lulusan</DialogTitle>
                            <DialogDescription>
                                {selectedProfilDetail?.kode} - {selectedProfilDetail?.nama}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto pr-2">
                            {detailLoading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingScreen fullScreen={false} />
                                </div>
                            ) : detailData.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada data detail untuk profil ini.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30 text-blue-800 dark:text-blue-300">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle className="text-sm font-semibold mb-1">Informasi Perhitungan</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            <p className="mb-2">
                                                Nilai Profil Lulusan diperoleh dari rata-rata nilai seluruh CPL yang menyusun profil ini.
                                                Setiap CPL memiliki bobot kontribusi yang sama terhadap nilai akhir profil.
                                            </p>
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-900/50 w-fit">
                                                <div className="flex items-center gap-2 text-xs font-semibold">
                                                    <span>Nilai PL = </span>
                                                    <div className="flex flex-col items-center">
                                                        <span className="border-b border-black dark:border-white px-1">Σ Nilai CPL</span>
                                                        <span>Jumlah CPL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AlertDescription>
                                    </Alert>

                                    <Accordion type="multiple" className="w-full space-y-3">
                                        {detailData.map((item, index) => {
                                            const contributionValue = detailData.length > 0 ? (Number(item.nilaiAkhir) / detailData.length).toFixed(2) : "0.00";

                                            return (
                                                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-0 overflow-hidden shadow-sm">
                                                    <AccordionTrigger className="hover:no-underline px-4 py-3 bg-card data-[state=open]:bg-muted/30">
                                                        <div className="flex flex-1 items-center justify-between mr-4 text-left">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-sm">{item.cpl.kodeCpl}</span>
                                                                    <Badge variant="outline" className="text-[10px] h-5 font-normal bg-blue-50 text-blue-700 border-blue-200">
                                                                        Kontribusi: {(100 / detailData.length).toFixed(1)}%
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-[10px] h-5 font-normal bg-green-50 text-green-700 border-green-200">
                                                                        +{contributionValue} ke Profil
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground line-clamp-1 max-w-[500px]">{item.cpl.deskripsi}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={cn("text-sm h-7 px-3", item.status === 'tercapai' ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700")}>
                                                                    {Number(item.nilaiAkhir).toFixed(2)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="p-0 border-t">
                                                        <div className="p-4 bg-muted/5 dark:bg-muted/10 space-y-4">
                                                            {/* CPL Info Box */}
                                                            <div className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                                                                <div className="flex items-start gap-2 mb-2">
                                                                    <Info className="w-3 h-3 mt-0.5 text-slate-500" />
                                                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kalkulasi Nilai CPL:</span>
                                                                </div>
                                                                <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded flex justify-center">
                                                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-slate-700 dark:text-slate-300">
                                                                        <span>Nilai CPL = </span>
                                                                        <div className="flex flex-col items-center">
                                                                            <span className="border-b border-slate-600 dark:border-slate-400 px-1">Σ (Nilai MK × SKS × Bobot)</span>
                                                                            <span>Σ (SKS × Bobot)</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Mata Kuliah List */}
                                                            <div className="space-y-2">

                                                                {item.mataKuliahList && item.mataKuliahList.length > 0 ? (
                                                                    <div className="grid gap-2">
                                                                        {item.mataKuliahList.map((mk: any, mkIdx: number) => {
                                                                            const nilai = mk.nilai || mk.nilaiAkhir || 0;
                                                                            const isPassed = nilai >= 50;
                                                                            return (
                                                                                <div key={mkIdx} className={cn(
                                                                                    "flex justify-between items-center p-3 rounded-lg border text-sm transition-colors",
                                                                                    isPassed
                                                                                        ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                                                        : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                )}>
                                                                                    <div className="flex flex-col gap-0.5">
                                                                                        <div className="font-medium text-foreground">
                                                                                            {mk.mataKuliah?.kodeMk || mk.kodeMk} - {mk.mataKuliah?.namaMk || mk.namaMk}
                                                                                        </div>
                                                                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                                                            <Badge variant="secondary" className="h-4 px-1 text-[9px] font-normal">Sem {mk.mataKuliah?.semester || mk.semester}</Badge>
                                                                                            <span>•</span>
                                                                                            <span>{mk.mataKuliah?.sks || mk.sks || 0} SKS</span>
                                                                                            <span>•</span>
                                                                                            <span>Bobot: {mk.bobot || 0}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Badge className={cn(
                                                                                        "font-mono h-6 w-14 justify-center text-xs",
                                                                                        isPassed ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                                                                                    )}>
                                                                                        {nilai.toFixed(2)}
                                                                                    </Badge>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 text-center border-dashed border rounded-lg text-muted-foreground text-xs">
                                                                        Belum ada mata kuliah yang berkontribusi.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* PRINT LAYOUT PORTAL */}
                {
                    selectedStudent && createPortal(
                        <div id="print-root" className="bg-white text-black">
                            <style>{`
                    @media print {
                        @page { 
                            size: A4;
                            margin: 20mm;
                        }
                        
                        body, html { 
                            margin: 0; 
                            padding: 0;
                            background-color: white !important;
                            height: 100% !important;
                            overflow: visible !important;
                        }

                        /* HIDE EVERYTHING ELSE */
                        body > *:not(#print-root) {
                            display: none !important;
                        }

                        /* SHOW PRINT ROOT */
                        #print-root {
                            display: block !important;
                            width: 100%;
                            height: auto;
                            margin: 0;
                            padding: 0;
                            background-color: white !important;
                            /* Reset positioning */
                            position: static !important;
                            overflow: visible !important;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color: black !important;
                        }
                    }
                    
                    /* Hide print root on screen */
                    @media screen {
                        #print-root {
                            display: none !important;
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
                                    {activeTab === 'cpl' ? 'TRANSKRIP CAPAIAN PEMBELAJARAN LULUSAN' : 'TRANSKRIP CAPAIAN MATA KULIAH SEMENTARA'}
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

                                {/* Analysis & Radar Chart for Print */}
                                {activeTab === 'cpl' && validTranskripList.length > 0 && (() => {
                                    const sorted = [...validTranskripList].sort((a, b) => b.nilaiAkhir - a.nilaiAkhir);
                                    const highest = sorted[0];
                                    const lowest = sorted[sorted.length - 1];

                                    return (
                                        <div className="mb-4 grid grid-cols-2 gap-3">
                                            {/* Analysis Section */}
                                            <div className="border border-black p-2">
                                                <h3 className="text-xs font-bold mb-2">ANALISIS CAPAIAN</h3>
                                                <div className="text-[9px] mb-2">
                                                    <div className="bg-green-50 p-2 mb-1.5 border border-green-200">
                                                        <div className="font-semibold text-green-700">CPL Tertinggi</div>
                                                        <div className="text-2xl font-bold text-green-800">{highest.nilaiAkhir.toFixed(2)}</div>
                                                        <div className="font-medium">{highest.cpl.kodeCpl}</div>
                                                        <div className="text-[8px] italic line-clamp-2">{highest.cpl.deskripsi}</div>
                                                    </div>
                                                    <div className="bg-red-50 p-2 border border-red-200">
                                                        <div className="font-semibold text-red-700">CPL Terendah</div>
                                                        <div className="text-2xl font-bold text-red-800">{lowest.nilaiAkhir.toFixed(2)}</div>
                                                        <div className="font-medium">{lowest.cpl.kodeCpl}</div>
                                                        <div className="text-[8px] italic line-clamp-2">{lowest.cpl.deskripsi}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Radar Chart Section */}
                                            <div className="border border-black p-2">
                                                <h3 className="text-xs font-bold mb-2">PETA RADAR CPL</h3>
                                                <div className="text-[8px] text-center mb-1">Visualisasi Sebaran Capaian Lulusan</div>
                                                <div className="relative" style={{ height: '140px' }}>
                                                    <svg viewBox="0 0 200 140" className="w-full h-full">
                                                        {/* Create radar chart visualization */}
                                                        {(() => {
                                                            const data = validTranskripList.map(i => ({
                                                                label: i.cpl.kodeCpl,
                                                                value: Number(i.nilaiAkhir) || 0
                                                            }));
                                                            const numPoints = data.length;
                                                            const centerX = 100;
                                                            const centerY = 50; // Center of 0-100 scale
                                                            const radius = 50;

                                                            // Calculate points for radar
                                                            const points = data.map((item, idx) => {
                                                                const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
                                                                const value = (item.value / 100) * radius;
                                                                return {
                                                                    x: centerX + Math.cos(angle) * value,
                                                                    y: centerY + Math.sin(angle) * value,
                                                                    maxX: centerX + Math.cos(angle) * radius,
                                                                    maxY: centerY + Math.sin(angle) * radius,
                                                                    label: item.label,
                                                                    labelX: centerX + Math.cos(angle) * (radius + 15),
                                                                    labelY: centerY + Math.sin(angle) * (radius + 15)
                                                                };
                                                            });

                                                            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

                                                            return (
                                                                <>
                                                                    {/* Grid circles */}
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />

                                                                    {/* Value indicators on circles */}
                                                                    <text x={centerX + radius * 0.25 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">25</text>
                                                                    <text x={centerX + radius * 0.5 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">50</text>
                                                                    <text x={centerX + radius * 0.75 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">75</text>
                                                                    <text x={centerX + radius + 2} y={centerY - 1} fontSize="5" fill="#6b7280" fontWeight="bold">100</text>
                                                                    <text x={centerX + 2} y={centerY - 1} fontSize="5" fill="#6b7280">0</text>

                                                                    {/* Grid lines */}
                                                                    {points.map((p, idx) => (
                                                                        <line key={idx} x1={centerX} y1={centerY} x2={p.maxX} y2={p.maxY} stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    ))}

                                                                    {/* Data polygon */}
                                                                    <path d={pathData} fill="#3b82f6" fillOpacity="0.4" stroke="#2563eb" strokeWidth="1.5" />

                                                                    {/* Labels */}
                                                                    {points.map((p, idx) => (
                                                                        <text
                                                                            key={idx}
                                                                            x={p.labelX}
                                                                            y={p.labelY}
                                                                            fontSize="6"
                                                                            textAnchor="middle"
                                                                            alignmentBaseline="middle"
                                                                            fontWeight="bold"
                                                                        >
                                                                            {p.label}
                                                                        </text>
                                                                    ))}
                                                                </>
                                                            );
                                                        })()}
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Analysis & Radar Chart for CPMK Print */}
                                {activeTab === 'cpmk' && transkripCpmkList.length > 0 && (() => {
                                    // Aggregate CPMK data by Mata Kuliah
                                    const makulMap = new Map();
                                    transkripCpmkList.forEach(item => {
                                        const key = item.mataKuliah.kodeMk;
                                        if (!makulMap.has(key)) {
                                            makulMap.set(key, {
                                                kodeMk: key,
                                                namaMk: item.mataKuliah.namaMk,
                                                totalNilai: 0,
                                                count: 0
                                            });
                                        }
                                        const entry = makulMap.get(key);
                                        entry.totalNilai += item.nilai;
                                        entry.count += 1;
                                    });

                                    const makulList = Array.from(makulMap.values()).map((m: any) => ({
                                        ...m,
                                        average: m.totalNilai / m.count
                                    }));

                                    const sorted = makulList.sort((a: any, b: any) => b.average - a.average);
                                    const highest = sorted[0];
                                    const lowest = sorted[sorted.length - 1];

                                    const radarData = makulList.slice(0, 10).map((m: any) => ({
                                        label: m.kodeMk,
                                        value: m.average
                                    }));

                                    return (
                                        <div className="mb-4 grid grid-cols-2 gap-3">
                                            {/* Analysis Section */}
                                            <div className="border border-black p-2">
                                                <h3 className="text-xs font-bold mb-2">ANALISIS MATA KULIAH</h3>
                                                <div className="text-[9px] mb-2">
                                                    <div className="bg-green-50 p-2 mb-1.5 border border-green-200">
                                                        <div className="font-semibold text-green-700">Nilai Makul Tertinggi</div>
                                                        <div className="text-2xl font-bold text-green-800">{highest.average.toFixed(2)}</div>
                                                        <div className="font-medium">{highest.kodeMk}</div>
                                                        <div className="text-[8px] italic line-clamp-2">{highest.namaMk}</div>
                                                    </div>
                                                    <div className="bg-red-50 p-2 border border-red-200">
                                                        <div className="font-semibold text-red-700">Nilai Makul Terendah</div>
                                                        <div className="text-2xl font-bold text-red-800">{lowest.average.toFixed(2)}</div>
                                                        <div className="font-medium">{lowest.kodeMk}</div>
                                                        <div className="text-[8px] italic line-clamp-2">{lowest.namaMk}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Radar Chart Section */}
                                            <div className="border border-black p-2">
                                                <h3 className="text-xs font-bold mb-2">PETA RADAR MATA KULIAH</h3>
                                                <div className="text-[8px] text-center mb-1">Sebaran Rata-rata Nilai per MK (Sample 10 Data)</div>
                                                <div className="relative" style={{ height: '140px' }}>
                                                    <svg viewBox="0 0 200 140" className="w-full h-full">
                                                        {(() => {
                                                            const numPoints = radarData.length;
                                                            const centerX = 100;
                                                            const centerY = 50; // Center of 0-100 scale
                                                            const radius = 50;

                                                            // Calculate points for radar
                                                            const points = radarData.map((item, idx) => {
                                                                const angle = (Math.PI * 2 * idx) / numPoints - Math.PI / 2;
                                                                const value = (item.value / 100) * radius;
                                                                return {
                                                                    x: centerX + Math.cos(angle) * value,
                                                                    y: centerY + Math.sin(angle) * value,
                                                                    maxX: centerX + Math.cos(angle) * radius,
                                                                    maxY: centerY + Math.sin(angle) * radius,
                                                                    label: item.label,
                                                                    labelX: centerX + Math.cos(angle) * (radius + 15),
                                                                    labelY: centerY + Math.sin(angle) * (radius + 15)
                                                                };
                                                            });

                                                            const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

                                                            return (
                                                                <>
                                                                    {/* Grid circles */}
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.25} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius * 0.75} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />

                                                                    {/* Value indicators on circles */}
                                                                    <text x={centerX + radius * 0.25 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">25</text>
                                                                    <text x={centerX + radius * 0.5 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">50</text>
                                                                    <text x={centerX + radius * 0.75 + 2} y={centerY - 1} fontSize="5" fill="#6b7280">75</text>
                                                                    <text x={centerX + radius + 2} y={centerY - 1} fontSize="5" fill="#6b7280" fontWeight="bold">100</text>
                                                                    <text x={centerX + 2} y={centerY - 1} fontSize="5" fill="#6b7280">0</text>

                                                                    {/* Grid lines */}
                                                                    {points.map((p, idx) => (
                                                                        <line key={idx} x1={centerX} y1={centerY} x2={p.maxX} y2={p.maxY} stroke="#e5e7eb" strokeWidth="0.5" />
                                                                    ))}

                                                                    {/* Data polygon */}
                                                                    <path d={pathData} fill="#8b5cf6" fillOpacity="0.4" stroke="#7c3aed" strokeWidth="1.5" />

                                                                    {/* Labels */}
                                                                    {points.map((p, idx) => (
                                                                        <text
                                                                            key={idx}
                                                                            x={p.labelX}
                                                                            y={p.labelY}
                                                                            fontSize="6"
                                                                            textAnchor="middle"
                                                                            alignmentBaseline="middle"
                                                                            fontWeight="bold"
                                                                        >
                                                                            {p.label}
                                                                        </text>
                                                                    ))}
                                                                </>
                                                            );
                                                        })()}
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Table */}
                                <div className="mb-4">
                                    <table className="w-full border-collapse border border-black text-[10px]">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-black p-1 w-8 text-center">NO</th>
                                                <th className="border border-black p-1 text-center w-20">{activeTab === 'cpl' ? 'KODE CPL' : 'MATA KULIAH'}</th>
                                                <th className="border border-black p-1 text-left">{activeTab === 'cpl' ? 'CAPAIAN PEMBELAJARAN' : 'CPMK'}</th>
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
                                                        <td className="border border-black p-1 text-center font-bold">{item.huruf || '-'}</td>
                                                        <td className="border border-black p-1 text-center">
                                                            {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (

                                                processedCpmkList.map((item, index) => (
                                                    <tr key={index}>
                                                        {item.rowSpan !== 0 && (
                                                            <td className="border border-black p-1 text-center align-top" rowSpan={item.rowSpan}>{item.courseNumber}</td>
                                                        )}
                                                        {item.rowSpan !== 0 && (
                                                            <td className="border border-black p-1 align-top" rowSpan={item.rowSpan}>
                                                                <div className="font-medium">{item.mataKuliah.kodeMk} - {item.mataKuliah.namaMk}</div>
                                                            </td>
                                                        )}
                                                        <td className={`border-x border-black p-1 ${item.isLastInGroup ? 'border-b' : ''}`}>
                                                            <div className="font-bold">{item.kodeCpmk}</div>
                                                            <div className="text-[9px] italic">{item.deskripsi}</div>
                                                        </td>
                                                        {item.rowSpan !== 0 && (
                                                            <>
                                                                <td className="border border-black p-1 text-center font-bold align-top" rowSpan={item.rowSpan}>
                                                                    {item.courseScore?.toFixed(2)}
                                                                </td>
                                                                <td className="border border-black p-1 text-center font-bold align-top" rowSpan={item.rowSpan}>
                                                                    {item.huruf || '-'}
                                                                </td>
                                                                <td className="border border-black p-1 text-center align-top" rowSpan={item.rowSpan}>
                                                                    {item.status === 'tercapai' ? 'Tercapai' : 'Belum'}
                                                                </td>
                                                            </>
                                                        )}
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
                        </div>,
                        document.body
                    )
                }
            </div>
        </DashboardPage >
    );
};

export default TranskripCPLPage;
