import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext"; // Add this


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

    const { can } = usePermission();
    const canEdit = can('edit', 'visi_misi') || can('create', 'visi_misi');
    const canViewAll = can('view_all', 'visi_misi') || role === 'admin';

    useEffect(() => {
        if (!roleLoading) {
            fetchInitialData();
        }
    }, [role, profile, roleLoading, canViewAll]);

    // Fetch Prodi when Fakultas changes (for Admin/ViewAll)
    useEffect(() => {
        if (canViewAll && selectedFakultas) {
            const fetchProdiByFakultas = async () => {
                try {
                    const res = await api.get(`/prodi?fakultasId=${selectedFakultas}`);
                    setProdiList(res.data);

                    // Reset prodi selection ONLY if current prodi is not in the new list 
                    // and user is NOT a kaprodi (locked to their prodi)
                    if (role !== "kaprodi") {
                        const isInList = res.data.some((p: any) => p.id === selectedProdi);
                        if (!isInList) {
                            setSelectedProdi("");
                            setVisiMisiList([]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching prodi:", error);
                    setProdiList([]);
                }
            };
            fetchProdiByFakultas();
        } else if (canViewAll && !selectedFakultas) {
            if (role !== "kaprodi") {
                setProdiList([]);
                setSelectedProdi("");
                setVisiMisiList([]);
            }
        }
    }, [selectedFakultas, canViewAll, role]);

    useEffect(() => {
        if (selectedProdi) {
            fetchVisiMisi(selectedProdi);
        } else {
            // Clear data if no prodi selected
            setVisiMisiList([]);
            setLoading(false);
        }
    }, [selectedProdi]);

    const fetchInitialData = async () => {
        try {
            // Fetch Fakultas List for Admin/ViewAll or Kaprodi
            if (canViewAll || role === 'kaprodi') {
                const res = await api.get("/fakultas");
                setFakultasList(res.data);
            }

            // Always try to set default prodi from profile if available
            if (profile?.prodiId) {
                // If it's the first load and nothing is selected yet
                if (!selectedProdi) {
                    setSelectedProdi(profile.prodiId);
                }

                // If we also fetched fakultasList or have fakultasId in profile, try to set selectedFakultas
                if (!selectedFakultas) {
                    const fId = profile.fakultasId || (profile.prodi && (profile.prodi as any).fakultasId);
                    if (fId) {
                        setSelectedFakultas(fId);
                    }
                }
            }

            // Set loading to false if we didn't trigger any prodi-specific fetch yet 
            // OR we are admin and can view all (who needs to select something first)
            if (!profile?.prodiId && !selectedProdi) {
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data");
            setLoading(false);
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
