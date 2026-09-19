import { LAMPORTS_PER_COOK } from "./constants";

export function shortAddress(address: string, size = 4) {
  if (address.length <= size * 2 + 1) return address;
  return `${address.slice(0, size)}…${address.slice(-size)}`;
}

export function lamportsToCook(lamports: number, digits = 4) {
  const value = lamports / LAMPORTS_PER_COOK;
  if (value === 0) return "0";
  if (value < 0.0001) return value.toExponential(2);
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatCompact(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(n);
}

export function formatInt(n: number) {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined).format(n);
}

export function formatAgo(unixSeconds: number | null | undefined) {
  if (!unixSeconds) return "just now";
  const delta = Math.max(0, Date.now() / 1000 - unixSeconds);
  if (delta < 8) return "now";
  if (delta < 60) return `${Math.floor(delta)}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

export function formatSlotTime(unixSeconds: number | null | undefined) {
  if (!unixSeconds) return "";
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
