import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { api, fetchAngkatanList, fetchProdiList } from "@/lib/api-client";

interface DashboardFilterBarProps {
    onFilterChange: (filters: { semester?: string; angkatan?: string; kelasId?: string; prodiId?: string }) => void;
    role: string;
}

export const DashboardFilterBar = ({ onFilterChange, role }: DashboardFilterBarProps) => {
    const [filters, setFilters] = useState({
        semester: "",
        angkatan: "",
        kelasId: "",
        prodiId: ""
    });

    const [kelasOptions, setKelasOptions] = useState<any[]>([]);
    const [angkatanOptions, setAngkatanOptions] = useState<string[]>([]);
    const [prodiOptions, setProdiOptions] = useState<any[]>([]);

    useEffect(() => {
        const loadAngkatan = async () => {
            try {
                const res = await fetchAngkatanList();
                if (res.data) {
                    // Map to string array of years for the dropdown
                    const years = res.data.map((a: any) => a.tahun.toString());
                    setAngkatanOptions(years);
                }
            } catch (error) {
                console.error("Failed to fetch angkatan options", error);
                // Fallback to generated years
                const currentYear = new Date().getFullYear();
                const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
                setAngkatanOptions(years);
            }
        };

        loadAngkatan();

        if (role === 'admin') {
            fetchProdi();
        }

        // Fetch kelas options if needed (could be optimized to fetch only relevant kelas)
        // For now, we can fetch all or rely on parent to pass options. 
        // Let's keep it simple and just hardcode semester for now, and fetch classes if role is relevant.
        if (role === 'kaprodi' || role === 'admin') {
            fetchKelas();
        }
    }, [role]);

    const fetchProdi = async () => {
        try {
            const res = await fetchProdiList();
            if (res.data) setProdiOptions(res.data);
        } catch (error) {
            console.error("Failed to fetch prodi options");
        }
    };

    const fetchKelas = async () => {
        try {
            // Assuming we have an endpoint for this, or we can reuse existing ones.
            // For now, let's skip actual API call for Kelas to avoid 404s if endpoint doesn't exist.
            // We can add it later.
        } catch (error) {
            console.error("Failed to fetch kelas options");
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { semester: "", angkatan: "", kelasId: "", prodiId: "" };
        setFilters(reset);
        onFilterChange(reset);
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
            </div>

            {role === 'admin' && (
                <Select value={filters.prodiId} onValueChange={(val) => handleFilterChange("prodiId", val)}>
                    <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Semua Program Studi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Program Studi</SelectItem>
                        {prodiOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select value={filters.semester} onValueChange={(val) => handleFilterChange("semester", val)}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.angkatan} onValueChange={(val) => handleFilterChange("angkatan", val)}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Angkatan" />
                </SelectTrigger>
                <SelectContent>
                    {angkatanOptions.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="ml-auto h-9 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            )}
        </div>
    );
};
