import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface SystemSettings {
    univName: string;
    univAddress: string;
    univContact: string;
    kaprodiName: string;
    kaprodiNip: string;
    logoUrl: string;
}

export function useSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SystemSettings>({
        univName: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
        univAddress: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
        univContact: "Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415",
        kaprodiName: "",
        kaprodiNip: "",
        logoUrl: "/logo.png"
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const result = await api.get('/settings');
            if (result.data && Object.keys(result.data).length > 0) {
                setSettings(prev => ({ ...prev, ...result.data }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            toast.error("Gagal memuat pengaturan");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.put('/settings', settings);
            toast.success("Pengaturan berhasil disimpan");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Gagal menyimpan pengaturan");
        } finally {
            setSaving(false);
        }
    };

    return {
        settings,
        loading,
        saving,
        handleChange,
        handleSave
    };
}
