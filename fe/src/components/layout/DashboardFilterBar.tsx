import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { fetchAngkatanList, fetchProdiList, fetchFakultasList } from "@/lib/api";


interface DashboardFilterBarProps {
    onFilterChange: (filters: { semester?: string; angkatan?: string; kelasId?: string; prodiId?: string; fakultasId?: string }) => void;
    filters?: { semester?: string; angkatan?: string; kelasId?: string; prodiId?: string; fakultasId?: string }; // Make optional to avoid initial undefined issues

    role: string;
}

export const DashboardFilterBar = ({ onFilterChange, filters = {}, role }: DashboardFilterBarProps) => {
    // No internal state for filters! We rely on props.filters (Controlled Component)

    const [angkatanOptions, setAngkatanOptions] = useState<string[]>([]);
    const [prodiOptions, setProdiOptions] = useState<any[]>([]);
    const [fakultasOptions, setFakultasOptions] = useState<any[]>([]);

    useEffect(() => {
        const loadAngkatan = async () => {
            try {
                const res = await fetchAngkatanList();
                if (res.data) {
                    const years = res.data.map((a: any) => a.tahun.toString());
                    setAngkatanOptions(years);
                }
            } catch (error) {
                console.error("Failed to fetch angkatan options", error);
                const currentYear = new Date().getFullYear();
                const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
                setAngkatanOptions(years);
            }
        };

        const fetchProdi = async () => {
            try {
                const res = await fetchProdiList();
                if (res.data) setProdiOptions(res.data);
            } catch (error) {
                console.error("Failed to fetch prodi options");
            }
        };

        const fetchFakultas = async () => {
            try {
                const res = await fetchFakultasList();
                if (res.data) setFakultasOptions(res.data);
            } catch (error) {
                console.error("Failed to fetch fakultas options");
            }
        }

        loadAngkatan();

        if (role === 'admin') {
            fetchProdi();
            fetchFakultas();
        }
    }, [role]);

    const handleFilterChange = (key: string, value: string) => {
        // Merge current filters with new value and notify parent
        const newFilters = { ...filters, [key]: value };

        // If fakultas changes, reset prodi
        if (key === 'fakultasId') {
            newFilters.prodiId = "";
        }

        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { semester: "", angkatan: "", kelasId: "", prodiId: "", fakultasId: "" };
        onFilterChange(reset);
    };

    const hasActiveFilters = Object.values(filters).some(val => val !== "" && val !== undefined && val !== null);

    // Filter prodi based on selected fakultas
    const filteredProdiOptions = filters.fakultasId && filters.fakultasId !== "all"
        ? prodiOptions.filter(p => p.fakultasId === filters.fakultasId)
        : prodiOptions;

    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 p-4 bg-card rounded-lg border shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
            </div>

            {role === 'admin' && (
                <>
                    <Select value={filters.fakultasId || ""} onValueChange={(val) => handleFilterChange("fakultasId", val)}>
                        <SelectTrigger className="w-full sm:w-[200px] h-9">
                            <SelectValue placeholder="Semua Fakultas">
                                {filters.fakultasId && filters.fakultasId !== "all"
                                    ? fakultasOptions.find(f => f.id === filters.fakultasId)?.nama
                                    : "Semua Fakultas"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Fakultas</SelectItem>
                            {fakultasOptions.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.prodiId || ""} onValueChange={(val) => handleFilterChange("prodiId", val)}>
                        <SelectTrigger className="w-full sm:w-[200px] h-9">
                            <SelectValue placeholder="Semua Program Studi">
                                {filters.prodiId && filters.prodiId !== "all"
                                    ? prodiOptions.find(p => p.id === filters.prodiId)?.nama
                                    : "Semua Program Studi"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Program Studi</SelectItem>
                            {filteredProdiOptions.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
            )}

            <Select value={filters.semester ? filters.semester.toString() : ""} onValueChange={(val) => handleFilterChange("semester", val)}>
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="Semester">
                        {filters.semester ? `Semester ${filters.semester}` : "Semester"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.angkatan ? filters.angkatan.toString() : ""} onValueChange={(val) => handleFilterChange("angkatan", val)}>
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                    <SelectValue placeholder="Angkatan">
                        {filters.angkatan ? filters.angkatan : "Angkatan"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {angkatanOptions.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="sm:ml-auto h-9 w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                    <X className="h-4 w-4 mr-2" />
                    Reset Filter
                </Button>
            )}
        </div>
    );
};
