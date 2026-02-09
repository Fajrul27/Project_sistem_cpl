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
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    fetchFakultasList, createFakultas, updateFakultas, deleteFakultas,
    fetchProdiList, createProdi, updateProdi, deleteProdi,
    fetchJenjangList, createJenjang, updateJenjang, deleteJenjang
} from '@/lib/api';
import { CollapsibleGuide } from '@/components/common/CollapsibleGuide';
import { usePermission } from '@/contexts/PermissionContext';


export default function FakultasPage() {
    const { can } = usePermission();
    const canManage = can('access', 'admin'); // Only Admin can manage units

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

    // Jenjang State
    const [jenjangList, setJenjangList] = useState<any[]>([]);
    const [jenjangLoading, setJenjangLoading] = useState(true);
    const [jenjangSearch, setJenjangSearch] = useState('');
    const [isJenjangDialogOpen, setIsJenjangDialogOpen] = useState(false);
    const [editingJenjang, setEditingJenjang] = useState<any>(null);
    const [jenjangForm, setJenjangForm] = useState({ nama: '', keterangan: '' });

    // Load Data
    useEffect(() => {
        loadFakultas();
        loadProdi();
        loadJenjang();
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

    const loadJenjang = async () => {
        setJenjangLoading(true);
        try {
            const res = await fetchJenjangList();
            setJenjangList(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data Jenjang');
        } finally {
            setJenjangLoading(false);
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
                toast.success(`Fakultas "${fakultasForm.nama}" (${fakultasForm.kode}) berhasil diupdate`);
            } else {
                await createFakultas(fakultasForm);
                toast.success(`Fakultas "${fakultasForm.nama}" (${fakultasForm.kode}) berhasil ditambahkan`);
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
                toast.success(`Prodi "${prodiForm.nama}" (${prodiForm.jenjang}) berhasil diupdate`);
            } else {
                await createProdi(prodiForm);
                toast.success(`Prodi "${prodiForm.nama}" (${prodiForm.jenjang}) berhasil ditambahkan`);
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
            jenjang: prodi.jenjang || '',
            fakultasId: prodi.fakultasId
        });
        setIsProdiDialogOpen(true);
    };

    // Jenjang Operations
    const handleSaveJenjang = async () => {
        if (!jenjangForm.nama) {
            toast.error('Mohon lengkapi data');
            return;
        }

        try {
            if (editingJenjang) {
                await updateJenjang(editingJenjang.id, jenjangForm);
                toast.success(`Jenjang "${jenjangForm.nama}" berhasil diupdate`);
            } else {
                await createJenjang(jenjangForm);
                toast.success(`Jenjang "${jenjangForm.nama}" berhasil ditambahkan`);
            }
            setIsJenjangDialogOpen(false);
            setEditingJenjang(null);
            setJenjangForm({ nama: '', keterangan: '' });
            loadJenjang();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menyimpan jenjang');
        }
    };

    const handleDeleteJenjang = async (id: string) => {
        try {
            await deleteJenjang(id);
            toast.success('Jenjang berhasil dihapus');
            loadJenjang();
        } catch (error: any) {
            toast.error(error.message || 'Gagal menghapus jenjang');
        }
    };

    const openCreateJenjang = () => {
        setEditingJenjang(null);
        setJenjangForm({ nama: '', keterangan: '' });
        setIsJenjangDialogOpen(true);
    };

    const openEditJenjang = (item: any) => {
        setEditingJenjang(item);
        setJenjangForm({ nama: item.nama, keterangan: item.keterangan || '' });
        setIsJenjangDialogOpen(true);
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

    const filteredJenjang = jenjangList.filter(j =>
        j.nama.toLowerCase().includes(jenjangSearch.toLowerCase())
    );

    return (
        <DashboardPage title="Data Fakultas & Prodi" description="Kelola data referensi fakultas dan program studi">
            <div className="mb-6">
                {canManage && (
                    <CollapsibleGuide title="Panduan Struktur Organisasi">
                        <div className="space-y-3">
                            <p>Halaman ini digunakan untuk mengelola hirarki organisasi pendidikan dan referensi jenjang yang akan digunakan di seluruh sistem.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Data Jenjang:</strong> Definisikan tingkatan pendidikan (S1, D3, dsb) terlebih dahulu sebelum membuat Prodi.</li>
                                <li><strong>Data Fakultas:</strong> Induk organisasi tertinggi yang akan membawahi beberapa Program Studi.</li>
                                <li><strong>Data Prodi:</strong> Unit pelaksana akademik yang akan terikat pada satu Fakultas dan satu Jenjang pendidikan.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}
            </div>
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
                    <TabsTrigger value="jenjang" className="flex items-center gap-2">
                        <School className="w-4 h-4" />
                        Data Jenjang
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

                {/* JENJANG TAB */}
                <TabsContent value="jenjang">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle>Data Jenjang Pendidikan</CardTitle>
                                <CardDescription>Daftar jenjang (Strata) yang tersedia</CardDescription>
                            </div>
                            <Button onClick={openCreateJenjang}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Jenjang
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari jenjang..."
                                        className="pl-8 max-w-sm"
                                        value={jenjangSearch}
                                        onChange={(e) => setJenjangSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Jenjang</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jenjangLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                                    Memuat data...
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredJenjang.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                                    Tidak ada data jenjang
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredJenjang.map((jenjang) => (
                                                <TableRow key={jenjang.id}>
                                                    <TableCell className="font-medium">{jenjang.nama}</TableCell>
                                                    <TableCell>{jenjang.keterangan || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditJenjang(jenjang)}>
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
                                                                        <AlertDialogTitle>Hapus Jenjang?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Apakah Anda yakin ingin menghapus jenjang <strong>{jenjang.nama}</strong>?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDeleteJenjang(jenjang.id)}>
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
                            <RequiredLabel htmlFor="fk-kode" required>Kode Fakultas</RequiredLabel>
                            <Input
                                id="fk-kode"
                                value={fakultasForm.kode}
                                onChange={(e) => setFakultasForm({ ...fakultasForm, kode: e.target.value })}
                                placeholder="Contoh: FT, FE"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <RequiredLabel htmlFor="fk-nama" required>Nama Fakultas</RequiredLabel>
                            <Input
                                id="fk-nama"
                                value={fakultasForm.nama}
                                onChange={(e) => setFakultasForm({ ...fakultasForm, nama: e.target.value })}
                                placeholder="Contoh: Fakultas Teknik"
                                required
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
                                <RequiredLabel htmlFor="pr-kode" required>Kode Prodi</RequiredLabel>
                                <Input
                                    id="pr-kode"
                                    value={prodiForm.kode}
                                    onChange={(e) => setProdiForm({ ...prodiForm, kode: e.target.value })}
                                    placeholder="Contoh: TI, SI"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <RequiredLabel htmlFor="pr-jenjang" required>Jenjang</RequiredLabel>
                                <Select
                                    value={prodiForm.jenjang}
                                    onValueChange={(val) => setProdiForm({ ...prodiForm, jenjang: val })}
                                    required
                                >
                                    <SelectTrigger id="pr-jenjang">
                                        <SelectValue placeholder="Pilih..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jenjangList.length > 0 ? (
                                            jenjangList.map((j) => (
                                                <SelectItem key={j.id} value={j.nama}>{j.nama}</SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">Data kosong</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <RequiredLabel htmlFor="pr-nama" required>Nama Prodi</RequiredLabel>
                            <Input
                                id="pr-nama"
                                value={prodiForm.nama}
                                onChange={(e) => setProdiForm({ ...prodiForm, nama: e.target.value })}
                                placeholder="Contoh: Teknik Informatika"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <RequiredLabel htmlFor="pr-fakultas" required>Fakultas</RequiredLabel>
                            <Select
                                value={prodiForm.fakultasId}
                                onValueChange={(val) => setProdiForm({ ...prodiForm, fakultasId: val })}
                                required
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

            {/* DIALOG JENJANG */}
            <Dialog open={isJenjangDialogOpen} onOpenChange={setIsJenjangDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingJenjang ? 'Edit Jenjang' : 'Tambah Jenjang'}</DialogTitle>
                        <DialogDescription>
                            Kelola data jenjang pendidikan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <RequiredLabel htmlFor="jj-nama" required>Nama Jenjang</RequiredLabel>
                            <Input
                                id="jj-nama"
                                value={jenjangForm.nama}
                                onChange={(e) => setJenjangForm({ ...jenjangForm, nama: e.target.value })}
                                placeholder="Contoh: S1"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="jj-ket">Keterangan</Label>
                            <Input
                                id="jj-ket"
                                value={jenjangForm.keterangan}
                                onChange={(e) => setJenjangForm({ ...jenjangForm, keterangan: e.target.value })}
                                placeholder="Contoh: Sarjana"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsJenjangDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveJenjang}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardPage>
    );
}
