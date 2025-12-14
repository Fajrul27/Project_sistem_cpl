import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, fetchSemesters } from "@/lib/api";
// Type import from backend schemas for payload validation
import type { MataKuliah as MataKuliahSchema } from "@schemas/index";


// Frontend Display Type (includes nested relations from API response)
// Note: MataKuliahSchema from backend represents the input/payload structure
// This interface extends that with relations for display purposes
export interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    sks: number;
    semester: number;
    createdBy: string;
    prodiId?: string;
    kurikulumId?: string;
    jenisMkId?: string;
    prodi?: { id: string; nama: string };
    kurikulum?: { id: string; nama: string };
    jenisMk?: { id: string; nama: string };
    semesterId?: string;
    semesterRef?: { id: string; nama: string; angka: number };
}

export interface MataKuliahFormData {
    kodeMk: string;
    namaMk: string;
    sks: string;
    semester: string;
    prodiId: string;
    kurikulumId: string;
    jenisMkId: string;
    semesterId: string;
}

const initialForm: MataKuliahFormData = {
    kodeMk: "",
    namaMk: "",
    sks: "3",
    semester: "1",
    prodiId: "",
    kurikulumId: "",
    jenisMkId: "",
    semesterId: ""
};

// Module-level cache
const mkCache: Record<string, { data: any[], meta: any }> = {};

export const useMataKuliah = () => {
    const [mkList, setMkList] = useState<MataKuliah[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Master Data State
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [kurikulumList, setKurikulumList] = useState<any[]>([]);
    const [jenisMkList, setJenisMkList] = useState<any[]>([]);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [semesterFilter, setSemesterFilter] = useState<string>("all");
    const [fakultasFilter, setFakultasFilter] = useState<string>("all");
    const [prodiFilter, setProdiFilter] = useState<string>("all");

    useEffect(() => {
        fetchMataKuliah();
        // Master data only needs to be fetched once or when dependencies change? 
        // We'll leave it to separate call or inside effect if strictly needed.
        // But preventing repeated fetches for master data is good.
    }, [page, searchTerm, semesterFilter, fakultasFilter, prodiFilter]);

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const [prodiRes, kurikulumRes, jenisMkRes, fakultasRes, semesterRes] = await Promise.all([
                api.get('/prodi'),
                api.get('/kurikulum'),
                api.get('/jenis-mata-kuliah'),
                api.get('/fakultas'),
                fetchSemesters()
            ]);

            if (prodiRes.data) setProdiList(prodiRes.data);
            if (kurikulumRes.data) setKurikulumList(kurikulumRes.data);
            if (jenisMkRes.data) setJenisMkList(jenisMkRes.data);
            if (fakultasRes.data) setFakultasList(fakultasRes.data);
            if (semesterRes.data) setSemesterList(semesterRes.data);
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    };

    const fetchMataKuliah = async (force = false) => {
        const cacheKey = `${page}-${limit}-${searchTerm}-${semesterFilter}-${fakultasFilter}-${prodiFilter}`;

        if (!force && mkCache[cacheKey]) {
            const cached = mkCache[cacheKey];
            setMkList(cached.data);
            setTotalPages(cached.meta.totalPages);
            setTotalItems(cached.meta.total);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params: any = {
                page,
                limit,
                q: searchTerm
            };
            if (semesterFilter !== 'all') params.semester = semesterFilter;
            if (fakultasFilter !== 'all') params.fakultasId = fakultasFilter;
            if (prodiFilter !== 'all') params.prodiId = prodiFilter;

            const result = await api.get('/mata-kuliah', { params });
            const data = result.data || [];
            const meta = result.meta || { totalPages: 1, total: 0 };

            // Save to cache
            mkCache[cacheKey] = { data: Array.isArray(data) ? data : [], meta };

            setMkList(Array.isArray(data) ? data : []);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);
        } catch (error) {
            console.error('Error fetching mata kuliah:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
            setMkList([]);
        } finally {
            setLoading(false);
        }
    };

    const createMataKuliah = async (formData: MataKuliahFormData) => {
        if (!formData.kodeMk || !formData.namaMk) {
            toast.error("Kode MK dan Nama MK harus diisi");
            return false;
        }

        setSubmitting(true);
        try {
            const payload = {
                kodeMk: formData.kodeMk.trim(),
                namaMk: formData.namaMk.trim(),
                sks: parseInt(formData.sks),
                semester: parseInt(formData.semester),
                prodiId: formData.prodiId || null,
                kurikulumId: formData.kurikulumId || null,
                jenisMkId: formData.jenisMkId || null,
                semesterId: formData.semesterId || null,
            };

            await api.post('/mata-kuliah', payload);
            toast.success("Mata kuliah berhasil ditambahkan");
            toast.success("Mata kuliah berhasil ditambahkan");
            // Invalidate cache
            Object.keys(mkCache).forEach(k => delete mkCache[k]);
            await fetchMataKuliah(true);
            return true;
        } catch (error) {
            console.error('Error saving mata kuliah:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateMataKuliah = async (id: string, formData: MataKuliahFormData) => {
        if (!formData.kodeMk || !formData.namaMk) {
            toast.error("Kode MK dan Nama MK harus diisi");
            return false;
        }

        setSubmitting(true);
        try {
            const payload = {
                kodeMk: formData.kodeMk.trim(),
                namaMk: formData.namaMk.trim(),
                sks: parseInt(formData.sks),
                semester: parseInt(formData.semester),
                prodiId: formData.prodiId || null,
                kurikulumId: formData.kurikulumId || null,
                jenisMkId: formData.jenisMkId || null,
                semesterId: formData.semesterId || null,
            };

            await api.put(`/mata-kuliah/${id}`, payload);
            toast.success("Mata kuliah berhasil diupdate");
            toast.success("Mata kuliah berhasil diupdate");
            Object.keys(mkCache).forEach(k => delete mkCache[k]);
            await fetchMataKuliah(true);
            return true;
        } catch (error) {
            console.error('Error updating mata kuliah:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteMataKuliah = async (id: string) => {
        try {
            await api.delete(`/mata-kuliah/${id}`);
            toast.success("Mata kuliah berhasil dihapus");
            // Reload to ensure pagination consistency
            await fetchMataKuliah(true);
            Object.keys(mkCache).forEach(k => delete mkCache[k]);
            return true;
        } catch (error) {
            console.error('Error deleting mata kuliah:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
            return false;
        }
    };

    // Wrappers for pagination reset
    const handleSetSearchTerm = (val: string) => { searchTerm !== val && setPage(1); setSearchTerm(val); };
    const handleSetSemesterFilter = (val: string) => { semesterFilter !== val && setPage(1); setSemesterFilter(val); };
    const handleSetFakultasFilter = (val: string) => { fakultasFilter !== val && setPage(1); setFakultasFilter(val); };
    const handleSetProdiFilter = (val: string) => { prodiFilter !== val && setPage(1); setProdiFilter(val); };

    const resetFilters = () => {
        setSemesterFilter("all");
        setFakultasFilter("all");
        setProdiFilter("all");
        setSearchTerm("");
        setPage(1);
    };

    return {
        // Data
        mkList,
        loading,
        submitting,
        initialForm,

        // Master Data
        prodiList,
        kurikulumList,
        jenisMkList,
        fakultasList,
        semesterList,

        // Standardized Filters Object
        filters: {
            searchTerm,
            semesterFilter,
            fakultasFilter,
            prodiFilter
        },

        // Individual Setters (Wrapped)
        setSearchTerm: handleSetSearchTerm,
        setSemesterFilter: handleSetSemesterFilter,
        setFakultasFilter: handleSetFakultasFilter,
        setProdiFilter: handleSetProdiFilter,
        resetFilters,

        // Actions
        fetchMataKuliah,
        createMataKuliah,
        updateMataKuliah,
        deleteMataKuliah,

        // Standardized Pagination Object
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        }
    };
};
