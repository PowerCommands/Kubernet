import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getClusterConnectionInfo, getClusterSummary, getNamespaces, getNodes, getPods } from "@/lib/api";
import type { ClusterConnectionInfo, ClusterSummary, NamespaceItem, NodeItem, PodItem } from "@/lib/types";

type PortalData = {
  connectionInfo: ClusterConnectionInfo;
  summary: ClusterSummary;
  nodes: NodeItem[];
  namespaces: NamespaceItem[];
  pods: PodItem[];
};

type PortalDataContextValue = {
  data: PortalData | null;
  error: string | null;
  isLoading: boolean;
};

const PortalDataContext = createContext<PortalDataContextValue | undefined>(undefined);

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPortalData() {
      try {
        const [connectionInfo, summary, nodes, namespaces, pods] = await Promise.all([
          getClusterConnectionInfo(),
          getClusterSummary(),
          getNodes(),
          getNamespaces(),
          getPods(),
        ]);

        if (!isMounted) {
          return;
        }

        setData({ connectionInfo, summary, nodes, namespaces, pods });
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unknown error.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPortalData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      data,
      error,
      isLoading,
    }),
    [data, error, isLoading],
  );

  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>;
}

export function usePortalData() {
  const context = useContext(PortalDataContext);

  if (!context) {
    throw new Error("usePortalData must be used within PortalDataProvider.");
  }

  return context;
}
