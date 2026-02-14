import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  trend,
  trendLabel,
  className,
}: StatCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(trend !== undefined || subtitle) && (
              <div className="flex items-center gap-1">
                {trend !== undefined && (
                  <>
                    {isPositiveTrend ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                      "text-sm font-medium",
                      isPositiveTrend ? "text-emerald-500" : "text-red-500"
                    )}>
                      {isPositiveTrend ? "+" : ""}{trend}%
                    </span>
                  </>
                )}
                {trendLabel && (
                  <span className="text-sm text-muted-foreground ml-1">{trendLabel}</span>
                )}
                {subtitle && !trend && (
                  <span className="text-sm text-muted-foreground">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
