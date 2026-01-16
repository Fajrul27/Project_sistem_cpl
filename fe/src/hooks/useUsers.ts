import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllUsers, createUserWithRole, updateUser, deleteUser, updateProfile, fetchKelas, fetchFakultasList, fetchAngkatanList } from "@/lib/api";
import { toast } from "sonner";

export interface UserRow {
    id: string;
    email: string;
    role: string;
    namaLengkap?: string | null;
    nim?: string | null;
    nip?: string | null;
    fakultas?: string | null;
    fakultasId?: string | null;
    programStudi?: string | null;
    prodiId?: string | null;
    semester?: number | null;
    semesterId?: string | null;
    kelasId?: string | null;
    profileId?: string | null;
    angkatan?: number | null;
    angkatanId?: string | null;
    alamat?: string | null;
    noTelepon?: string | null;
}

export type ProdiOption = { id: string; nama: string; kode: string; fakultasId?: string };
export type FakultasOption = { id: string; nama: string; kode: string; prodi: ProdiOption[] };

export function useUsers() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Data States
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);

    // Reference Lists
    const [angkatanList, setAngkatanList] = useState<any[]>([]);
    const [fakultasList, setFakultasList] = useState<FakultasOption[]>([]);
    const [kelasList, setKelasList] = useState<any[]>([]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [fakultasFilter, setFakultasFilter] = useState("all");
    const [prodiFilter, setProdiFilter] = useState("all");

    const loadAngkatan = useCallback(async () => {
        try {
            const res = await fetchAngkatanList();
            if (res.data) setAngkatanList(res.data);
        } catch (error) {
            console.error("Error fetching angkatan:", error);
        }
    }, []);

    const loadFakultas = useCallback(async () => {
        try {
            const res = await fetchFakultasList();
            if (res.data) setFakultasList(res.data);
        } catch (error) {
            console.error("Error fetching fakultas:", error);
        }
    }, []);

    const loadKelas = useCallback(async () => {
        try {
            const res = await fetchKelas();
            if (res.data) setKelasList(res.data);
        } catch (error) {
            console.error("Error fetching kelas:", error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Construct query params safely
            const params: any = {
                page,
                limit,
                q: searchTerm
            };

            if (roleFilter !== "all") params.role = roleFilter;
            if (fakultasFilter !== "all") params.fakultasId = fakultasFilter;
            if (prodiFilter !== "all") params.prodiId = prodiFilter;

            const response = await fetchAllUsers(params);
            const data = (response?.data || []) as any[];
            const meta = response?.meta || { totalPages: 1, total: 0 };

            const mapped: UserRow[] = data.map((u) => {
                let fakultasName = u.profile?.fakultasRef?.nama || null;
                let prodiName = u.profile?.prodiRef?.nama || null;

                // Fallback parsing if refs are missing but string exists
                const fullProgram = (u.profile?.programStudi || null) as string | null;
                if (!prodiName && fullProgram) {
                    if (fullProgram.includes(" - ")) {
                        const [fLabel, pLabel] = fullProgram
                            .split(" - ")
                            .map((s: string) => s.trim());
                        if (!fakultasName) fakultasName = fLabel || null;
                        prodiName = pLabel || null;
                    } else {
                        if (!prodiName) prodiName = fullProgram;
                    }
                }

                return {
                    id: u.id,
                    email: u.email,
                    role: u.role?.role || "mahasiswa",
                    namaLengkap: u.profile?.namaLengkap,
                    nim: u.profile?.nim,
                    nip: u.profile?.nip,
                    fakultas: fakultasName,
                    fakultasId: u.profile?.fakultasId,
                    programStudi: prodiName,
                    prodiId: u.profile?.prodiId,
                    semester: u.profile?.semester,
                    semesterId: u.profile?.semesterId,
                    kelasId: u.profile?.kelasId,
                    profileId: u.profile?.id,
                    angkatan: u.profile?.angkatanRef?.tahun,
                    angkatanId: u.profile?.angkatanId,
                    alamat: u.profile?.alamat,
                    noTelepon: u.profile?.noTelepon
                };
            });

            setUsers(mapped);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);
        } catch (error: any) {
            console.error("Gagal memuat users:", error);
            toast.error("Gagal memuat data pengguna");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, roleFilter, fakultasFilter, prodiFilter]);

    useEffect(() => {
        loadUsers();
        // Only trigger load on mount for references, effectively
    }, [loadUsers]);

    // Load references once
    useEffect(() => {
        loadKelas();
        loadFakultas();
        loadAngkatan();
    }, []);

    // Derived Prodis based on selected Fakultas
    const filteredProdis = useMemo(() => {
        // Flatten all prodis from all fakultas
        let allProdis: ProdiOption[] = [];
        fakultasList.forEach(f => {
            if (f.prodi) {
                // Attach fakultasId if not present (though usually nice to have)
                const prodisWithFak = f.prodi.map(p => ({ ...p, fakultasId: f.id }));
                allProdis.push(...prodisWithFak);
            }
        });

        if (fakultasFilter === "all") return allProdis;
        return allProdis.filter(p => p.fakultasId === fakultasFilter);
    }, [fakultasList, fakultasFilter]);


    const createUser = async (payload: any) => {
        try {
            await createUserWithRole(
                payload.email,
                payload.password,
                payload.fullName,
                payload.role,
                payload.profileData
            );
            toast.success("Pengguna baru berhasil dibuat");
            await loadUsers();
            return true;
        } catch (error: any) {
            console.error("Gagal membuat pengguna:", error);
            toast.error(error.message || "Gagal membuat pengguna baru");
            return false;
        }
    };

    const editUser = async (userId: string, payload: any) => {
        try {
            await updateUser(userId, {
                email: payload.email,
                fullName: payload.fullName,
                role: payload.role,
            });

            if (payload.profileId) {
                await updateProfile(payload.profileId, payload.profileData);
            }

            toast.success("Pengguna berhasil diperbarui");
            await loadUsers();
            return true;
        } catch (error: any) {
            console.error("Gagal memperbarui pengguna:", error);
            toast.error(error.message || "Gagal memperbarui pengguna");
            return false;
        }
    };

    const removeUser = async (userId: string) => {
        try {
            await deleteUser(userId);
            toast.success("Pengguna berhasil dihapus");
            // Reload to ensure pagination consistency
            await loadUsers();
            return true;
        } catch (error: any) {
            console.error("Gagal menghapus pengguna:", error);
            toast.error(error.message || "Gagal menghapus pengguna");
            return false;
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setRoleFilter("all");
        setFakultasFilter("all");
        setProdiFilter("all");
        setPage(1);
    };

    // Wrappers to reset page
    const handleSetSearchTerm = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    };

    const handleSetRoleFilter = (val: string) => {
        setRoleFilter(val);
        setPage(1);
    };

    const handleSetFakultasFilter = (val: string) => {
        setFakultasFilter(val);
        setPage(1);
    };

    const handleSetProdiFilter = (val: string) => {
        setProdiFilter(val);
        setPage(1);
    };


    return {
        users, // Directly return users (server-side filtered)
        loading,
        fakultasList,
        kelasList,
        angkatanList,
        filteredProdis,

        // Pagination
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        },

        // Filter States
        searchTerm,
        setSearchTerm: handleSetSearchTerm,
        roleFilter,
        setRoleFilter: handleSetRoleFilter,
        fakultasFilter,
        setFakultasFilter: handleSetFakultasFilter,
        prodiFilter,
        setProdiFilter: handleSetProdiFilter,
        resetFilters,

        // Actions
        loadUsers,
        createUser,
        editUser,
        removeUser
    };
}
