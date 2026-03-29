import { Boxes, CircleAlert, Layers3, Server, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClusterSummary } from "@/lib/types";

type SummaryCardsProps = {
  summary: ClusterSummary;
};

const items = (summary: ClusterSummary) => [
  {
    label: "Nodes",
    value: summary.totalNodeCount,
    detail: "Cluster capacity",
    icon: Server,
  },
  {
    label: "Workspaces",
    value: summary.totalNamespaceCount,
    detail: "Namespace-backed work areas",
    icon: Layers3,
  },
  {
    label: "Instances",
    value: summary.totalPodCount,
    detail: `${summary.runningPodCount} running instances`,
    icon: Boxes,
  },
  {
    label: "Problems",
    value: summary.pendingPodCount,
    detail: `${summary.failedPodCount} failed`,
    icon: CircleAlert,
  },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
      {items(summary).map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="mt-2 text-3xl">{item.value}</CardTitle>
            </div>
            <div className="rounded-full bg-secondary p-3 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Workflow className="h-4 w-4" />
            <span>{item.detail}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
