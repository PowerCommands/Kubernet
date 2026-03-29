import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WorkspaceNetworkingInstanceItem } from "@/lib/types";

type NetworkingInstancesTableProps = {
  items: WorkspaceNetworkingInstanceItem[];
};

export function NetworkingInstancesTable({ items }: NetworkingInstancesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instance</TableHead>
          <TableHead>Node</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Matched Services</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.podName}>
            <TableCell className="font-medium">{item.podName}</TableCell>
            <TableCell>{item.nodeName ?? "Unscheduled"}</TableCell>
            <TableCell>
              <StatusBadge status={item.phase} />
            </TableCell>
            <TableCell>{item.matchedServices.length === 0 ? "None" : item.matchedServices.join(", ")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
