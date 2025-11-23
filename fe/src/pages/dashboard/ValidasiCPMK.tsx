import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CPMK {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    statusValidasi: 'draft' | 'validated' | 'active';
    validatedAt: string | null;
    createdAt: string;
    mataKuliah: {
        id: string;
        kodeMk: string;
        namaMk: string;
        semester: number;
    };
    creator?: {
        profile?: {
            namaLengkap: string;
        };
    };
}

const ValidasiCPMKPage = () => {
    const { role } = useUserRole();
    const canValidate = role === "admin" || role === "kaprodi";

    const [cpmkList, setCpmkList] = useState<CPMK[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchCPMK();
    }, []);

    const fetchCPMK = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/cpmk`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            setCpmkList(Array.isArray(data.data) ? data.data : []);
        } catch (error: any) {
            console.error("Error fetching CPMK:", error);
            toast.error("Gagal memuat data CPMK");
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (cpmkId: string, newStatus: 'draft' | 'validated' | 'active') => {
        try {
            setUpdating(cpmkId);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/cpmk/${cpmkId}/validate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ statusValidasi: newStatus })
            });

            if (!response.ok) throw new Error('Gagal mengubah status validasi');

            toast.success(`Status berhasil diubah menjadi ${newStatus}`);
            await fetchCPMK();
        } catch (error: any) {
            console.error('Error updating validation:', error);
            toast.error(error.message || 'Gagal mengubah status validasi');
        } finally {
            setUpdating(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'validated':
                return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Tervalidasi</Badge>;
            case 'active':
                return <Badge className="bg-blue-500"><CheckCircle2 className="w-3 h-3 mr-1" />Aktif</Badge>;
            case 'draft':
            default:
                return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
        }
    };

    const filteredCPMK = cpmkList.filter((cpmk) => {
        if (filterStatus === "all") return true;
        return cpmk.statusValidasi === filterStatus;
    });

    if (loading) {
        return (
            <DashboardPage title="Validasi CPMK">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title="Validasi CPMK"
            description="Kelola validasi CPMK dari dosen"
            actions={
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="validated">Tervalidasi</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                    </SelectContent>
                </Select>
            }
        >
            <Card>
                <CardHeader>
                    <CardTitle>Daftar CPMK</CardTitle>
                    <CardDescription>
                        Klik tombol aksi untuk mengubah status validasi CPMK
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredCPMK.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Tidak ada CPMK dengan filter yang dipilih
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode CPMK</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Mata Kuliah</TableHead>
                                    <TableHead>Pembuat</TableHead>
                                    <TableHead>Status</TableHead>
                                    {canValidate && <TableHead>Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCPMK.map((cpmk) => (
                                    <TableRow key={cpmk.id}>
                                        <TableCell className="font-medium">{cpmk.kodeCpmk}</TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {cpmk.deskripsi || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {cpmk.mataKuliah.kodeMk} - {cpmk.mataKuliah.namaMk}
                                            <div className="text-xs text-muted-foreground">
                                                Semester {cpmk.mataKuliah.semester}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {cpmk.creator?.profile?.namaLengkap || '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(cpmk.statusValidasi)}</TableCell>
                                        {canValidate && (
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {cpmk.statusValidasi !== 'validated' && (
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            onClick={() => handleValidate(cpmk.id, 'validated')}
                                                            disabled={updating === cpmk.id}
                                                        >
                                                            {updating === cpmk.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                    Validasi
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    {cpmk.statusValidasi === 'validated' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleValidate(cpmk.id, 'active')}
                                                            disabled={updating === cpmk.id}
                                                        >
                                                            Aktifkan
                                                        </Button>
                                                    )}
                                                    {cpmk.statusValidasi !== 'draft' && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleValidate(cpmk.id, 'draft')}
                                                            disabled={updating === cpmk.id}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-1" />
                                                            Batalkan
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </DashboardPage>
    );
};

export default ValidasiCPMKPage;
