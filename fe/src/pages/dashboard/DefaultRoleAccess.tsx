
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { usePermission } from "@/contexts/PermissionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { FilterRequiredState } from "@/components/common/FilterRequiredState";
import {
    RotateCcw,
    Save,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ACTIONS } from "@/constants/permissions";
import { MENU_ITEMS } from "@/constants/menu";

// Transform MENU_ITEMS into the structure expected by the UI
const { RESOURCE_CATEGORIES, ALL_RESOURCES } = (() => {
    const categories: any[] = [];
    const allResources: any[] = [];

    MENU_ITEMS.forEach(item => {
        if (item.items) {
            // It's a group
            const resources = item.items.filter(i => i.resource).map(i => ({
                id: i.resource!,
                label: i.title,
                description: `Akses fitur ${i.title}`
            }));

            if (resources.length > 0) {
                categories.push({
                    name: item.title,
                    icon: item.icon,
                    resources
                });
                allResources.push(...resources);
            }
        } else if (item.resource) {
            // It's a single item (e.g. Dashboard) acting as a category
            const resource = {
                id: item.resource,
                label: item.title,
                description: `Akses fitur ${item.title}`
            };
            categories.push({
                name: item.title,
                icon: item.icon,
                resources: [resource]
            });
            allResources.push(resource);
        }
    });

    return { RESOURCE_CATEGORIES: categories, ALL_RESOURCES: allResources };
})();

interface RolePermission {
    id?: string;
    roleId: string;
    resource: string;
    action: string;
    isEnabled: boolean;
}

const DefaultRoleAccessPage = () => {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [activeRole, setActiveRole] = useState("");
    const [pendingChanges, setPendingChanges] = useState<RolePermission[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch roles
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await api.get('/roles');
                const rolesData = response.data || response;
                if (Array.isArray(rolesData)) {
                    setRoles(rolesData);
                    // if (rolesData.length > 0) setActiveRole(rolesData[0].id);
                }
            } catch (error) {
                console.error('[DefaultRoleAccess] Error fetching roles:', error);
                toast.error('Gagal memuat data role');
            } finally {
                setRolesLoading(false);
            }
        };
        loadRoles();
    }, []);

    // Fetch default permissions
    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/role-access/defaults');
            if (Array.isArray(res)) {
                setPermissions(res);
                setPendingChanges(res);
                setHasChanges(false);
            }
        } catch (error) {
            console.error('Error fetching default permissions:', error);
            toast.error('Gagal memuat data default hak akses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const updatePermission = (roleId: string, resource: string, action: string, isEnabled: boolean) => {
        setPendingChanges(prev => {
            const existingIndex = prev.findIndex(p => p.roleId === roleId && p.resource === resource && p.action === action);
            if (existingIndex >= 0) {
                const newArr = [...prev];
                newArr[existingIndex] = { ...newArr[existingIndex], isEnabled };
                return newArr;
            } else {
                return [...prev, { roleId, resource, action, isEnabled }];
            }
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            await api.put('/role-access/defaults', pendingChanges);
            setPermissions(pendingChanges);
            setHasChanges(false);
            toast.success('Default hak akses berhasil disimpan');
        } catch (error) {
            console.error('Error saving default permissions:', error);
            toast.error('Gagal menyimpan perubahan');
        }
    };

    const handleResetDefaults = async () => {
        if (!window.confirm('APAKAH ANDA YAKIN?\n\nTindakan ini akan me-reset SEMUA konfigurasi default role kembali ke pengaturan awal sistem.\nPerubahan kustom yang Anda buat pada default akan hilang.')) {
            return;
        }

        try {
            setLoading(true);
            await api.post('/role-access/defaults/reset', {});
            toast.success('Default hak akses berhasil di-reset ke sistem');
            // Refresh local data
            await fetchPermissions();
        } catch (error) {
            console.error('Error resetting defaults:', error);
            toast.error('Gagal me-reset defaults');
        } finally {
            setLoading(false);
        }
    };

    // Create O(1) lookup map for permissions
    const permissionMap = useMemo(() => {
        const map = new Set<string>();
        // Use pendingChanges for the UI to reflect immediate updates
        pendingChanges.forEach(p => {
            if (p.isEnabled) {
                map.add(`${p.roleId}:${p.resource}:${p.action}`);
            }
        });
        return map;
    }, [pendingChanges]);

    // UI Helpers (Same as RoleAccessPage)
    const isPermissionEnabled = (roleId: string, resource: string, action: string) => {
        return permissionMap.has(`${roleId}:${resource}:${action}`);
    };

    const isAllActionEnabled = (roleId: string, action: string) => {
        return ALL_RESOURCES.every(resource =>
            permissionMap.has(`${roleId}:${resource.id}:${action}`)
        );
    };

    const handleSelectAllAction = (roleId: string, action: string, checked: boolean) => {
        ALL_RESOURCES.forEach(resource => {
            updatePermission(roleId, resource.id, action, checked);
        });
    };

    const isCategoryActionEnabled = (roleId: string, categoryResources: any[], action: string) => {
        return categoryResources.every(resource =>
            permissionMap.has(`${roleId}:${resource.id}:${action}`)
        );
    };

    const handleSelectCategoryAction = (roleId: string, categoryResources: any[], action: string, checked: boolean) => {
        categoryResources.forEach(resource => {
            updatePermission(roleId, resource.id, action, checked);
        });
    };

    // Render Logic
    const renderRoleContent = (role: { id: string, name: string, displayName: string }) => {
        if (role.id !== activeRole) return null;

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Default Hak Akses {role.displayName || role.name}</CardTitle>
                    <CardDescription className="text-sm">
                        Atur template hak akses yang akan diberikan secara otomatis ketika role ini di-reset atau di-inisialisasi ulang.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Global Select All Section */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-sm">Select All Defaults</h3>
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
                                            <p className="text-xs font-medium mb-2 text-muted-foreground">Select default untuk kategori ini:</p>
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

                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead className="w-[40%] font-semibold">Fitur</TableHead>
                                                        {ACTIONS.map(action => (
                                                            <TableHead key={action.id} className="text-center text-xs font-semibold">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="cursor-help decoration-dotted underline hover:decoration-solid">
                                                                            {action.label}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{action.description}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {category.resources.map(resource => (
                                                        <TableRow key={resource.id} className="hover:bg-muted/30">
                                                            <TableCell className="font-medium text-sm">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="cursor-help">
                                                                            {resource.label}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{resource.description}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
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
        );
    };

    if ((loading && permissions.length === 0) || rolesLoading) {
        return (
            <DashboardPage title="Hak Akses Default Role">
                <LoadingScreen fullScreen={false} message="Memuat data default..." />
            </DashboardPage>
        );
    }

    return (
        <TooltipProvider>
            <DashboardPage
                title="Template Akses Role"
                description="Konfigurasi template hak akses default untuk setiap role."
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
                        <Button variant="outline" onClick={handleResetDefaults} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Default System
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="w-full md:w-[300px]">
                            <Select value={activeRole} onValueChange={setActiveRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.displayName || role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!activeRole && (
                            <Card>
                                <CardContent className="pt-6">
                                    <FilterRequiredState
                                        message="Silakan pilih role terlebih dahulu untuk mengatur default hak akses."
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {roles.map(role => (
                            role.id === activeRole && (
                                <div key={role.id} className="mt-4">
                                    {renderRoleContent(role)}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </DashboardPage>
        </TooltipProvider>
    );
};

export default DefaultRoleAccessPage;
