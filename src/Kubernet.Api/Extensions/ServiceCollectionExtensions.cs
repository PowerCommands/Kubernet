using Kubernet.Api.Configuration;
using Kubernet.Api.Kubernetes;
using Kubernet.Api.Services;

namespace Kubernet.Api.Extensions;

public static class ServiceCollectionExtensions
{
    private const string CorsPolicyName = "DashboardCors";

    public static IServiceCollection AddDashboardOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<DashboardOptions>(configuration.GetSection(DashboardOptions.SectionName));
        return services;
    }

    public static IServiceCollection AddDashboardServices(this IServiceCollection services, IConfiguration configuration)
    {
        var dashboardOptions = configuration
            .GetSection(DashboardOptions.SectionName)
            .Get<DashboardOptions>() ?? new DashboardOptions();

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                policy.WithOrigins(dashboardOptions.AllowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        services.AddEndpointsApiExplorer();
        services.AddSingleton<IKubernetesClientFactory, KubernetesClientFactory>();
        services.AddSingleton<IClusterConnectionInfoProvider, ClusterConnectionInfoProvider>();
        services.AddHostedService<ClusterConnectionInfoStartupLogger>();
        services.AddScoped<IClusterDashboardService, ClusterDashboardService>();

        return services;
    }

    public static IApplicationBuilder UseConfiguredCors(this IApplicationBuilder app)
    {
        app.UseCors(CorsPolicyName);
        return app;
    }
}
