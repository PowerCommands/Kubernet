using k8s;
using k8s.Models;
using Kubernet.Api.Kubernetes;
using Kubernet.Api.Models;

namespace Kubernet.Api.Services;

public sealed class ClusterDashboardService : IClusterDashboardService
{
    private readonly IKubernetesClientFactory _kubernetesClientFactory;

    public ClusterDashboardService(IKubernetesClientFactory kubernetesClientFactory)
    {
        _kubernetesClientFactory = kubernetesClientFactory;
    }

    public async Task<ClusterSummaryDto> GetClusterSummaryAsync(CancellationToken cancellationToken)
    {
        var client = _kubernetesClientFactory.CreateClient();

        var nodeListTask = client.CoreV1.ListNodeAsync(
            allowWatchBookmarks: null,
            continueParameter: null,
            fieldSelector: null,
            labelSelector: null,
            limit: null,
            resourceVersion: null,
            resourceVersionMatch: null,
            sendInitialEvents: null,
            timeoutSeconds: null,
            pretty: null,
            cancellationToken: cancellationToken);

        var namespaceListTask = client.CoreV1.ListNamespaceAsync(
            allowWatchBookmarks: null,
            continueParameter: null,
            fieldSelector: null,
            labelSelector: null,
            limit: null,
            resourceVersion: null,
            resourceVersionMatch: null,
            sendInitialEvents: null,
            timeoutSeconds: null,
            pretty: null,
            cancellationToken: cancellationToken);

        var podListTask = client.CoreV1.ListPodForAllNamespacesAsync(
            allowWatchBookmarks: null,
            continueParameter: null,
            fieldSelector: null,
            labelSelector: null,
            limit: null,
            pretty: null,
            resourceVersion: null,
            resourceVersionMatch: null,
            sendInitialEvents: null,
            timeoutSeconds: null,
            cancellationToken: cancellationToken);

        await Task.WhenAll(nodeListTask, namespaceListTask, podListTask);

        var podItems = podListTask.Result.Items;
        return new ClusterSummaryDto(
            TotalNodeCount: nodeListTask.Result.Items.Count,
            TotalNamespaceCount: namespaceListTask.Result.Items.Count,
            TotalPodCount: podItems.Count,
            RunningPodCount: podItems.Count(IsRunningPod),
            PendingPodCount: podItems.Count(pod => string.Equals(pod.Status?.Phase, "Pending", StringComparison.OrdinalIgnoreCase)),
            FailedPodCount: podItems.Count(pod => string.Equals(pod.Status?.Phase, "Failed", StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<IReadOnlyList<NodeDto>> GetNodesAsync(CancellationToken cancellationToken)
    {
        var client = _kubernetesClientFactory.CreateClient();
        var nodeListTask = client.CoreV1.ListNodeAsync(null, null, null, null, null, null, null, null, null, null, cancellationToken);
        var podListTask = client.CoreV1.ListPodForAllNamespacesAsync(null, null, null, null, null, null, null, null, null, null, cancellationToken);

        await Task.WhenAll(nodeListTask, podListTask);

        var podUsageByNode = BuildNodeReservationMap(podListTask.Result.Items);

        return nodeListTask.Result.Items
            .Select(node => MapNode(node, podUsageByNode.GetValueOrDefault(node.Metadata?.Name ?? string.Empty)))
            .OrderBy(node => node.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public async Task<IReadOnlyList<NamespaceDto>> GetNamespacesAsync(CancellationToken cancellationToken)
    {
        var client = _kubernetesClientFactory.CreateClient();

        var namespaceListTask = client.CoreV1.ListNamespaceAsync(null, null, null, null, null, null, null, null, null, null, cancellationToken);
        var podListTask = client.CoreV1.ListPodForAllNamespacesAsync(null, null, null, null, null, null, null, null, null, null, cancellationToken);

        await Task.WhenAll(namespaceListTask, podListTask);

        var podCountByNamespace = podListTask.Result.Items
            .GroupBy(pod => pod.Metadata?.NamespaceProperty ?? "unknown", StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.Count(), StringComparer.OrdinalIgnoreCase);
        return namespaceListTask.Result.Items
            .Select(ns =>
            {
                var name = ns.Metadata?.Name ?? "unknown";

                return new NamespaceDto(
                    Name: name,
                    Status: ns.Status?.Phase ?? "Unknown",
                    PodCount: podCountByNamespace.GetValueOrDefault(name));
            })
            .OrderBy(ns => ns.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public async Task<IReadOnlyList<PodDto>> GetPodsAsync(CancellationToken cancellationToken)
    {
        var client = _kubernetesClientFactory.CreateClient();
        var podList = await client.CoreV1.ListPodForAllNamespacesAsync(null, null, null, null, null, null, null, null, null, null, cancellationToken);
        return podList.Items
            .Select(MapPod)
            .OrderBy(pod => pod.Namespace, StringComparer.OrdinalIgnoreCase)
            .ThenBy(pod => pod.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public async Task<WorkspaceNetworkingDto?> GetWorkspaceNetworkingAsync(string workspaceName, CancellationToken cancellationToken)
    {
        var client = _kubernetesClientFactory.CreateClient();
        var namespaceList = await client.CoreV1.ListNamespaceAsync(
            fieldSelector: $"metadata.name={workspaceName}",
            cancellationToken: cancellationToken);

        if (namespaceList.Items.Count == 0)
        {
            return null;
        }

        var ingressTask = client.NetworkingV1.ListNamespacedIngressAsync(
            namespaceParameter: workspaceName,
            cancellationToken: cancellationToken);
        var serviceTask = client.CoreV1.ListNamespacedServiceAsync(
            namespaceParameter: workspaceName,
            cancellationToken: cancellationToken);
        var podTask = client.CoreV1.ListNamespacedPodAsync(
            namespaceParameter: workspaceName,
            cancellationToken: cancellationToken);

        await Task.WhenAll(ingressTask, serviceTask, podTask);

        var pods = podTask.Result.Items;
        var podLabelSnapshots = pods
            .Select(pod => new PodLabelSnapshot(
                PodName: pod.Metadata?.Name ?? "unknown",
                NodeName: pod.Spec?.NodeName,
                Phase: pod.Status?.Phase ?? "Unknown",
                Labels: pod.Metadata?.Labels is { } labels
                    ? new Dictionary<string, string>(labels, StringComparer.OrdinalIgnoreCase)
                    : new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)))
            .ToArray();

        var services = serviceTask.Result.Items;
        var serviceSnapshots = services
            .Select(service =>
            {
                var selector = service.Spec?.Selector is { Count: > 0 }
                    ? new Dictionary<string, string>(service.Spec.Selector, StringComparer.OrdinalIgnoreCase)
                    : new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var matchingPods = selector.Count == 0
                    ? []
                    : podLabelSnapshots
                        .Where(pod => MatchesSelector(pod.Labels, selector))
                        .Select(pod => pod.PodName)
                        .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                        .ToArray();

                return new ServiceNetworkingSnapshot(
                    ServiceName: service.Metadata?.Name ?? "unknown",
                    ServiceType: service.Spec?.Type ?? "Unknown",
                    ClusterIp: NormalizeClusterIp(service.Spec?.ClusterIP),
                    Ports: (service.Spec?.Ports ?? [])
                        .Select(port => new WorkspaceServicePortDto(
                            Name: port.Name,
                            Port: port.Port,
                            TargetPort: FormatServiceTargetPort(port.TargetPort, port.Port),
                            Protocol: port.Protocol ?? "TCP"))
                        .ToArray(),
                    Selector: selector,
                    TargetPodNames: matchingPods,
                    Status: GetServiceStatus(selector, matchingPods.Length));
            })
            .OrderBy(service => service.ServiceName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var serviceLookup = serviceSnapshots.ToDictionary(service => service.ServiceName, StringComparer.OrdinalIgnoreCase);

        var externalAccess = ingressTask.Result.Items
            .SelectMany(ingress => MapIngressRules(ingress, serviceLookup))
            .OrderBy(item => item.Host, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.Path, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.IngressName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var instances = podLabelSnapshots
            .Select(pod => new WorkspaceInstanceNetworkingDto(
                PodName: pod.PodName,
                NodeName: pod.NodeName,
                Phase: pod.Phase,
                MatchedServices: serviceSnapshots
                    .Where(service => service.TargetPodNames.Contains(pod.PodName, StringComparer.OrdinalIgnoreCase))
                    .Select(service => service.ServiceName)
                    .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                    .ToArray()))
            .OrderBy(instance => instance.PodName, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return new WorkspaceNetworkingDto(
            WorkspaceName: workspaceName,
            ExternalAccess: externalAccess,
            Services: serviceSnapshots
                .Select(service => new WorkspaceServiceNetworkingDto(
                    ServiceName: service.ServiceName,
                    ServiceType: service.ServiceType,
                    ClusterIp: service.ClusterIp,
                    Ports: service.Ports,
                    Selector: service.Selector,
                    TargetPodNames: service.TargetPodNames,
                    TargetPodCount: service.TargetPodNames.Count,
                    Status: service.Status))
                .ToArray(),
            Instances: instances);
    }

    private static NodeDto MapNode(V1Node node, NodeReservationSnapshot? reservation)
    {
        var labels = node.Metadata?.Labels ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var roles = labels
            .Keys
            .Where(key => key.StartsWith("node-role.kubernetes.io/", StringComparison.OrdinalIgnoreCase))
            .Select(key => key["node-role.kubernetes.io/".Length..])
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .DefaultIfEmpty("worker")
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(role => role, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var cpuCapacityCores = GetNodeCpuQuantity(node.Status?.Capacity);
        var cpuAllocatableCores = GetNodeCpuQuantity(node.Status?.Allocatable);
        var memoryCapacityBytes = GetNodeMemoryQuantity(node.Status?.Capacity);
        var memoryAllocatableBytes = GetNodeMemoryQuantity(node.Status?.Allocatable);
        var diskCapacityBytes = GetNodeEphemeralStorageQuantity(node.Status?.Capacity);
        var diskAllocatableBytes = GetNodeEphemeralStorageQuantity(node.Status?.Allocatable);
        var cpuRequestedCores = reservation?.CpuRequestedCores ?? 0d;
        var memoryRequestedBytes = reservation?.MemoryRequestedBytes ?? 0L;
        var diskRequestedBytes = reservation?.DiskRequestedBytes ?? 0L;
        var diskAvailableBytes = Math.Max(0L, diskAllocatableBytes - diskRequestedBytes);

        return new NodeDto(
            Name: node.Metadata?.Name ?? "unknown",
            ReadinessStatus: GetReadinessStatus(node),
            Roles: roles,
            KubeletVersion: node.Status?.NodeInfo?.KubeletVersion,
            CpuCapacityCores: RoundCpu(cpuCapacityCores),
            CpuAllocatableCores: RoundCpu(cpuAllocatableCores),
            CpuRequestedCores: RoundCpu(cpuRequestedCores),
            CpuReservationPercent: RoundPercent(CalculateReservationPercent(cpuRequestedCores, cpuAllocatableCores)),
            MemoryCapacityBytes: memoryCapacityBytes,
            MemoryAllocatableBytes: memoryAllocatableBytes,
            MemoryRequestedBytes: memoryRequestedBytes,
            MemoryReservationPercent: RoundPercent(CalculateReservationPercent(memoryRequestedBytes, memoryAllocatableBytes)),
            DiskCapacityBytes: diskCapacityBytes,
            DiskAllocatableBytes: diskAllocatableBytes,
            DiskRequestedBytes: diskRequestedBytes,
            DiskAvailableBytes: diskAvailableBytes,
            DiskReservationPercent: RoundPercent(CalculateReservationPercent(diskRequestedBytes, diskAllocatableBytes)),
            PodCount: reservation?.PodCount ?? 0);
    }

    private static PodDto MapPod(V1Pod pod)
    {
        var restartCount = pod.Status?.ContainerStatuses?.Sum(status => status.RestartCount) ?? 0;
        var createdAtUtc = pod.Metadata?.CreationTimestamp ?? DateTimeOffset.MinValue;

        return new PodDto(
            Name: pod.Metadata?.Name ?? "unknown",
            Namespace: pod.Metadata?.NamespaceProperty ?? "unknown",
            Status: pod.Status?.Phase ?? "Unknown",
            NodeName: pod.Spec?.NodeName,
            RestartCount: restartCount,
            CreatedAtUtc: createdAtUtc);
    }

    private static string GetReadinessStatus(V1Node node)
    {
        var readyCondition = node.Status?.Conditions?.FirstOrDefault(condition =>
            string.Equals(condition.Type, "Ready", StringComparison.OrdinalIgnoreCase));

        return string.Equals(readyCondition?.Status, "True", StringComparison.OrdinalIgnoreCase)
            ? "Ready"
            : "NotReady";
    }

    private static bool IsRunningPod(V1Pod pod)
    {
        return string.Equals(pod.Status?.Phase, "Running", StringComparison.OrdinalIgnoreCase);
    }

    private static IEnumerable<WorkspaceExternalAccessDto> MapIngressRules(
        V1Ingress ingress,
        IReadOnlyDictionary<string, ServiceNetworkingSnapshot> serviceLookup)
    {
        var ingressName = ingress.Metadata?.Name ?? "unknown";
        var tlsSecretName = ingress.Spec?.Tls?.FirstOrDefault()?.SecretName;
        var tlsEnabled = ingress.Spec?.Tls?.Count > 0;
        var rules = ingress.Spec?.Rules ?? [];

        foreach (var rule in rules)
        {
            var host = string.IsNullOrWhiteSpace(rule.Host) ? "All hosts" : rule.Host;
            var paths = rule.Http?.Paths ?? [];

            if (paths.Count == 0)
            {
                yield return BuildExternalAccess(ingressName, host, "/", null, null, tlsEnabled, tlsSecretName, serviceLookup);
                continue;
            }

            foreach (var path in paths)
            {
                var serviceName = path.Backend?.Service?.Name;
                var servicePort = FormatIngressServicePort(path.Backend?.Service?.Port);
                yield return BuildExternalAccess(
                    ingressName,
                    host,
                    string.IsNullOrWhiteSpace(path.Path) ? "/" : path.Path,
                    serviceName,
                    servicePort,
                    tlsEnabled,
                    tlsSecretName,
                    serviceLookup);
            }
        }

        if (rules.Count == 0)
        {
            var defaultBackend = ingress.Spec?.DefaultBackend?.Service;
            yield return BuildExternalAccess(
                ingressName,
                "Default backend",
                "/",
                defaultBackend?.Name,
                FormatIngressServicePort(defaultBackend?.Port),
                tlsEnabled,
                tlsSecretName,
                serviceLookup);
        }
    }

    private static WorkspaceExternalAccessDto BuildExternalAccess(
        string ingressName,
        string host,
        string path,
        string? serviceName,
        string? servicePort,
        bool tlsEnabled,
        string? tlsSecretName,
        IReadOnlyDictionary<string, ServiceNetworkingSnapshot> serviceLookup)
    {
        var status = GetExternalAccessStatus(serviceName, tlsEnabled, serviceLookup);

        return new WorkspaceExternalAccessDto(
            IngressName: ingressName,
            Host: host,
            Path: path,
            ServiceName: serviceName,
            ServicePort: servicePort,
            TlsEnabled: tlsEnabled,
            TlsSecretName: tlsSecretName,
            Status: status);
    }

    private static string GetExternalAccessStatus(
        string? serviceName,
        bool tlsEnabled,
        IReadOnlyDictionary<string, ServiceNetworkingSnapshot> serviceLookup)
    {
        if (string.IsNullOrWhiteSpace(serviceName))
        {
            return "Incomplete";
        }

        if (!serviceLookup.ContainsKey(serviceName))
        {
            return "Missing service";
        }

        return tlsEnabled ? "OK" : "No TLS";
    }

    private static string GetServiceStatus(IReadOnlyDictionary<string, string> selector, int targetPodCount)
    {
        if (selector.Count == 0)
        {
            return "No selector";
        }

        return targetPodCount == 0 ? "No matching pods" : "OK";
    }

    private static bool MatchesSelector(
        IReadOnlyDictionary<string, string> labels,
        IReadOnlyDictionary<string, string> selector)
    {
        return selector.All(entry =>
            labels.TryGetValue(entry.Key, out var value) &&
            string.Equals(value, entry.Value, StringComparison.OrdinalIgnoreCase));
    }

    private static string? NormalizeClusterIp(string? clusterIp)
    {
        return string.Equals(clusterIp, "None", StringComparison.OrdinalIgnoreCase) ? null : clusterIp;
    }

    private static string FormatServiceTargetPort(object? targetPort, int fallbackPort)
    {
        var renderedTargetPort = targetPort?.ToString();
        return string.IsNullOrWhiteSpace(renderedTargetPort) ? fallbackPort.ToString() : renderedTargetPort;
    }

    private static string? FormatIngressServicePort(V1ServiceBackendPort? port)
    {
        if (port is null)
        {
            return null;
        }

        if (port.Number.HasValue)
        {
            return port.Number.Value.ToString();
        }

        return string.IsNullOrWhiteSpace(port.Name) ? null : port.Name;
    }

    private static Dictionary<string, NodeReservationSnapshot> BuildNodeReservationMap(IEnumerable<V1Pod> pods)
    {
        return pods
            .Where(pod => !string.IsNullOrWhiteSpace(pod.Spec?.NodeName))
            .GroupBy(pod => pod.Spec!.NodeName!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                group => group.Key,
                group => new NodeReservationSnapshot(
                    CpuRequestedCores: group.Sum(GetPodRequestedCpuCores),
                    MemoryRequestedBytes: group.Sum(GetPodRequestedMemoryBytes),
                    DiskRequestedBytes: group.Sum(GetPodRequestedDiskBytes),
                    PodCount: group.Count()),
                StringComparer.OrdinalIgnoreCase);
    }

    private static double GetPodRequestedCpuCores(V1Pod pod)
    {
        var regularContainersCpu = (pod.Spec?.Containers ?? [])
            .Sum(container => GetCpuRequestFromRequirements(container.Resources));

        // Init containers are not scheduled cumulatively with regular containers.
        // Kubernetes uses the maximum init-container request per resource when
        // determining the pod's effective scheduling footprint.
        var initContainersCpu = (pod.Spec?.InitContainers ?? [])
            .Select(container => GetCpuRequestFromRequirements(container.Resources))
            .DefaultIfEmpty(0d)
            .Max();

        return Math.Max(regularContainersCpu, initContainersCpu);
    }

    private static long GetPodRequestedMemoryBytes(V1Pod pod)
    {
        var regularContainersMemory = (pod.Spec?.Containers ?? [])
            .Sum(container => GetMemoryRequestFromRequirements(container.Resources));

        var initContainersMemory = (pod.Spec?.InitContainers ?? [])
            .Select(container => GetMemoryRequestFromRequirements(container.Resources))
            .DefaultIfEmpty(0L)
            .Max();

        return Math.Max(regularContainersMemory, initContainersMemory);
    }

    private static long GetPodRequestedDiskBytes(V1Pod pod)
    {
        var regularContainersDisk = (pod.Spec?.Containers ?? [])
            .Sum(container => GetEphemeralStorageRequestFromRequirements(container.Resources));

        var initContainersDisk = (pod.Spec?.InitContainers ?? [])
            .Select(container => GetEphemeralStorageRequestFromRequirements(container.Resources))
            .DefaultIfEmpty(0L)
            .Max();

        return Math.Max(regularContainersDisk, initContainersDisk);
    }

    private static double GetCpuRequestFromRequirements(V1ResourceRequirements? requirements)
    {
        return requirements?.Requests is not { } requests || !requests.TryGetValue("cpu", out var quantity)
            ? 0d
            : KubernetesQuantityParser.ParseCpuCores(quantity.ToString());
    }

    private static long GetMemoryRequestFromRequirements(V1ResourceRequirements? requirements)
    {
        return requirements?.Requests is not { } requests || !requests.TryGetValue("memory", out var quantity)
            ? 0L
            : KubernetesQuantityParser.ParseMemoryBytes(quantity.ToString());
    }

    private static long GetEphemeralStorageRequestFromRequirements(V1ResourceRequirements? requirements)
    {
        return requirements?.Requests is not { } requests || !requests.TryGetValue("ephemeral-storage", out var quantity)
            ? 0L
            : KubernetesQuantityParser.ParseMemoryBytes(quantity.ToString());
    }

    private static double GetNodeCpuQuantity(IDictionary<string, ResourceQuantity>? quantities)
    {
        return quantities is not { } values || !values.TryGetValue("cpu", out var quantity)
            ? 0d
            : KubernetesQuantityParser.ParseCpuCores(quantity.ToString());
    }

    private static long GetNodeMemoryQuantity(IDictionary<string, ResourceQuantity>? quantities)
    {
        return quantities is not { } values || !values.TryGetValue("memory", out var quantity)
            ? 0L
            : KubernetesQuantityParser.ParseMemoryBytes(quantity.ToString());
    }

    private static long GetNodeEphemeralStorageQuantity(IDictionary<string, ResourceQuantity>? quantities)
    {
        return quantities is not { } values || !values.TryGetValue("ephemeral-storage", out var quantity)
            ? 0L
            : KubernetesQuantityParser.ParseMemoryBytes(quantity.ToString());
    }

    private static double CalculateReservationPercent(double requested, double allocatable)
    {
        return allocatable <= 0d ? 0d : (requested / allocatable) * 100d;
    }

    private static double CalculateReservationPercent(long requested, long allocatable)
    {
        return allocatable <= 0L ? 0d : (double)requested / allocatable * 100d;
    }

    private static double RoundCpu(double value)
    {
        return Math.Round(value, 3, MidpointRounding.AwayFromZero);
    }

    private static double RoundPercent(double value)
    {
        return Math.Round(value, 1, MidpointRounding.AwayFromZero);
    }

    private sealed record NodeReservationSnapshot(
        double CpuRequestedCores,
        long MemoryRequestedBytes,
        long DiskRequestedBytes,
        int PodCount);

    private sealed record PodLabelSnapshot(
        string PodName,
        string? NodeName,
        string Phase,
        IReadOnlyDictionary<string, string> Labels);

    private sealed record ServiceNetworkingSnapshot(
        string ServiceName,
        string ServiceType,
        string? ClusterIp,
        IReadOnlyList<WorkspaceServicePortDto> Ports,
        IReadOnlyDictionary<string, string> Selector,
        IReadOnlyList<string> TargetPodNames,
        string Status);
}
