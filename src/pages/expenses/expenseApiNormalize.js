import { mergeSalaryPeople } from "./expenseGridUtils.js";
import { normalizePeriodMonth } from "./expensePeriodUtils.js";

/**
 * Unwrap common API envelopes so cells/remarks load reliably in RTK Query.
 */
export const createEmptyExpenseSheet = (reportType = "") => ({
  report_type: reportType,
  status: "draft",
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
  typeof value === "object" &&
  (Array.isArray(value.cells) || typeof value.report_type === "string");

const unwrapSheetPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;

  if (isSheetShape(payload)) return payload;

  const wrapperKeys = [
    "data",
    "result",
    "response",
    "payload",
    "body",
    "content",
  ];
  let current = payload;

  for (let depth = 0; depth < 6; depth += 1) {
    if (isSheetShape(current)) return current;

    let nested = null;
    for (const key of wrapperKeys) {
      const candidate = current[key];
      if (candidate && typeof candidate === "object") {
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
export const normalizeExpenseSheetResponse = (payload, reportType = "") => {
  const sheet = unwrapSheetPayload(payload);
  if (!sheet) {
    return createEmptyExpenseSheet(reportType);
  }

  const cells = Array.isArray(sheet.cells)
    ? sheet.cells
        .filter((c) => c && typeof c === "object")
        .map((c) => ({
          ...c,
          period_month: normalizePeriodMonth(c.period_month) || c.period_month,
          amount: Number(c.amount ?? 0),
        }))
    : [];

  const custom = sheet.custom || {
    periods: [],
    categories: [],
    columns: [],
    people: [],
  };
  const people = mergeSalaryPeople(sheet.people || [], custom.people || []);

  return {
    ...sheet,
    report_type: sheet.report_type || reportType,
    cells,
    custom: { ...custom, people: [] },
    remarks: sheet.remarks || {},
    people,
  };
};

/**
 * Use as RTK transformResponse (3rd arg = reportType). Never returns undefined.
 */
export const transformExpenseSheetResponse = (response, _meta, reportType) => {
  try {
    return normalizeExpenseSheetResponse(response, reportType);
  } catch (err) {
    console.warn("[expense] transformExpenseSheetResponse failed", err);
    return createEmptyExpenseSheet(reportType);
  }
};

/** @deprecated use transformExpenseSheetResponse for apiSlice */
export const safeTransformExpenseSheetResponse = (payload) =>
  normalizeExpenseSheetResponse(payload);

const isSummaryShape = (value) =>
  value &&
  typeof value === "object" &&
  (typeof value.report_type === "string" ||
    value.grand_total !== undefined ||
    value.updated_at !== undefined ||
    value.updated_on !== undefined);

const unwrapSummaryPayload = (payload) => {
  if (!payload || typeof payload !== "object") return null;
  if (isSummaryShape(payload) && !Array.isArray(payload.cells)) return payload;

  const wrapperKeys = [
    "data",
    "result",
    "response",
    "payload",
    "body",
    "content",
  ];
  let current = payload;

  for (let depth = 0; depth < 6; depth += 1) {
    if (isSummaryShape(current) && !Array.isArray(current.cells))
      return current;

    let nested = null;
    for (const key of wrapperKeys) {
      const candidate = current[key];
      if (candidate && typeof candidate === "object") {
        nested = candidate;
        break;
      }
    }
    if (!nested) break;
    current = nested;
  }

  return isSummaryShape(current) && !Array.isArray(current.cells)
    ? current
    : null;
};

export const normalizeExpenseSummaryResponse = (payload, reportType = "") => {
  const row = unwrapSummaryPayload(payload);
  if (!row) {
    return {
      report_type: reportType,
      status: "draft",
      grand_total: 0,
      updated_at: null,
      has_data: false,
    };
  }

  const grand_total = Number(row.grand_total ?? 0);
  const updated_at = row.updated_at ?? row.updated_on ?? null;

  return {
    report_type: row.report_type || reportType,
    status: row.status || "draft",
    grand_total,
    updated_at,
    has_data: Boolean(row.has_data ?? (grand_total > 0 || updated_at)),
  };
};

export const transformExpenseSummaryResponse = (
  response,
  _meta,
  reportType,
) => {
  try {
    return normalizeExpenseSummaryResponse(response, reportType);
  } catch (err) {
    console.warn("[expense] transformExpenseSummaryResponse failed", err);
    return normalizeExpenseSummaryResponse(null, reportType);
  }
};

/** Build list-card summary from full GET /expense-sheets/:type (already loaded for export). */
export const summaryFromFullSheet = (sheetData) => {
  if (!sheetData || typeof sheetData !== "object") return null;

  const cellSum = (sheetData.cells || []).reduce(
    (sum, c) => sum + Number(c?.amount ?? 0),
    0,
  );
  const grand_total = Number(sheetData.grand_total) || cellSum;
  const updated_at = sheetData.updated_at ?? null;

  return {
    report_type: sheetData.report_type,
    status: sheetData.status || "draft",
    grand_total,
    updated_at,
    has_data: Boolean(
      grand_total > 0 || (sheetData.cells?.length ?? 0) > 0 || updated_at,
    ),
  };
};

export const mergeExpenseListSummary = (
  summaryPayload,
  sheetData,
  reportType,
) => {
  const fromSummary = normalizeExpenseSummaryResponse(
    summaryPayload,
    reportType,
  );
  const fromSheet = summaryFromFullSheet(sheetData);

  const summaryHasTotals =
    fromSummary.has_data ||
    fromSummary.grand_total > 0 ||
    fromSummary.updated_at;

  if (summaryHasTotals) return fromSummary;
  if (fromSheet) return fromSheet;
  return fromSummary;
};
