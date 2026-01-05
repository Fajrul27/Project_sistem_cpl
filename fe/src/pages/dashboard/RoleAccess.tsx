
import { useState, useRef, useEffect, useMemo } from "react";
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

const RoleAccessPage = () => {
    const { permissions, loading, updatePermission, initializePermissions, saveChanges, hasChanges } = useRoleAccess();
    const { refreshPermissions } = usePermission();
    const [activeRole, setActiveRole] = useState("");
    const [roles, setRoles] = useState<Array<{ id: string; name: string; displayName: string }>>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Create O(1) lookup map for permissions
    // Key: `${roleId}:${resourceId}:${actionId}`
    const permissionMap = useMemo(() => {
        const map = new Set<string>();
        permissions.forEach(p => {
            if (p.isEnabled) {
                map.add(`${p.roleId}:${p.resource}:${p.action}`);
            }
        });
        return map;
    }, [permissions]);

    // Fetch roles on mount
    useEffect(() => {
        const loadRoles = async () => {
            try {
                const response = await api.get('/roles');
                const rolesData = response.data || response;
                if (Array.isArray(rolesData)) {
                    setRoles(rolesData);
                    // Set first role as active
                    if (rolesData.length > 0) {
                        setActiveRole(rolesData[0].id);
                    }
                } else {
                    console.error('[RoleAccess] Invalid response format:', response);
                }
            } catch (error) {
                console.error('[RoleAccess] Error fetching roles:', error);
                toast.error('Gagal memuat data role: ' + (error as Error).message);
            } finally {
                setRolesLoading(false);
            }
        };
        loadRoles();
    }, []);

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

    if ((loading && permissions.length === 0) || rolesLoading) {
        return (
            <DashboardPage title="Akses Role">
                <LoadingScreen fullScreen={false} message="Memuat data hak akses..." />
            </DashboardPage>
        );
    }

    // Fast O(1) lookup
    const isPermissionEnabled = (roleId: string, resource: string, action: string) => {
        return permissionMap.has(`${roleId}:${resource}:${action}`);
    };

    // Handle select all for a specific action across all resources
    const handleSelectAllAction = (roleId: string, action: string, checked: boolean) => {
        ALL_RESOURCES.forEach(resource => {
            updatePermission(roleId, resource.id, action, checked);
        });
    };

    // Check if all resources are enabled for a specific action (Optimized)
    const isAllActionEnabled = (roleId: string, action: string) => {
        return ALL_RESOURCES.every(resource =>
            // Direct map lookup is fast enough to run in loop
            permissionMap.has(`${roleId}:${resource.id}:${action}`)
        );
    };

    // Handle select all for a category + action
    const handleSelectCategoryAction = (roleId: string, categoryResources: any[], action: string, checked: boolean) => {
        categoryResources.forEach(resource => {
            updatePermission(roleId, resource.id, action, checked);
        });
    };

    // Check if all resources in a category are enabled for a specific action (Optimized)
    const isCategoryActionEnabled = (roleId: string, categoryResources: any[], action: string) => {
        return categoryResources.every(resource =>
            permissionMap.has(`${roleId}:${resource.id}:${action}`)
        );
    };

    // Render content only for the active role to avoid DOM bloat
    const renderRoleContent = (role: { id: string, name: string, displayName: string }) => {
        if (role.id !== activeRole) return null;

        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Hak Akses {role.displayName || role.name}</CardTitle>
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
                            // Check enabled count using the map for header subtitle
                            const enabledCount = category.resources.reduce((acc, res) => {
                                // Count how many actions are enabled for this resource
                                const actionsEnabled = ACTIONS.filter(a => permissionMap.has(`${role.id}:${res.id}:${a.id}`)).length;
                                return acc + (actionsEnabled > 0 ? 1 : 0);
                            }, 0);

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

    return (
        <TooltipProvider>
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
                        <TabsList className="inline-flex w-full justify-start overflow-x-auto">
                            {roles.map(role => (
                                <TabsTrigger key={role.id} value={role.id}>{role.displayName || role.name}</TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Optimazation: Render content only for the active role */}
                        {roles.map(role => (
                            <TabsContent key={role.id} value={role.id}>
                                {role.id === activeRole && renderRoleContent(role)}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </DashboardPage>
        </TooltipProvider>
    );
};

export default RoleAccessPage;
