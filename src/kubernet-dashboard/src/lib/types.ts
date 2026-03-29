export type ClusterSummary = {
  totalNodeCount: number;
  totalNamespaceCount: number;
  totalPodCount: number;
  runningPodCount: number;
  pendingPodCount: number;
  failedPodCount: number;
};

export type ClusterConnectionInfo = {
  kubeConfigPath: string;
  currentContext: string | null;
  clusterName: string | null;
  server: string;
  kubernetesVersion: string | null;
};

export type NodeItem = {
  name: string;
  readinessStatus: string;
  roles: string[];
  kubeletVersion: string | null;
  cpuCapacityCores: number;
  cpuAllocatableCores: number;
  cpuRequestedCores: number;
  cpuReservationPercent: number;
  memoryCapacityBytes: number;
  memoryAllocatableBytes: number;
  memoryRequestedBytes: number;
  memoryReservationPercent: number;
  diskCapacityBytes: number;
  diskAllocatableBytes: number;
  diskRequestedBytes: number;
  diskAvailableBytes: number;
  diskReservationPercent: number;
  podCount: number;
};

export type NamespaceItem = {
  name: string;
  status: string;
  podCount: number;
};

export type PodItem = {
  name: string;
  namespace: string;
  status: string;
  nodeName: string | null;
  restartCount: number;
  createdAtUtc: string;
};

export type WorkspaceNetworking = {
  workspaceName: string;
  externalAccess: WorkspaceExternalAccessItem[];
  services: WorkspaceNetworkingServiceItem[];
  instances: WorkspaceNetworkingInstanceItem[];
};

export type WorkspaceExternalAccessItem = {
  ingressName: string;
  host: string;
  path: string;
  serviceName: string | null;
  servicePort: string | null;
  tlsEnabled: boolean;
  tlsSecretName: string | null;
  status: string;
};

export type WorkspaceNetworkingServiceItem = {
  serviceName: string;
  serviceType: string;
  clusterIp: string | null;
  ports: WorkspaceNetworkingServicePortItem[];
  selector: Record<string, string>;
  targetPodNames: string[];
  targetPodCount: number;
  status: string;
};

export type WorkspaceNetworkingServicePortItem = {
  name: string | null;
  port: number;
  targetPort: string;
  protocol: string;
};

export type WorkspaceNetworkingInstanceItem = {
  podName: string;
  nodeName: string | null;
  phase: string;
  matchedServices: string[];
};
