import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KuesionerStat {
    cplId: string;
    kodeCpl: string;
    deskripsi: string;
    rataRata: number;
    jumlahResponden: number;
}

export default function RekapKuesionerPage() {
    const { role, profile } = useUserRole();
    const [stats, setStats] = useState<KuesionerStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [tahunAjaran, setTahunAjaran] = useState("2024/2025 Ganjil"); // Default, should be dynamic

    useEffect(() => {
        if (role === "kaprodi" || role === "admin") {
            fetchStats();
        }
    }, [role, tahunAjaran]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get("/kuesioner/stats", {
                params: {
                    tahunAjaran,
                    prodiId: profile?.prodiId
                }
            });
            setStats(res.data || []);
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Gagal memuat statistik kuesioner");
        } finally {
            setLoading(false);
        }
    };

    if (role !== "kaprodi" && role !== "admin") {
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
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-[200px]">
                                <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024/2025 Ganjil">2024/2025 Ganjil</SelectItem>
                                        <SelectItem value="2023/2024 Genap">2023/2024 Genap</SelectItem>
                                        <SelectItem value="2023/2024 Ganjil">2023/2024 Ganjil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grafik Rata-Rata Penilaian per CPL</CardTitle>
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
                                            <TableCell className="max-w-[400px] truncate" title={item.deskripsi}>
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
