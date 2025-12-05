import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive" | "delinquent";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    active: "success",
    inactive: "secondary",
    delinquent: "warning",
  } as const;

  const labels = {
    active: "Active",
    inactive: "Inactive",
    delinquent: "Delinquent",
  };

  return (
    <Badge variant={variants[status]} className={cn(className)}>
      <span
        className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
          "bg-white": status === "active",
          "bg-muted-foreground": status === "inactive",
          "bg-black": status === "delinquent",
        })}
      />
      {labels[status]}
    </Badge>
  );
}
