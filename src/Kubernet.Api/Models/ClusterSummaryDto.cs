namespace Kubernet.Api.Models;

public sealed record ClusterSummaryDto(
    int TotalNodeCount,
    int TotalNamespaceCount,
    int TotalPodCount,
    int RunningPodCount,
    int PendingPodCount,
    int FailedPodCount);
