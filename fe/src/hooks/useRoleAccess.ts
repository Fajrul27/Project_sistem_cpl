
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface RolePermission {
    id: string;
    roleId: string;
    role?: { id: string; name: string; };
    resource: string;
    action: string;
    isEnabled: boolean;
}

export const useRoleAccess = () => {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<RolePermission[]>([]);

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/role-access');
            if (Array.isArray(res)) {
                setPermissions(res);
                setPendingChanges(res); // Initialize pending changes
                setHasChanges(false);
            } else {
                setPermissions([]);
                setPendingChanges([]);
                console.error('Invalid permissions format:', res);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Gagal memuat data hak akses');
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePermission = (role: string, resource: string, action: string, isEnabled: boolean) => {
        setPendingChanges(prev => prev.map(p =>
            (p.roleId === role && p.resource === resource && p.action === action)
                ? { ...p, isEnabled }
                : p
        ));
        setHasChanges(true);
    };

    const saveChanges = async () => {
        try {
            // Only send changed items or all items (sending all is simpler for now since backend handles upsert)
            // Ideally we track diffs, but for < 100 items sending all is fine.
            await api.put('/role-access', pendingChanges);

            setPermissions(pendingChanges);
            setHasChanges(false);
            toast.success('Hak akses berhasil disimpan');
        } catch (error) {
            console.error('Error saving permissions:', error);
            toast.error('Gagal menyimpan perubahan');
        }
    };

    const initializePermissions = async () => {
        try {
            await api.post('/role-access/init', {});
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
        permissions: pendingChanges, // UI uses pending state
        loading,
        hasChanges,
        fetchPermissions,
        updatePermission,
        saveChanges,
        initializePermissions
    };
};
