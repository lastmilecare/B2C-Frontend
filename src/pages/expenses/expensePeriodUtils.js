const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** @typedef {'mon_yy' | 'yy_mon'} PeriodFormat */

export const periodMonthFromDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

export const formatMonYy = (periodMonth) => {
  const d = new Date(periodMonth);
  if (Number.isNaN(d.getTime())) return periodMonth;
  const yy = String(d.getFullYear()).slice(-2);
  return `${MONTH_SHORT[d.getMonth()]}-${yy}`;
};

export const formatYyMon = (periodMonth) => {
  const d = new Date(periodMonth);
  if (Number.isNaN(d.getTime())) return periodMonth;
  const yy = String(d.getFullYear()).slice(-2);
  return `${yy}-${MONTH_SHORT[d.getMonth()]}`;
};

export const labelForPeriod = (periodMonth, format) => {
  if (format === "yy_mon") return formatYyMon(periodMonth);
  return formatMonYy(periodMonth);
};

const addMonths = (periodMonth, delta) => {
  const d = new Date(periodMonth);
  if (Number.isNaN(d.getTime())) return null;
  return periodMonthFromDate(
    new Date(d.getFullYear(), d.getMonth() + delta, 1),
  );
};

/**
 * Merge seed periods + API/custom + rolling window (past/future) so new months appear automatically.
 */
export const buildEffectivePeriods = (
  seedPeriods = [],
  periodFormat,
  {
    customPeriods = [],
    cellPeriods = [],
    monthsPast = 24,
    monthsFuture = 18,
  } = {},
) => {
  const map = new Map();

  const add = (period_month, label) => {
    if (!period_month) return;
    if (!map.has(period_month)) {
      map.set(period_month, {
        period_month,
        label: label || labelForPeriod(period_month, periodFormat),
      });
    }
  };

  seedPeriods.forEach((p) => add(p.period_month, p.label));
  customPeriods.forEach((p) => add(p.period_month, p.label));
  cellPeriods.forEach((pm) => add(pm));

  const now = new Date();
  for (let i = -monthsPast; i <= monthsFuture; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    add(periodMonthFromDate(d));
  }

  return Array.from(map.values()).sort((a, b) =>
    a.period_month.localeCompare(b.period_month),
  );
};

export const nextPeriodAfterLatest = (periods, periodFormat) => {
  if (!periods?.length) {
    const pm = periodMonthFromDate(new Date());
    return { period_month: pm, label: labelForPeriod(pm, periodFormat) };
  }
  const latest = periods[periods.length - 1].period_month;
  const pm = addMonths(latest, 1);
  return { period_month: pm, label: labelForPeriod(pm, periodFormat) };
};

export const slugifyLineCode = (label) =>
  String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48) || `line_${Date.now()}`;
