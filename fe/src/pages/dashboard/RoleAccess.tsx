
import { useState, useRef } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { usePermission } from "@/contexts/PermissionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import {
    RefreshCw,
    Save,
    Download,
    Upload,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Database,
    GraduationCap,
    FileText,
    Users,
    Settings,
    Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";


// Grouped resource structure
const RESOURCE_CATEGORIES = [
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        resources: [
            { id: 'dashboard', label: 'Dashboard' },
        ]
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
            { id: 'default_role_access', label: 'Default Akses Role' },
            { id: 'fakultas', label: 'Data Fakultas' },
        ]
    },
];

// Flatten all resources for easy access
const ALL_RESOURCES = RESOURCE_CATEGORIES.flatMap(cat => cat.resources);

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleExport = async () => {
        try {
            const response = await fetch('/api/role-access/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `permissions-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Permissions exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export permissions');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate structure
            if (!data.permissions || !Array.isArray(data.permissions)) {
                toast.error('Invalid file format');
                return;
            }

            // Confirm before import
            const confirmed = window.confirm(
                `Import ${data.permissions.length} permissions?\n\n` +
                `This will overwrite current permissions. Continue?`
            );

            if (!confirmed) return;

            await api.post('/role-access/import', {
                permissions: data.permissions,
                overwrite: true
            });

            toast.success('Permissions imported successfully');
            await new Promise(resolve => setTimeout(resolve, 500));
            await refreshPermissions();
            window.location.reload(); // Reload to refresh all permission state
        } catch (error: any) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.error || 'Failed to import permissions');
        } finally {
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
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

    // Handle select all for a specific action across all resources
    const handleSelectAllAction = (role: string, action: string, checked: boolean) => {
        ALL_RESOURCES.forEach(resource => {
            updatePermission(role, resource.id, action, checked);
        });
    };

    // Check if all resources are enabled for a specific action
    const isAllActionEnabled = (role: string, action: string) => {
        return ALL_RESOURCES.every(resource =>
            isPermissionEnabled(role, resource.id, action)
        );
    };

    // Handle select all for a category + action
    const handleSelectCategoryAction = (role: string, categoryResources: any[], action: string, checked: boolean) => {
        categoryResources.forEach(resource => {
            updatePermission(role, resource.id, action, checked);
        });
    };

    // Check if all resources in a category are enabled for a specific action
    const isCategoryActionEnabled = (role: string, categoryResources: any[], action: string) => {
        return categoryResources.every(resource =>
            isPermissionEnabled(role, resource.id, action)
        );
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
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
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
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Hak Akses {role.label}</CardTitle>
                                    <CardDescription className="text-sm">
                                        Klik kategori untuk expand/collapse. Centang checkbox untuk memberikan akses.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Global Select All Section */}
                                    <div className="border rounded-lg p-4 bg-muted/20">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-sm">Select All Permissions</h3>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {ACTIONS.map(action => (
                                                <div key={action.id} className="flex flex-col items-center gap-1.5 p-2 rounded border bg-background hover:bg-muted/50 transition-colors">
                                                    <Checkbox
                                                        checked={isAllActionEnabled(role.id, action.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleSelectAllAction(role.id, action.id, checked as boolean)
                                                        }
                                                        id={`all-${action.id}-${role.id}`}
                                                    />
                                                    <label
                                                        htmlFor={`all-${action.id}-${role.id}`}
                                                        className="text-xs font-medium cursor-pointer select-none"
                                                    >
                                                        {action.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Collapsible Categories */}
                                    <Accordion type="multiple" className="space-y-2" defaultValue={RESOURCE_CATEGORIES.map((_, idx) => `category-${idx}`)}>
                                        {RESOURCE_CATEGORIES.map((category, idx) => {
                                            const Icon = category.icon;
                                            return (
                                                <AccordionItem
                                                    key={`category-${idx}`}
                                                    value={`category-${idx}`}
                                                    className="border rounded-lg overflow-hidden"
                                                >
                                                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <Icon className="w-5 h-5 text-primary" />
                                                            <span className="font-semibold text-sm">{category.name}</span>
                                                            <span className="text-xs text-muted-foreground ml-auto mr-4">
                                                                ({category.resources.length} fitur)
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 pb-4 pt-2">
                                                        {/* Category-level Select All */}
                                                        <div className="mb-3 p-3 bg-muted/30 rounded-lg border">
                                                            <p className="text-xs font-medium mb-2 text-muted-foreground">Select untuk semua fitur di kategori ini:</p>
                                                            <div className="grid grid-cols-6 gap-2">
                                                                {ACTIONS.map(action => (
                                                                    <div key={action.id} className="flex items-center gap-1.5 justify-center">
                                                                        <Checkbox
                                                                            checked={isCategoryActionEnabled(role.id, category.resources, action.id)}
                                                                            onCheckedChange={(checked) =>
                                                                                handleSelectCategoryAction(role.id, category.resources, action.id, checked as boolean)
                                                                            }
                                                                            id={`cat-${idx}-${action.id}-${role.id}`}
                                                                        />
                                                                        <label
                                                                            htmlFor={`cat-${idx}-${action.id}-${role.id}`}
                                                                            className="text-xs cursor-pointer select-none"
                                                                        >
                                                                            {action.label}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Resources Table */}
                                                        <div className="border rounded-lg overflow-hidden">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="bg-muted/50">
                                                                        <TableHead className="w-[40%] font-semibold">Fitur</TableHead>
                                                                        {ACTIONS.map(action => (
                                                                            <TableHead key={action.id} className="text-center text-xs font-semibold">
                                                                                {action.label}
                                                                            </TableHead>
                                                                        ))}
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {category.resources.map(resource => (
                                                                        <TableRow key={resource.id} className="hover:bg-muted/30">
                                                                            <TableCell className="font-medium text-sm">
                                                                                {resource.label}
                                                                            </TableCell>
                                                                            {ACTIONS.map(action => (
                                                                                <TableCell key={action.id} className="text-center">
                                                                                    <div className="flex justify-center">
                                                                                        <Checkbox
                                                                                            checked={isPermissionEnabled(role.id, resource.id, action.id)}
                                                                                            onCheckedChange={(checked) =>
                                                                                                updatePermission(role.id, resource.id, action.id, checked as boolean)
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </TableCell>
                                                                            ))}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
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
