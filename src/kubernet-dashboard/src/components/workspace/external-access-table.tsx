import { NetworkingStatusBadge } from "@/components/workspace/networking-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkspaceExternalAccessItem } from "@/lib/types";

type ExternalAccessTableProps = {
  items: WorkspaceExternalAccessItem[];
};

export function ExternalAccessTable({ items }: ExternalAccessTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Host</TableHead>
          <TableHead>Path</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Port</TableHead>
          <TableHead>TLS</TableHead>
          <TableHead>TLS Secret</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.ingressName}-${item.host}-${item.path}-${item.serviceName ?? "none"}`}>
            <TableCell>
              <div className="font-medium">{item.host}</div>
              <div className="mt-1 text-xs text-muted-foreground">Ingress: {item.ingressName}</div>
            </TableCell>
            <TableCell>{item.path}</TableCell>
            <TableCell>{item.serviceName ?? "Unmapped"}</TableCell>
            <TableCell>{item.servicePort ?? "Unknown"}</TableCell>
            <TableCell>{item.tlsEnabled ? "Enabled" : "No TLS"}</TableCell>
            <TableCell>{item.tlsSecretName ?? "None"}</TableCell>
            <TableCell>
              <NetworkingStatusBadge status={item.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
