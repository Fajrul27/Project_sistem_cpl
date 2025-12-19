
import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { usePermission } from "@/contexts/PermissionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { RefreshCw, Save } from "lucide-react";

const RESOURCES = [
    // Dashboard
    { id: 'dashboard', label: 'Dashboard' },

    // Master Data & Perencanaan
    { id: 'visi_misi', label: 'Visi & Misi' },
    { id: 'profil_lulusan', label: 'Profil Lulusan' },
    { id: 'cpl', label: 'CPL & Mapping PL - CPL' },
    { id: 'mata_kuliah', label: 'Mata Kuliah' },

    // Persiapan & Pembelajaran
    { id: 'cpmk', label: 'CPMK & Mapping CPMK - CPL' },
    { id: 'nilai_teknik', label: 'Input Nilai Teknik' },
    { id: 'kuesioner', label: 'Isi Kuesioner CPL' },

    // Laporan & Evaluasi
    { id: 'transkrip_cpl', label: 'Capaian Pembelajaran' },
    { id: 'analisis_cpl', label: 'Analisis CPL' },
    { id: 'evaluasi_cpl', label: 'Evaluasi CPL' },
    { id: 'rekap_kuesioner', label: 'Rekap Kuesioner' },

    // Manajemen Pengguna
    { id: 'dosen_pengampu', label: 'Dosen Pengampu' },
    { id: 'kaprodi_data', label: 'Data Kaprodi' },
    { id: 'mahasiswa', label: 'Mahasiswa' },
    { id: 'users', label: 'Pengguna Sistem' },

    // Sistem
    { id: 'role_access', label: 'Akses Role' },

    // Internal / Extras
    { id: 'evaluasi_mk', label: 'Evaluasi Mata Kuliah' },
    { id: 'fakultas', label: 'Data Fakultas' },
];

const ACTIONS = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
    { id: 'view_all', label: 'View All' },
    { id: 'verify', label: 'Verify' },
];

const ROLES = [
    { id: 'admin', label: 'Admin' },
    { id: 'kaprodi', label: 'Kaprodi' },
    { id: 'dosen', label: 'Dosen' },
    { id: 'mahasiswa', label: 'Mahasiswa' },
];

const RoleAccessPage = () => {
    const { permissions, loading, updatePermission, initializePermissions, saveChanges, hasChanges } = useRoleAccess();
    const { refreshPermissions } = usePermission();
    const [activeRole, setActiveRole] = useState("admin");

    const handleSave = async () => {
        try {
            await saveChanges();
            // Force a slight delay to ensure backend transaction is committed
            await new Promise(resolve => setTimeout(resolve, 500));
            await refreshPermissions();
        } catch (error) {
            console.error("Failed to save or refresh permissions:", error);
        }
    };

    if (loading && permissions.length === 0) {
        return (
            <DashboardPage title="Akses Role">
                <LoadingScreen fullScreen={false} message="Memuat data hak akses..." />
            </DashboardPage>
        );
    }

    const isPermissionEnabled = (role: string, resource: string, action: string) => {
        return permissions.find(p => p.role === role && p.resource === resource && p.action === action)?.isEnabled || false;
    };

    return (
        <DashboardPage
            title="Manajemen Akses Role"
            description="Atur hak akses untuk setiap role terhadap fitur-fitur sistem."
        >
            <div className="space-y-6">
                <div className="flex justify-end gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        variant={hasChanges ? "default" : "secondary"}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                    </Button>
                    <Button variant="outline" onClick={() => initializePermissions()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset Default
                    </Button>
                </div>

                <Tabs value={activeRole} onValueChange={setActiveRole} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        {ROLES.map(role => (
                            <TabsTrigger key={role.id} value={role.id}>{role.label}</TabsTrigger>
                        ))}
                    </TabsList>

                    {ROLES.map(role => (
                        <TabsContent key={role.id} value={role.id}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hak Akses {role.label}</CardTitle>
                                    <CardDescription>
                                        Centang box untuk memberikan akses pada fitur tertentu.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[300px]">Fitur / Resource</TableHead>
                                                {ACTIONS.map(action => (
                                                    <TableHead key={action.id} className="text-center">{action.label}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {RESOURCES.map(resource => (
                                                <TableRow key={resource.id}>
                                                    <TableCell className="font-medium">{resource.label}</TableCell>
                                                    {ACTIONS.map(action => (
                                                        <TableCell key={action.id} className="text-center">
                                                            <Checkbox
                                                                checked={isPermissionEnabled(role.id, resource.id, action.id)}
                                                                onCheckedChange={(checked) =>
                                                                    updatePermission(role.id, resource.id, action.id, checked as boolean)
                                                                }
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </DashboardPage>
    );
};

export default RoleAccessPage;
