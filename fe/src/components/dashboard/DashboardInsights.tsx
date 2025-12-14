import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardInsightsProps {
    insights: { type: string; message: string }[];
}

export const DashboardInsights = ({ insights }: DashboardInsightsProps) => {
    if (!insights || insights.length === 0) return null;

    return (
        <Card className="h-full bg-gradient-to-br from-primary/5 via-background to-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5 fill-primary/20" />
                    AI Summary & Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {insights.map((insight, index) => (
                        <li key={index} className="text-sm flex gap-3 items-start group">
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors shrink-0 shadow-sm" />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                {insight.message}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
