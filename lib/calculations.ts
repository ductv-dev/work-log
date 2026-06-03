export function getDurationMinutes(start: Date, end: Date) {
  const diff = Math.round((end.getTime() - start.getTime()) / 60000);
  return Math.max(diff, 0);
}

export function calculateAmount({
  durationMinutes,
  hourlyRate,
  isBillable
}: {
  durationMinutes: number;
  hourlyRate: number;
  isBillable: boolean;
}) {
  if (!isBillable) return 0;
  return Math.round((durationMinutes / 60) * hourlyRate * 100) / 100;
}

export function resolveHourlyRate(projectRate?: number | null, clientRate?: number | null, profileRate?: number | null) {
  if (projectRate && projectRate > 0) return projectRate;
  if (clientRate && clientRate > 0) return clientRate;
  if (profileRate && profileRate > 0) return profileRate;
  return 0;
}

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, minutes || 0);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours} giờ ${mins.toString().padStart(2, "0")} phút`;
}

export function formatTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export function formatMoney(amount: number, currency = "VND") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount || 0);
}
