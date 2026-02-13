
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleGuideProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export const CollapsibleGuide = ({ title, children, defaultOpen = false, className }: CollapsibleGuideProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className={cn("overflow-hidden border-blue-100 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/20", className)}>
            <CardHeader
                className="py-3 px-4 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/30 transition-colors flex flex-row items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    {title}
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-800 dark:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </CardHeader>
            {isOpen && (
                <CardContent className="py-3 px-4 text-xs text-blue-700 dark:text-blue-400 leading-relaxed border-t border-blue-100 dark:border-blue-900/30 bg-white/50 dark:bg-slate-950/40">
                    {children}
                </CardContent>
            )}
        </Card>
    );
};
