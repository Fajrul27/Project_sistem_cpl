import { useState, useEffect } from 'react';
import { DashboardPage } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RefreshCw, Download, Upload, Database, GraduationCap, FileText, Users, Settings, LayoutDashboard, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
    fetchDefaultPermissions,
    initializeDefaultPermissions,
    updateRoleDefaultPermissions,
    exportDefaultPermissions,
    importDefaultPermissions
} from '@/lib/api';

interface Permission {
    id?: string;
    role: string;
    resource: string;
    action: string;
    isEnabled: boolean;
}

const ROLES = [
    { id: 'admin', label: 'Admin', color: 'red' },
    { id: 'kaprodi', label: 'Kaprodi', color: 'blue' },
    { id: 'dosen', label: 'Dosen', color: 'green' },
    { id: 'mahasiswa', label: 'Mahasiswa', color: 'yellow' }
];

const RESOURCE_CATEGORIES = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        resources: [{ id: 'dashboard', label: 'Dashboard' }]
    },
    {
        name: 'Master Data & Perencanaan',
        icon: Database,
        resources: [
            { id: 'visi_misi', label: 'Visi & Misi' },
            { id: 'profil_lulusan', label: 'Profil Lulusan' },
            { id: 'cpl', label: 'CPL & Mapping PL - CPL' },
            { id: 'mata_kuliah', label: 'Mata Kuliah' },
        ]
    },
    {
        name: 'Persiapan & Pembelajaran',
        icon: GraduationCap,
        resources: [
            { id: 'cpmk', label: 'CPMK & Mapping CPMK - CPL' },
            { id: 'nilai_teknik', label: 'Input Nilai Teknik' },
            { id: 'kuesioner', label: 'Isi Kuesioner CPL' },
        ]
    },
    {
        name: 'Laporan & Evaluasi',
        icon: FileText,
        resources: [
            { id: 'transkrip_cpl', label: 'Capaian Pembelajaran' },
            { id: 'analisis_cpl', label: 'Analisis CPL' },
            { id: 'evaluasi_cpl', label: 'Evaluasi CPL' },
            { id: 'rekap_kuesioner', label: 'Rekap Kuesioner' },
            { id: 'evaluasi_mk', label: 'Evaluasi Mata Kuliah' },
        ]
    },
    {
        name: 'Manajemen Pengguna',
        icon: Users,
        resources: [
            { id: 'dosen_pengampu', label: 'Dosen Pengampu' },
            { id: 'kaprodi_data', label: 'Data Kaprodi' },
            { id: 'mahasiswa', label: 'Mahasiswa' },
            { id: 'users', label: 'Pengguna Sistem' },
        ]
    },
    {
        name: 'Sistem & Referensi',
        icon: Settings,
        resources: [
            { id: 'role_access', label: 'Akses Role' },
            { id: 'fakultas', label: 'Data Fakultas' },
        ]
    },
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

const DefaultRoleAccessPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [hasCustomDefaults, setHasCustomDefaults] = useState(false);

    useEffect(() => {
        loadDefaults();
    }, []);

    const loadDefaults = async () => {
        setLoading(true);
        try {
            const data = await fetchDefaultPermissions();
            if (data && data.length > 0) {
                setPermissions(data);
                setHasCustomDefaults(true);
            } else {
                // No defaults yet, initialize from hardcoded
                await handleInitialize();
            }
        } catch (error) {
            console.error('Error loading defaults:', error);
            toast.error('Gagal memuat default permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async () => {
        setSaving(true);
        try {
            const result = await initializeDefaultPermissions();
            setPermissions(result.defaults);
            setHasCustomDefaults(true);
            toast.success('Default permissions berhasil diinisialisasi dari sistem');
        } catch (error) {
            console.error('Error initializing:', error);
            toast.error('Gagal menginisialisasi default permissions');
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (role: string, resource: string, action: string) => {
        setPermissions(prev => {
            const existing = prev.find(p => p.role === role && p.resource === resource && p.action === action);
            if (existing) {
                return prev.map(p =>
                    p.role === role && p.resource === resource && p.action === action
                        ? { ...p, isEnabled: !p.isEnabled }
                        : p
                );
            } else {
                return [...prev, { role, resource, action, isEnabled: true }];
            }
        });
    };

    const isPermissionEnabled = (role: string, resource: string, action: string): boolean => {
        const perm = permissions.find(p => p.role === role && p.resource === resource && p.action === action);
        return perm?.isEnabled ?? false;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Group permissions by role and save each
            for (const role of ROLES) {
                const rolePerms = permissions
                    .filter(p => p.role === role.id)
                    .map(p => ({
                        resource: p.resource,
                        action: p.action,
                        isEnabled: p.isEnabled
                    }));

                if (rolePerms.length > 0) {
                    await updateRoleDefaultPermissions(role.id, rolePerms);
                }
            }
            toast.success('Default permissions berhasil disimpan');
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Gagal menyimpan default permissions');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const data = await exportDefaultPermissions();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `default-permissions-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Default permissions berhasil diexport');
        } catch (error) {
            console.error('Error exporting:', error);
            toast.error('Gagal export default permissions');
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await importDefaultPermissions(data);
            await loadDefaults();
            toast.success('Default permissions berhasil diimport');
        } catch (error) {
            console.error('Error importing:', error);
            toast.error('Gagal import default permissions');
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <DashboardPage title="Default Akses Role" description="Kelola default permission untuk reset role access">
            <div className="space-y-6">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Halaman ini untuk mengatur <strong>default permissions</strong> yang akan digunakan saat tombol
                        "Reset ke Default" diklik di halaman Akses Role. Ubah sesuai kebutuhan dan simpan.
                    </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Semua
                        </Button>
                        <Button onClick={handleInitialize} variant="outline" disabled={saving}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset ke Sistem Default
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <label>
                                <Upload className="w-4 h-4 mr-2" />
                                Import
                                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                            </label>
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="admin">
                    <TabsList className="grid w-full grid-cols-4">
                        {ROLES.map(role => (
                            <TabsTrigger key={role.id} value={role.id}>
                                {role.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {ROLES.map(role => (
                        <TabsContent key={role.id} value={role.id}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Default Permission: {role.label}</CardTitle>
                                    <CardDescription>
                                        Atur default permission untuk role {role.label.toLowerCase()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {RESOURCE_CATEGORIES.map(category => {
                                        const Icon = category.icon;
                                        return (
                                            <div key={category.name}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Icon className="w-5 h-5 text-muted-foreground" />
                                                    <h3 className="font-semibold">{category.name}</h3>
                                                </div>
                                                <div className="ml-7 space-y-2">
                                                    {category.resources.map(resource => (
                                                        <div key={resource.id} className="flex items-center justify-between py-2 border-b">
                                                            <span className="text-sm font-medium">{resource.label}</span>
                                                            <div className="flex gap-4">
                                                                {ACTIONS.map(action => (
                                                                    <label key={action} className="flex items-center gap-2 cursor-pointer">
                                                                        <Checkbox
                                                                            checked={isPermissionEnabled(role.id, resource.id, action)}
                                                                            onCheckedChange={() => togglePermission(role.id, resource.id, action)}
                                                                        />
                                                                        <span className="text-sm capitalize">{action}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        <strong>Catatan:</strong> Perubahan di halaman ini tidak langsung mempengaruhi permission aktif pengguna.
                        Default ini hanya digunakan saat admin mengklik "Reset ke Default" di halaman Akses Role.
                    </AlertDescription>
                </Alert>
            </div>
        </DashboardPage>
    );
};

export default DefaultRoleAccessPage;
