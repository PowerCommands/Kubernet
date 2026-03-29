import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeAge } from "@/lib/formatters";
import type { PodItem } from "@/lib/types";

type PodsTableProps = {
  items: PodItem[];
  showWorkspace?: boolean;
};

export function PodsTable({ items, showWorkspace = true }: PodsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instance</TableHead>
          {showWorkspace ? <TableHead>Workspace</TableHead> : null}
          <TableHead>Status</TableHead>
          <TableHead>Node</TableHead>
          <TableHead>Restarts</TableHead>
          <TableHead>Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((pod) => (
          <TableRow key={`${pod.namespace}-${pod.name}`}>
            <TableCell className="font-medium">{pod.name}</TableCell>
            {showWorkspace ? <TableCell>{pod.namespace}</TableCell> : null}
            <TableCell>
              <StatusBadge status={pod.status} />
            </TableCell>
            <TableCell>{pod.nodeName ?? "Unscheduled"}</TableCell>
            <TableCell>{pod.restartCount}</TableCell>
            <TableCell>{formatRelativeAge(pod.createdAtUtc)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
