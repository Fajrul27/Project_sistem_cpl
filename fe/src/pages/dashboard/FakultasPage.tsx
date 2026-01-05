import { useState, useEffect } from 'react';
import { DashboardPage } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Building2, School } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    fetchFakultasList, createFakultas, updateFakultas, deleteFakultas,
    fetchProdiList, createProdi, updateProdi, deleteProdi
} from '@/lib/api';

export default function FakultasPage() {
    const [activeTab, setActiveTab] = useState('fakultas');

    // Fakultas State
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [fakultasLoading, setFakultasLoading] = useState(true);
    const [fakultasSearch, setFakultasSearch] = useState('');
    const [isFakultasDialogOpen, setIsFakultasDialogOpen] = useState(false);
    const [editingFakultas, setEditingFakultas] = useState<any>(null);
    const [fakultasForm, setFakultasForm] = useState({ kode: '', nama: '' });

    // Prodi State
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [prodiLoading, setProdiLoading] = useState(true);
    const [prodiSearch, setProdiSearch] = useState('');
    const [isProdiDialogOpen, setIsProdiDialogOpen] = useState(false);
    const [editingProdi, setEditingProdi] = useState<any>(null);
    const [prodiForm, setProdiForm] = useState({ kode: '', nama: '', jenjang: '', fakultasId: '' });

    // Load Data
    useEffect(() => {
        loadFakultas();
        loadProdi();
    }, []);

    const loadFakultas = async () => {
        setFakultasLoading(true);
        try {
            const res = await fetchFakultasList();
            setFakultasList(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data Fakultas');
        } finally {
            setFakultasLoading(false);
        }
    };

    const loadProdi = async () => {
        setProdiLoading(true);
        try {
            const res = await fetchProdiList();
            setProdiList(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data Prodi');
        } finally {
            setProdiLoading(false);
        }
    };

    // Fakultas Operations
    const handleSaveFakultas = async () => {
        if (!fakultasForm.kode || !fakultasForm.nama) {
            toast.error('Mohon lengkapi data');
            return;
        }

        try {
            if (editingFakultas) {
                await updateFakultas(editingFakultas.id, fakultasForm);
                toast.success('Fakultas berhasil diupdate');
            } else {
                await createFakultas(fakultasForm);
                toast.success('Fakultas berhasil dibuat');
            }
            setIsFakultasDialogOpen(false);
            setEditingFakultas(null);
            setFakultasForm({ kode: '', nama: '' });
            loadFakultas();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan fakultas');
        }
    };

    const handleDeleteFakultas = async (id: string) => {
        try {
            await deleteFakultas(id);
            toast.success('Fakultas berhasil dihapus');
            loadFakultas();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus fakultas');
        }
    };

    const openCreateFakultas = () => {
        setEditingFakultas(null);
        setFakultasForm({ kode: '', nama: '' });
        setIsFakultasDialogOpen(true);
    };

    const openEditFakultas = (fakultas: any) => {
        setEditingFakultas(fakultas);
        setFakultasForm({ kode: fakultas.kode, nama: fakultas.nama });
        setIsFakultasDialogOpen(true);
    };

    // Prodi Operations
    const handleSaveProdi = async () => {
        if (!prodiForm.kode || !prodiForm.nama || !prodiForm.jenjang || !prodiForm.fakultasId) {
            toast.error('Mohon lengkapi data');
            return;
        }

        try {
            if (editingProdi) {
                await updateProdi(editingProdi.id, prodiForm);
                toast.success('Prodi berhasil diupdate');
            } else {
                await createProdi(prodiForm);
                toast.success('Prodi berhasil dibuat');
            }
            setIsProdiDialogOpen(false);
            setEditingProdi(null);
            setProdiForm({ kode: '', nama: '', jenjang: '', fakultasId: '' });
            loadProdi();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan prodi');
        }
    };

    const handleDeleteProdi = async (id: string) => {
        try {
            await deleteProdi(id);
            toast.success('Prodi berhasil dihapus');
            loadProdi();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus prodi');
        }
    };

    const openCreateProdi = () => {
        setEditingProdi(null);
        setProdiForm({ kode: '', nama: '', jenjang: '', fakultasId: '' });
        setIsProdiDialogOpen(true);
    };

    const openEditProdi = (prodi: any) => {
        setEditingProdi(prodi);
        setProdiForm({
            kode: prodi.kode || '',
            nama: prodi.nama,
            jenjang: prodi.jenjang || 'S1',
            fakultasId: prodi.fakultasId
        });
        setIsProdiDialogOpen(true);
    };

    // Filters
    const filteredFakultas = fakultasList.filter(f =>
        f.nama.toLowerCase().includes(fakultasSearch.toLowerCase()) ||
        f.kode.toLowerCase().includes(fakultasSearch.toLowerCase())
    );

    const filteredProdi = prodiList.filter(p =>
        p.nama.toLowerCase().includes(prodiSearch.toLowerCase()) ||
        (p.kode && p.kode.toLowerCase().includes(prodiSearch.toLowerCase()))
    );

    return (
        <DashboardPage title="Data Fakultas & Prodi" description="Kelola data referensi fakultas dan program studi">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="fakultas" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Data Fakultas
                    </TabsTrigger>
                    <TabsTrigger value="prodi" className="flex items-center gap-2">
                        <School className="w-4 h-4" />
                        Data Prodi
                    </TabsTrigger>
                </TabsList>

                {/* FAKULTAS TAB */}
                <TabsContent value="fakultas">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Data Fakultas</CardTitle>
                                <CardDescription>Daftar fakultas yang terdaftar dalam sistem</CardDescription>
                            </div>
                            <Button onClick={openCreateFakultas}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Fakultas
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari fakultas..."
                                        className="pl-8 max-w-sm"
                                        value={fakultasSearch}
                                        onChange={(e) => setFakultasSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Kode</TableHead>
                                            <TableHead>Nama Fakultas</TableHead>
                                            <TableHead>Jumlah Prodi</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fakultasLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    Memuat data...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredFakultas.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                    Tidak ada data fakultas
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredFakultas.map((fakultas) => (
                                                <TableRow key={fakultas.id}>
                                                    <TableCell className="font-mono font-medium">{fakultas.kode}</TableCell>
                                                    <TableCell>{fakultas.nama}</TableCell>
                                                    <TableCell>{fakultas.prodi?.length || 0}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditFakultas(fakultas)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Hapus Fakultas?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Apakah Anda yakin ingin menghapus fakultas <strong>{fakultas.nama}</strong>?
                                                                            Tindakan ini tidak dapat dibatalkan.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteFakultas(fakultas.id)}>
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRODI TAB */}
                <TabsContent value="prodi">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Data Program Studi</CardTitle>
                                <CardDescription>Daftar program studi yang terdaftar</CardDescription>
                            </div>
                            <Button onClick={openCreateProdi}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Prodi
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari prodi..."
                                        className="pl-8 max-w-sm"
                                        value={prodiSearch}
                                        onChange={(e) => setProdiSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Kode</TableHead>
                                            <TableHead>Nama Prodi</TableHead>
                                            <TableHead>Jenjang</TableHead>
                                            <TableHead>Fakultas</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {prodiLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                    Memuat data...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredProdi.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                    Tidak ada data prodi
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProdi.map((prodi) => (
                                                <TableRow key={prodi.id}>
                                                    <TableCell className="font-mono font-medium">{prodi.kode}</TableCell>
                                                    <TableCell>{prodi.nama}</TableCell>
                                                    <TableCell>{prodi.jenjang}</TableCell>
                                                    <TableCell>{prodi.fakultas?.nama || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditProdi(prodi)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Hapus Prodi?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Apakah Anda yakin ingin menghapus prodi <strong>{prodi.nama}</strong>?
                                                                            Tindakan ini tidak dapat dibatalkan.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteProdi(prodi.id)}>
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* DIALOG FAKULTAS */}
            <Dialog open={isFakultasDialogOpen} onOpenChange={setIsFakultasDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFakultas ? 'Edit Fakultas' : 'Tambah Fakultas'}</DialogTitle>
                        <DialogDescription>
                            Isi detail fakultas di bawah ini. Kode harus unik.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fk-kode">Kode Fakultas</Label>
                            <Input
                                id="fk-kode"
                                value={fakultasForm.kode}
                                onChange={(e) => setFakultasForm({ ...fakultasForm, kode: e.target.value })}
                                placeholder="Contoh: FT, FE"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="fk-nama">Nama Fakultas</Label>
                            <Input
                                id="fk-nama"
                                value={fakultasForm.nama}
                                onChange={(e) => setFakultasForm({ ...fakultasForm, nama: e.target.value })}
                                placeholder="Contoh: Fakultas Teknik"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFakultasDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveFakultas}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DIALOG PRODI */}
            <Dialog open={isProdiDialogOpen} onOpenChange={setIsProdiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProdi ? 'Edit Prodi' : 'Tambah Prodi'}</DialogTitle>
                        <DialogDescription>
                            Isi detail prodi di bawah ini. Pastikan memilih fakultas yang sesuai.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pr-kode">Kode Prodi</Label>
                                <Input
                                    id="pr-kode"
                                    value={prodiForm.kode}
                                    onChange={(e) => setProdiForm({ ...prodiForm, kode: e.target.value })}
                                    placeholder="Contoh: TI, SI"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pr-jenjang">Jenjang</Label>
                                <Select
                                    value={prodiForm.jenjang}
                                    onValueChange={(val) => setProdiForm({ ...prodiForm, jenjang: val })}
                                >
                                    <SelectTrigger id="pr-jenjang">
                                        <SelectValue placeholder="Pilih..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="D3">D3</SelectItem>
                                        <SelectItem value="D4">D4</SelectItem>
                                        <SelectItem value="S1">S1</SelectItem>
                                        <SelectItem value="S2">S2</SelectItem>
                                        <SelectItem value="S3">S3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pr-nama">Nama Prodi</Label>
                            <Input
                                id="pr-nama"
                                value={prodiForm.nama}
                                onChange={(e) => setProdiForm({ ...prodiForm, nama: e.target.value })}
                                placeholder="Contoh: Teknik Informatika"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pr-fakultas">Fakultas</Label>
                            <Select
                                value={prodiForm.fakultasId}
                                onValueChange={(val) => setProdiForm({ ...prodiForm, fakultasId: val })}
                            >
                                <SelectTrigger id="pr-fakultas">
                                    <SelectValue placeholder="Pilih Fakultas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fakultasList.map((f) => (
                                        <SelectItem key={f.id} value={f.id}>
                                            {f.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsProdiDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveProdi}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardPage>
    );
}
