/** @typedef {{ id: string; label: string; value: string | number; sublabel?: string; trend?: { value: number; label: string } }} KpiMetric */

/** @typedef {{ name: string; value: number; color?: string; percent?: number }} ChartSlice */

/** @typedef {{ label: string; value: number }} BarPoint */

/** @typedef {{ date: string; value: number; label?: string }} TrendPoint */

/** @typedef {{ columns: string[]; rows: Record<string, string | number>[] }} SegmentationTable */

/** @typedef {{ area: string; patients: number }} GeoRow */

/** @typedef {{ serviceCategory: string; y2024: number; y2025: number; y2026: number; total: number }} RevenueTableRow */

export const CHART_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#4f46e5",
  "#0d9488",
  "#ca8a04",
];
