import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, fetchSemesters } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useUserRole } from "@/hooks/useUserRole";
import { useDosenTeachingInfo } from "@/hooks/useDosenTeachingInfo";
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
    sks: "",
    semester: "1",
    prodiId: "",
    kurikulumId: "",
    jenisMkId: "",
    semesterId: ""
};

// Module-level cache
const mkCache: Record<string, { data: any[], meta: any }> = {};

export const useMataKuliah = () => {
    const { role, profile, loading: roleLoading } = useUserRole();
    const [searchParams, setSearchParams] = useSearchParams();
    const [mkList, setMkList] = useState<MataKuliah[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Dosen Teaching Info
    const { taughtSemesters } = useDosenTeachingInfo();

    // Pagination State
    const page = parseInt(searchParams.get("page") || "1");
    const setPage = (p: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", p.toString());
        setSearchParams(newParams);
    };

    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Master Data State
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [kurikulumList, setKurikulumList] = useState<any[]>([]);
    const [jenisMkList, setJenisMkList] = useState<any[]>([]);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);

    // Filter State derived from URL
    const searchTerm = searchParams.get("q") || "";
    // Local state for immediate input feedback before debounce updates URL
    const [inputValue, setInputValue] = useState(searchTerm);
    const debouncedSearchTerm = useDebounce(inputValue, 500);

    // Sync input value if URL changes externally (e.g. back button)
    useEffect(() => {
        setInputValue(searchTerm);
    }, [searchTerm]);

    // Update URL when debounced value changes
    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (debouncedSearchTerm !== currentQ) {
            const newParams = new URLSearchParams(searchParams);
            if (debouncedSearchTerm) {
                newParams.set("q", debouncedSearchTerm);
            } else {
                newParams.delete("q");
            }
            newParams.set("page", "1"); // Reset page on search
            setSearchParams(newParams);
        }
    }, [debouncedSearchTerm, searchParams, setSearchParams]);

    const semesterFilter = searchParams.get("semester") || "";
    const fakultasFilter = searchParams.get("fakultasId") || "";
    const prodiFilter = searchParams.get("prodiId") || "";
    const kurikulumFilter = searchParams.get("kurikulumId") || "";

    // Setters that update URL
    const setSearchTermState = (val: string) => {
        setInputValue(val);
    };

    const setSemesterFilter = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (val && val !== 'all') newParams.set("semester", val);
        else newParams.delete("semester");
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    const setFakultasFilter = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (val && val !== 'all') newParams.set("fakultasId", val);
        else newParams.delete("fakultasId");
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    const setProdiFilter = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (val && val !== 'all') newParams.set("prodiId", val);
        else newParams.delete("prodiId");
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    const setKurikulumFilter = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (val && val !== 'all') newParams.set("kurikulumId", val);
        else newParams.delete("kurikulumId");
        newParams.set("page", "1");
        setSearchParams(newParams);
    };

    const resetFilters = () => {
        setSearchParams(new URLSearchParams());
        setInputValue("");
    };

    // Role-based filter initialization
    useEffect(() => {
        if (!roleLoading && role !== "admin") {
            const newParams = new URLSearchParams(searchParams);
            let changed = false;

            if (profile?.prodiId && !searchParams.get("prodiId")) {
                newParams.set("prodiId", profile.prodiId);
                changed = true;
            }

            const fId = profile?.fakultasId || (profile?.prodi as any)?.fakultasId;
            if (fId && !searchParams.get("fakultasId")) {
                newParams.set("fakultasId", fId);
                changed = true;
            }

            if (role === 'mahasiswa' && profile?.angkatanRef?.kurikulumId && !searchParams.get("kurikulumId")) {
                newParams.set("kurikulumId", profile.angkatanRef.kurikulumId);
                changed = true;
            }

            if (changed) {
                setSearchParams(newParams, { replace: true });
            }
        }
    }, [roleLoading, role, profile, setSearchParams]);

    // Dosen Semester Auto-select
    useEffect(() => {
        if (role === 'dosen' && taughtSemesters.length === 1) {
            const singleSemester = taughtSemesters[0].toString();
            if (semesterFilter !== singleSemester) {
                // Update URL directly to avoid loop/dependency issues if using setSemesterFilter wrapper
                const newParams = new URLSearchParams(searchParams);
                newParams.set("semester", singleSemester);
                // Preserve other params if needed, but the wrapper resets page.
                // using setSemesterFilter is safer
                setSemesterFilter(singleSemester);
            }
        }
    }, [role, taughtSemesters, semesterFilter]);

    useEffect(() => {
        fetchMataKuliah();
    }, [page, searchTerm, semesterFilter, fakultasFilter, prodiFilter, kurikulumFilter]);

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
        const cacheKey = `${page}-${limit}-${searchTerm}-${semesterFilter}-${fakultasFilter}-${prodiFilter}-${kurikulumFilter}`;

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
            if (semesterFilter && semesterFilter !== 'all') params.semester = semesterFilter;
            if (fakultasFilter && fakultasFilter !== 'all') params.fakultasId = fakultasFilter;
            if (prodiFilter && prodiFilter !== 'all') params.prodiId = prodiFilter;
            if (kurikulumFilter && kurikulumFilter !== 'all') params.kurikulumId = kurikulumFilter;

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
        semesterList: (role === 'dosen' && taughtSemesters.length > 0)
            ? taughtSemesters.map(s => ({ id: s.toString(), nama: `Semester ${s}`, angka: s }))
            : semesterList,

        // Standardized Filters Object
        filters: {
            searchTerm: inputValue, // Use local input value for immediate feedback
            semesterFilter,
            fakultasFilter,
            prodiFilter,
            kurikulumFilter
        },

        // Individual Setters (Wrapped)
        setSearchTerm: setSearchTermState,
        setSemesterFilter,
        setFakultasFilter,
        setProdiFilter,
        setKurikulumFilter,
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
