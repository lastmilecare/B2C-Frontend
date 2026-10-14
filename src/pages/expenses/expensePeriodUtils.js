const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** @typedef {'mon_yy' | 'yy_mon'} PeriodFormat */

/** Default visible past window (months ending at current month). No automatic future months. */
export const DEFAULT_MONTHS_PAST = 30;
export const DEFAULT_MONTHS_FUTURE = 0;

/**
 * Parse YYYY-MM-DD (or ISO datetime) without timezone drift.
 * @returns {{ year: number, monthIndex: number } | null}
 */
export const parsePeriodMonth = (periodMonth) => {
  const raw = String(periodMonth ?? '').trim();
  const match = /^(\d{4})-(\d{2})/.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { year, monthIndex };
};

/** Canonical storage key: YYYY-MM-01 */
export const normalizePeriodMonth = (periodMonth) => {
  const p = parsePeriodMonth(periodMonth);
  if (!p) return null;
  const m = String(p.monthIndex + 1).padStart(2, '0');
  return `${p.year}-${m}-01`;
};

export const periodMonthFromDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
};

export const formatMonYy = (periodMonth) => {
  const p = parsePeriodMonth(periodMonth);
  if (!p) return String(periodMonth);
  const yy = String(p.year).slice(-2);
  return `${MONTH_SHORT[p.monthIndex]}-${yy}`;
};

export const formatYyMon = (periodMonth) => {
  const p = parsePeriodMonth(periodMonth);
  if (!p) return String(periodMonth);
  const yy = String(p.year).slice(-2);
  return `${yy}-${MONTH_SHORT[p.monthIndex]}`;
};

export const labelForPeriod = (periodMonth, format) => {
  if (format === 'yy_mon') return formatYyMon(periodMonth);
  return formatMonYy(periodMonth);
};

export const comparePeriodMonth = (a, b) =>
  String(normalizePeriodMonth(a)).localeCompare(String(normalizePeriodMonth(b)));

export const addMonths = (periodMonth, delta) => {
  const p = parsePeriodMonth(periodMonth);
  if (!p) return null;
  const d = new Date(p.year, p.monthIndex + delta, 1);
  return periodMonthFromDate(d);
};

/** Inclusive range of period_month strings, month by month. */
export const eachPeriodMonthInclusive = (startPm, endPm) => {
  const start = normalizePeriodMonth(startPm);
  const end = normalizePeriodMonth(endPm);
  if (!start || !end || start > end) return [];

  const out = [];
  let cur = start;
  while (cur && cur <= end) {
    out.push(cur);
    const next = addMonths(cur, 1);
    if (!next || next === cur) break;
    cur = next;
  }
  return out;
};

/**
 * Build period list: saved/custom months + rolling past through current month only.
 * Future months appear only when added via custom.periods or saved cells.
 */
export const buildEffectivePeriods = (
  seedPeriods = [],
  periodFormat,
  {
    customPeriods = [],
    cellPeriods = [],
    monthsPast = DEFAULT_MONTHS_PAST,
    monthsFuture = DEFAULT_MONTHS_FUTURE,
  } = {},
) => {
  const map = new Map();

  const add = (period_month, label) => {
    const key = normalizePeriodMonth(period_month);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, {
        period_month: key,
        label: label || labelForPeriod(key, periodFormat),
      });
    }
  };

  seedPeriods.forEach((p) => add(p.period_month, p.label));
  customPeriods.forEach((p) => add(p.period_month, p.label));
  cellPeriods.forEach((pm) => add(pm));

  const nowPm = periodMonthFromDate(new Date());
  let windowEnd = nowPm;
  if (monthsFuture > 0) {
    windowEnd = addMonths(nowPm, monthsFuture) || nowPm;
  }

  let windowStart = addMonths(nowPm, -monthsPast) || nowPm;

  const knownKeys = Array.from(map.keys()).sort();
  if (knownKeys.length > 0 && knownKeys[0] < windowStart) {
    windowStart = knownKeys[0];
  }

  eachPeriodMonthInclusive(windowStart, windowEnd).forEach((pm) => add(pm));

  knownKeys.forEach((pm) => {
    if (pm > windowEnd) add(pm);
  });

  customPeriods.forEach((p) => {
    const key = normalizePeriodMonth(p.period_month);
    if (key && key > windowEnd) add(p.period_month, p.label);
  });

  return Array.from(map.values()).sort((a, b) =>
    comparePeriodMonth(a.period_month, b.period_month),
  );
};

export const nextPeriodAfterLatest = (periods, periodFormat) => {
  if (!periods?.length) {
    const pm = periodMonthFromDate(new Date());
    return { period_month: pm, label: labelForPeriod(pm, periodFormat) };
  }
  const sorted = [...periods].sort((a, b) =>
    comparePeriodMonth(a.period_month, b.period_month),
  );
  const latest = sorted[sorted.length - 1].period_month;
  const pm = addMonths(latest, 1);
  return { period_month: pm, label: labelForPeriod(pm, periodFormat) };
};

export const slugifyLineCode = (label) =>
  String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48) || `line_${Date.now()}`;
