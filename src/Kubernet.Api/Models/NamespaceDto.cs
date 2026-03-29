namespace Kubernet.Api.Models;

public sealed record NamespaceDto(
    string Name,
    string Status,
    int PodCount);
