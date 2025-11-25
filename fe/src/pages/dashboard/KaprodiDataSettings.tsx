import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { DashboardPage } from "@/components/DashboardLayout";
import { Save, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const PROGRAM_STUDI_LIST = [
    "HUKUM",
    "EKONOMI SYARIAH",
    "PENDIDIKAN AGAMA ISLAM",
    "PENDIDIKAN BAHASA INGGRIS",
    "TEKNIK INFORMATIKA"
];

const KaprodiDataSettings = () => {
    const [kaprodiList, setKaprodiList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        programStudi: "",
        namaKaprodi: "",
        nidnKaprodi: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchKaprodiData();
    }, []);

    const fetchKaprodiData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/kaprodi-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                setKaprodiList(result.data || []);
            }
        } catch (error) {
            toast.error("Gagal memuat data kaprodi");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.programStudi || !formData.namaKaprodi) {
            toast.error("Lengkapi data program studi dan nama kaprodi");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/kaprodi-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error();

            toast.success("Data kaprodi berhasil disimpan");
            setFormData({ programStudi: "", namaKaprodi: "", nidnKaprodi: "" });
            fetchKaprodiData();
        } catch (error) {
            toast.error("Gagal menyimpan data kaprodi");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardPage
            title="Data Kaprodi"
            description="Kelola data Ketua Program Studi untuk transkrip"
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tambah/Update Data Kaprodi</CardTitle>
                        <CardDescription>Setiap program studi memiliki kaprodi yang berbeda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Program Studi</Label>
                                <Select
                                    value={formData.programStudi}
                                    onValueChange={(val) => setFormData({ ...formData, programStudi: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Program Studi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROGRAM_STUDI_LIST.map(prodi => (
                                            <SelectItem key={prodi} value={prodi}>{prodi}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Nama Kaprodi (dengan gelar)</Label>
                                <Input
                                    value={formData.namaKaprodi}
                                    onChange={(e) => setFormData({ ...formData, namaKaprodi: e.target.value })}
                                    placeholder="Dr. Nama Lengkap, M.Pd."
                                />
                            </div>

                            <div>
                                <Label>NIDN Kaprodi</Label>
                                <Input
                                    value={formData.nidnKaprodi}
                                    onChange={(e) => setFormData({ ...formData, nidnKaprodi: e.target.value })}
                                    placeholder="0123456789"
                                />
                            </div>

                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Meny impan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan Data Kaprodi
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Data Kaprodi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : kaprodiList.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Belum ada data kaprodi
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Program Studi</TableHead>
                                        <TableHead>Nama Kaprodi</TableHead>
                                        <TableHead>NIDN</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kaprodiList.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.programStudi}</TableCell>
                                            <TableCell>{item.namaKaprodi}</TableCell>
                                            <TableCell>{item.nidnKaprodi || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
};

export default KaprodiDataSettings;
