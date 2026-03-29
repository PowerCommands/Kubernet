namespace Kubernet.Api.Configuration;

public sealed class DashboardOptions
{
    public const string SectionName = "Dashboard";

    public string[] AllowedOrigins { get; init; } = ["http://localhost:5173"];
}
