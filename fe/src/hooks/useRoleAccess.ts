
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface RolePermission {
    id: string;
    role: string;
    resource: string;
    action: string;
    isEnabled: boolean;
}

export const useRoleAccess = () => {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/role-access');
            if (Array.isArray(res)) {
                setPermissions(res);
            } else {
                setPermissions([]);
                console.error('Invalid permissions format:', res);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Gagal memuat data hak akses');
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePermission = async (role: string, resource: string, action: string, isEnabled: boolean) => {
        try {
            // Optimistic update
            setPermissions(prev => prev.map(p =>
                (p.role === role && p.resource === resource && p.action === action)
                    ? { ...p, isEnabled }
                    : p
            ));

            await api.put('/role-access', { role, resource, action, isEnabled });
            toast.success('Hak akses diperbarui');

            // Refetch to ensure consistency (optional)
            // fetchPermissions(); 
        } catch (error) {
            console.error('Error updating permission:', error);
            toast.error('Gagal memperbarui hak akses');
            // Revert optimistic update
            fetchPermissions();
        }
    };

    const initializePermissions = async () => {
        try {
            await api.post('/role-access/init');
            toast.success('Hak akses diinisialisasi');
            fetchPermissions();
        } catch (error) {
            console.error('Error initializing permissions:', error);
            toast.error('Gagal inisialisasi hak akses');
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    return {
        permissions,
        loading,
        fetchPermissions,
        updatePermission,
        initializePermissions
    };
};
