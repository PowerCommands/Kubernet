import { Layers3, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePortalData } from "@/providers/portal-data-provider";

export function PortalHeader() {
  const { data } = usePortalData();

  return (
    <header className="border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-[2vw] flex items-center justify-between gap-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Kubernet</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">Cluster Portal</h1>
        </div>
        <Card className="min-w-[320px] border-white/70 bg-white/70 shadow-none">
          <CardContent className="flex items-center justify-end gap-6 px-5 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Layers3 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cluster</p>
                <p className="font-medium">{data?.connectionInfo.clusterName ?? "Loading"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">API Server</p>
                <p className="max-w-[280px] truncate font-medium">{data?.connectionInfo.server ?? "Loading"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
