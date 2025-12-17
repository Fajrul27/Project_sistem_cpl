
import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { RefreshCw } from "lucide-react";

const RESOURCES = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'visi_misi', label: 'Visi & Misi' },
    { id: 'profil_lulusan', label: 'Profil Lulusan' },
    { id: 'cpl', label: 'CPL & Mapping' },
    { id: 'mata_kuliah', label: 'Mata Kuliah' },
    { id: 'cpmk', label: 'CPMK & Mapping' },
    { id: 'nilai_teknik', label: 'Input Nilai Teknik' },
    { id: 'kuesioner', label: 'Kuesioner CPL' },
    { id: 'dosen_pengampu', label: 'Manajemen Dosen Pengampu' },
    { id: 'kaprodi_data', label: 'Data Kaprodi' },
    { id: 'mahasiswa', label: 'Data Mahasiswa' },
    { id: 'users', label: 'Manajemen Pengguna' },
    { id: 'transkrip_cpl', label: 'Laporan: Transkrip CPL' },
    { id: 'analisis_cpl', label: 'Laporan: Analisis CPL' },
    { id: 'rekap_kuesioner', label: 'Laporan: Rekap Kuesioner' },
    { id: 'settings', label: 'Pengaturan Sistem' },
];

const ACTIONS = [
    { id: 'view', label: 'View' },
    { id: 'create', label: 'Create' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete' },
];

const ROLES = [
    { id: 'admin', label: 'Admin' },
    { id: 'kaprodi', label: 'Kaprodi' },
    { id: 'dosen', label: 'Dosen' },
    { id: 'mahasiswa', label: 'Mahasiswa' },
];

const RoleAccessPage = () => {
    const { permissions, loading, updatePermission, initializePermissions, fetchPermissions } = useRoleAccess();
    const [activeRole, setActiveRole] = useState("admin");

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
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => initializePermissions()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset / Inisialisasi Default
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
