import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, api, fetchSemesters, fetchKelas, fetchAngkatanList } from "@/lib/api";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export function useProfile() {
    const navigate = useNavigate();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    // Dropdown Data
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [angkatanList, setAngkatanList] = useState<any[]>([]);

    // Derived
    const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);

    const fetchMasterData = useCallback(async () => {
        try {
            const [fakultasRes, prodiRes, semesterRes, kelasRes, angkatanRes] = await Promise.all([
                api.get('/fakultas'),
                api.get('/prodi'),
                fetchSemesters(),
                fetchKelas(),
                fetchAngkatanList()
            ]);

            if (fakultasRes.data) setFakultasList(fakultasRes.data);
            if (prodiRes.data) setProdiList(prodiRes.data);
            if (semesterRes.data) setSemesterList(semesterRes.data);
            if (kelasRes.data) setKelasList(kelasRes.data);
            if (angkatanRes.data) setAngkatanList(angkatanRes.data);
        } catch (error) {
            console.error("Error fetching master data:", error);
        }
    }, []);

    const fetchUserData = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Return gracefully and let component handle redirect if needed (or do it here)
                return { redirect: "/auth" };
            }

            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
                setUser(userData.user);

                // Fetch full profile data
                if (userData.user.profile?.id) {
                    try {
                        const profileRes = await api.get(`/profiles/${userData.user.profile.id}`);
                        if (profileRes.data) {
                            setProfile(profileRes.data);
                        } else {
                            setProfile(userData.user.profile);
                        }
                    } catch (err) {
                        console.error("Error fetching full profile:", err);
                        setProfile(userData.user.profile);
                    }
                } else {
                    setProfile(userData.user.profile);
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Gagal memuat data profil");
        } finally {
            setLoading(false);
        }
        return {};
    }, []);

    const fetchTeachingAssignments = useCallback(async (userId: string) => {
        try {
            const assignmentsRes = await api.get(`/mata-kuliah-pengampu/dosen/${userId}`);
            if (assignmentsRes.data) {
                setTeachingAssignments(assignmentsRes.data);
            }
        } catch (error) {
            console.error("Error fetching teaching assignments:", error);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            const res = await fetchUserData();
            if (res.redirect) {
                navigate(res.redirect);
                return;
            }
            fetchMasterData();
        };
        load();
    }, [fetchUserData, fetchMasterData, navigate]);

    useEffect(() => {
        const isDosen = role === 'dosen' || user?.role === 'dosen' || user?.user_metadata?.role === 'dosen' || profile?.role === 'dosen';
        if (isDosen && user?.id) {
            fetchTeachingAssignments(user.id);
        }
    }, [role, user, profile, fetchTeachingAssignments]);

    const updateProfileData = async (formData: any) => {
        if (!profile?.id) return false;
        try {
            setLoading(true);
            await api.put(`/profiles/${profile.id}`, formData);
            toast.success("Profil berhasil diperbarui");
            await fetchUserData(); // Refresh data
            return true;
        } catch (e: any) {
            toast.error("Gagal memperbarui profil: " + (e.response?.data?.error || e.message));
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        profile,
        loading,
        role,

        // Data lists
        fakultasList,
        prodiList,
        semesterList,
        kelasList,
        angkatanList,
        teachingAssignments,

        // Actions
        updateProfileData
    };
}
