import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePermission } from "@/contexts/PermissionContext";
import { useRekapKuesioner } from "@/hooks/useRekapKuesioner";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";
import { useEffect } from "react";

export default function RekapKuesionerPage() {
    const { can } = usePermission();
    const {
        role,
        stats,
        loading,
        tahunAjaran,
        semester,
        selectedFakultas,
        selectedProdi,
        fakultasList,
        prodiList,
        setTahunAjaran,
        setSemester,
        setSelectedFakultas,
        setSelectedProdi,
        resetFilters,
        isFiltered
    } = useRekapKuesioner();

    const { tahunAjaranList, activeTahunAjaran } = useTahunAjaran();

    // Set default active Tahun Ajaran
    useEffect(() => {
        if (activeTahunAjaran && !tahunAjaran) {
            setTahunAjaran(activeTahunAjaran.id);
        }
    }, [activeTahunAjaran]);

    if (!can('view', 'rekap_kuesioner')) {
        return (
            <DashboardPage title="Rekap Kuesioner CPL" description="Monitoring Penilaian Tidak Langsung">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p>Anda tidak memiliki akses ke halaman ini.</p>
                    </CardContent>
                </Card>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage title="Rekap Kuesioner CPL" description="Hasil Penilaian Tidak Langsung (Self-Assessment Mahasiswa)">
            <div className="space-y-6">
                {/* Filters */}
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={isFiltered ? "default" : "outline"}
                                className="gap-2"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-80 space-y-4" onClick={(e) => e.stopPropagation()}>
                            {/* Admin Filters */}
                            {(role === 'admin' || can('view_all', 'rekap_kuesioner')) && (
                                <>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Fakultas</Label>
                                        <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
                                            <SelectTrigger className="w-full h-8 text-xs">
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

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Program Studi</Label>
                                        <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Semua Prodi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Prodi</SelectItem>
                                                {prodiList.map((prodi) => (
                                                    <SelectItem key={prodi.id} value={prodi.id}>
                                                        {prodi.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Common Filters */}
                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Tahun Ajaran</Label>
                                <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Pilih Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tahunAjaranList.map(ta => (
                                            <SelectItem key={ta.id} value={ta.id}>{ta.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs font-medium">Semester</Label>
                                <Select value={semester} onValueChange={setSemester}>
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Semua Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Semester</SelectItem>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                            <SelectItem key={sem} value={sem.toString()}>
                                                Semester {sem}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Quick Access Reset */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                        disabled={!isFiltered}
                    >
                        Reset Filter
                    </Button>
                </div>

                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grafik Rata-Rata Penilaian per CPL</CardTitle>
                        <CardDescription>
                            {(role === 'admin' || can('view_all', 'rekap_kuesioner'))
                                ? (selectedProdi !== 'all'
                                    ? `Prodi: ${prodiList.find(p => p.id === selectedProdi)?.nama || 'Unknown'}`
                                    : 'Semua Program Studi')
                                : 'Program Studi Anda'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">Memuat grafik...</div>
                        ) : stats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorCplRekap" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                                    <XAxis
                                        dataKey="kodeCpl"
                                        className="text-xs font-medium"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        className="text-xs font-medium"
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar
                                        dataKey="rataRata"
                                        fill="url(#colorCplRekap)"
                                        name="Rata-Rata Nilai"
                                        radius={[6, 6, 0, 0]}
                                        animationDuration={2000}
                                        animationEasing="ease-out"
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Belum ada data kuesioner untuk periode ini.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Hasil Penilaian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode CPL</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-center">Jumlah Responden</TableHead>
                                    <TableHead className="text-right">Rata-Rata Nilai</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Memuat data...</TableCell>
                                    </TableRow>
                                ) : stats.length > 0 ? (
                                    stats.map((item) => (
                                        <TableRow key={item.cplId}>
                                            <TableCell className="font-medium">{item.kodeCpl}</TableCell>
                                            <TableCell className="min-w-[300px]">
                                                {item.deskripsi}
                                            </TableCell>
                                            <TableCell className="text-center">{item.jumlahResponden}</TableCell>
                                            <TableCell className="text-right font-bold">
                                                {Number(item.rataRata).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Tidak ada data.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
}
