
import { useEffect, useState, FormEvent, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, createUserWithRole, updateUser, deleteUser, updateProfile, fetchFakultasList } from "@/lib/api";
import { Search, SlidersHorizontal } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface UserRow {
    id: string;
    email: string;
    role: string;
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

const ROLE_OPTIONS = [
    { value: "dosen", label: "Dosen" },
    { value: "kaprodi", label: "Kaprodi" },
    { value: "admin", label: "Admin" },
];

export const StaffList = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        fetchFakultasList().then(res => {
            if (res.data) setFakultasList(res.data);
        });
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

                return {
                    id: u.id,
                    email: u.email,
                    role: u.role?.role || "dosen",
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
    }, [page, searchTerm, roleFilter, facultyFilter, programFilter]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
            toast.success("Staff berhasil dibuat");
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
            toast.success("Staff updated");
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
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base md:text-lg">Daftar Dosen & Tenaga Kependidikan</CardTitle>
                    <CardDescription className="text-xs md:text-sm text-muted-foreground">
                        Total: <span className="font-medium">{totalItems}</span>
                    </CardDescription>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Role Filter Toggles */}
                    <div className="flex bg-muted p-1 rounded-lg">
                        {ROLE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { setRoleFilter(opt.value); setPage(1); }}
                                className={`px-3 py-1 text-xs rounded-md transition-all ${roleFilter === opt.value ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
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

                    <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="h-9">
                        {showCreate ? "Tutup" : "Tambah"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {showCreate && (
                    <div className="mb-6 border rounded-lg p-4 bg-muted/30">
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Nama</Label><Input value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Password</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required minLength={6} /></div>
                            <div className="space-y-2"><Label>NIP/NIDN</Label><Input value={newUser.identityNumber} onChange={e => setNewUser({ ...newUser, identityNumber: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Fakultas</Label>
                                <Select value={newUser.fakultasId} onValueChange={v => setNewUser({ ...newUser, fakultasId: v, prodiId: "" })}>
                                    <SelectTrigger><SelectValue placeholder="Opsional..." /></SelectTrigger>
                                    <SelectContent>{fakultasList.map(f => <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Prodi</Label>
                                <Select value={newUser.prodiId} onValueChange={v => setNewUser({ ...newUser, prodiId: v })} disabled={!newUser.fakultasId}>
                                    <SelectTrigger><SelectValue placeholder="Opsional..." /></SelectTrigger>
                                    <SelectContent>{selectedFakultas?.prodi.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="lg:col-span-4 flex justify-end mt-4"><Button type="submit" disabled={creating}>{creating ? "..." : "Simpan"}</Button></div>
                        </form>
                    </div>
                )}

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
                                            <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                                            <TableCell className="text-xs">
                                                {(user as any).taughtProdis && (user as any).taughtProdis.length > 0
                                                    ? (user as any).taughtProdis.join(", ")
                                                    : user.programStudi ? user.programStudi : user.fakultas ? user.fakultas : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
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
                                            </TableCell>
                                        </TableRow>
                                    )))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                    <span className="text-sm py-1">Page {page} of {totalPages}</span>
                    <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                </div>

                <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Role</Label>
                                <Select value={editData.role} onValueChange={v => setEditData({ ...editData, role: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{ROLE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
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
            </CardContent>
        </Card>
    );
};
