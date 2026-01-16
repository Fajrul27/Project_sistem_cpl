import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useEvaluasiCPL, TargetCPL, EvaluationItem } from "@/hooks/useEvaluasiCPL";
import { useProdi } from "@/hooks/useProdi";
import { useFakultas } from "@/hooks/useFakultas";
import { useAngkatan } from "@/hooks/useAngkatan";
import { useCPL } from "@/hooks/useCPL";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";
import { useNavigate } from "react-router-dom"; // Added import
import { CheckCircle, XCircle, AlertCircle, Save, ChevronDown, ChevronRight, TrendingUp, Edit, ChevronUp } from "lucide-react"; // Added Edit
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const EvaluasiCPLPage = () => {
    const navigate = useNavigate();
    const {
        loading, targets, evaluation, summary,
        fetchTargets, saveTargets, fetchEvaluation, saveTindakLanjut, resetEvaluation
    } = useEvaluasiCPL();

    const { prodiList } = useProdi();
    const { fakultasList } = useFakultas();
    const { angkatanList } = useAngkatan();
    const { cplList, setProdiFilter } = useCPL();
    const { tahunAjaranList, activeTahunAjaran } = useTahunAjaran();

    const [activeTab, setActiveTab] = useState("evaluation");
    const [filters, setFilters] = useState({
        fakultasId: "",
        prodiId: "",
        angkatan: "",
        tahunAjaran: "", // Default or dynamic
        semester: "all"
    });

    // Local state for target editing
    const [targetInputs, setTargetInputs] = useState<Record<string, number>>({});

    // Local state for tindak lanjut dialog
    const [selectedCpl, setSelectedCpl] = useState<EvaluationItem | null>(null);
    const [tindakLanjutForm, setTindakLanjutForm] = useState({
        akarMasalah: "",
        rencanaPerbaikan: "",
        penanggungJawab: "",
        targetSemester: ""
    });

    // Expanded rows state
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);

    const toggleRow = (cplId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(cplId)) {
            newExpanded.delete(cplId);
        } else {
            newExpanded.add(cplId);
        }
        setExpandedRows(newExpanded);
    };

    useEffect(() => {
        if (filters.prodiId) {
            setProdiFilter(filters.prodiId);
        }
    }, [filters.prodiId]);

    // Set default active Tahun Ajaran
    useEffect(() => {
        if (activeTahunAjaran && !filters.tahunAjaran) {
            setFilters(prev => ({ ...prev, tahunAjaran: activeTahunAjaran.id }));
        }
    }, [activeTahunAjaran]);

    useEffect(() => {
        if (filters.prodiId && filters.angkatan && filters.tahunAjaran) {
            const apiFilters = {
                ...filters,
                semester: filters.semester === 'all' ? '' : filters.semester
            };

            if (activeTab === "target") {
                fetchTargets(apiFilters);
            } else {
                fetchEvaluation(apiFilters);
            }
        }
    }, [filters, activeTab]);

    useEffect(() => {
        if (targets.length > 0) {
            const inputs: Record<string, number> = {};
            targets.forEach(t => {
                inputs[t.cplId] = t.target;
            });
            setTargetInputs(inputs);
        }
    }, [targets]);

    const handleSaveTargets = async () => {
        const targetData = Object.entries(targetInputs).map(([cplId, target]) => ({
            cplId,
            target
        }));

        await saveTargets({
            ...filters,
            semester: filters.semester === 'all' ? '' : filters.semester,
            targets: targetData
        });
    };

    const handleSaveTindakLanjut = async () => {
        if (!selectedCpl) return;

        const success = await saveTindakLanjut({
            ...filters,
            semester: filters.semester === 'all' ? '' : filters.semester,
            cplId: selectedCpl.cplId,
            ...tindakLanjutForm
        });

        if (success) {
            setSelectedCpl(null);
            fetchEvaluation(filters); // Refresh
        }
    };

    const canLoad = filters.prodiId && filters.angkatan && filters.tahunAjaran;

    // Prepare Chart Data
    const chartData = evaluation.map(item => ({
        subject: item.kodeCpl,
        Target: item.target,
        Actual: item.actual,
        fullMark: 100
    }));

    return (
        <DashboardPage title="Evaluasi CPL & Tindak Lanjut OBE">
            <div className="space-y-6">
                {/* Filters */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    Filter Data Evaluasi
                                    {isFilterExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Tentukan kelompok mahasiswa dan periode penilaian yang ingin dianalisis.
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFilters({ fakultasId: "", prodiId: "", angkatan: "", tahunAjaran: "", semester: "all" });
                                    resetEvaluation();
                                }}
                                className="h-8"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </CardHeader>
                    {isFilterExpanded && (
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Group 1: Cohort Selection */}
                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</div>
                                        <h4 className="font-semibold text-sm">Siapa yang dievaluasi?</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Fakultas</Label>
                                            <Select
                                                value={filters.fakultasId}
                                                onValueChange={(v) => setFilters({ ...filters, fakultasId: v, prodiId: "" })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Fakultas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fakultasList.map(f => (
                                                        <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Program Studi</Label>
                                            <Select
                                                value={filters.prodiId}
                                                onValueChange={(v) => setFilters({ ...filters, prodiId: v })}
                                                disabled={!filters.fakultasId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Prodi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {prodiList
                                                        .filter(p => p.id && p.id !== "" && (!filters.fakultasId || p.fakultasId === filters.fakultasId))
                                                        .map(p => (
                                                            <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Angkatan Mahasiswa</Label>
                                            <Select
                                                value={filters.angkatan}
                                                onValueChange={(v) => setFilters({ ...filters, angkatan: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Angkatan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {angkatanList.filter(a => a.tahun).map(a => (
                                                        <SelectItem key={a.id} value={a.tahun.toString()}>{a.tahun}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Group 2: Time Period */}
                                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</div>
                                        <h4 className="font-semibold text-sm">Periode Penilaian</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Tahun Ajaran</Label>
                                            <Select
                                                value={filters.tahunAjaran}
                                                onValueChange={(v) => setFilters({ ...filters, tahunAjaran: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tahunAjaranList.map(ta => (
                                                        <SelectItem key={ta.id} value={ta.id}>{ta.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Semester (Opsional)</Label>
                                            <Select
                                                value={filters.semester}
                                                onValueChange={(v) => setFilters({ ...filters, semester: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Semua Semester" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Semester</SelectItem>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="evaluation">Evaluasi & Tindak Lanjut</TabsTrigger>
                        <TabsTrigger value="target">Lihat Target</TabsTrigger>
                    </TabsList>

                    <TabsContent value="target">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Target Capaian Pembelajaran Lulusan</CardTitle>
                                        <CardDescription>Tentukan target minimal pencapaian untuk setiap CPL</CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const params = new URLSearchParams();
                                            params.set("view", "target");
                                            if (filters.fakultasId) params.set("fakultasId", filters.fakultasId);
                                            if (filters.prodiId) params.set("prodiId", filters.prodiId);
                                            if (filters.angkatan) params.set("angkatan", filters.angkatan);
                                            if (filters.tahunAjaran) params.set("tahunAjaran", filters.tahunAjaran);

                                            navigate(`/dashboard/cpl?${params.toString()}`);
                                        }}
                                        disabled={!canLoad}
                                        variant="outline" // Using outline or maybe standard? User asked for "rubah target".
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Ubah Target
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!canLoad ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Silakan pilih filter terlebih dahulu
                                    </div>
                                ) : loading ? (
                                    <LoadingScreen fullScreen={false} />
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Kode CPL</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead className="w-[150px]">Target (%)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cplList.map(cpl => (
                                                <TableRow key={cpl.id}>
                                                    <TableCell className="font-medium">{cpl.kodeCpl}</TableCell>
                                                    <TableCell>{cpl.deskripsi}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={targetInputs[cpl.id] ?? 75}
                                                            disabled // Make read-only
                                                            className="bg-muted" // Optional visual cue
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="evaluation">
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total CPL</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{summary.totalCpl}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Tercapai</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{summary.tercapai}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Tidak Tercapai</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{summary.tidakTercapai}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Radar Chart */}
                        {canLoad && !loading && evaluation.length > 0 && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Peta Capaian CPL (Radar Chart)</CardTitle>
                                    <CardDescription>Visualisasi perbandingan Target vs Capaian Aktual</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                <Radar name="Target" dataKey="Target" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                                                <Radar name="Actual" dataKey="Actual" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                                <Legend />
                                                <Tooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Hasil Evaluasi CPL</CardTitle>
                                <CardDescription>Perbandingan capaian aktual mahasiswa dengan target yang ditetapkan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!canLoad ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Silakan pilih filter terlebih dahulu
                                    </div>
                                ) : loading ? (
                                    <LoadingScreen fullScreen={false} />
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]"></TableHead>
                                                <TableHead className="w-[80px]">Kode</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead className="text-center">Target</TableHead>
                                                <TableHead className="text-center">Aktual</TableHead>
                                                <TableHead className="text-center">% Mhs Lulus</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {evaluation.map(item => (
                                                <>
                                                    <TableRow key={item.cplId} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(item.cplId)}>
                                                        <TableCell>
                                                            {expandedRows.has(item.cplId) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{item.kodeCpl}</TableCell>
                                                        <TableCell className="max-w-md truncate" title={item.deskripsi}>{item.deskripsi}</TableCell>
                                                        <TableCell className="text-center">{item.target}</TableCell>
                                                        <TableCell className="text-center font-bold">{item.actual}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant={item.passPercentage >= 80 ? "outline" : "secondary"} className={item.passPercentage < 50 ? "text-red-600 border-red-200 bg-red-50" : ""}>
                                                                {item.passPercentage}%
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.status === 'Tercapai' ? (
                                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                                    <CheckCircle className="w-3 h-3 mr-1" /> Tercapai
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive">
                                                                    <XCircle className="w-3 h-3 mr-1" /> Tidak Tercapai
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            {item.status === 'Tidak Tercapai' && (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            variant={item.tindakLanjut ? "outline" : "default"}
                                                                            size="sm"
                                                                            onClick={() => setSelectedCpl(item)}
                                                                        >
                                                                            {item.tindakLanjut ? "Lihat Tindak Lanjut" : "Tindak Lanjut"}
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-lg">
                                                                        <DialogHeader>
                                                                            <DialogTitle>Tindak Lanjut OBE - {item.kodeCpl}</DialogTitle>
                                                                            <DialogDescription>
                                                                                Lengkapi formulir tindak lanjut untuk CPL yang tidak tercapai (Closing the Loop).
                                                                            </DialogDescription>
                                                                        </DialogHeader>

                                                                        {item.tindakLanjut ? (
                                                                            <div className="space-y-4 py-4">
                                                                                <div className="p-4 bg-muted rounded-lg space-y-3">
                                                                                    <div>
                                                                                        <Label className="text-xs text-muted-foreground">Akar Masalah</Label>
                                                                                        <p className="text-sm font-medium">{item.tindakLanjut.akarMasalah}</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs text-muted-foreground">Rencana Perbaikan</Label>
                                                                                        <p className="text-sm font-medium">{item.tindakLanjut.rencanaPerbaikan}</p>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-4">
                                                                                        <div>
                                                                                            <Label className="text-xs text-muted-foreground">PIC</Label>
                                                                                            <p className="text-sm font-medium">{item.tindakLanjut.penanggungJawab}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <Label className="text-xs text-muted-foreground">Target Semester</Label>
                                                                                            <p className="text-sm font-medium">{item.tindakLanjut.targetSemester}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="space-y-4 py-4">
                                                                                <div className="space-y-2">
                                                                                    <Label>Akar Masalah</Label>
                                                                                    <Textarea
                                                                                        placeholder="Jelaskan penyebab tidak tercapainya CPL..."
                                                                                        value={tindakLanjutForm.akarMasalah}
                                                                                        onChange={e => setTindakLanjutForm({ ...tindakLanjutForm, akarMasalah: e.target.value })}
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label>Rencana Perbaikan Pembelajaran</Label>
                                                                                    <Textarea
                                                                                        placeholder="Deskripsikan rencana perbaikan..."
                                                                                        value={tindakLanjutForm.rencanaPerbaikan}
                                                                                        onChange={e => setTindakLanjutForm({ ...tindakLanjutForm, rencanaPerbaikan: e.target.value })}
                                                                                    />
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div className="space-y-2">
                                                                                        <Label>Penanggung Jawab (PIC)</Label>
                                                                                        <Input
                                                                                            placeholder="Nama Dosen / Tim"
                                                                                            value={tindakLanjutForm.penanggungJawab}
                                                                                            onChange={e => setTindakLanjutForm({ ...tindakLanjutForm, penanggungJawab: e.target.value })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label>Target Semester</Label>
                                                                                        <Input
                                                                                            placeholder="Contoh: Ganjil 2024/2025"
                                                                                            value={tindakLanjutForm.targetSemester}
                                                                                            onChange={e => setTindakLanjutForm({ ...tindakLanjutForm, targetSemester: e.target.value })}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <DialogFooter>
                                                                            {!item.tindakLanjut && (
                                                                                <Button onClick={handleSaveTindakLanjut} disabled={loading}>
                                                                                    Simpan Tindak Lanjut
                                                                                </Button>
                                                                            )}
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                    {expandedRows.has(item.cplId) && (
                                                        <TableRow className="bg-muted/30">
                                                            <TableCell colSpan={8} className="p-4">
                                                                <div className="pl-12">
                                                                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                                                                        <TrendingUp className="w-4 h-4 mr-2" />
                                                                        Kontribusi Mata Kuliah
                                                                    </h4>
                                                                    <div className="border rounded-md bg-background">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow>
                                                                                    <TableHead>Kode MK</TableHead>
                                                                                    <TableHead>Nama Mata Kuliah</TableHead>
                                                                                    <TableHead className="text-right">Rata-rata Nilai</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {item.courseBreakdown.length > 0 ? (
                                                                                    item.courseBreakdown.map((mk, idx) => (
                                                                                        <TableRow key={idx}>
                                                                                            <TableCell>{mk.kodeMk}</TableCell>
                                                                                            <TableCell>{mk.namaMk}</TableCell>
                                                                                            <TableCell className="text-right font-medium">
                                                                                                {mk.averageScore}
                                                                                            </TableCell>
                                                                                        </TableRow>
                                                                                    ))
                                                                                ) : (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                                                            Belum ada data nilai mata kuliah
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardPage>
    );
};

export default EvaluasiCPLPage;
