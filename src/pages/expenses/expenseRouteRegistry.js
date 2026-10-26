import { EXPENSE_SHEET_DEFINITIONS } from "./expenseSheetDefinitions";

const PATH_BY_REPORT_TYPE = {
  monthly_operating_expense: "operating",
  compliance_fees: "compliances",
  misc_expenses: "misc",
  consumables_expenses: "consumables",
  satellite_centre: "satellite",
  salary_by_person: "salaries",
  hr_recruitment: "hr-recruitment",
  health_camp: "health-camp",
  iec_branding: "iec-branding",
  tech_stack: "tech-stack",
  management_exp: "management-exp",
  vendor_payment_revenue: "vendor-payments",
  total_exp_summary: "total-exp",
};

export const pathForReportType = (reportType) =>
  PATH_BY_REPORT_TYPE[reportType] || String(reportType).replace(/_/g, "-");

/**
 * Build menu/route entries from sheet definitions (single source of truth).
 */
export const buildExpenseRouteRegistry = () => {
  const amp = [];
  const honda = [];

  Object.values(EXPENSE_SHEET_DEFINITIONS).forEach((def) => {
    const entry = {
      path: pathForReportType(def.report_type),
      reportType: def.report_type,
      menuLabel: def.module_title,
      permission: `expenses.${def.report_type}`,
      readOnly: def.entry_mode === "readonly",
      layout: def.layout,
      client: def.client,
    };
    if (def.client === "amp") amp.push(entry);
    if (def.client === "honda") honda.push(entry);
  });

  return { amp, honda };
};

export const EXPENSE_ROUTE_REGISTRY = buildExpenseRouteRegistry();
