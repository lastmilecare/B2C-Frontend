import { normalizePeriodMonth } from './expensePeriodUtils.js';

/**
 * Unwrap common API envelopes so cells/remarks load reliably in RTK Query.
 */
export const createEmptyExpenseSheet = (reportType = '') => ({
  report_type: reportType,
  status: 'draft',
  cells: [],
  remarks: {},
  people: [],
  custom: {
    periods: [],
    categories: [],
    columns: [],
    people: [],
  },
  grand_total: 0,
  updated_at: null,
});

const isSheetShape = (value) =>
  value &&
  typeof value === 'object' &&
  (Array.isArray(value.cells) || typeof value.report_type === 'string');

const unwrapSheetPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;

  if (isSheetShape(payload)) return payload;

  const wrapperKeys = ['data', 'result', 'response', 'payload', 'body', 'content'];
  let current = payload;

  for (let depth = 0; depth < 6; depth += 1) {
    if (isSheetShape(current)) return current;

    let nested = null;
    for (const key of wrapperKeys) {
      const candidate = current[key];
      if (candidate && typeof candidate === 'object') {
        nested = candidate;
        break;
      }
    }
    if (!nested) break;
    current = nested;
  }

  return isSheetShape(current) ? current : null;
};

/**
 * @param {unknown} payload - RTK transformResponse body (same as ambulance hook `data` source)
 * @param {string} [reportType] - query arg from useGetExpenseSheetQuery(reportType)
 */
export const normalizeExpenseSheetResponse = (payload, reportType = '') => {
  const sheet = unwrapSheetPayload(payload);
  if (!sheet) {
    return createEmptyExpenseSheet(reportType);
  }

  const cells = Array.isArray(sheet.cells)
    ? sheet.cells
        .filter((c) => c && typeof c === 'object')
        .map((c) => ({
          ...c,
          period_month: normalizePeriodMonth(c.period_month) || c.period_month,
          amount: Number(c.amount ?? 0),
        }))
    : [];

  return {
    ...sheet,
    report_type: sheet.report_type || reportType,
    cells,
    custom: sheet.custom || {
      periods: [],
      categories: [],
      columns: [],
      people: [],
    },
    remarks: sheet.remarks || {},
    people: sheet.people || [],
  };
};

/**
 * Use as RTK transformResponse (3rd arg = reportType). Never returns undefined.
 */
export const transformExpenseSheetResponse = (response, _meta, reportType) => {
  try {
    return normalizeExpenseSheetResponse(response, reportType);
  } catch (err) {
    console.warn('[expense] transformExpenseSheetResponse failed', err);
    return createEmptyExpenseSheet(reportType);
  }
};

/** @deprecated use transformExpenseSheetResponse for apiSlice */
export const safeTransformExpenseSheetResponse = (payload) =>
  normalizeExpenseSheetResponse(payload);
