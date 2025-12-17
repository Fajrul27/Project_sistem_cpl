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
import { useAngkatan } from "@/hooks/useAngkatan";
import { useCPL } from "@/hooks/useCPL";
import { CheckCircle, XCircle, AlertCircle, Save } from "lucide-react";

const EvaluasiCPLPage = () => {
    const {
        loading, targets, evaluation, summary,
        fetchTargets, saveTargets, fetchEvaluation, saveTindakLanjut
    } = useEvaluasiCPL();

    const { prodiList } = useProdi();
    const { angkatanList } = useAngkatan();
    const { cplList, setProdiFilter } = useCPL();

    const [activeTab, setActiveTab] = useState("evaluation");
    const [filters, setFilters] = useState({
        prodiId: "",
        angkatan: "",
        tahunAjaran: "2023/2024", // Default or dynamic
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

    useEffect(() => {
        if (filters.prodiId) {
            setProdiFilter(filters.prodiId);
        }
    }, [filters.prodiId]);

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

    return (
        <DashboardPage title="Evaluasi CPL & Tindak Lanjut OBE">
            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Filter Evaluasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Program Studi</Label>
                                <Select
                                    value={filters.prodiId}
                                    onValueChange={(v) => setFilters({ ...filters, prodiId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Prodi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prodiList.filter(p => p.id && p.id !== "").map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Angkatan</Label>
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
                            <div className="space-y-2">
                                <Label>Tahun Ajaran</Label>
                                <Select
                                    value={filters.tahunAjaran}
                                    onValueChange={(v) => setFilters({ ...filters, tahunAjaran: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih TA" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2023/2024">2023/2024</SelectItem>
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester (Opsional)</Label>
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
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="evaluation">Evaluasi & Tindak Lanjut</TabsTrigger>
                        <TabsTrigger value="target">Target CPL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="target">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Target Capaian Pembelajaran Lulusan</CardTitle>
                                        <CardDescription>Tentukan target minimal pencapaian untuk setiap CPL</CardDescription>
                                    </div>
                                    <Button onClick={handleSaveTargets} disabled={!canLoad || loading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Target
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
                                                            onChange={(e) => setTargetInputs({
                                                                ...targetInputs,
                                                                [cpl.id]: parseFloat(e.target.value)
                                                            })}
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
                                                <TableHead className="w-[80px]">Kode</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead className="text-center">Target</TableHead>
                                                <TableHead className="text-center">Aktual</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {evaluation.map(item => (
                                                <TableRow key={item.cplId}>
                                                    <TableCell className="font-medium">{item.kodeCpl}</TableCell>
                                                    <TableCell className="max-w-md truncate" title={item.deskripsi}>{item.deskripsi}</TableCell>
                                                    <TableCell className="text-center">{item.target}</TableCell>
                                                    <TableCell className="text-center font-bold">{item.actual}</TableCell>
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
                                                    <TableCell className="text-right">
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
