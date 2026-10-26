/**
 * Google Sheet tab → report_type + grid layout (from AMP / Honda CSVs).
 */

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/** Apr-25 → 2025-04-01 */
export const parseMonYyLabel = (label) => {
  const [mon, yy] = String(label).trim().split("-");
  const m = MONTHS[mon];
  if (m === undefined || yy === undefined) return null;
  const year = 2000 + Number(yy);
  return `${year}-${String(m + 1).padStart(2, "0")}-01`;
};

/** 24-Apr → 2024-04-01 */
export const parseYyMonLabel = (label) => {
  const [yy, mon] = String(label).trim().split("-");
  const m = MONTHS[mon];
  if (m === undefined || yy === undefined) return null;
  const year = 2000 + Number(yy);
  return `${year}-${String(m + 1).padStart(2, "0")}-01`;
};

const periodsFromLabels = (labels, parser) =>
  labels
    .map((label) => ({
      label,
      period_month: parser(label),
    }))
    .filter((p) => p.period_month);

const AMP_CATEGORIES = [
  { line_code: "staff_salary", label: "Staff Salary" },
  { line_code: "medicine_consumables", label: "Medicine and Consumables" },
  { line_code: "capex", label: "CAPEX" },
  { line_code: "admin_consumables", label: "Admin Consumables" },
  { line_code: "compliances_licensing", label: "Compliances and Licensing" },
  { line_code: "miscellaneous", label: "Miscellaneous" },
  { line_code: "camp_cost", label: "Camp Cost" },
  { line_code: "management_cost", label: "Management Cost" },
];

/** Period rows/columns come from DB cells + custom.periods + rolling window (see expensePeriodUtils). */
const EMPTY_PERIODS = [];

const VENDOR_BLOCKS = [
  {
    block_code: "diagnostics",
    label: "Diagnostics",
    payment_key: "diagnostics_payment",
  },
  {
    block_code: "medicines",
    label: "Medicines, Medical Consumables",
    payment_key: "medicines_payment",
  },
  {
    block_code: "specs_vendor",
    label: "Specs Vendor",
    payment_key: "specs_vendor_payment",
  },
  {
    block_code: "physiotherapist",
    label: "Physiotherapist",
    payment_key: "physiotherapist_payment",
  },
  { block_code: "dentist", label: "Dentist", payment_key: "dentist_payment" },
];

const TOTAL_EXP_COLUMNS = [
  { line_code: "salaries", label: "Salaries" },
  { line_code: "hr_recruitment", label: "Hr Recruitment & Managemenrt Cost(salaries * 0.03)" },
  { line_code: "health_camp", label: "Health Camp & Other Events" },
  { line_code: "compliance_cert", label: "Compliance & Certifications" },
  { line_code: "iec_branding", label: "IEC Branding and Promotion" },
  { line_code: "consumables_hsvk", label: "Consumables HSVK" },
  { line_code: "satellite_centre", label: "Satellite Centre" },
  { line_code: "tech_stack", label: "Tech Stack" },
  { line_code: "misc", label: "Misc" },
  { line_code: "management_exp", label: "Management Exp" },
  { line_code: "total_opex_grant", label: "Total Expenses under Opex Grant" },
  { line_code: "diagnostics", label: "Diagnostics" },
  { line_code: "medicines", label: "Medicines,Medical Consumables" },
  { line_code: "specs_vendor", label: "Specs Vendor" },
  { line_code: "physiotherapist", label: "Physiotherapist" },
  { line_code: "dentist", label: "Dentist" },
  {
    line_code: "total_incl_vendors",
    label: "Total expenses including vendors payment/share",
  },
];

export const EXPENSE_SHEET_DEFINITIONS = {
  monthly_operating_expense: {
    report_type: "monthly_operating_expense",
    client: "amp",
    layout: "category_by_month",
    module_title: "Monthly Operating Expenses",
    row_label_header: "Categories",
    categories: AMP_CATEGORIES,
    periods: EMPTY_PERIODS,
    period_format: "mon_yy",
    remarks_per_row: true,
    entry_mode: "editable",
  },

  compliance_fees: {
    report_type: "compliance_fees",
    client: "honda",
    layout: "month_by_category",
    module_title: "Compliances",
    row_label_header: "Month",
    columns: [
      { line_code: "audit_fee", label: "Audit Fee" },
      { line_code: "barcode", label: "Barcode" },
      { line_code: "bio_med_waste", label: "Bio Med Waste" },
      {
        line_code: "xray_license_reporting",
        label: "X-Ray License & Reporting",
      },
      { line_code: "regulatory_license", label: "Regulatory License" },
      { line_code: "pharmacy_license", label: "Pharmacy license" },
    ],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  misc_expenses: {
    report_type: "misc_expenses",
    client: "honda",
    layout: "month_by_category",
    module_title: "MISC",
    row_label_header: "Month",
    columns: [
      {
        line_code: "travelling_setup",
        label: "Travelling for Initial Setup, Training…",
      },
      { line_code: "pos_rental", label: "POS Rental" },
      { line_code: "employee_welfare", label: "Employee Welfare" },
      { line_code: "picasoid", label: "Picasoid" },
      { line_code: "misc", label: "Misc" },
      {
        line_code: "mobilisation_conveyance",
        label: "Mobilisation Conveyance",
      },
    ],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  consumables_expenses: {
    report_type: "consumables_expenses",
    client: "honda",
    layout: "month_by_category",
    module_title: "Consumables",
    row_label_header: "Months",
    columns: [
      {
        line_code: "packaged_drinking_water",
        label: "Packaged Drinking Water",
      },
      { line_code: "dental_expenses", label: "Dental Expenses" },
      { line_code: "office_expense", label: "Office Expense" },
    ],
    periods: EMPTY_PERIODS,
    period_format: "mon_yy",
    entry_mode: "editable",
  },

  satellite_centre: {
    report_type: "satellite_centre",
    client: "honda",
    layout: "month_by_category",
    module_title: "Satelite Center",
    row_label_header: "Month",
    columns: [
      { line_code: "badha_rent", label: "Badha Rent" },
      { line_code: "kherki_rent", label: "Kherki Rent" },
      { line_code: "kherki_daula_rent", label: "Kherki Daula rent" },
      { line_code: "kota", label: "Kota" },
      { line_code: "catridge_refill", label: "Catridge Refill" },
      { line_code: "electricity", label: "Electricity Expense" },
      {
        line_code: "initial_setup",
        label: "Initial Setup… Printing & Stationaries…",
      },
      { line_code: "conveyence", label: "Conveyence (mobilisation)" },
    ],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  salary_by_person: {
    report_type: "salary_by_person",
    client: "honda",
    layout: "person_by_month",
    module_title: "Individual Salary Details",
    row_label_header: "Name",
    periods: EMPTY_PERIODS,
    period_format: "mon_yy",
    meta_columns: ["subcategory", "category"],
    entry_mode: "editable",
  },

  hr_recruitment: {
    report_type: "hr_recruitment",
    client: "honda",
    layout: "month_by_category",
    module_title: "HR Recruitment & Management Cost",
    row_label_header: "Month",
    persist_column_codes: ['cost'],
    show_month_row_total: false,
    columns: [
      { line_code: "salaries", label: "Salaries",input_only:true  },
      {
        line_code: "cost",
        label: "Cost (Salaries × 0.03)",
        computed: true,
        formula: "salaries_times_0_3",
      },
    ],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  health_camp: {
    report_type: "health_camp",
    client: "honda",
    layout: "month_by_category",
    module_title: "Health Camp & Other Events",
    row_label_header: "Month",
    columns: [{ line_code: "cost", label: "Cost" }],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  iec_branding: {
    report_type: "iec_branding",
    client: "honda",
    layout: "month_by_category",
    module_title: "IEC Branding and Promotion",
    row_label_header: "Month",
    columns: [{ line_code: "cost", label: "Cost" }],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  tech_stack: {
    report_type: "tech_stack",
    client: "honda",
    layout: "month_by_category",
    module_title: "Tech Stack",
    row_label_header: "Month",
    columns: [{ line_code: "cost", label: "Cost" }],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  management_exp: {
    report_type: "management_exp",
    client: "honda",
    layout: "month_by_category",
    module_title: "Management Exp",
    row_label_header: "Month",
    columns: [{ line_code: "cost", label: "Cost" }],
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "editable",
  },

  vendor_payment_revenue: {
    report_type: "vendor_payment_revenue",
    client: "honda",
    layout: "vendor_month_blocks",
    module_title: "Vendor Payment Vs Revenue",
    row_label_header: "Month",
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    vendor_blocks: VENDOR_BLOCKS,
    block_fields: [
      { field: "revenue", label: "Revenue" },
      { field: "vendor_payment", label: "Payment" },
      {
        field: "share",
        label: "MediKavach's Share",
        computed: true,
        formula: "revenue_minus_vendor_payment",
      },
    ],
    entry_mode: "editable",
  },

  total_exp_summary: {
    report_type: "total_exp_summary",
    client: "honda",
    layout: "month_by_category",
    module_title: "Total Exp",
    row_label_header: "Month",
    columns: TOTAL_EXP_COLUMNS,
    periods: EMPTY_PERIODS,
    period_format: "yy_mon",
    entry_mode: "readonly",
  },
};

export const getSheetDefinition = (reportType) =>
  EXPENSE_SHEET_DEFINITIONS[reportType] || null;

export const listSheetsByClient = (client) =>
  Object.values(EXPENSE_SHEET_DEFINITIONS).filter((s) => s.client === client);
