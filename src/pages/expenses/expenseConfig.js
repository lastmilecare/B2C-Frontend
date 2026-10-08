export const EXPENSE_REPORT_TYPES = {
  MONTHLY_OPERATING: 'monthly_operating_expense',
  COMPLIANCE_FEES: 'compliance_fees',
  MISC: 'misc_expenses',
  SATELLITE: 'satellite_centre',
  SALARY: 'salary_by_person',
  VENDOR: 'vendor_payment_revenue',
  TOTAL_EXP: 'total_exp_summary',
};

/** Register routes in your app router + RBAC menus */
export const EXPENSE_ROUTE_REGISTRY = {
  amp: [
    {
      path: 'operating',
      reportType: EXPENSE_REPORT_TYPES.MONTHLY_OPERATING,
      menuLabel: 'Operating expenses',
      permission: 'expenses.operating',
    },
  ],
  honda: [
    {
      path: 'compliances',
      reportType: EXPENSE_REPORT_TYPES.COMPLIANCE_FEES,
      menuLabel: 'Compliances',
      permission: 'expenses.compliances',
    },
    {
      path: 'misc',
      reportType: EXPENSE_REPORT_TYPES.MISC,
      menuLabel: 'MISC',
      permission: 'expenses.misc',
    },
    {
      path: 'satellite',
      reportType: EXPENSE_REPORT_TYPES.SATELLITE,
      menuLabel: 'Satelite center',
      permission: 'expenses.satellite',
    },
    {
      path: 'salaries',
      reportType: EXPENSE_REPORT_TYPES.SALARY,
      menuLabel: 'Salary details',
      permission: 'expenses.salaries',
    },
    {
      path: 'vendor-payments',
      reportType: EXPENSE_REPORT_TYPES.VENDOR,
      menuLabel: 'Vendor payment vs revenue',
      permission: 'expenses.vendor',
    },
    {
      path: 'total-exp',
      reportType: EXPENSE_REPORT_TYPES.TOTAL_EXP,
      menuLabel: 'Total Exp',
      permission: 'expenses.total_exp',
      readOnly: true,
    },
  ],
};

export const EXPENSE_FORM_STEPS = [
  { id: 1, label: 'Enter amounts', icon: null },
  { id: 2, label: 'Confirm', icon: null },
];

export const STATUS_COLORS = {
  draft: 'bg-amber-100 text-amber-800',
  submitted: 'bg-green-100 text-green-700',
  locked: 'bg-slate-100 text-slate-600',
};
