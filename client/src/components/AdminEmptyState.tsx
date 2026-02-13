import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="bg-[#008090] hover:bg-[#006070]">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
