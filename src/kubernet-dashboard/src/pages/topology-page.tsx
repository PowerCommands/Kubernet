import { Network, ScanSearch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePortalData } from "@/providers/portal-data-provider";

export function TopologyPage() {
  const { data } = usePortalData();

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-white/60">
          <CardTitle>Topology Workspace</CardTitle>
          <CardDescription>
            This space will later visualize how workspaces, instances, services, ingress, and nodes relate to each other.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 py-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-lg border bg-white/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace Focus</p>
              <select
                className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
                defaultValue="all"
                disabled
              >
                <option value="all">All workspaces</option>
                {data.namespaces.map((namespace) => (
                  <option key={namespace.name} value={namespace.name}>
                    {namespace.name}
                  </option>
                ))}
              </select>
              <p className="mt-3 text-sm text-muted-foreground">
                Workspace scoping and topology filtering will land here as the topology view matures.
              </p>
            </div>
            <div className="rounded-lg border bg-white/70 p-4">
              <p className="text-sm font-medium text-foreground">Planned relationship layers</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Workspaces and namespace boundaries</li>
                <li>Instances, services, and dependency paths</li>
                <li>Ingress entry points and exposure paths</li>
                <li>Placement on infrastructure nodes</li>
              </ul>
            </div>
          </div>

          <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed bg-gradient-to-br from-white via-white to-secondary/40 p-8">
            <div className="max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
                <Network className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Topology canvas coming next</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                The portal will evolve from object listings into relationship-aware views. This page is reserved for that visual model and will grow into a map of workspaces, instance paths, and infrastructure placement.
              </p>
              <Separator className="my-6" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ScanSearch className="h-4 w-4" />
                Start here later for workspace-aware topology exploration.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
