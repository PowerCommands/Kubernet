import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const variant =
    normalized === "ready" ||
    normalized === "running" ||
    normalized === "active" ||
    normalized === "healthy"
      ? "success"
      : normalized === "pending" || normalized === "attention"
        ? "warning"
        : normalized === "failed" || normalized === "notready" || normalized === "degraded"
          ? "danger"
          : "muted";

  return <Badge variant={variant}>{status}</Badge>;
}
