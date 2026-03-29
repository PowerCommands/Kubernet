import { NetworkingStatusBadge } from "@/components/workspace/networking-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkspaceNetworkingServiceItem } from "@/lib/types";

type ServicesTableProps = {
  items: WorkspaceNetworkingServiceItem[];
};

function formatPorts(item: WorkspaceNetworkingServiceItem) {
  if (item.ports.length === 0) {
    return "No ports";
  }

  return item.ports
    .map((port) => {
      const prefix = port.name ? `${port.name}: ` : "";
      return `${prefix}${port.port} -> ${port.targetPort} ${port.protocol}`;
    })
    .join(", ");
}

function formatSelector(selector: Record<string, string>) {
  const entries = Object.entries(selector);

  if (entries.length === 0) {
    return "No selector";
  }

  return entries.map(([key, value]) => `${key}=${value}`).join(", ");
}

export function ServicesTable({ items }: ServicesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Cluster IP</TableHead>
          <TableHead>Ports</TableHead>
          <TableHead>Selector</TableHead>
          <TableHead>Target Instances</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.serviceName}>
            <TableCell className="font-medium">{item.serviceName}</TableCell>
            <TableCell>{item.serviceType}</TableCell>
            <TableCell>{item.clusterIp ?? "Headless / None"}</TableCell>
            <TableCell>{formatPorts(item)}</TableCell>
            <TableCell>{formatSelector(item.selector)}</TableCell>
            <TableCell>{item.targetPodCount}</TableCell>
            <TableCell>
              <NetworkingStatusBadge status={item.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
