import { Boxes, Layers3, SquareStack } from "lucide-react";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { NamespacesTable } from "@/components/dashboard/namespaces-table";
import { PodsTable } from "@/components/dashboard/pods-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalData } from "@/providers/portal-data-provider";

export function ResourcesPage() {
  const { data } = usePortalData();

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Technical Resource Views</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Layers3 className="h-4 w-4 text-primary" />
              Workspaces
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Workspace-facing view of namespace boundaries with phase and instance counts.
            </p>
          </div>
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Boxes className="h-4 w-4 text-primary" />
              Instances
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Technical pod inventory, still available as the low-level fallback beneath the workspace model.
            </p>
          </div>
          <div className="rounded-lg border bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <SquareStack className="h-4 w-4 text-primary" />
              Next resource layers
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Services, ingress, volumes, and other Kubernetes objects will be added here as dedicated subviews.
            </p>
          </div>
        </CardContent>
      </Card>

      <DataTableCard title="Workspaces" description="Namespace inventory presented through the portal workspace model.">
        <NamespacesTable items={data.namespaces} />
      </DataTableCard>

      <DataTableCard
        title="Instances"
        description="Direct Kubernetes pod view across all workspaces for technical fallback and troubleshooting."
      >
        <PodsTable items={data.pods} />
      </DataTableCard>
    </div>
  );
}
