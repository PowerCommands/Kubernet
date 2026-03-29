import { Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PortalHeader } from "@/layout/portal-header";
import { Sidebar } from "@/layout/sidebar";
import { usePortalData } from "@/providers/portal-data-provider";

export function AppShell() {
  const { error, isLoading } = usePortalData();

  return (
    <div className="min-h-screen">
      <PortalHeader />
      <div className="mx-[2vw] grid gap-6 py-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <main className="min-w-0">
          {isLoading ? (
            <Card>
              <CardContent className="flex min-h-48 items-center justify-center text-muted-foreground">
                Loading portal data...
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-danger/60">
              <CardContent className="flex min-h-48 items-center justify-center text-danger-foreground">
                {error}
              </CardContent>
            </Card>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
