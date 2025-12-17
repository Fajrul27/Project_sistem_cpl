import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export interface VisiMisi {
    id: string;
    teks: string;
    tipe: "visi" | "misi";
    urutan: number;
    prodiId: string;
    prodi?: { nama: string };
}

export interface Prodi {
    id: string;
    nama: string;
}

// Simple Module-Level Cache
const visiMisiCache: Record<string, VisiMisi[]> = {};

export function useVisiMisi() {
    const { role, profile, loading: roleLoading } = useUserRole();
    const [visiMisiList, setVisiMisiList] = useState<VisiMisi[]>([]);
    const [fakultasList, setFakultasList] = useState<{ id: string; nama: string }[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("");
    const [selectedProdi, setSelectedProdi] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VisiMisi | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        teks: "",
        tipe: "misi" as "visi" | "misi",
        urutan: 1,
        prodiId: ""
    });

    const canEdit = role === "admin" || role === "kaprodi";

    useEffect(() => {
        if (!roleLoading) {
            fetchInitialData();
        }
    }, [role, profile, roleLoading]);

    // Fetch Prodi when Fakultas changes (for Admin)
    useEffect(() => {
        if (role === "admin" && selectedFakultas) {
            const fetchProdiByFakultas = async () => {
                try {
                    const res = await api.get(`/prodi?fakultasId=${selectedFakultas}`);
                    setProdiList(res.data);
                    // Don't auto-select prodi
                    setSelectedProdi("");
                    setVisiMisiList([]);
                } catch (error) {
                    console.error("Error fetching prodi:", error);
                    setProdiList([]);
                }
            };
            fetchProdiByFakultas();
        } else if (role === "admin" && !selectedFakultas) {
            setProdiList([]);
            setSelectedProdi("");
            setVisiMisiList([]);
        }
    }, [selectedFakultas, role]);

    useEffect(() => {
        if (selectedProdi) {
            fetchVisiMisi(selectedProdi);
        } else {
            // Clear data if no prodi selected
            setVisiMisiList([]);
        }
    }, [selectedProdi]);

    const fetchInitialData = async () => {
        try {
            // Fetch Fakultas List for Admin
            if (role === "admin") {
                const res = await api.get("/fakultas");
                setFakultasList(res.data);
                // Don't auto-select fakultas
                // if (res.data.length > 0) {
                //     setSelectedFakultas(res.data[0].id);
                // }
            } else if ((role === "kaprodi" || role === "dosen" || role === "mahasiswa") && profile?.prodiId) {
                // Kaprodi, Dosen, and Mahasiswa automatically selected
                setSelectedProdi(profile.prodiId);
            } else if (role === "kaprodi" || role === "dosen" || role === "mahasiswa") {
                console.warn("User has role but missing prodiId in profile");
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data");
        }
    };

    const fetchVisiMisi = async (prodiId: string, force = false) => {
        // Optimistic Load from Cache
        if (!force && visiMisiCache[prodiId]) {
            setVisiMisiList(visiMisiCache[prodiId]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/visi-misi?prodiId=${prodiId}`);
            setVisiMisiList(res.data);
            visiMisiCache[prodiId] = res.data;
        } catch (error) {
            console.error("Error fetching visi misi:", error);
            toast.error("Gagal memuat data visi misi");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                prodiId: role === "kaprodi" ? profile?.prodiId : (formData.prodiId || selectedProdi)
            };

            if (!payload.prodiId) {
                toast.error("Prodi harus dipilih");
                return;
            }

            if (editingItem) {
                await api.put(`/visi-misi/${editingItem.id}`, payload);
                toast.success("Berhasil diperbarui");
            } else {
                await api.post("/visi-misi", payload);
                toast.success("Berhasil ditambahkan");
            }

            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData({ teks: "", tipe: "misi", urutan: 1, prodiId: "" });
            setFormData({ teks: "", tipe: "misi", urutan: 1, prodiId: "" });
            // Invalidate cache for this prodi
            if (payload.prodiId) delete visiMisiCache[payload.prodiId];
            fetchVisiMisi(selectedProdi, true);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus?")) return;
        try {
            await api.delete(`/visi-misi/${id}`);
            toast.success("Berhasil dihapus");
            toast.success("Berhasil dihapus");
            // Invalidate cache
            if (selectedProdi) delete visiMisiCache[selectedProdi];
            fetchVisiMisi(selectedProdi, true);
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Gagal menghapus");
        }
    };

    const openEdit = (item: VisiMisi) => {
        setEditingItem(item);
        setFormData({
            teks: item.teks,
            tipe: item.tipe,
            urutan: item.urutan,
            prodiId: item.prodiId
        });
        setIsDialogOpen(true);
    };

    const openAdd = (tipe: "visi" | "misi") => {
        setEditingItem(null);
        setFormData({
            teks: "",
            tipe: tipe,
            urutan: tipe === "misi" ? visiMisiList.filter(v => v.tipe === "misi").length + 1 : 1,
            prodiId: selectedProdi
        });
        setIsDialogOpen(true);
    };

    const visiList = visiMisiList.filter(v => v.tipe === 'visi');
    const misiList = visiMisiList.filter(v => v.tipe === 'misi');

    return {
        role,
        visiList,
        misiList,
        fakultasList,
        selectedFakultas,
        setSelectedFakultas,
        prodiList,
        selectedProdi,
        setSelectedProdi,
        loading,
        canEdit,
        isDialogOpen,
        setIsDialogOpen,
        editingItem,
        formData,
        setFormData,
        handleSave,
        handleDelete,
        openEdit,
        openAdd
    };
}
