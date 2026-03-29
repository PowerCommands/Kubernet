import { Badge } from "@/components/ui/badge";

type NetworkingStatusBadgeProps = {
  status: string;
};

export function NetworkingStatusBadge({ status }: NetworkingStatusBadgeProps) {
  const normalized = status.toLowerCase();

  const variant =
    normalized === "ok"
      ? "success"
      : normalized === "no tls"
        ? "warning"
        : normalized === "missing service" ||
            normalized === "incomplete" ||
            normalized === "no matching pods"
          ? "danger"
          : "muted";

  return <Badge variant={variant}>{status}</Badge>;
}
