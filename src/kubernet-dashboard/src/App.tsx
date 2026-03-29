import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/layout/app-shell";
import { InfrastructurePage } from "@/pages/infrastructure-page";
import { OverviewPage } from "@/pages/overview-page";
import { ResourcesPage } from "@/pages/resources-page";
import { TopologyPage } from "@/pages/topology-page";
import { WorkspaceDetailPage } from "@/pages/workspace-detail-page";
import { WorkspacesPage } from "@/pages/workspaces-page";
import { PortalDataProvider } from "@/providers/portal-data-provider";

export default function App() {
  return (
    <PortalDataProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate replace to="/overview" />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/workspaces/:workspaceName" element={<WorkspaceDetailPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          <Route path="/topology" element={<TopologyPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Route>
      </Routes>
    </PortalDataProvider>
  );
}
