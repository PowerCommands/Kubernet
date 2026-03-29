import type {
  ClusterConnectionInfo,
  ClusterSummary,
  NamespaceItem,
  NodeItem,
  PodItem,
  WorkspaceNetworking,
} from "@/lib/types";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed for ${path} with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export function getClusterSummary() {
  return fetchJson<ClusterSummary>("/api/cluster/summary");
}

export function getClusterConnectionInfo() {
  return fetchJson<ClusterConnectionInfo>("/api/cluster/connection-info");
}

export function getNodes() {
  return fetchJson<NodeItem[]>("/api/nodes");
}

export function getNamespaces() {
  return fetchJson<NamespaceItem[]>("/api/namespaces");
}

export function getPods() {
  return fetchJson<PodItem[]>("/api/pods");
}

export function getWorkspaceNetworking(workspaceName: string) {
  return fetchJson<WorkspaceNetworking>(`/api/workspaces/${encodeURIComponent(workspaceName)}/networking`);
}
