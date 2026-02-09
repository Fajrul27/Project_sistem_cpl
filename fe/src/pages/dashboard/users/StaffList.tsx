
import { useEffect, useState, FormEvent, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, createUserWithRole, updateUser, deleteUser, updateProfile, fetchFakultasList, api } from "@/lib/api";
import { Search, SlidersHorizontal, UserCircle, Download, Upload, Plus } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { Pagination } from "@/components/common/Pagination";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useImpersonation } from "@/hooks/useImpersonation";
import { useUserRole } from "@/hooks/useUserRole";
import { ImportResultDialog } from "@/components/common/ImportResultDialog";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";


interface UserRow {
    id: string;
    email: string;
    role: string;
    roleDisplay?: string;
    namaLengkap?: string | null;
    nip?: string | null;
    fakultas?: string | null;
    programStudi?: string | null;
    profileId?: string | null;
}

interface NewUserForm {
    fullName: string;
    email: string;
    password: string;
    role: string;
    fakultasId: string;
    prodiId: string;
    identityNumber: string;
}

interface EditUserForm {
    fullName: string;
    email: string;
    role: string;
    fakultas: string;
    prodi: string;
    identityNumber: string;
}

type ProdiOption = { id: string; nama: string; kode: string };
type FakultasOption = { id: string; nama: string; kode: string; prodi: ProdiOption[] };

const STATIC_ROLE_OPTIONS = [
    { value: "dosen", label: "Dosen" },
    { value: "kaprodi", label: "Kaprodi" },
    { value: "admin", label: "Admin" },
];

export const StaffList = () => {
    const { can } = usePermission();
    const canManage = can('access', 'admin');
    const { loginAsUser, isImpersonating, loading: loginAsLoading } = useImpersonation();

    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleOptions, setRoleOptions] = useState(STATIC_ROLE_OPTIONS);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [fakultasList, setFakultasList] = useState<FakultasOption[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [creating, setCreating] = useState(false);

    // Filters
    const [roleFilter, setRoleFilter] = useState<string>("dosen");
    const [facultyFilter, setFacultyFilter] = useState<string>("all");
    const [programFilter, setProgramFilter] = useState<string>("all");

    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);

    const [newUser, setNewUser] = useState<NewUserForm>({
        fullName: "",
        email: "",
        password: "",
        role: "dosen",
        fakultasId: "",
        prodiId: "",
        identityNumber: "",
    });

    const [editData, setEditData] = useState<EditUserForm>({
        fullName: "",
        email: "",
        role: "dosen",
        fakultas: "",
        prodi: "",
        identityNumber: "",
    });

    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ successCount: number; errors?: string[] } | null>(null);

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('role', roleFilter);
            if (facultyFilter !== 'all') queryParams.append('fakultasId', facultyFilter);
            if (programFilter !== 'all') queryParams.append('prodiId', programFilter);

            const url = `/api/users/export/staff?${queryParams.toString()}`;

            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error('Gagal export data');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `staff_${roleFilter}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success('Data Staff berhasil diexport');
        } catch (error) {
            toast.error('Gagal export data Staff');
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImporting(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`/api/users/import/staff`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();

                setImportResult({
                    successCount: result.successCount || 0,
                    errors: result.errors
                });

                if (!response.ok) throw new Error(result.error || 'Gagal import data');

                if (result.errors && result.errors.length > 0) {
                    toast.warning(`Import selesai: ${result.successCount || 0} berhasil, ${result.errors.length} gagal.`);
                } else {
                    toast.success(result.message || 'Data berhasil diimport');
                }

                loadUsers();
            } catch (error: any) {
                toast.error(error.message || 'Gagal import data Staff');
            } finally {
                setImporting(false);
            }
        };
        input.click();
    };

    // Login As Feature
    const { role: currentUserRole } = useUserRole();
    const [loginAsConfirmOpen, setLoginAsConfirmOpen] = useState(false);
    const [userToImpersonate, setUserToImpersonate] = useState<UserRow | null>(null);

    const handleLoginAsClick = (user: UserRow) => {
        setUserToImpersonate(user);
        setLoginAsConfirmOpen(true);
    };

    const confirmLoginAs = async () => {
        if (userToImpersonate) {
            await loginAsUser(userToImpersonate.id);
            setLoginAsConfirmOpen(false);
            setUserToImpersonate(null);
        }
    };

    useEffect(() => {
        fetchFakultasList().then(res => {
            if (res.data) setFakultasList(res.data);
        });

        // Fetch dynamic roles
        api.get('/roles')
            .then(res => {
                if (res.data && Array.isArray(res.data)) {
                    const options = res.data.map((r: any) => ({
                        value: r.roleName || r.name, // Handle possible key variations
                        label: r.displayName || r.roleName
                    }));
                    setRoleOptions(options);
                }
            })
            .catch(err => console.error("Failed to fetch roles:", err));
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setPage(1);
            loadUsers();
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
                q: searchTerm,
                role: roleFilter, // Using specific role
                fakultasId: facultyFilter === "all" ? undefined : facultyFilter,
                prodiId: programFilter === "all" ? undefined : programFilter,
            };

            const response = await fetchAllUsers(params);
            const data = (response?.data || []) as any[];
            const meta = response?.meta || { totalPages: 1, total: 0 };

            const mapped: UserRow[] = data.map((u) => {
                let fakultasName: string | null = null;
                let prodiName: string | null = null;
                if (u.profile?.prodi?.fakultas?.nama) fakultasName = u.profile.prodi.fakultas.nama;
                if (u.profile?.prodi?.nama) prodiName = u.profile.prodi.nama;

                const roleObj = u.role?.role;
                const roleName = roleObj?.roleName || roleObj?.name || "dosen";
                const roleDisplay = roleObj?.displayName || roleName;

                return {
                    id: u.id,
                    email: u.email,
                    role: roleName,
                    roleDisplay: roleDisplay,
                    namaLengkap: u.profile?.namaLengkap,
                    nip: u.profile?.nip,
                    fakultas: fakultasName,
                    programStudi: prodiName,
                    profileId: u.profile?.id,
                };
            });

            setUsers(mapped);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);
        } catch (error: any) {
            toast.error("Gagal memuat data staff");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, roleFilter, facultyFilter, programFilter, limit]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Sync filters with new user form
    useEffect(() => {
        setNewUser(prev => ({
            ...prev,
            role: roleFilter,
            fakultasId: facultyFilter === "all" ? "" : facultyFilter,
            prodiId: programFilter === "all" ? "" : programFilter
        }));
    }, [roleFilter, facultyFilter, programFilter]);

    const selectedFakultas = fakultasList.find(f => f.id === newUser.fakultasId);
    const selectedEditFakultas = fakultasList.find(f => f.id === editData.fakultas);
    const selectedFacultyFilter = facultyFilter === "all" ? undefined : fakultasList.find(f => f.id === facultyFilter);
    const programFilterOptions: ProdiOption[] = selectedFacultyFilter
        ? (selectedFacultyFilter.prodi as ProdiOption[])
        : (fakultasList.flatMap((f) => f.prodi) as ProdiOption[]);
    const hasActiveFilter = facultyFilter !== "all" || programFilter !== "all";

    const handleCreateUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!newUser.email) return;
        try {
            setCreating(true);
            const profilePayload: any = {
                nip: newUser.identityNumber || null,
                fakultasId: newUser.fakultasId || undefined,
                prodiId: newUser.prodiId || undefined,
            };
            await createUserWithRole(
                newUser.email,
                newUser.password,
                newUser.fullName,
                newUser.role,
                profilePayload
            );
            toast.success(`Staff "${newUser.fullName}" berhasil dibuat`);
            setShowCreate(false);
            setNewUser({ fullName: "", email: "", password: "", role: "dosen", fakultasId: "", prodiId: "", identityNumber: "" });
            loadUsers();
        } catch (err: any) {
            toast.error(err.message || "Gagal membuat user");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setSavingEdit(true);
        try {
            await updateUser(editingUser.id, {
                email: editData.email,
                fullName: editData.fullName,
                role: editData.role !== editingUser.role ? editData.role : undefined
            });
            if (editingUser.profileId) {
                await updateProfile(editingUser.profileId, {
                    nip: editData.identityNumber || null,
                    fakultasId: editData.fakultas || null,
                    prodiId: editData.prodi || null
                });
            }
            toast.success(`Data staff "${editingUser?.namaLengkap || editingUser?.email || 'Unknown'}" berhasil diperbarui`);
            setEditingUser(null);
            loadUsers();
        } catch (err: any) {
            toast.error("Failed to update");
        } finally {
            setSavingEdit(false);
        }
    };

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);

    const handleDeleteUser = (user: UserRow) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            setDeletingId(userToDelete.id);
            try {
                await deleteUser(userToDelete.id);
                toast.success("User dihapus");
                setUsers(u => u.filter(x => x.id !== userToDelete.id));
                setEditingUser(null);
            } catch (e) { toast.error("Gagal hapus"); }
            finally {
                setDeletingId(null);
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            {canManage && (
                <CollapsibleGuide title="Panduan Manajemen Staff & Dosen">
                    <div className="space-y-3">
                        <p>Halaman ini digunakan untuk mengelola akun staff, dosen, kaprodi, dan admin. Anda dapat mengatur unit kerja (Fakultas/Prodi) untuk setiap akun.</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            <li><strong>Unit Kerja:</strong> Dosen/Kaprodi biasanya terikat pada satu homebase. Admin dapat mengakses semua unit.</li>
                            <li><strong>NIP/NIDN:</strong> Pastikan NIP unik untuk setiap akun dosen.</li>
                            <li><strong>Import:</strong> Gunakan format Excel yang sesuai untuk mendaftarkan akun secara massal.</li>
                        </ul>
                    </div>
                </CollapsibleGuide>
            )}

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base md:text-lg">Daftar Dosen & Tenaga Kependidikan</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-muted-foreground">
                            Total: <span className="font-medium">{totalItems}</span>
                        </CardDescription>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <Button size="sm" variant="outline" onClick={handleExport} disabled={loading} className="h-9">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleImportClick} disabled={importing} className="h-9">
                            <Upload className="h-4 w-4 mr-2" />
                            {importing ? 'Importing...' : 'Import'}
                        </Button>
                        <div className="w-[200px]">
                            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roleOptions
                                        .filter(opt => opt.value.toLowerCase() !== 'mahasiswa')
                                        .map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative min-w-[150px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm" />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={hasActiveFilter ? "default" : "outline"} size="sm" className="h-9 gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Fakultas</Label>
                                    <Select value={facultyFilter} onValueChange={(val) => { setFacultyFilter(val); setProgramFilter("all"); }}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Semua" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            {fakultasList.map(f => <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Program Studi</Label>
                                    <Select value={programFilter} onValueChange={setProgramFilter} disabled={facultyFilter === "all" && programFilterOptions.length === 0}>
                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Semua" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            {programFilterOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button size="sm" onClick={() => setShowCreate(true)} className="h-9">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && users.length === 0 ? (
                        <LoadingScreen fullScreen={false} message="Memuat data staff..." />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">No</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>NIP</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                    {users.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                                    ) : (
                                        users.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                                                <TableCell className="font-mono text-xs">{user.email}</TableCell>
                                                <TableCell>{user.namaLengkap}</TableCell>
                                                <TableCell>{user.nip || "-"}</TableCell>
                                                <TableCell><Badge variant="outline" className="capitalize">{user.roleDisplay || user.role}</Badge></TableCell>
                                                <TableCell className="text-xs">
                                                    {(user as any).taughtProdis && (user as any).taughtProdis.length > 0
                                                        ? (user as any).taughtProdis.join(", ")
                                                        : user.programStudi ? user.programStudi : user.fakultas ? user.fakultas : "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {currentUserRole === 'admin' && user.role !== 'admin' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleLoginAsClick(user)}
                                                                disabled={loginAsLoading}
                                                                title="Login sebagai user ini"
                                                            >
                                                                <UserCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setEditingUser(user);
                                                            let fakId = "", prodiId = "";
                                                            if (user.fakultas) {
                                                                const f = fakultasList.find(x => x.nama === user.fakultas);
                                                                if (f) { fakId = f.id; const p = f.prodi.find(x => x.nama === user.programStudi); if (p) prodiId = p.id; }
                                                            }
                                                            setEditData({
                                                                fullName: user.namaLengkap || "",
                                                                email: user.email,
                                                                role: user.role,
                                                                fakultas: fakId,
                                                                prodi: prodiId,
                                                                identityNumber: user.nip || ""
                                                            });
                                                        }}>Kelola</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>

            <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit {roleOptions.find(r => r.value === editData.role)?.label || 'Pengguna'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Role</Label>
                            <Select value={editData.role} onValueChange={v => setEditData({ ...editData, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Nama</Label><Input value={editData.fullName} onChange={e => setEditData({ ...editData, fullName: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} /></div>
                        <div className="space-y-2"><Label>NIP</Label><Input value={editData.identityNumber} onChange={e => setEditData({ ...editData, identityNumber: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Fakultas</Label>
                            <Select value={editData.fakultas} onValueChange={v => setEditData({ ...editData, fakultas: v, prodi: "" })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{fakultasList.map(f => <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Prodi</Label>
                            <Select value={editData.prodi} onValueChange={v => setEditData({ ...editData, prodi: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{selectedEditFakultas?.prodi.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="destructive" onClick={() => editingUser && handleDeleteUser(editingUser)}>Hapus User</Button>
                            <Button onClick={handleSaveEdit}>{savingEdit ? "..." : "Simpan"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus Staff"
                description={`Yakin ingin menghapus ${userToDelete?.namaLengkap || userToDelete?.email}?`}
                loading={!!deletingId}
            />

            <Dialog open={loginAsConfirmOpen} onOpenChange={setLoginAsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Login Sebagai User</DialogTitle>
                        <DialogDescription>
                            Anda akan login sebagai <strong>{userToImpersonate?.namaLengkap || userToImpersonate?.email}</strong>.
                            Anda dapat kembali ke akun admin kapan saja menggunakan tombol "Kembali ke Admin".
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLoginAsConfirmOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={confirmLoginAs} disabled={loginAsLoading}>
                            {loginAsLoading ? 'Loading...' : 'Ya, Login Sebagai User Ini'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Staff/Dosen Baru</DialogTitle>
                        <DialogDescription>Daftarkan akun staff baru dengan role tertentu.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel required>Nama Lengkap</RequiredLabel>
                                <Input value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel required>Email</RequiredLabel>
                                <Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <RequiredLabel required>Password</RequiredLabel>
                                <Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label>NIP/NIDN</Label>
                                <Input value={newUser.identityNumber} onChange={e => setNewUser({ ...newUser, identityNumber: e.target.value })} />
                            </div>
                        </div>

                        {newUser.role !== 'admin' && (
                            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Fakultas</Label>
                                    <Select value={newUser.fakultasId} onValueChange={v => setNewUser({ ...newUser, fakultasId: v, prodiId: "" })}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>{fakultasList.map(f => <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Prodi</Label>
                                    <Select value={newUser.prodiId} onValueChange={v => setNewUser({ ...newUser, prodiId: v })} disabled={!newUser.fakultasId}>
                                        <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>{selectedFakultas?.prodi.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Simpan Staff
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ImportResultDialog
                open={!!importResult}
                onOpenChange={(open) => !open && setImportResult(null)}
                result={importResult}
                title="Hasil Import Staff"
                description="Proses import data staff telah selesai dengan rincian berikut."
            />
        </div>
    );
};
