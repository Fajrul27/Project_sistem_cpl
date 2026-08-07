import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ImpersonationState {
    isImpersonating: boolean;
    originalAdmin: {
        id: string;
        email: string;
    } | null;
}

export const useImpersonation = () => {
    const [impersonationState, setImpersonationState] = useState<ImpersonationState>({
        isImpersonating: false,
        originalAdmin: null
    });
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    // Check impersonation state on mount
    useEffect(() => {
        checkImpersonationState();
    }, []);

    const checkImpersonationState = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                const impersonationData = localStorage.getItem('impersonation');
                if (impersonationData) {
                    const parsed = JSON.parse(impersonationData);
                    // If user logged in is already admin or matches originalAdmin, clear stale state
                    if (data.user?.id === parsed.originalAdmin?.id || (data.user?.role?.role?.toLowerCase() === 'admin' && data.user?.email === parsed.originalAdmin?.email)) {
                        localStorage.removeItem('impersonation');
                        setImpersonationState({ isImpersonating: false, originalAdmin: null });
                    } else {
                        setImpersonationState(parsed);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check impersonation state:', error);
        }
    };

    const loginAsUser = async (userId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login-as/${userId}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal login sebagai user');
            }

            // Store impersonation state
            const impersonationData = {
                isImpersonating: true,
                originalAdmin: data.originalAdmin
            };

            localStorage.setItem('impersonation', JSON.stringify(impersonationData));
            setImpersonationState(impersonationData);

            toast.success(data.message || 'Berhasil login sebagai user');

            // Reload page to refresh all data
            window.location.href = '/dashboard';

            return true;
        } catch (error: any) {
            console.error('Login as user error:', error);
            toast.error(error.message || 'Gagal login sebagai user');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const returnToAdmin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/return-to-admin`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            // Always clear local storage state
            localStorage.removeItem('impersonation');
            setImpersonationState({
                isImpersonating: false,
                originalAdmin: null
            });

            if (!response.ok) {
                if (response.status === 400) {
                    toast.info('Sesi sudah berada di akun admin');
                    window.location.href = '/dashboard';
                    return true;
                }
                throw new Error(data.error || 'Gagal kembali ke akun admin');
            }

            toast.success(data.message || 'Berhasil kembali ke akun admin');
            window.location.href = '/dashboard';
            return true;
        } catch (error: any) {
            console.error('Return to admin error:', error);
            localStorage.removeItem('impersonation');
            setImpersonationState({
                isImpersonating: false,
                originalAdmin: null
            });
            window.location.href = '/dashboard';
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        isImpersonating: impersonationState.isImpersonating,
        originalAdmin: impersonationState.originalAdmin,
        loading,
        loginAsUser,
        returnToAdmin
    };
};
