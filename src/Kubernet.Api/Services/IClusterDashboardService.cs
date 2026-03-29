using Kubernet.Api.Models;

namespace Kubernet.Api.Services;

public interface IClusterDashboardService
{
    Task<ClusterSummaryDto> GetClusterSummaryAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<NodeDto>> GetNodesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<NamespaceDto>> GetNamespacesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PodDto>> GetPodsAsync(CancellationToken cancellationToken);
    Task<WorkspaceNetworkingDto?> GetWorkspaceNetworkingAsync(string workspaceName, CancellationToken cancellationToken);
}
