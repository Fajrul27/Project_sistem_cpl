import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface SettingsMap {
    [key: string]: string;
}

export function useSettings() {
    const [settings, setSettings] = useState<SettingsMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get("/settings");
            setSettings(response.data || {});
        } catch (error) {
            console.error("Error fetching settings:", error);
            // Don't show toast error on initial load as it might be expected to be empty
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: SettingsMap) => {
        setSaving(true);
        try {
            await api.put("/settings", updates);
            // Update local state
            setSettings(prev => ({ ...prev, ...updates }));
            toast.success("Pengaturan berhasil disimpan");
            return true;
        } catch (error: any) {
            console.error("Error updating settings:", error);
            toast.error(error.message || "Gagal menyimpan pengaturan");
            return false;
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        saving,
        fetchSettings,
        updateSettings
    };
}
