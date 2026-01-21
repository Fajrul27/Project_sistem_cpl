import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';

// Define the shape of a permission object
export interface Permission {
    id: string;
    roleId: string;
    role: {
        id: string;
        name: string;
        displayName: string;
    };
    resource: string;
    action: string;
    isEnabled: boolean;
}

interface PermissionContextType {
    permissions: Permission[];
    loading: boolean;
    can: (action: string, resource: string) => boolean;
    refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({ children }: { children: ReactNode }) => {
    const { role } = useUser();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/role-access');
            // The endpoint returns ALL permissions.
            if (Array.isArray(res)) {
                setPermissions(res);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const can = useCallback((action: string, resource: string): boolean => {
        if (!role) return false;

        // Safety: Admin always has access to everything
        if (role === 'admin') return true;

        const permission = permissions.find(p =>
            p.role?.name?.toLowerCase() === role.toLowerCase() &&
            p.resource === resource &&
            p.action === action
        );

        return permission ? permission.isEnabled : false;
    }, [permissions, role]);

    return (
        <PermissionContext.Provider value={{ permissions, loading, can, refreshPermissions: fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermission must be used within a PermissionProvider');
    }
    return context;
};
