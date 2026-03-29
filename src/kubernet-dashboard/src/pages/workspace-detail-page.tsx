import { ArrowLeft, Boxes, Globe, Rows3, SquareStack, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { ExternalAccessTable } from "@/components/workspace/external-access-table";
import { NetworkingInstancesTable } from "@/components/workspace/networking-instances-table";
import { ServicesTable } from "@/components/workspace/services-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceNetworking } from "@/lib/api";
import type { WorkspaceNetworking } from "@/lib/types";
import { usePortalData } from "@/providers/portal-data-provider";

export function WorkspaceDetailPage() {
  const { workspaceName } = useParams<{ workspaceName: string }>();
  const { data } = usePortalData();
  const [networking, setNetworking] = useState<WorkspaceNetworking | null>(null);
  const [networkingError, setNetworkingError] = useState<string | null>(null);
  const [isNetworkingLoading, setIsNetworkingLoading] = useState(true);
  const decodedWorkspaceName = workspaceName ? decodeURIComponent(workspaceName) : null;

  useEffect(() => {
    if (!decodedWorkspaceName) {
      setNetworking(null);
      setNetworkingError(null);
      setIsNetworkingLoading(false);
      return;
    }

    const currentWorkspaceName = decodedWorkspaceName;
    let isMounted = true;

    async function loadNetworking() {
      setIsNetworkingLoading(true);
      setNetworking(null);
      setNetworkingError(null);

      try {
        const result = await getWorkspaceNetworking(currentWorkspaceName);

        if (!isMounted) {
          return;
        }

        setNetworking(result);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNetworkingError(error instanceof Error ? error.message : "Unknown error.");
      } finally {
        if (isMounted) {
          setIsNetworkingLoading(false);
        }
      }
    }

    void loadNetworking();

    return () => {
      isMounted = false;
    };
  }, [decodedWorkspaceName]);

  if (!data || !decodedWorkspaceName) {
    return null;
  }

  const workspace = data.namespaces.find((item) => item.name === decodedWorkspaceName);

  if (!workspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspace not found</CardTitle>
          <CardDescription>
            The requested workspace could not be matched to a namespace in the current cluster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/workspaces" className="text-sm font-medium text-primary hover:underline">
            Back to Workspaces
          </Link>
        </CardContent>
      </Card>
    );
  }

  const instances = data.pods.filter((pod) => pod.namespace === workspace.name);
  const problemInstances = instances.filter((pod) => {
    const normalizedStatus = pod.status.toLowerCase();
    return normalizedStatus === "pending" || normalizedStatus === "failed";
  });
  const nodesInUse = new Set(instances.map((pod) => pod.nodeName).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/workspaces" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Workspaces
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>{workspace.name}</CardTitle>
              <CardDescription className="mt-1">Workspace mapped to Kubernetes namespace `{workspace.name}`.</CardDescription>
            </div>
            <StatusBadge status={workspace.status} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Rows3 className="h-3.5 w-3.5" />
              Summary
            </div>
            <p className="mt-3 text-2xl font-semibold">{workspace.podCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Instances currently mapped to this workspace.</p>
          </div>
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Boxes className="h-3.5 w-3.5" />
              Healthy Instances
            </div>
            <p className="mt-3 text-2xl font-semibold">{instances.length - problemInstances.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Running or otherwise non-problematic instances.</p>
          </div>
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              Networking
            </div>
            <p className="mt-3 text-2xl font-semibold">{networking?.externalAccess.length ?? 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">External endpoints currently exposing this workspace.</p>
          </div>
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <SquareStack className="h-3.5 w-3.5" />
              Resources
            </div>
            <p className="mt-3 text-2xl font-semibold">{problemInstances.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Problem indicators to investigate in this workspace.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Networking</CardTitle>
          <CardDescription>
            How this workspace is reached and how traffic flows from external entry points to internal services and instances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-4">
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                External Access
              </div>
              <p className="mt-3 text-2xl font-semibold">{networking?.externalAccess.length ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Waypoints className="h-3.5 w-3.5" />
                Services
              </div>
              <p className="mt-3 text-2xl font-semibold">{networking?.services.length ?? 0}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Boxes className="h-3.5 w-3.5" />
                Instances
              </div>
              <p className="mt-3 text-2xl font-semibold">{networking?.instances.length ?? instances.length}</p>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Flow</div>
              <p className="mt-3 text-sm font-medium text-foreground">Host → Service → Instances</p>
              <p className="mt-2 text-sm text-muted-foreground">{nodesInUse} nodes currently participate in this workspace.</p>
            </div>
          </div>

          {isNetworkingLoading ? (
            <div className="rounded-lg border bg-white/70 p-6 text-sm text-muted-foreground">
              Loading networking relationships...
            </div>
          ) : networkingError ? (
            <div className="rounded-lg border border-danger/60 bg-white/70 p-6 text-sm text-danger-foreground">
              {networkingError}
            </div>
          ) : networking ? (
            <div className="space-y-6">
              <DataTableCard
                title="External Access"
                description="External host and path mappings that route traffic into this workspace."
              >
                <ExternalAccessTable items={networking.externalAccess} />
              </DataTableCard>

              <DataTableCard
                title="Services"
                description="Stable internal routing points and which instances they currently match."
              >
                <ServicesTable items={networking.services} />
              </DataTableCard>

              <DataTableCard
                title="Instances"
                description="Running workspace instances and the services that currently point to them."
              >
                <NetworkingInstancesTable items={networking.instances} />
              </DataTableCard>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            This section will later gather the workspace&apos;s controllers, secrets, config, and related Kubernetes objects.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The workspace-to-resource relationship is intentionally left as the next incremental step.
        </CardContent>
      </Card>
    </div>
  );
}
