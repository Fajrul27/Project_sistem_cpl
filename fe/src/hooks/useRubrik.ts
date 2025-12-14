import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface RubrikLevel {
    id?: string;
    deskripsi: string;
    nilai: number;
    label: string;
}

export interface RubrikKriteria {
    id?: string;
    deskripsi: string;
    bobot: number;
    levels: RubrikLevel[];
}

export interface RubrikData {
    id?: string;
    cpmkId: string;
    deskripsi: string;
    kriteria: RubrikKriteria[];
}

export function useRubrik() {
    const { cpmkId } = useParams<{ cpmkId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cpmkData, setCpmkData] = useState<any>(null);

    const [rubrik, setRubrik] = useState<RubrikData>({
        cpmkId: cpmkId || "",
        deskripsi: "",
        kriteria: []
    });

    const fetchData = useCallback(async () => {
        if (!cpmkId) return;
        setLoading(true);
        try {
            // Fetch CPMK info
            const cpmkRes = await api.get(`/cpmk/${cpmkId}`);
            setCpmkData(cpmkRes.data);

            // Fetch existing Rubrik
            const rubrikRes = await api.get(`/rubrik/${cpmkId}`);
            if (rubrikRes.data) {
                setRubrik(rubrikRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Gagal memuat data");
        }
        finally {
            setLoading(false);
        }
    }, [cpmkId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddKriteria = () => {
        setRubrik(prev => ({
            ...prev,
            kriteria: [
                ...prev.kriteria,
                {
                    deskripsi: "",
                    bobot: 1,
                    levels: [
                        { deskripsi: "Sangat Baik", nilai: 100, label: "A" },
                        { deskripsi: "Baik", nilai: 80, label: "B" },
                        { deskripsi: "Cukup", nilai: 60, label: "C" },
                        { deskripsi: "Kurang", nilai: 40, label: "D" }
                    ]
                }
            ]
        }));
    };

    const handleRemoveKriteria = (index: number) => {
        setRubrik(prev => ({
            ...prev,
            kriteria: prev.kriteria.filter((_, i) => i !== index)
        }));
    };

    const updateKriteria = (index: number, field: keyof RubrikKriteria, value: any) => {
        setRubrik(prev => {
            const newKriteria = [...prev.kriteria];
            newKriteria[index] = { ...newKriteria[index], [field]: value };
            return { ...prev, kriteria: newKriteria };
        });
    };

    const updateLevel = (kriteriaIndex: number, levelIndex: number, field: keyof RubrikLevel, value: any) => {
        setRubrik(prev => {
            const newKriteria = [...prev.kriteria];
            const newLevels = [...newKriteria[kriteriaIndex].levels];
            newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
            newKriteria[kriteriaIndex] = { ...newKriteria[kriteriaIndex], levels: newLevels };
            return { ...prev, kriteria: newKriteria };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate
            if (rubrik.kriteria.length === 0) {
                toast.error("Minimal harus ada 1 kriteria");
                setSaving(false);
                return;
            }

            await api.post("/rubrik", {
                cpmkId: cpmkId,
                deskripsi: rubrik.deskripsi,
                kriteria: rubrik.kriteria
            });
            toast.success("Rubrik berhasil disimpan");
            navigate(-1); // Go back
        } catch (error) {
            console.error("Error saving rubrik:", error);
            toast.error("Gagal menyimpan rubrik");
        } finally {
            setSaving(false);
        }
    };

    const setRubrikDeskripsi = (val: string) => {
        setRubrik(prev => ({ ...prev, deskripsi: val }));
    };

    return {
        rubrik,
        cpmkData,
        loading,
        saving,
        navigate,
        handleAddKriteria,
        handleRemoveKriteria,
        updateKriteria,
        updateLevel,
        handleSave,
        setRubrikDeskripsi
    };
}
