
import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermission, Permission } from '@/contexts/PermissionContext';
import { DashboardPage } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugAccess = () => {
    const { role, loading: roleLoading } = useUserRole();
    const { permissions, loading: permLoading, can } = usePermission();

    const normalizedRole = role?.toLowerCase();

    // Filter permissions relevant to current user for easier reading
    const myPermissions = permissions.filter(p => p.role?.name?.toLowerCase() === normalizedRole);

    return (
        <DashboardPage title="Debug Access Control">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Current State</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <strong>User Role (Raw):</strong> {role}
                        </div>
                        <div>
                            <strong>User Role (Normalized):</strong> {normalizedRole}
                        </div>
                        <div>
                            <strong>Permissions Loaded:</strong> {permissions.length} items
                        </div>
                        <div>
                            <strong>Loading State:</strong> Role: {roleLoading ? 'Loading' : 'Ready'}, Perms: {permLoading ? 'Loading' : 'Ready'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Can Access Dashboard?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <strong>Check:</strong> can('view', 'dashboard')
                        </div>
                        <div className="text-xl font-bold">
                            Result: {can('view', 'dashboard') ? 'YES' : 'NO'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Permissions ({myPermissions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[500px] text-xs">
                            {JSON.stringify(myPermissions, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions (First 10)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-auto max-h-[500px] text-xs">
                            {JSON.stringify(permissions.slice(0, 10), null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
};

export default DebugAccess;
