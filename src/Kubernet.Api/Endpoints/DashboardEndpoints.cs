using Kubernet.Api.Models;
using Kubernet.Api.Kubernetes;
using Kubernet.Api.Services;

namespace Kubernet.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var api = endpoints.MapGroup("/api");

        api.MapGet("/cluster/summary", async (IClusterDashboardService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetClusterSummaryAsync(cancellationToken)))
            .WithName("GetClusterSummary")
            .WithSummary("Gets a summary of the cluster.");

        api.MapGet("/cluster/connection-info", async (IClusterConnectionInfoProvider provider, CancellationToken cancellationToken) =>
            Results.Ok(await provider.GetCurrentAsync(cancellationToken)))
            .WithName("GetClusterConnectionInfo")
            .WithSummary("Gets the current Kubernetes connection details.");

        api.MapGet("/nodes", async (IClusterDashboardService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetNodesAsync(cancellationToken)))
            .WithName("GetNodes")
            .WithSummary("Gets the nodes in the cluster.");

        api.MapGet("/namespaces", async (IClusterDashboardService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetNamespacesAsync(cancellationToken)))
            .WithName("GetNamespaces")
            .WithSummary("Gets the namespaces in the cluster.");

        api.MapGet("/pods", async (IClusterDashboardService service, CancellationToken cancellationToken) =>
            Results.Ok(await service.GetPodsAsync(cancellationToken)))
            .WithName("GetPods")
            .WithSummary("Gets the pods in the cluster.");

        api.MapGet("/workspaces/{workspaceName}/networking", async (string workspaceName, IClusterDashboardService service, CancellationToken cancellationToken) =>
            {
                var networking = await service.GetWorkspaceNetworkingAsync(workspaceName, cancellationToken);
                return networking is null
                    ? Results.NotFound(new { message = $"Workspace '{workspaceName}' was not found." })
                    : Results.Ok(networking);
            })
            .WithName("GetWorkspaceNetworking")
            .WithSummary("Gets ingress, services, and instance networking for a workspace.");

        api.MapGet("/health", () => Results.Ok(new { status = "ok" }))
            .WithName("GetHealth")
            .WithSummary("Gets the API health status.");

        return endpoints;
    }
}
