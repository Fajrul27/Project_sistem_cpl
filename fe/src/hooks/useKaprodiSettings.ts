import { useState, useEffect, useMemo, useCallback } from "react";
import { api, fetchFakultasList, fetchProdiList, fetchAllUsers } from "@/lib/api";
import { toast } from "sonner";

export interface Prodi {
    id: string;
    nama: string;
    fakultasId: string;
}

export interface Fakultas {
    id: string;
    nama: string;
}

export interface User {
    id: string;
    email: string;
    role: { role: string };
    profile?: {
        namaLengkap: string;
        nidn: string;
        nip?: string;
        prodiId?: string;
        prodi?: {
            fakultasId: string;
            nama: string;
        };
    };
}

export interface KaprodiData {
    id: string;
    programStudi: string;
    prodiId: string | null;
    namaKaprodi: string;
    nidnKaprodi: string;
    prodi?: Prodi;
}

export function useKaprodiSettings() {
    const [kaprodiList, setKaprodiList] = useState<KaprodiData[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form and UI States
    const [formData, setFormData] = useState({
        programStudi: "",
        prodiId: "",
        namaKaprodi: "",
        nidnKaprodi: "",
        fakultasId: ""
    });
    const [searchQuery, setSearchQuery] = useState("");

    const fetchInitialData = useCallback(async () => {
        try {
            const [fakultasRes, kaprodiRes] = await Promise.all([
                fetchFakultasList(),
                api.get('/kaprodi-data')
            ]);

            setFakultasList(fakultasRes.data || []);
            setKaprodiList(kaprodiRes.data || []);

            // Fetch only users with role 'kaprodi'
            const kaprodiUserRes = await fetchAllUsers({ role: 'kaprodi', limit: 100 });
            setUserList(kaprodiUserRes.data || []);

        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data awal");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProdiByFakultas = useCallback(async (fakultasId: string) => {
        try {
            const result = await fetchProdiList(fakultasId);
            setProdiList(result.data || []);
        } catch (error) {
            console.error("Gagal memuat data prodi");
        }
    }, []);

    const fetchKaprodiData = useCallback(async () => {
        try {
            const result = await api.get('/kaprodi-data');
            setKaprodiList(result.data || []);
        } catch (error) {
            toast.error("Gagal memuat data kaprodi");
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (formData.fakultasId) {
            fetchProdiByFakultas(formData.fakultasId);
        } else {
            setProdiList([]);
        }
    }, [formData.fakultasId, fetchProdiByFakultas]);

    const filteredUsers = useMemo(() => {
        return userList.filter(user => {
            // Strict filter: Must have prodiId selected if we strictly want to match prodi?
            // The original code enforced: if (!formData.prodiId) return false;
            if (!formData.prodiId) return false;

            // Filter by Prodi
            if (user.profile?.prodiId !== formData.prodiId) return false;

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const name = user.profile?.namaLengkap?.toLowerCase() || "";
                const email = user.email.toLowerCase();
                const nidn = user.profile?.nidn?.toLowerCase() || "";
                const nip = user.profile?.nip?.toLowerCase() || "";
                return name.includes(query) || email.includes(query) || nidn.includes(query) || nip.includes(query);
            }
            return true;
        });
    }, [userList, formData.prodiId, searchQuery]);

    const saveKaprodi = async () => {
        if (!formData.programStudi || !formData.namaKaprodi) {
            toast.error("Lengkapi data program studi dan nama kaprodi");
            return false;
        }

        setSaving(true);
        try {
            await api.post('/kaprodi-data', {
                programStudi: formData.programStudi,
                prodiId: formData.prodiId,
                namaKaprodi: formData.namaKaprodi,
                nidnKaprodi: formData.nidnKaprodi
            });

            toast.success("Data kaprodi berhasil disimpan");
            setFormData({
                programStudi: "",
                prodiId: "",
                namaKaprodi: "",
                nidnKaprodi: "",
                fakultasId: ""
            });
            await fetchKaprodiData();
            return true;
        } catch (error: any) {
            toast.error("Gagal menyimpan data kaprodi");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteKaprodi = async (id: string) => {
        try {
            await api.delete(`/kaprodi-data/${id}`);
            toast.success("Data kaprodi berhasil dihapus");
            await fetchKaprodiData();
            return true;
        } catch (error) {
            toast.error("Gagal menghapus data kaprodi");
            return false;
        }
    };

    const prepareEdit = (item: KaprodiData) => {
        setFormData({
            programStudi: item.programStudi,
            prodiId: item.prodiId || "",
            namaKaprodi: item.namaKaprodi,
            nidnKaprodi: item.nidnKaprodi,
            fakultasId: item.prodi?.fakultasId || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return {
        kaprodiList,
        prodiList,
        fakultasList,
        userList,
        loading,
        saving,
        formData,
        setFormData,
        filteredUsers,
        searchQuery,
        setSearchQuery,
        saveKaprodi,
        deleteKaprodi,
        prepareEdit
    };
}
