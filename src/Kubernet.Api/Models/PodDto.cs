namespace Kubernet.Api.Models;

public sealed record PodDto(
    string Name,
    string Namespace,
    string Status,
    string? NodeName,
    int RestartCount,
    DateTimeOffset CreatedAtUtc);
