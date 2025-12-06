import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface Cpmk {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    mataKuliah: {
        kodeMk: string;
        namaMk: string;
        prodiId?: string;
    };
    creator?: {
        email: string;
        profile?: {
            namaLengkap: string | null;
        };
    };
}

export interface CplMapping {
    id: string;
    bobotPersentase: number;
    cpl: {
        id: string;
        kodeCpl: string;
        deskripsi: string;
        kategori: string | null;
    };
}

export interface TeknikPenilaian {
    id: string;
    namaTeknik: string;
    bobotPersentase: number;
    deskripsi: string | null;
    teknikRefId?: string | null;
}

export interface TeknikPenilaianRef {
    id: string;
    nama: string;
    deskripsi: string | null;
}

export interface Cpl {
    id: string;
    kodeCpl: string;
    deskripsi: string;
    kategori: string | null;
}

export interface SubCpmk {
    id: string;
    kode: string;
    deskripsi: string;
    bobot: number;
    asesmenMappings?: any[];
}


export function useCPMKDetail(id: string | undefined) {
    const [cpmk, setCpmk] = useState<Cpmk | null>(null);
    const [cplMappings, setCplMappings] = useState<CplMapping[]>([]);
    const [teknikPenilaian, setTeknikPenilaian] = useState<TeknikPenilaian[]>([]);
    const [teknikRefs, setTeknikRefs] = useState<TeknikPenilaianRef[]>([]);
    const [availableCpl, setAvailableCpl] = useState<Cpl[]>([]);
    const [subCpmkList, setSubCpmkList] = useState<SubCpmk[]>([]);
    const [levelTaksonomiMap, setLevelTaksonomiMap] = useState<{ [key: string]: string }>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Level Taksonomi
    const fetchLevelTaksonomi = useCallback(async () => {
        try {
            const result = await api.get('/level-taksonomi');
            const data = result.data || [];
            const map: { [key: string]: string } = {};
            data.forEach((item: any) => {
                map[item.kode] = item.deskripsi;
            });
            setLevelTaksonomiMap(map);
        } catch (error) {
            console.error('Error fetching level taksonomi:', error);
        }
    }, []);

    // Fetch Base Data
    const fetchCpmkDetail = useCallback(async () => {
        if (!id) return;
        try {
            const result = await api.get(`/cpmk/${id}`);
            setCpmk(result.data);

            if (result.data?.mataKuliah?.prodiId) {
                fetchAvailableCpl(result.data.mataKuliah.prodiId);
            } else {
                fetchAvailableCpl();
            }
        } catch (error) {
            console.error('Error fetching CPMK:', error);
            toast.error('Gagal memuat data CPMK');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchAvailableCpl = async (prodiId?: string) => {
        try {
            const params = prodiId ? { prodiId } : {};
            const result = await api.get('/cpl', { params });
            setAvailableCpl(result.data || []);
        } catch (error) {
            console.error('Error fetching CPL:', error);
        }
    };

    const fetchCplMappings = useCallback(async () => {
        if (!id) return;
        try {
            const result = await api.get(`/cpmk-mapping/cpmk/${id}`);
            setCplMappings(result.data || []);
        } catch (error) {
            console.error('Error fetching mappings:', error);
            toast.error('Gagal memuat data mapping');
        }
    }, [id]);

    const fetchTeknikPenilaian = useCallback(async () => {
        if (!id) return;
        try {
            const result = await api.get(`/teknik-penilaian/cpmk/${id}`);
            setTeknikPenilaian(result.data || []);
        } catch (error) {
            console.error('Error fetching teknik penilaian:', error);
            toast.error('Gagal memuat teknik penilaian');
        }
    }, [id]);

    const fetchTeknikRefs = useCallback(async () => {
        try {
            const result = await api.get('/teknik-penilaian-ref');
            setTeknikRefs(result.data || []);
        } catch (error) {
            console.error('Error fetching teknik refs:', error);
        }
    }, []);

    const fetchSubCpmk = useCallback(async () => {
        if (!id) return;
        try {
            const res = await api.get(`/sub-cpmk?cpmkId=${id}`);
            setSubCpmkList(res.data);
        } catch (error) {
            console.error("Error fetching sub-cpmk:", error);
        }
    }, [id]);

    // Initial Load
    const initializeData = useCallback(() => {
        fetchLevelTaksonomi();
        if (id) {
            fetchCpmkDetail();
            fetchCplMappings();
            fetchTeknikPenilaian();
            fetchTeknikRefs();
            fetchSubCpmk();
        }
    }, [id, fetchLevelTaksonomi, fetchCpmkDetail, fetchCplMappings, fetchTeknikPenilaian, fetchTeknikRefs, fetchSubCpmk]);


    // Actions: Mapping
    const saveMapping = async (form: { cplId: string; bobotPersentase: string }, editingId?: string) => {
        if (!id) return;
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/cpmk-mapping/${editingId}`, {
                    bobotPersentase: parseFloat(form.bobotPersentase),
                });
                toast.success("Mapping berhasil diupdate");
            } else {
                await api.post('/cpmk-mapping', {
                    cpmkId: id,
                    cplId: form.cplId,
                    bobotPersentase: parseFloat(form.bobotPersentase),
                });
                toast.success("Mapping berhasil ditambahkan");
            }
            await fetchCplMappings();
            return true;
        } catch (error) {
            console.error('Error saving mapping:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteMapping = async (mappingId: string) => {
        try {
            await api.delete(`/cpmk-mapping/${mappingId}`);
            toast.success("Mapping berhasil dihapus");
            await fetchCplMappings();
        } catch (error) {
            console.error('Error deleting mapping:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    // Actions: Teknik Penilaian
    const saveTeknik = async (form: any, editingId?: string) => {
        if (!id) return;
        setSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/teknik-penilaian/${editingId}`, {
                    namaTeknik: form.namaTeknik.trim(),
                    bobotPersentase: parseFloat(form.bobotPersentase),
                    deskripsi: form.deskripsi.trim() || null,
                    teknikRefId: form.teknikRefId || null,
                });
                toast.success("Teknik penilaian berhasil diupdate");
            } else {
                await api.post('/teknik-penilaian', {
                    cpmkId: id,
                    namaTeknik: form.namaTeknik.trim(),
                    bobotPersentase: parseFloat(form.bobotPersentase),
                    deskripsi: form.deskripsi.trim() || null,
                    teknikRefId: form.teknikRefId || null,
                });
                toast.success("Teknik penilaian berhasil ditambahkan");
            }
            await fetchTeknikPenilaian();
            return true;
        } catch (error) {
            console.error('Error saving teknik:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteTeknik = async (teknikId: string) => {
        try {
            await api.delete(`/teknik-penilaian/${teknikId}`);
            toast.success("Teknik penilaian berhasil dihapus");
            await fetchTeknikPenilaian();
        } catch (error) {
            console.error('Error deleting teknik:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    // Actions: Sub CPMK
    const saveSubCpmk = async (form: any, currentId?: string) => {
        if (!id) return;
        try {
            if (currentId) {
                await api.put(`/sub-cpmk/${currentId}`, {
                    ...form,
                    bobot: parseFloat(form.bobot) || 0
                });
                toast.success("Sub-CPMK berhasil diperbarui");
            } else {
                await api.post(`/sub-cpmk?cpmkId=${id}`, {
                    ...form,
                    bobot: parseFloat(form.bobot) || 0
                });
                toast.success("Sub-CPMK berhasil ditambahkan");
            }
            fetchSubCpmk();
            return true;
        } catch (error) {
            console.error("Error saving sub-cpmk:", error);
            toast.error("Gagal menyimpan Sub-CPMK");
            return false;
        }
    };

    const deleteSubCpmk = async (subId: string) => {
        try {
            await api.delete(`/sub-cpmk/${subId}`);
            toast.success("Sub-CPMK berhasil dihapus");
            fetchSubCpmk();
        } catch (error) {
            console.error("Error deleting sub-cpmk:", error);
            toast.error("Gagal menghapus Sub-CPMK");
        }
    };

    // Actions: Sub CPMK Mapping
    const saveSubCpmkMapping = async (subCpmkId: string, teknikPenilaianId: string, bobot: string) => {
        setSubmitting(true);
        try {
            await api.post('/sub-cpmk/mapping', {
                subCpmkId,
                teknikPenilaianId,
                bobot
            });
            toast.success("Mapping berhasil disimpan");
            fetchSubCpmk();
            return true;
        } catch (error) {
            console.error("Error saving mapping:", error);
            toast.error("Gagal menyimpan mapping");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteSubCpmkMapping = async (mappingId: string) => {
        try {
            await api.delete(`/sub-cpmk/mapping/${mappingId}`);
            toast.success("Mapping dihapus");
            fetchSubCpmk();
        } catch (error) {
            console.error("Error deleting mapping:", error);
            toast.error("Gagal menghapus mapping");
        }
    };

    return {
        cpmk,
        cplMappings,
        teknikPenilaian,
        teknikRefs,
        availableCpl,
        subCpmkList,
        levelTaksonomiMap,
        loading,
        submitting,
        initializeData,
        saveMapping,
        deleteMapping,
        saveTeknik,
        deleteTeknik,
        saveSubCpmk,
        deleteSubCpmk,
        saveSubCpmkMapping,
        deleteSubCpmkMapping
    };
}
