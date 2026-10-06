import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value, locale = "en-IN") {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(value, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value) {
  if (value >= 1_000_000) {
    return `₹ ${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `₹ ${(value / 1_000).toFixed(2)}K`;
  }
  return formatCurrency(value);
}

export function percentOf(part, total) {
  if (!total) return "0%";
  return `${((part / total) * 100).toFixed(2)}%`;
}

export function formatPercent(value) {
  return `${Number(value).toFixed(2)}%`;
}

export function formatValue(value, format = "number") {
  const num = Number(value);
  if (value == null || Number.isNaN(num)) return "—";
  if (format === "currency" || format === "compact-currency") {
    return format === "compact-currency"
      ? formatCompactCurrency(num)
      : formatCurrency(num);
  }
  if (format === "percent") return formatPercent(num);
  return formatNumber(num);
}
