import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: number | string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

interface AlertBadgeProps {
  title: string;
  count: number;
  items: AlertItem[];
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  variant?: "warning" | "info" | "success" | "destructive";
  onViewAll?: () => void;
  viewAllLabel?: string;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

export function AlertBadge({
  title,
  count,
  items,
  icon: Icon,
  iconColor = "text-amber-600",
  iconBgColor = "bg-amber-100",
  variant = "warning",
  onViewAll,
  viewAllLabel = "View All",
  emptyMessage = "No items",
  maxItems = 3,
  className,
}: AlertBadgeProps) {
  const displayItems = items.slice(0, maxItems);
  
  const variantStyles = {
    warning: "border-amber-200 bg-amber-50/50",
    info: "border-blue-200 bg-blue-50/50",
    success: "border-emerald-200 bg-emerald-50/50",
    destructive: "border-red-200 bg-red-50/50",
  };
  
  return (
    <Card className={cn("overflow-hidden", variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", iconBgColor)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              {count > 0 && (
                <Badge variant={variant === "destructive" ? "destructive" : "secondary"} className="mt-1">
                  {count} {count === 1 ? "item" : "items"}
                </Badge>
              )}
            </div>
          </div>
          {onViewAll && count > 0 && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
              {viewAllLabel}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {count === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          <div className="space-y-2">
            {displayItems.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg bg-background/80",
                  item.onClick && "cursor-pointer hover:bg-background transition-colors"
                )}
                onClick={item.onClick}
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <item.icon className={cn("h-4 w-4", item.iconColor || "text-muted-foreground")} />
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                {item.onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
            {items.length > maxItems && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{items.length - maxItems} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertBadge;
