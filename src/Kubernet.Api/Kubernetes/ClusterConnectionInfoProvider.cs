using Kubernet.Api.Models;
using k8s;

namespace Kubernet.Api.Kubernetes;

public sealed class ClusterConnectionInfoProvider : IClusterConnectionInfoProvider
{
    private readonly IKubernetesClientFactory _kubernetesClientFactory;

    public ClusterConnectionInfoProvider(IKubernetesClientFactory kubernetesClientFactory)
    {
        _kubernetesClientFactory = kubernetesClientFactory;
    }

    private const string ServiceHostEnvironmentVariable = "KUBERNETES_SERVICE_HOST";
    private const string KubeConfigEnvironmentVariable = "KUBECONFIG";
    private const string InClusterServiceAccountTokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";

    public async Task<ClusterConnectionInfoDto> GetCurrentAsync(CancellationToken cancellationToken)
    {
        var kubernetesVersion = await TryGetKubernetesVersionAsync(cancellationToken);

        if (IsInCluster())
        {
            var configuration = KubernetesClientConfiguration.InClusterConfig();

            return new ClusterConnectionInfoDto(
                KubeConfigPath: "(in-cluster)",
                CurrentContext: null,
                ClusterName: "in-cluster",
                Server: configuration.Host,
                KubernetesVersion: kubernetesVersion);
        }

        var kubeConfigPath = ResolveKubeConfigPath();
        var currentContext = TryReadCurrentContextFromKubeConfig(kubeConfigPath);
        var clusterName = TryReadClusterNameForContext(kubeConfigPath, currentContext);
        var server = TryReadServerForCluster(kubeConfigPath, clusterName);

        return new ClusterConnectionInfoDto(
            KubeConfigPath: kubeConfigPath,
            CurrentContext: currentContext,
            ClusterName: clusterName,
            Server: server ?? "(unknown)",
            KubernetesVersion: kubernetesVersion);
    }

    private async Task<string?> TryGetKubernetesVersionAsync(CancellationToken cancellationToken)
    {
        try
        {
            var client = _kubernetesClientFactory.CreateClient();
            var version = await client.Version.GetCodeAsync(cancellationToken: cancellationToken);

            if (string.IsNullOrWhiteSpace(version.GitVersion))
            {
                return null;
            }

            return version.GitVersion;
        }
        catch
        {
            return null;
        }
    }

    private static string ResolveKubeConfigPath()
    {
        var configuredPath = Environment.GetEnvironmentVariable(KubeConfigEnvironmentVariable);

        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            return configuredPath;
        }

        var homeDirectory = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        return Path.Combine(homeDirectory, ".kube", "config");
    }

    private static bool IsInCluster()
    {
        return !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(ServiceHostEnvironmentVariable))
               && File.Exists(InClusterServiceAccountTokenPath);
    }

    private static string? TryReadCurrentContextFromKubeConfig(string kubeConfigPath)
    {
        if (!File.Exists(kubeConfigPath))
        {
            return null;
        }

        foreach (var line in File.ReadLines(kubeConfigPath))
        {
            const string prefix = "current-context:";

            if (!line.TrimStart().StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var value = line[(line.IndexOf(prefix, StringComparison.OrdinalIgnoreCase) + prefix.Length)..].Trim();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }

        return null;
    }

    private static string? TryReadClusterNameForContext(string kubeConfigPath, string? currentContext)
    {
        if (!File.Exists(kubeConfigPath) || string.IsNullOrWhiteSpace(currentContext))
        {
            return null;
        }

        string? pendingClusterName = null;
        string? pendingContextName = null;
        var inContextsSection = false;

        foreach (var rawLine in File.ReadLines(kubeConfigPath))
        {
            var line = rawLine.Trim();

            if (line == "contexts:")
            {
                inContextsSection = true;
                pendingClusterName = null;
                pendingContextName = null;
                continue;
            }

            if (inContextsSection && !rawLine.StartsWith(' ') && !rawLine.StartsWith('-') && line != "contexts:")
            {
                break;
            }

            if (!inContextsSection)
            {
                continue;
            }

            if (line.StartsWith("- context:", StringComparison.OrdinalIgnoreCase))
            {
                pendingClusterName = null;
                pendingContextName = null;
                continue;
            }

            if (line.StartsWith("cluster:", StringComparison.OrdinalIgnoreCase))
            {
                pendingClusterName = line["cluster:".Length..].Trim();
                continue;
            }

            if (line.StartsWith("name:", StringComparison.OrdinalIgnoreCase))
            {
                pendingContextName = line["name:".Length..].Trim();

                if (string.Equals(pendingContextName, currentContext, StringComparison.OrdinalIgnoreCase))
                {
                    return pendingClusterName;
                }
            }
        }

        return null;
    }

    private static string? TryReadServerForCluster(string kubeConfigPath, string? clusterName)
    {
        if (!File.Exists(kubeConfigPath) || string.IsNullOrWhiteSpace(clusterName))
        {
            return null;
        }

        string? pendingName = null;
        string? pendingServer = null;
        var inClustersSection = false;

        foreach (var rawLine in File.ReadLines(kubeConfigPath))
        {
            var line = rawLine.Trim();

            if (line == "clusters:")
            {
                inClustersSection = true;
                pendingName = null;
                pendingServer = null;
                continue;
            }

            if (inClustersSection && !rawLine.StartsWith(' ') && !rawLine.StartsWith('-') && line != "clusters:")
            {
                break;
            }

            if (!inClustersSection)
            {
                continue;
            }

            if (line.StartsWith("- cluster:", StringComparison.OrdinalIgnoreCase))
            {
                pendingName = null;
                pendingServer = null;
                continue;
            }

            if (line.StartsWith("server:", StringComparison.OrdinalIgnoreCase))
            {
                pendingServer = line["server:".Length..].Trim();
                continue;
            }

            if (line.StartsWith("name:", StringComparison.OrdinalIgnoreCase))
            {
                pendingName = line["name:".Length..].Trim();

                if (string.Equals(pendingName, clusterName, StringComparison.OrdinalIgnoreCase))
                {
                    return pendingServer;
                }
            }
        }

        return null;
    }
}
