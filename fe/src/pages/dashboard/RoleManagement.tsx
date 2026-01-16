import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Shield, GraduationCap, BookOpen, User, Crown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { LoadingScreen } from "@/components/common/LoadingScreen";

interface RoleMetadata {
    id: string;
    roleName: string;
    displayName: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
    _count?: {
        userRoles: number;
        rolePermissions: number;
    };
}

const ROLE_ICONS: Record<string, any> = {
    Shield,
    GraduationCap,
    BookOpen,
    User,
    Crown
};

const RoleManagementPage = () => {
    const [roles, setRoles] = useState<RoleMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleMetadata | null>(null);
    const [deletingRole, setDeletingRole] = useState<RoleMetadata | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        displayName: "",
        description: ""
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Gagal memuat data role');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (role: RoleMetadata) => {
        setEditingRole(role);
        setFormData({
            name: role.roleName,
            displayName: role.displayName,
            description: role.description || ""
        });
        setEditDialogOpen(true);
    };

    const handleCreate = () => {
        setFormData({ name: "", displayName: "", description: "" });
        setCreateDialogOpen(true);
    };

    const handleDelete = (role: RoleMetadata) => {
        setDeletingRole(role);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingRole) return;

        try {
            await api.put(`/roles/${editingRole.id}`, {
                displayName: formData.displayName,
                description: formData.description || null
            });

            toast.success(`Role "${formData.displayName}" berhasil diupdate`);
            setEditDialogOpen(false);
            fetchRoles();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Gagal mengupdate role');
        }
    };

    const handleCreateSave = async () => {
        if (!formData.name || !formData.displayName) {
            toast.error('Name dan Display Name wajib diisi');
            return;
        }

        try {
            await api.post('/roles', {
                name: formData.name,
                displayName: formData.displayName,
                description: formData.description || null
            });

            toast.success(`Role "${formData.displayName}" berhasil dibuat`);
            setCreateDialogOpen(false);
            fetchRoles();
        } catch (error: any) {
            console.error('Error creating role:', error);
            toast.error(error.response?.data?.error || 'Gagal membuat role');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingRole) return;

        try {
            await api.delete(`/roles/${deletingRole.id}`, {});
            toast.success('Role berhasil dihapus');
            setDeleteDialogOpen(false);
            fetchRoles();
        } catch (error: any) {
            console.error('Error deleting role:', error);
            toast.error(error.response?.data?.error || 'Gagal menghapus role');
        }
    };

    const initializeDefaults = async () => {
        try {
            await api.post('/roles/init');
            toast.success('Default role metadata berhasil diinisialisasi');
            fetchRoles();
        } catch (error) {
            console.error('Error initializing defaults:', error);
            toast.error('Gagal menginisialisasi default');
        }
    };

    const getRoleIcon = (iconName: string | null) => {
        if (!iconName) return Shield;
        return ROLE_ICONS[iconName] || Shield;
    };

    if (loading) {
        return <LoadingScreen message="Memuat data role..." />;
    }

    return (
        <DashboardPage
            title="Kelola Role"
            description="Manage role display names and descriptions"
        >
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Role</CardTitle>
                        <CardDescription>
                            {roles.length} role tersedia dalam sistem
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Role
                        </Button>
                        {roles.length === 0 && (
                            <Button onClick={initializeDefaults} variant="outline">
                                Inisialisasi Default
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Icon</TableHead>
                                <TableHead>Role Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data role. Klik "Inisialisasi Default" untuk memuat role default.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => {
                                    const Icon = getRoleIcon(role.icon);
                                    return (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <Icon className="h-5 w-5" style={{ color: role.color || undefined }} />
                                            </TableCell>
                                            <TableCell className="font-medium">{role.roleName}</TableCell>
                                            <TableCell>{role.displayName}</TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {role.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(role)}
                                                        disabled={role._count?.userRoles! > 0 || role.isSystem || role.roleName === 'dekan'}
                                                        title={(role.isSystem || role.roleName === 'dekan') ? "System role cannot be deleted" : "Delete role"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role: {editingRole?.roleName}</DialogTitle>
                        <DialogDescription>
                            Update display name and description for this role
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="displayName" required>Display Name</RequiredLabel>
                            <Input
                                id="displayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="e.g., Administrator"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Deskripsi role..."
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleSave} className="flex-1">
                                Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Role Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Role Baru</DialogTitle>
                        <DialogDescription>
                            Buat role baru untuk sistem. Default permissions akan otomatis dibuat.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="name" required>Name (ID)</RequiredLabel>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                placeholder="e.g., koordinator"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Lowercase, alphanumeric dan underscore saja</p>
                        </div>
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="createDisplayName" required>Display Name</RequiredLabel>
                            <Input
                                id="createDisplayName"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="e.g., Koordinator Program"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="createDescription">Description</Label>
                            <Textarea
                                id="createDescription"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Deskripsi role..."
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreateSave} className="flex-1">
                                Buat Role
                            </Button>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Batal
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Role Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Role?</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus role "{deletingRole?.displayName}"?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {deletingRole?._count?.userRoles && deletingRole._count.userRoles > 0 ? (
                            <div className="p-4 bg-destructive/10 border border-destructive rounded">
                                <p className="text-sm text-destructive font-medium">
                                    Tidak dapat menghapus role ini!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {deletingRole._count.userRoles} pengguna masih memiliki role ini.
                                    Silakan ubah role pengguna terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm">
                                    Role dan semua permission terkait akan dihapus permanen.
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteConfirm}
                                        className="flex-1"
                                    >
                                        Ya, Hapus
                                    </Button>
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                        Batal
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardPage>
    );
};

export default RoleManagementPage;
