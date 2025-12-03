import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, FileWarning } from "lucide-react";

interface CompletenessCardProps {
    data: {
        cplEmpty: number;
        mkUnmapped: number;
        dosenNoInput: number;
        progressPengisian: number;
    };
}

export const CompletenessCard = ({ data }: CompletenessCardProps) => {
    return (
        <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Status Kelengkapan Data
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Progress Pengisian Nilai</span>
                        <span className="font-bold text-primary">{data.progressPengisian}%</span>
                    </div>
                    <Progress value={data.progressPengisian} className="h-2.5 bg-muted/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20">
                        <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.cplEmpty}</p>
                        <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 text-center">CPL Kosong</p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/20">
                        <FileWarning className="h-6 w-6 text-amber-500 mb-2" />
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.mkUnmapped}</p>
                        <p className="text-xs font-medium text-amber-600/80 dark:text-amber-400/80 text-center">MK Unmapped</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
