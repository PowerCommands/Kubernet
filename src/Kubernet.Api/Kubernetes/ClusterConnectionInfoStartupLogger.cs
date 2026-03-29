using Microsoft.Extensions.Hosting;

namespace Kubernet.Api.Kubernetes;

public sealed class ClusterConnectionInfoStartupLogger(
    IClusterConnectionInfoProvider connectionInfoProvider,
    ILogger<ClusterConnectionInfoStartupLogger> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var info = await connectionInfoProvider.GetCurrentAsync(cancellationToken);

        logger.LogInformation(
            "Kubernetes connection info. Kubeconfig path: {KubeConfigPath}, Current context: {CurrentContext}, Cluster: {ClusterName}, Server: {Server}, Version: {KubernetesVersion}",
            info.KubeConfigPath,
            info.CurrentContext ?? "(none)",
            info.ClusterName ?? "(unknown)",
            info.Server,
            info.KubernetesVersion ?? "(unknown)");
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
