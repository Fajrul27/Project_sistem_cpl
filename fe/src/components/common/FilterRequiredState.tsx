import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterRequiredStateProps {
    message?: string;
    onOpenFilter?: () => void;
    title?: string;
}

export const FilterRequiredState = ({
    title = "Filter Data Diperlukan",
    message = "Silakan pilih filter yang sesuai untuk menampilkan data.",
    onOpenFilter
}: FilterRequiredStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
            <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800">
                <SlidersHorizontal className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {title}
            </h3>
            <p className="max-w-md mb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
            </p>
            {onOpenFilter && (
                <Button variant="outline" onClick={onOpenFilter}>
                    Buka Filter
                </Button>
            )}
        </div>
    );
};
