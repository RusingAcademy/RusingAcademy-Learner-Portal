import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

interface AdminStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export default function AdminStatsGrid({ stats, columns = 4, className }: AdminStatsGridProps) {
  const colClass = columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : columns === 5 ? "grid-cols-5" : "grid-cols-4";
  return (
    <div className={cn(`grid gap-4 ${colClass} sm:grid-cols-2 lg:${colClass}`, className)}>
      {stats.map((s, i) => (
        <Card key={i} className="border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              {s.icon && <span className="text-muted-foreground">{s.icon}</span>}
            </div>
            <p className={cn("text-2xl font-bold mt-1", s.color ?? "text-foreground")}>{s.value}</p>
            {s.trend && (
              <p className={cn("text-xs mt-1", s.trendUp ? "text-green-600" : "text-red-500")}>
                {s.trend}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
