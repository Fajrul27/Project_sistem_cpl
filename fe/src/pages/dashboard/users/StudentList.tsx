
import { useEffect, useState, FormEvent, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchAllUsers, updateUserRole, createUserWithRole, updateUser, deleteUser, updateProfile, fetchKelas, fetchFakultasList, fetchAngkatanList } from "@/lib/api";
import { Search, SlidersHorizontal, UserCircle, Download, Upload, Plus } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { Pagination } from "@/components/common/Pagination";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    namaLengkap?: string | null;
    nim?: string | null;
    nip?: string | null;
    fakultas?: string | null;
    programStudi?: string | null;
    semester?: number | null;
    kelasId?: string | null;
    profileId?: string | null;
    angkatan?: number | null;
    angkatanId?: string | null;
}

interface NewUserForm {
    fullName: string;
    email: string;
    password: string;
    role: string;
    fakultasId: string;
    prodiId: string;
    identityType: "mahasiswa" | "dosen";
    identityNumber: string;
    semester: string;
    kelasId?: string;
    angkatanId?: string;
}

interface EditUserForm {
    fullName: string;
    email: string;
    role: string;
    fakultas: string;
    prodi: string;
    identityType: "mahasiswa" | "dosen";
    identityNumber: string;
    semester: string;
    kelasId?: string;
    angkatanId?: string;
}

type ProdiOption = { id: string; nama: string; kode: string };
type FakultasOption = { id: string; nama: string; kode: string; prodi: ProdiOption[] };

export const StudentList = () => {
    const { can } = usePermission();
    const canManage = can('access', 'admin');
    const { loginAsUser, isImpersonating, loading: loginAsLoading } = useImpersonation();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [fakultasList, setFakultasList] = useState<FakultasOption[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [creating, setCreating] = useState(false);
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [angkatanList, setAngkatanList] = useState<any[]>([]);

    // Filters specific to Students
    const [facultyFilter, setFacultyFilter] = useState<string>("all");
    const [programFilter, setProgramFilter] = useState<string>("all");
    const [semesterFilter, setSemesterFilter] = useState<string>("all");
    const [kelasFilter, setKelasFilter] = useState<string>("all");
    const [importResult, setImportResult] = useState<{ successCount: number; errors?: string[] } | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);

    // Forms
    const [newUser, setNewUser] = useState<NewUserForm>({
        fullName: "",
        email: "",
        password: "",
        role: "mahasiswa",
        fakultasId: "",
        prodiId: "",
        identityType: "mahasiswa",
        identityNumber: "",
        semester: "",
        kelasId: "",
        angkatanId: "",
    });

    const [editData, setEditData] = useState<EditUserForm>({
        fullName: "",
        email: "",
        role: "mahasiswa",
        fakultas: "",
        prodi: "",
        identityType: "mahasiswa",
        identityNumber: "",
        semester: "",
        kelasId: "",
        angkatanId: "",
    });

    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (facultyFilter !== 'all') queryParams.append('fakultasId', facultyFilter);
            if (programFilter !== 'all') queryParams.append('prodiId', programFilter);
            if (semesterFilter !== 'all') queryParams.append('semester', semesterFilter);
            if (kelasFilter !== 'all') queryParams.append('kelasId', kelasFilter);

            const url = `/api/users/export/mahasiswa?${queryParams.toString()}`;

            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error('Gagal export data');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `mahasiswa_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success('Data Mahasiswa berhasil diexport');
        } catch (error) {
            toast.error('Gagal export data Mahasiswa');
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

                const response = await fetch(`/api/users/import/mahasiswa`, {
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
                toast.error(error.message || 'Gagal import data Mahasiswa');
            } finally {
                setImporting(false);
            }
        };
        input.click();
    };


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

    // Load References
    useEffect(() => {
        const loadRefs = async () => {
            try {
                const [angRes, fakRes, kelRes] = await Promise.all([
                    fetchAngkatanList(),
                    fetchFakultasList(),
                    fetchKelas()
                ]);
                if (angRes.data) setAngkatanList(angRes.data);
                if (fakRes.data) setFakultasList(fakRes.data);
                if (kelRes.data) setKelasList(kelRes.data);
            } catch (err) {
                console.error("Error loading references:", err);
            }
        };
        loadRefs();
    }, []);

    // Sync filters reset on mount? No need if component unmounts.

    // Debounce search
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
                role: "mahasiswa", // Enforced
                fakultasId: facultyFilter === "all" ? undefined : facultyFilter,
                prodiId: programFilter === "all" ? undefined : programFilter,
                semester: semesterFilter === "all" ? undefined : semesterFilter,
                kelasId: kelasFilter === "all" ? undefined : kelasFilter,
            };

            const response = await fetchAllUsers(params);
            const data = (response?.data || []) as any[];
            const meta = response?.meta || { totalPages: 1, total: 0 };

            const mapped: UserRow[] = data.map((u) => {
                let fakultasName: string | null = null;
                let prodiName: string | null = null;

                // Use reference if available (better than string parsing)
                if (u.profile?.prodi?.fakultas?.nama) fakultasName = u.profile.prodi.fakultas.nama;
                if (u.profile?.prodi?.nama) prodiName = u.profile.prodi.nama;

                // Fallback checks could be added here if needed

                return {
                    id: u.id,
                    email: u.email,
                    role: u.role?.role || "mahasiswa",
                    namaLengkap: u.profile?.namaLengkap,
                    nim: u.profile?.nim,
                    nip: u.profile?.nip,
                    fakultas: fakultasName,
                    programStudi: prodiName,
                    semester: u.profile?.semester,
                    kelasId: u.profile?.kelasId,
                    profileId: u.profile?.id,
                    angkatan: u.profile?.angkatanRef?.tahun,
                    angkatanId: u.profile?.angkatanId,
                };
            });

            setUsers(mapped);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);
        } catch (error: any) {
            console.error("Gagal memuat users:", error);
            toast.error("Gagal memuat data pengguna");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, facultyFilter, programFilter, semesterFilter, kelasFilter]);

    // Trigger load on filter change
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Derived state
    const selectedFakultas = fakultasList.find(f => f.id === newUser.fakultasId);
    const selectedEditFakultas = fakultasList.find(f => f.id === editData.fakultas);
    const selectedFacultyFilter = facultyFilter === "all" ? undefined : fakultasList.find(f => f.id === facultyFilter);
    const programFilterOptions: ProdiOption[] = selectedFacultyFilter
        ? (selectedFacultyFilter.prodi as ProdiOption[])
        : (fakultasList.flatMap((f) => f.prodi) as ProdiOption[]);

    const hasActiveFilter = facultyFilter !== "all" || programFilter !== "all" || semesterFilter !== "all" || kelasFilter !== "all";

    // Handlers
    const handleCreateUser = async (e: FormEvent) => {
        e.preventDefault();
        if (!newUser.email || !newUser.password || !newUser.fullName) {
            toast.error("Nama, email, dan password harus diisi");
            return;
        }

        try {
            setCreating(true);
            const profilePayload: any = {};

            if (newUser.identityNumber.trim()) {
                profilePayload.nim = newUser.identityNumber.trim();
            }

            if (newUser.fakultasId || newUser.prodiId) {
                // Just send IDs, let backend handle naming if needed or relations
                profilePayload.prodiId = newUser.prodiId;
                profilePayload.fakultasId = newUser.fakultasId;
            }

            if (newUser.semester.trim()) {
                const parsed = parseInt(newUser.semester.trim(), 10);
                profilePayload.semester = Number.isNaN(parsed) ? null : parsed;
            }
            if (newUser.kelasId) profilePayload.kelasId = newUser.kelasId;
            if (newUser.angkatanId) profilePayload.angkatanId = newUser.angkatanId;

            await createUserWithRole(
                newUser.email,
                newUser.password.trim(),
                newUser.fullName,
                "mahasiswa",
                profilePayload
            );

            toast.success(`Mahasiswa "${newUser.fullName}" berhasil dibuat`);
            setNewUser({
                fullName: "",
                email: "",
                password: "",
                role: "mahasiswa",
                fakultasId: "",
                prodiId: "",
                identityType: "mahasiswa",
                identityNumber: "",
                semester: "",
                kelasId: "",
                angkatanId: "",
            });
            setShowCreate(false);
            loadUsers();
        } catch (error: any) {
            console.error("Gagal membuat pengguna:", error);
            toast.error(error.message || "Gagal membuat pengguna");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            setSavingEdit(true);

            // Update basic info
            await updateUser(editingUser.id, {
                email: editData.email,
                fullName: editData.fullName,
                // role is fixed to 'mahasiswa' generally in this list. 
                // If user changes role to 'dosen', they will disappear from this list.
                role: editData.role !== editingUser.role ? editData.role : undefined,
            });

            // Update Profile
            if (editingUser.profileId) {
                const profilePayload: any = {
                    nim: editData.identityNumber || null,
                    prodiId: editData.prodi || null,
                    fakultasId: editData.fakultas || null,
                    semester: editData.semester ? parseInt(editData.semester) : null,
                    kelasId: editData.kelasId || null,
                    angkatanId: editData.angkatanId || null,
                };

                if (editData.role !== 'mahasiswa') {
                    // Logic if turning into dosen (clearing student specific fields?)
                    // Keeping it simple for now.
                }

                await updateProfile(editingUser.profileId, profilePayload);
            }

            toast.success(`Data mahasiswa "${editingUser?.namaLengkap || editingUser?.email || 'Unknown'}" berhasil diperbarui`);
            setEditingUser(null);
            loadUsers();
        } catch (error: any) {
            toast.error(error.message || "Gagal update user");
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
                toast.success("Dihapus");
                setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
                setEditingUser(null);
            } catch (error: any) {
                toast.error("Gagal menghapus");
            } finally {
                setDeletingId(null);
                setDeleteDialogOpen(false);
                setUserToDelete(null);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {canManage && (
                <CollapsibleGuide title="Panduan Manajemen Mahasiswa">
                    <div className="space-y-3">
                        <p>Halaman ini digunakan untuk mengelola data akun mahasiswa. Anda dapat menambahkan mahasiswa secara manual atau melakukan import massal.</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            <li><strong>Manual:</strong> Gunakan tombol "Tambah" untuk mengisi data mahasiswa satu per satu.</li>
                            <li><strong>Import:</strong> Gunakan template Excel untuk mendaftarkan banyak mahasiswa sekaligus. Pastikan NIM unik.</li>
                            <li><strong>Filter:</strong> Gunakan popover filter untuk mempersempit daftar berdasarkan fakultas, prodi, atau angkatan.</li>
                        </ul>
                    </div>
                </CollapsibleGuide>
            )}

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base md:text-lg">Daftar Mahasiswa</CardTitle>
                        <CardDescription className="text-xs md:text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium">{totalItems}</span> mahasiswa
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleExport} disabled={loading} className="h-9">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleImportClick} disabled={importing} className="h-9">
                            <Upload className="h-4 w-4 mr-2" />
                            {importing ? 'Importing...' : 'Import'}
                        </Button>

                        <div className="relative min-w-[200px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={hasActiveFilter ? "default" : "outline"} size="sm" className="h-9 gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80 space-y-4">
                                <div className="grid grid-cols-1 gap-3">
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
                                    <div className="space-y-1">
                                        <Label className="text-xs">Semester</Label>
                                        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Semua" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua</SelectItem>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Kelas</Label>
                                        <Select value={kelasFilter} onValueChange={setKelasFilter}>
                                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Semua" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua</SelectItem>
                                                {kelasList.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                        <LoadingScreen fullScreen={false} message="Memuat data mahasiswa..." />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">No</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>NIM</TableHead>
                                        <TableHead>Prodi</TableHead>
                                        <TableHead className="text-center">Sem</TableHead>
                                        <TableHead className="text-center">Angk</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
                                    {users.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
                                    ) : (
                                        users.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                                                <TableCell className="font-mono text-xs">{user.email}</TableCell>
                                                <TableCell>{user.namaLengkap}</TableCell>
                                                <TableCell>{user.nim}</TableCell>
                                                <TableCell className="text-xs">{user.programStudi}</TableCell>
                                                <TableCell className="text-center">{user.semester}</TableCell>
                                                <TableCell className="text-center">{user.angkatan}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {currentUserRole === 'admin' && (
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
                                                                if (f) {
                                                                    fakId = f.id;
                                                                    const p = f.prodi.find(x => x.nama === user.programStudi);
                                                                    if (p) prodiId = p.id;
                                                                }
                                                            }
                                                            setEditData({
                                                                fullName: user.namaLengkap || "",
                                                                email: user.email,
                                                                role: "mahasiswa",
                                                                fakultas: fakId,
                                                                prodi: prodiId,
                                                                identityType: "mahasiswa",
                                                                identityNumber: user.nim || "",
                                                                semester: user.semester ? String(user.semester) : "",
                                                                kelasId: user.kelasId || "",
                                                                angkatanId: user.angkatanId || "",
                                                            })
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

                    <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Edit Mahasiswa</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Nama</Label><Input value={editData.fullName} onChange={e => setEditData({ ...editData, fullName: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Email</Label><Input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} /></div>
                                <div className="space-y-2"><Label>NIM</Label><Input value={editData.identityNumber} onChange={e => setEditData({ ...editData, identityNumber: e.target.value })} /></div>
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
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Semester</Label><Input value={editData.semester} onChange={e => setEditData({ ...editData, semester: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Kelas</Label>
                                        <Select value={editData.kelasId} onValueChange={v => setEditData({ ...editData, kelasId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                            <SelectContent>{kelasList.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2"><Label>Angkatan</Label>
                                        <Select value={editData.angkatanId} onValueChange={v => setEditData({ ...editData, angkatanId: v })}>
                                            <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                            <SelectContent>{angkatanList.map(a => <SelectItem key={a.id} value={a.id}>{a.tahun}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button variant="destructive" onClick={() => editingUser && handleDeleteUser(editingUser)}>Hapus User</Button>
                                    <Button onClick={handleSaveEdit}>{savingEdit ? "Menyimpan" : "Simpan"}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus Mahasiswa"
                description={`Apakah Anda yakin ingin menghapus mahasiswa ${userToDelete?.namaLengkap || userToDelete?.email}? Data akan dihapus permanen.`}
                loading={deletingId !== null}
            />

            {/* Login As Confirmation Dialog */}
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
            {/* Create Student Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Tambah Mahasiswa Baru</DialogTitle>
                        <DialogDescription>Isi detail akun mahasiswa di bawah ini.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                <RequiredLabel required>NIM</RequiredLabel>
                                <Input value={newUser.identityNumber} onChange={e => setNewUser({ ...newUser, identityNumber: e.target.value })} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                            <div className="space-y-2">
                                <Label>Fakultas</Label>
                                <Select value={newUser.fakultasId} onValueChange={v => setNewUser({ ...newUser, fakultasId: v, prodiId: "" })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {fakultasList.map(f => <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Prodi</Label>
                                <Select value={newUser.prodiId} onValueChange={v => setNewUser({ ...newUser, prodiId: v })} disabled={!newUser.fakultasId}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {selectedFakultas?.prodi.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Semester</Label>
                                <Input type="number" min="1" max="14" value={newUser.semester} onChange={e => setNewUser({ ...newUser, semester: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Kelas</Label>
                                <Select value={newUser.kelasId} onValueChange={v => setNewUser({ ...newUser, kelasId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {kelasList.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Angkatan</Label>
                                <Select value={newUser.angkatanId} onValueChange={v => setNewUser({ ...newUser, angkatanId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                    <SelectContent>
                                        {angkatanList.map(a => <SelectItem key={a.id} value={a.id}>{a.tahun}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? <LoadingSpinner size="sm" className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                Simpan Mahasiswa
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ImportResultDialog
                open={!!importResult}
                onOpenChange={(open) => !open && setImportResult(null)}
                result={importResult}
                title="Hasil Import Mahasiswa"
                description="Proses import data mahasiswa telah selesai dengan rincian berikut."
            />
        </div>
    );
};
