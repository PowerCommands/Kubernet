namespace Kubernet.Api.Models;

public sealed record WorkspaceNetworkingDto(
    string WorkspaceName,
    IReadOnlyList<WorkspaceExternalAccessDto> ExternalAccess,
    IReadOnlyList<WorkspaceServiceNetworkingDto> Services,
    IReadOnlyList<WorkspaceInstanceNetworkingDto> Instances);

public sealed record WorkspaceExternalAccessDto(
    string IngressName,
    string Host,
    string Path,
    string? ServiceName,
    string? ServicePort,
    bool TlsEnabled,
    string? TlsSecretName,
    string Status);

public sealed record WorkspaceServiceNetworkingDto(
    string ServiceName,
    string ServiceType,
    string? ClusterIp,
    IReadOnlyList<WorkspaceServicePortDto> Ports,
    IReadOnlyDictionary<string, string> Selector,
    IReadOnlyList<string> TargetPodNames,
    int TargetPodCount,
    string Status);

public sealed record WorkspaceServicePortDto(
    string? Name,
    int Port,
    string TargetPort,
    string Protocol);

public sealed record WorkspaceInstanceNetworkingDto(
    string PodName,
    string? NodeName,
    string Phase,
    IReadOnlyList<string> MatchedServices);
