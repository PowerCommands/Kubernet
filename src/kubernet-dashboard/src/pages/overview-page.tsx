import { Activity, Boxes, Server } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPercent } from "@/lib/formatters";
import { usePortalData } from "@/providers/portal-data-provider";

function getHealthStatus(problemCount: number) {
  if (problemCount === 0) {
    return "Healthy";
  }

  if (problemCount <= 3) {
    return "Attention";
  }

  return "Degraded";
}

export function OverviewPage() {
  const { data } = usePortalData();

  if (!data) {
    return null;
  }

  const problemCount = data.summary.pendingPodCount + data.summary.failedPodCount;
  const healthyNodes = data.nodes.filter((node) => node.readinessStatus === "Ready").length;
  const workspaceCount = data.namespaces.length;
  const instanceCount = data.pods.length;
  const averageCpuReservation =
    data.nodes.length === 0
      ? 0
      : data.nodes.reduce((sum, node) => sum + node.cpuReservationPercent, 0) / data.nodes.length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Executive Overview</CardTitle>
            <CardDescription>
              High-level view of environment health, workload presence, and infrastructure readiness.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Cluster Health
              </div>
              <div className="mt-4 flex items-center gap-3">
                <StatusBadge status={getHealthStatus(problemCount)} />
                <span className="text-sm text-muted-foreground">{problemCount} problem indicators</span>
              </div>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Boxes className="h-4 w-4 text-primary" />
                Workspaces and Instances
              </div>
              <p className="mt-4 text-3xl font-semibold">{workspaceCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {instanceCount} instances across {workspaceCount} workspaces
              </p>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Server className="h-4 w-4 text-primary" />
                Infrastructure Readiness
              </div>
              <p className="mt-4 text-3xl font-semibold">
                {healthyNodes}/{data.summary.totalNodeCount}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Average CPU reservation {formatPercent(averageCpuReservation)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Environment</CardTitle>
            <CardDescription>Current cluster connection used by the portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cluster</p>
              <p className="mt-2 text-sm font-medium">{data.connectionInfo.clusterName ?? "Unavailable"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Context</p>
              <p className="mt-2 text-sm font-medium">{data.connectionInfo.currentContext ?? "Unavailable"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">API Server</p>
              <p className="mt-2 break-all text-sm font-medium">{data.connectionInfo.server}</p>
            </div>
            <Separator />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Kubernetes Version</p>
              <p className="mt-2 text-sm font-medium">{data.connectionInfo.kubernetesVersion ?? "Unavailable"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <SummaryCards summary={data.summary} />
    </div>
  );
}
