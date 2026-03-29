using k8s;

namespace Kubernet.Api.Kubernetes;

public sealed class KubernetesClientFactory(
    IHostEnvironment hostEnvironment) : IKubernetesClientFactory
{
    private const string ServiceHostEnvironmentVariable = "KUBERNETES_SERVICE_HOST";
    private const string KubeConfigEnvironmentVariable = "KUBECONFIG";
    private const string InClusterServiceAccountTokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";

    public k8s.Kubernetes CreateClient()
    {
        var configuration = BuildConfiguration();
        return new k8s.Kubernetes(configuration);
    }

    private KubernetesClientConfiguration BuildConfiguration()
    {
        if (IsInCluster())
        {
            return KubernetesClientConfiguration.InClusterConfig();
        }

        if (hostEnvironment.IsProduction())
        {
            throw new InvalidOperationException(
                "In production, Kubernetes access must use in-cluster configuration. Kubeconfig fallback is disabled.");
        }

        var kubeConfigPath = Environment.GetEnvironmentVariable(KubeConfigEnvironmentVariable);
        return string.IsNullOrWhiteSpace(kubeConfigPath)
            ? KubernetesClientConfiguration.BuildConfigFromConfigFile()
            : KubernetesClientConfiguration.BuildConfigFromConfigFile(kubeconfig: new FileInfo(kubeConfigPath));
    }

    private static bool IsInCluster()
    {
        return !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(ServiceHostEnvironmentVariable))
               && File.Exists(InClusterServiceAccountTokenPath);
    }
}
