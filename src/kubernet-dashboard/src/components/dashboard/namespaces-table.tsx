import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { NamespaceItem } from "@/lib/types";

type NamespacesTableProps = {
  items: NamespaceItem[];
};

export function NamespacesTable({ items }: NamespacesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Instance Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((namespace) => (
          <TableRow key={namespace.name}>
            <TableCell className="font-medium">{namespace.name}</TableCell>
            <TableCell>
              <StatusBadge status={namespace.status} />
            </TableCell>
            <TableCell>{namespace.podCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
