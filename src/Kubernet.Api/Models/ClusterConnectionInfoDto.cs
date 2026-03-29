namespace Kubernet.Api.Models;

public sealed record ClusterConnectionInfoDto(
    string KubeConfigPath,
    string? CurrentContext,
    string? ClusterName,
    string Server,
    string? KubernetesVersion);
