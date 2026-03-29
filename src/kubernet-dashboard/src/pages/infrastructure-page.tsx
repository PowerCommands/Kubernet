import { HardDrive, MemoryStick, Server } from "lucide-react";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { NodesTable } from "@/components/dashboard/nodes-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCpuCores, formatMemoryBytes, formatPercent } from "@/lib/formatters";
import { usePortalData } from "@/providers/portal-data-provider";

export function InfrastructurePage() {
  const { data } = usePortalData();

  if (!data) {
    return null;
  }

  const totalCpuAllocatable = data.nodes.reduce((sum, node) => sum + node.cpuAllocatableCores, 0);
  const totalCpuRequested = data.nodes.reduce((sum, node) => sum + node.cpuRequestedCores, 0);
  const totalMemoryAllocatable = data.nodes.reduce((sum, node) => sum + node.memoryAllocatableBytes, 0);
  const totalMemoryRequested = data.nodes.reduce((sum, node) => sum + node.memoryRequestedBytes, 0);
  const totalDiskAvailable = data.nodes.reduce((sum, node) => sum + node.diskAvailableBytes, 0);
  const cpuReservationPercent =
    totalCpuAllocatable === 0 ? 0 : (totalCpuRequested / totalCpuAllocatable) * 100;
  const memoryReservationPercent =
    totalMemoryAllocatable === 0 ? 0 : (totalMemoryRequested / totalMemoryAllocatable) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">CPU Reservation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold">{formatPercent(cpuReservationPercent)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatCpuCores(totalCpuRequested)} requested of {formatCpuCores(totalCpuAllocatable)} allocatable
                </p>
              </div>
              <Server className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Memory Reservation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold">{formatPercent(memoryReservationPercent)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatMemoryBytes(totalMemoryRequested)} requested of {formatMemoryBytes(totalMemoryAllocatable)}
                </p>
              </div>
              <MemoryStick className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scheduling Headroom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-semibold">{formatMemoryBytes(totalDiskAvailable)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Remaining allocatable ephemeral storage across {data.nodes.length} nodes.
                </p>
              </div>
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTableCard
        title="Node Capacity"
        description="Infrastructure capacity and reservation from a scheduling perspective, based on node allocatable values and pod requests."
      >
        <NodesTable items={data.nodes} />
      </DataTableCard>
    </div>
  );
}
