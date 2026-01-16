import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface TargetCPL {
    id: string;
    cplId: string;
    target: number;
    cpl: {
        id: string;
        kodeCpl: string;
        deskripsi: string;
    };
}

export interface EvaluationItem {
    cplId: string;
    kodeCpl: string;
    deskripsi: string;
    target: number;
    actual: number;
    status: 'Tercapai' | 'Tidak Tercapai';
    passPercentage: number;
    courseBreakdown: {
        kodeMk: string;
        namaMk: string;
        averageScore: number;
    }[];
    tindakLanjut: {
        id: string;
        akarMasalah: string;
        rencanaPerbaikan: string;
        penanggungJawab: string;
        targetSemester: string;
        status: string;
    } | null;
}

export function useEvaluasiCPL() {
    const [loading, setLoading] = useState(false);
    const [targets, setTargets] = useState<TargetCPL[]>([]);
    const [evaluation, setEvaluation] = useState<EvaluationItem[]>([]);
    const [summary, setSummary] = useState({ totalCpl: 0, tercapai: 0, tidakTercapai: 0 });

    const fetchTargets = useCallback(async (params: { prodiId: string; angkatan: string; tahunAjaran: string; semester?: string }) => {
        setLoading(true);
        try {
            const apiParams = { ...params, tahunAjaranId: params.tahunAjaran };
            delete (apiParams as any).tahunAjaran;
            const response = await api.get('/evaluasi-cpl/targets', { params: apiParams });
            setTargets(response.data || []);
        } catch (error: any) {
            toast.error("Gagal memuat target CPL");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveTargets = useCallback(async (payload: { prodiId: string; angkatan: string; tahunAjaran: string; semester?: string; targets: { cplId: string; target: number }[] }) => {
        setLoading(true);
        try {
            const apiPayload = { ...payload, tahunAjaranId: payload.tahunAjaran };
            delete (apiPayload as any).tahunAjaran;
            await api.post('/evaluasi-cpl/targets', apiPayload);
            toast.success("Target CPL berhasil disimpan");
            return true;
        } catch (error: any) {
            toast.error("Gagal menyimpan target CPL");
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEvaluation = useCallback(async (params: { prodiId: string; angkatan: string; tahunAjaran: string; semester?: string }) => {
        setLoading(true);
        try {
            const apiParams = { ...params, tahunAjaranId: params.tahunAjaran };
            delete (apiParams as any).tahunAjaran;
            const response = await api.get('/evaluasi-cpl/evaluation', { params: apiParams });
            setEvaluation(response.evaluation || []);
            setSummary(response.summary || { totalCpl: 0, tercapai: 0, tidakTercapai: 0 });
        } catch (error: any) {
            toast.error("Gagal memuat evaluasi CPL");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveTindakLanjut = useCallback(async (payload: any) => {
        setLoading(true);
        try {
            await api.post('/evaluasi-cpl/tindak-lanjut', payload);
            toast.success("Tindak lanjut berhasil disimpan");
            return true;
        } catch (error: any) {
            toast.error("Gagal menyimpan tindak lanjut");
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const resetEvaluation = useCallback(() => {
        setEvaluation([]);
        setSummary({ totalCpl: 0, tercapai: 0, tidakTercapai: 0 });
        setTargets([]);
    }, []);

    return {
        loading,
        targets,
        evaluation,
        summary,
        fetchTargets,
        saveTargets,
        fetchEvaluation,
        saveTindakLanjut,
        resetEvaluation
    };
}
