
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { DashboardPage } from "@/components/DashboardLayout";
import { Save, Loader2, Check, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { api, fetchFakultasList, fetchProdiList, fetchAllUsers } from "@/lib/api-client";

interface Prodi {
    id: string;
    nama: string;
    fakultasId: string;
}

interface Fakultas {
    id: string;
    nama: string;
}

interface User {
    id: string;
    email: string;
    role: { role: string };
    profile?: {
        namaLengkap: string;
        nidn: string;
        prodiId?: string;
        prodi?: {
            fakultasId: string;
            nama: string;
        };
    };
}

interface KaprodiData {
    id: string;
    programStudi: string;
    prodiId: string | null;
    namaKaprodi: string;
    nidnKaprodi: string;
    prodi?: Prodi;
}

const KaprodiDataSettings = () => {
    const [kaprodiList, setKaprodiList] = useState<KaprodiData[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [userList, setUserList] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        programStudi: "",
        prodiId: "",
        namaKaprodi: "",
        nidnKaprodi: "",
        fakultasId: ""
    });
    const [saving, setSaving] = useState(false);
    const [openUserCombobox, setOpenUserCombobox] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (formData.fakultasId) {
            fetchProdiByFakultas(formData.fakultasId);
        } else {
            setProdiList([]);
        }
    }, [formData.fakultasId]);

    const fetchInitialData = async () => {
        try {
            const [fakultasRes, kaprodiRes] = await Promise.all([
                fetchFakultasList(),
                api.get('/kaprodi-data')
            ]);

            setFakultasList(fakultasRes.data || []);
            setKaprodiList(kaprodiRes.data || []);

            // Fetch only users with role 'kaprodi'
            const kaprodiUserRes = await fetchAllUsers({ role: 'kaprodi', limit: 100 });
            setUserList(kaprodiUserRes.data || []);

        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data awal");
        } finally {
            setLoading(false);
        }
    };

    const fetchProdiByFakultas = async (fakultasId: string) => {
        try {
            const result = await fetchProdiList(fakultasId);
            setProdiList(result.data || []);
        } catch (error) {
            console.error("Gagal memuat data prodi");
        }
    };

    const fetchKaprodiData = async () => {
        try {
            const result = await api.get('/kaprodi-data');
            setKaprodiList(result.data || []);
        } catch (error) {
            toast.error("Gagal memuat data kaprodi");
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
            await api.post('/kaprodi-data', {
                programStudi: formData.programStudi,
                prodiId: formData.prodiId,
                namaKaprodi: formData.namaKaprodi,
                nidnKaprodi: formData.nidnKaprodi
            });

            toast.success("Data kaprodi berhasil disimpan");
            setFormData({
                programStudi: "",
                prodiId: "",
                namaKaprodi: "",
                nidnKaprodi: "",
                fakultasId: ""
            });
            fetchKaprodiData();
        } catch (error) {
            toast.error("Gagal menyimpan data kaprodi");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item: KaprodiData) => {
        setFormData({
            programStudi: item.programStudi,
            prodiId: item.prodiId || "",
            namaKaprodi: item.namaKaprodi,
            nidnKaprodi: item.nidnKaprodi,
            fakultasId: item.prodi?.fakultasId || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await api.delete(`/kaprodi-data/${deleteId}`);
            toast.success("Data kaprodi berhasil dihapus");
            fetchKaprodiData();
        } catch (error) {
            toast.error("Gagal menghapus data kaprodi");
        } finally {
            setDeleteId(null);
        }
    };

    const filteredUsers = userList.filter(user => {
        // Strict filter: Must have prodiId selected
        if (!formData.prodiId) return false;

        // Filter by Prodi
        if (user.profile?.prodiId !== formData.prodiId) return false;

        // Filter by search query
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const name = user.profile?.namaLengkap?.toLowerCase() || "";
            const email = user.email.toLowerCase();
            const nidn = user.profile?.nidn?.toLowerCase() || "";
            const nip = user.profile?.nip?.toLowerCase() || "";
            return name.includes(query) || email.includes(query) || nidn.includes(query) || nip.includes(query);
        }

        return true;
    });

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Fakultas</Label>
                                    <Select
                                        value={formData.fakultasId}
                                        onValueChange={(val) => setFormData({ ...formData, fakultasId: val, prodiId: "", programStudi: "" })}
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

                                <div>
                                    <Label>Program Studi</Label>
                                    <Select
                                        value={formData.prodiId}
                                        onValueChange={(val) => {
                                            const selectedProdi = prodiList.find(p => p.id === val);
                                            setFormData({
                                                ...formData,
                                                prodiId: val,
                                                programStudi: selectedProdi ? selectedProdi.nama : ""
                                            });
                                        }}
                                        disabled={!formData.fakultasId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Program Studi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prodiList.map(prodi => (
                                                <SelectItem key={prodi.id} value={prodi.id}>{prodi.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nama Kaprodi</Label>
                                    <Popover open={openUserCombobox} onOpenChange={setOpenUserCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openUserCombobox}
                                                className="w-full justify-between"
                                                disabled={!formData.prodiId}
                                            >
                                                {formData.namaKaprodi || (formData.prodiId ? "Pilih Kaprodi..." : "Pilih Prodi Terlebih Dahulu")}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                            <Command shouldFilter={false}>
                                                <CommandInput
                                                    placeholder="Cari nama atau NIDN/NIP..."
                                                    value={searchQuery}
                                                    onValueChange={setSearchQuery}
                                                    className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none focus:border-none ring-0 outline-none shadow-none !outline-none !border-none !ring-0 !shadow-none"
                                                />
                                                <CommandList>
                                                    <CommandEmpty>Kaprodi tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filteredUsers.map((user) => (
                                                            <CommandItem
                                                                key={user.id}
                                                                value={user.id}
                                                                onSelect={() => {
                                                                    const selectedNidn = user.profile?.nidn || user.profile?.nip || "";
                                                                    console.log("Selected user:", user);
                                                                    console.log("NIDN/NIP to set:", selectedNidn);

                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        namaKaprodi: user.profile?.namaLengkap || "",
                                                                        nidnKaprodi: selectedNidn
                                                                    }));
                                                                    setOpenUserCombobox(false);

                                                                    if (!selectedNidn) {
                                                                        toast.warning("User ini belum memiliki NIDN atau NIP");
                                                                    }
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formData.namaKaprodi === user.profile?.namaLengkap ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{user.profile?.namaLengkap}</span>
                                                                    <span className="text-xs opacity-70">
                                                                        NIDN/NIP: {user.profile?.nidn || user.profile?.nip || "-"} - {user.profile?.prodi?.nama || user.role.role}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label>NIDN/NIP Kaprodi</Label>
                                    <Input
                                        value={formData.nidnKaprodi}
                                        onChange={(e) => setFormData({ ...formData, nidnKaprodi: e.target.value })}
                                        placeholder="0123456789"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
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
                                        <TableHead className="w-[100px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kaprodiList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.prodi?.nama || item.programStudi}</TableCell>
                                            <TableCell>{item.namaKaprodi}</TableCell>
                                            <TableCell>{item.nidnKaprodi || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Data kaprodi ini akan dihapus permanen.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div >
        </DashboardPage >
    );
};

export default KaprodiDataSettings;
