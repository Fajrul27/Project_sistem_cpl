import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface FloatingBackButtonProps {
    onClick?: () => void;
    path?: string;
    children?: ReactNode;
    className?: string;
    hideBackButton?: boolean;
}

export function FloatingBackButton({ onClick, path, children, className, hideBackButton }: FloatingBackButtonProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (path) {
            navigate(path);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`relative ${className || ''}`}>
            {/* Back Button Side Column */}
            {!hideBackButton && (
                <div className="fixed left-[calc(var(--sidebar-width)+1rem)] top-1/2 -translate-y-1/2 z-40 transition-all duration-300">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full shadow-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 h-10 w-10 transition-all hover:scale-105"
                        onClick={handleClick}
                        title="Kembali"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </div>
            )}

            <div className="min-w-0">
                {children}
            </div>
        </div>
    );
}
