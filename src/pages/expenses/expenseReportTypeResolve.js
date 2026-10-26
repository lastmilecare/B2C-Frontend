import { EXPENSE_SHEET_DEFINITIONS } from "./expenseSheetDefinitions.js";

/** URL segment → canonical report_type (keep in sync with expenseRouteRegistry.js) */
const PATH_SEGMENT_TO_REPORT_TYPE = {
  operating: "monthly_operating_expense",
  compliances: "compliance_fees",
  misc: "misc_expenses",
  consumables: "consumables_expenses",
  satellite: "satellite_centre",
  salaries: "salary_by_person",
  "hr-recruitment": "hr_recruitment",
  "health-camp": "health_camp",
  "iec-branding": "iec_branding",
  "tech-stack": "tech_stack",
  "management-exp": "management_exp",
  "vendor-payments": "vendor_payment_revenue",
  "total-exp": "total_exp_summary",
};

const RESERVED_SEGMENTS = new Set(["edit", "new", "list"]);

/**
 * @param {string | undefined | null} value
 * @returns {string | null}
 */
export const resolveReportType = (value) => {
  if (value == null || value === "") return null;

  const raw = String(value).trim();
  if (RESERVED_SEGMENTS.has(raw)) return null;

  if (EXPENSE_SHEET_DEFINITIONS[raw]) return raw;

  if (PATH_SEGMENT_TO_REPORT_TYPE[raw]) return PATH_SEGMENT_TO_REPORT_TYPE[raw];

  const underscored = raw.replace(/-/g, "_");
  if (EXPENSE_SHEET_DEFINITIONS[underscored]) return underscored;

  const fromHyphenPath = PATH_SEGMENT_TO_REPORT_TYPE[raw.replace(/_/g, "-")];
  if (fromHyphenPath) return fromHyphenPath;

  return null;
};

/**
 * Parse /expense-transactions/operating/edit → monthly_operating_expense
 */
export const resolveReportTypeFromPathname = (pathname = "") => {
  const parts = String(pathname).split("/").filter(Boolean);
  const txIdx = parts.findIndex((p) => p === "expense-transactions");
  const segments = txIdx >= 0 ? parts.slice(txIdx + 1) : parts;

  for (const segment of segments) {
    const resolved = resolveReportType(segment);
    if (resolved) return resolved;
  }

  return null;
};

/**
 * AMP single-sheet routes often use /expense-transactions with no segment.
 */
export const resolveReportTypeForExpenseRoute = ({
  reportTypeProp,
  pathname = "",
  defaultAmpReportType = "monthly_operating_expense",
} = {}) =>
  resolveReportType(reportTypeProp) ||
  resolveReportTypeFromPathname(pathname) ||
  (String(pathname).includes("expense-transaction")
    ? defaultAmpReportType
    : null);
