import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export interface EvaluasiData {
    id?: string;
    mataKuliahId: string;
    semester: number;
    tahunAjaran: string;
    kendala: string;
    rencanaPerbaikan: string;
    status: string;
    feedbackKaprodi?: string;
    dosen?: {
        profile?: {
            namaLengkap: string;
        }
    }
}

export function useEvaluasiMK() {
    const { mataKuliahId } = useParams<{ mataKuliahId: string }>();
    const navigate = useNavigate();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default current semester/year (should be dynamic in real app)
    const currentSemester = 1;
    const currentTahunAjaran = "2024/2025";

    const [evaluasi, setEvaluasi] = useState<EvaluasiData>({
        mataKuliahId: mataKuliahId || "",
        semester: currentSemester,
        tahunAjaran: currentTahunAjaran,
        kendala: "",
        rencanaPerbaikan: "",
        status: "submitted"
    });

    const fetchData = useCallback(async () => {
        if (!mataKuliahId) return;

        setLoading(true);
        try {
            const res = await api.get(`/evaluasi/mata-kuliah/${mataKuliahId}`, {
                params: { semester: currentSemester, tahunAjaran: currentTahunAjaran }
            });

            if (res.data && res.data.length > 0) {
                // Use the latest evaluation
                setEvaluasi(res.data[0]);
            }
        } catch (error) {
            console.error("Error fetching evaluasi:", error);
        } finally {
            setLoading(false);
        }
    }, [mataKuliahId, currentSemester, currentTahunAjaran]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!evaluasi.rencanaPerbaikan) {
                toast.error("Rencana perbaikan wajib diisi");
                setSaving(false);
                return;
            }

            if (role === 'kaprodi' && evaluasi.id) {
                // Kaprodi Review Mode
                await api.put(`/evaluasi/${evaluasi.id}/review`, {
                    feedbackKaprodi: evaluasi.feedbackKaprodi
                });
                toast.success("Feedback berhasil dikirim");
            } else {
                // Dosen Submit Mode
                await api.post("/evaluasi", {
                    mataKuliahId,
                    semester: currentSemester,
                    tahunAjaran: currentTahunAjaran,
                    kendala: evaluasi.kendala,
                    rencanaPerbaikan: evaluasi.rencanaPerbaikan
                });
                toast.success("Evaluasi berhasil disimpan");
            }
            navigate(-1);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    const isKaprodi = role === 'kaprodi' || role === 'admin';
    const isDosen = role === 'dosen';

    return {
        evaluasi,
        setEvaluasi,
        loading,
        saving,
        handleSave,
        navigate,
        isKaprodi,
        isDosen,
        currentSemester,
        currentTahunAjaran,
        mataKuliahId // Exported in case needed
    };
}
