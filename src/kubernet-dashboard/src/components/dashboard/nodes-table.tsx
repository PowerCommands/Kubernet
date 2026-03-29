import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCpuReservation, formatMemoryBytes, formatPercent } from "@/lib/formatters";
import type { NodeItem } from "@/lib/types";

type NodesTableProps = {
  items: NodeItem[];
};

export function NodesTable({ items }: NodesTableProps) {
  const getReservationVariant = (value: number) => {
    if (value >= 90) {
      return "danger";
    }

    if (value >= 70) {
      return "warning";
    }

    return "success";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>CPU Allocatable</TableHead>
          <TableHead>CPU Requested</TableHead>
          <TableHead>CPU Reserved</TableHead>
          <TableHead>Memory Allocatable</TableHead>
          <TableHead>Memory Requested</TableHead>
          <TableHead>Memory Reserved</TableHead>
          <TableHead>Disk Free</TableHead>
          <TableHead>Pods</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((node) => (
          <TableRow key={node.name}>
            <TableCell className="font-medium">{node.name}</TableCell>
            <TableCell>
              <StatusBadge status={node.readinessStatus} />
            </TableCell>
            <TableCell>{formatCpuReservation(node.cpuAllocatableCores, node.cpuCapacityCores)}</TableCell>
            <TableCell>{formatCpuReservation(node.cpuRequestedCores, node.cpuAllocatableCores)}</TableCell>
            <TableCell>
              <Badge variant={getReservationVariant(node.cpuReservationPercent)}>{formatPercent(node.cpuReservationPercent)}</Badge>
            </TableCell>
            <TableCell>{formatMemoryBytes(node.memoryAllocatableBytes)}</TableCell>
            <TableCell>{formatMemoryBytes(node.memoryRequestedBytes)}</TableCell>
            <TableCell>
              <Badge variant={getReservationVariant(node.memoryReservationPercent)}>{formatPercent(node.memoryReservationPercent)}</Badge>
            </TableCell>
            <TableCell>{formatMemoryBytes(node.diskAvailableBytes)}</TableCell>
            <TableCell>{node.podCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
