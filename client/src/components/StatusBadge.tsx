import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const VARIANT_MAP: Record<string, { bg: string; text: string; label?: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  review: { bg: "bg-blue-100", text: "text-blue-700", label: "In Review" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Approved" },
  published: { bg: "bg-green-100", text: "text-green-700", label: "Published" },
  archived: { bg: "bg-amber-100", text: "text-amber-700", label: "Archived" },
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Inactive" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
  suspended: { bg: "bg-red-100", text: "text-red-700", label: "Suspended" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
};

interface StatusBadgeProps {
  variant: string;
  label?: string;
  className?: string;
}

export default function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const v = VARIANT_MAP[variant] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <Badge variant="outline" className={cn(v.bg, v.text, "border-0 font-medium text-xs", className)}>
      {label ?? v.label ?? variant}
    </Badge>
  );
}
