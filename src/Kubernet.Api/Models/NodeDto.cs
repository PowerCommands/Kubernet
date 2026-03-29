namespace Kubernet.Api.Models;

public sealed record NodeDto(
    string Name,
    string ReadinessStatus,
    IReadOnlyList<string> Roles,
    string? KubeletVersion,
    double CpuCapacityCores,
    double CpuAllocatableCores,
    double CpuRequestedCores,
    double CpuReservationPercent,
    long MemoryCapacityBytes,
    long MemoryAllocatableBytes,
    long MemoryRequestedBytes,
    double MemoryReservationPercent,
    long DiskCapacityBytes,
    long DiskAllocatableBytes,
    long DiskRequestedBytes,
    long DiskAvailableBytes,
    double DiskReservationPercent,
    int PodCount);
