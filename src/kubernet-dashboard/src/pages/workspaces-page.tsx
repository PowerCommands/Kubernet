import { AlertTriangle, FolderKanban, Rows3 } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalData } from "@/providers/portal-data-provider";

export function WorkspacesPage() {
  const { data } = usePortalData();

  if (!data) {
    return null;
  }

  const problemPodsByWorkspace = new Map<string, number>();

  for (const pod of data.pods) {
    const normalizedStatus = pod.status.toLowerCase();
    const hasProblem = normalizedStatus === "pending" || normalizedStatus === "failed";

    if (!hasProblem) {
      continue;
    }

    problemPodsByWorkspace.set(pod.namespace, (problemPodsByWorkspace.get(pod.namespace) ?? 0) + 1);
  }

  const workspaces = [...data.namespaces].sort((left, right) => {
    const leftProblems = problemPodsByWorkspace.get(left.name) ?? 0;
    const rightProblems = problemPodsByWorkspace.get(right.name) ?? 0;

    if (leftProblems !== rightProblems) {
      return rightProblems - leftProblems;
    }

    return left.name.localeCompare(right.name);
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workspace Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderKanban className="h-4 w-4 text-primary" />
              Each workspace maps directly to a Kubernetes namespace and becomes the primary portal object.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{workspaces.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Structured work areas across the connected cluster.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instance Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{data.summary.pendingPodCount + data.summary.failedPodCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pending or failed instances surfaced through their owning workspace.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {workspaces.map((workspace) => {
          const problemCount = problemPodsByWorkspace.get(workspace.name) ?? 0;

          return (
            <Link
              key={workspace.name}
              to={`/workspaces/${encodeURIComponent(workspace.name)}`}
              className="block"
            >
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-white/95">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{workspace.name}</CardTitle>
                      <CardDescription className="mt-1">Namespace: {workspace.name}</CardDescription>
                    </div>
                    <StatusBadge status={workspace.status} />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-white/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Rows3 className="h-3.5 w-3.5" />
                      Instances
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{workspace.podCount}</p>
                  </div>
                  <div className="rounded-lg border bg-white/70 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Status
                    </div>
                    <div className="mt-3">
                      <StatusBadge status={workspace.status} />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-white/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Problems
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{problemCount}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
