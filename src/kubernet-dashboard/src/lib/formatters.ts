export function formatRelativeAge(createdAtUtc: string): string {
  const createdAt = new Date(createdAtUtc);
  const diffMs = Date.now() - createdAt.getTime();

  if (Number.isNaN(createdAt.getTime()) || diffMs < 0) {
    return "Unknown";
  }

  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function formatCpuCores(cores: number): string {
  return `${trimTrailingZeros(cores.toFixed(2))} cores`;
}

export function formatCpuReservation(requestedCores: number, allocatableCores: number): string {
  return `${trimTrailingZeros(requestedCores.toFixed(2))} / ${trimTrailingZeros(allocatableCores.toFixed(2))}`;
}

export function formatMemoryBytes(bytes: number): string {
  if (bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${trimTrailingZeros(value.toFixed(digits))} ${units[unitIndex]}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function trimTrailingZeros(value: string): string {
  return value.replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");
}
