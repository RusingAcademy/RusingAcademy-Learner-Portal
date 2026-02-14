import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  month: string;
  revenue: number;
  commission: number;
}

interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  className?: string;
  showCommission?: boolean;
}

export function ChartCard({
  title,
  description,
  data,
  className,
  showCommission = true,
}: ChartCardProps) {
  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart bars */}
          <div className="flex items-end justify-between gap-2 h-40">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-1" style={{ height: '120px' }}>
                  {/* Revenue bar */}
                  <div 
                    className="w-full bg-primary/20 rounded-t relative group transition-all hover:bg-primary/30"
                    style={{ 
                      height: `${Math.max((item.revenue / maxValue) * 100, 2)}%`,
                      minHeight: '4px'
                    }}
                  >
                    {showCommission && item.commission > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-emerald-500/60 rounded-t"
                        style={{ 
                          height: `${(item.commission / item.revenue) * 100}%`
                        }}
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      <div>Revenus: ${(item.revenue / 100).toLocaleString()}</div>
                      {showCommission && <div className="text-emerald-500">Commission: ${(item.commission / 100).toLocaleString()}</div>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span className="text-xs text-muted-foreground">Revenus totaux</span>
            </div>
            {showCommission && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/60" />
                <span className="text-xs text-muted-foreground">Commission (30%)</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChartCard;
