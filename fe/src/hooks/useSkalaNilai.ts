import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SkalaNilai {
    id: string;
    huruf: string;

    nilaiMin: number;
    nilaiMax: number;
    isActive: boolean;
    isSystem: boolean;
    isLulus: boolean;
}

export const useSkalaNilai = () => {
    const [skalaNilaiList, setSkalaNilaiList] = useState<SkalaNilai[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSkalaNilai = async () => {
        try {
            setLoading(true);
            const response = await api.get('/skala-nilai');
            setSkalaNilaiList(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to fetch skala nilai', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkalaNilai();
    }, []);

    // Helper to get grade based on score
    const getGrade = useCallback((score: number) => {
        if (skalaNilaiList.length === 0) return '-';

        const sorted = [...skalaNilaiList].sort((a, b) => b.nilaiMin - a.nilaiMin);

        for (const grade of sorted) {
            if (score >= grade.nilaiMin) {
                return grade.huruf;
            }
        }

        return 'E';
    }, [skalaNilaiList]);

    const createSkalaNilai = async (data: Partial<SkalaNilai>) => {
        try {
            await api.post('/skala-nilai', data);
            fetchSkalaNilai();
            return { success: true };
        } catch (error) {
            console.error('Create failed', error);
            return { success: false, error };
        }
    };

    const updateSkalaNilai = async (id: string, data: Partial<SkalaNilai>) => {
        try {
            await api.put(`/skala-nilai/${id}`, data);
            fetchSkalaNilai();
            return { success: true };
        } catch (error) {
            console.error('Update failed', error);
            return { success: false, error };
        }
    };

    const deleteSkalaNilai = async (id: string) => {
        try {
            await api.delete(`/skala-nilai/${id}`);
            fetchSkalaNilai();
            return { success: true };
        } catch (error) {
            console.error('Delete failed', error);
            return { success: false, error };
        }
    };

    return {
        skalaNilaiList,
        loading,
        fetchSkalaNilai,
        getGrade,
        createSkalaNilai,
        updateSkalaNilai,
        deleteSkalaNilai
    };
};
