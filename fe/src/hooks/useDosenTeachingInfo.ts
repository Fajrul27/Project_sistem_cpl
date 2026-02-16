
import { useState, useEffect } from "react";
import { fetchMataKuliahPengampu } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";

export function useDosenTeachingInfo() {
    const { role, userId } = useUserRole();
    const [taughtSemesters, setTaughtSemesters] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            // Only fetch if role is specifically 'dosen'
            if (role === 'dosen' && userId) {
                setLoading(true);
                try {
                    const res = await fetchMataKuliahPengampu(userId);
                    const pengampuList = res.data || [];
                    const semesters = new Set<number>();

                    pengampuList.forEach((p: any) => {
                        // Access nested mataKuliah object
                        if (p.mataKuliah?.semester) {
                            semesters.add(Number(p.mataKuliah.semester));
                        }
                    });

                    setTaughtSemesters(Array.from(semesters).sort((a, b) => a - b));
                } catch (e) {
                    console.error("Error fetching taught semesters:", e);
                } finally {
                    setLoading(false);
                }
            } else {
                // Reset if not dosen
                setTaughtSemesters([]);
            }
        }
        load();
    }, [role, userId]);

    return { taughtSemesters, loading };
}
