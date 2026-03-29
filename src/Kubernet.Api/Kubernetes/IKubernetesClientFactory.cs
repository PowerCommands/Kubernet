namespace Kubernet.Api.Kubernetes;

public interface IKubernetesClientFactory
{
    k8s.Kubernetes CreateClient();
}
