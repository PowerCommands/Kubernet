using Kubernet.Api.Models;

namespace Kubernet.Api.Kubernetes;

public interface IClusterConnectionInfoProvider
{
    Task<ClusterConnectionInfoDto> GetCurrentAsync(CancellationToken cancellationToken);
}
