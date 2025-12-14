import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export interface Cpl {
    id: string;
    kodeCpl: string;
    deskripsi: string;
}

export function useKuesioner() {
    const { role, profile, loading: roleLoading } = useUserRole();
    const [cplList, setCplList] = useState<Cpl[]>([]);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Assuming current semester/year (should be fetched from system settings in real app)
    const currentSemester = profile?.semester || 1;
    const currentTahunAjaran = "2024/2025 Ganjil";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch CPLs
            const cplRes = await api.get("/cpl");
            setCplList(cplRes.data || cplRes); // Handle both formats

            // Fetch existing responses
            const existingRes = await api.get("/kuesioner/me", {
                params: {
                    semester: currentSemester,
                    tahunAjaran: currentTahunAjaran
                }
            });

            const existingData = Array.isArray(existingRes) ? existingRes : existingRes.data;

            if (existingData && existingData.length > 0) {
                setHasSubmitted(true);
                const initialResponses: Record<string, number> = {};
                existingData.forEach((item: any) => {
                    initialResponses[item.cplId] = item.nilai;
                });
                setResponses(initialResponses);
            } else {
                // Initialize with default values (e.g., 50)
                const initialResponses: Record<string, number> = {};
                const cpls = Array.isArray(cplRes) ? cplRes : (cplRes.data || []);
                cpls.forEach((cpl: Cpl) => {
                    initialResponses[cpl.id] = 50;
                });
                setResponses(initialResponses);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Gagal memuat data kuesioner");
        } finally {
            setLoading(false);
        }
    }, [currentSemester, currentTahunAjaran]);

    useEffect(() => {
        if (!roleLoading && role === "mahasiswa") {
            fetchData();
        }
    }, [role, roleLoading, currentSemester, fetchData]);

    const handleSliderChange = (cplId: string, value: number[]) => {
        setResponses(prev => ({
            ...prev,
            [cplId]: value[0]
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                semester: currentSemester,
                tahunAjaran: currentTahunAjaran,
                nilai: Object.entries(responses).map(([cplId, nilai]) => ({
                    cplId,
                    nilai
                }))
            };

            await api.post("/kuesioner", payload);
            toast.success("Kuesioner berhasil disimpan");
            setHasSubmitted(true);
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Gagal menyimpan kuesioner");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        role,
        cplList,
        responses,
        loading,
        submitting,
        hasSubmitted,
        currentSemester,
        currentTahunAjaran,
        handleSliderChange,
        handleSubmit
    };
}
