import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { Save, Check, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { useKaprodiSettings } from "@/hooks/useKaprodiSettings";

const KaprodiDataSettings = () => {
    const {
        kaprodiList,
        prodiList,
        fakultasList,
        loading,
        saving,
        formData,
        setFormData,
        filteredUsers,
        searchQuery,
        setSearchQuery,
        saveKaprodi,
        deleteKaprodi,
        prepareEdit
    } = useKaprodiSettings();

    const [openUserCombobox, setOpenUserCombobox] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        saveKaprodi();
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteKaprodi(deleteId);
        setDeleteId(null);
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <RequiredLabel required>Fakultas</RequiredLabel>
                                    <Select
                                        value={formData.fakultasId}
                                        onValueChange={(val) => setFormData({ ...formData, fakultasId: val, prodiId: "", programStudi: "" })}
                                        required
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
                                    <RequiredLabel required>Program Studi</RequiredLabel>
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
                                        required
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
                                    <RequiredLabel required>Nama Kaprodi</RequiredLabel>
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
                                    <RequiredLabel required>NIDN/NIP Kaprodi</RequiredLabel>
                                    <Input
                                        value={formData.nidnKaprodi}
                                        onChange={(e) => setFormData({ ...formData, nidnKaprodi: e.target.value })}
                                        placeholder="0123456789"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
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
                            <LoadingScreen fullScreen={false} message="Memuat data kaprodi..." />
                        ) : kaprodiList.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                Belum ada data kaprodi
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
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
                                                        <Button variant="ghost" size="icon" onClick={() => prepareEdit(item)}>
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
                            </div>
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
