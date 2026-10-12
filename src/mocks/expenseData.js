export const EXPENSE_TEMPLATES = {
  amp: {
    client_id: 'amp',
    report_type: 'monthly_operating_expense',
    lines: [
      { line_code: 'staff_salary', label: 'Staff Salary', sort_order: 1, remark_allowed: true },
      { line_code: 'medicine_consumables', label: 'Medicine and Consumables', sort_order: 2, remark_allowed: true },
      { line_code: 'capex', label: 'CAPEX', sort_order: 3, remark_allowed: true },
      { line_code: 'admin_consumables', label: 'Admin Consumables', sort_order: 4, remark_allowed: true },
      { line_code: 'compliances_licensing', label: 'Compliances and Licensing', sort_order: 5, remark_allowed: true },
      { line_code: 'miscellaneous', label: 'Miscellaneous', sort_order: 6, remark_allowed: true },
      { line_code: 'camp_cost', label: 'Camp Cost', sort_order: 7, remark_allowed: true },
      { line_code: 'management_cost', label: 'Management Cost', sort_order: 8, remark_allowed: true },
    ],
  },
  honda: {
    client_id: 'honda',
    report_type: 'compliance_fees',
    lines: [
      { line_code: 'audit_fee', label: 'Audit Fee', sort_order: 1, remark_allowed: false },
      { line_code: 'barcode', label: 'Barcode', sort_order: 2, remark_allowed: false },
      { line_code: 'bio_med_waste', label: 'Bio Med Waste', sort_order: 3, remark_allowed: false },
      { line_code: 'xray_license_reporting', label: 'X-Ray License & Reporting', sort_order: 4, remark_allowed: false },
      { line_code: 'regulatory_license', label: 'Regulatory License', sort_order: 5, remark_allowed: false },
      { line_code: 'pharmacy_license', label: 'Pharmacy license', sort_order: 6, remark_allowed: false },
    ],
  },
};

const seedReports = () => {
  const now = new Date().toISOString();
  return [
    {
      id: 'r-honda-2025-09',
      unique_name: 'EXP-HONDA-202509',
      client_id: 'honda',
      client_name: 'Honda',
      report_type: 'compliance_fees',
      period_month: '2025-09-01',
      status: 'submitted',
      total_amount: 205116,
      created_at: now,
      updated_at: now,
      lines: [
        { line_code: 'audit_fee', amount: 194400, remark: null },
        { line_code: 'barcode', amount: 2596, remark: null },
        { line_code: 'bio_med_waste', amount: 4480, remark: null },
        { line_code: 'xray_license_reporting', amount: 3640, remark: null },
        { line_code: 'regulatory_license', amount: 0, remark: null },
        { line_code: 'pharmacy_license', amount: 0, remark: null },
      ],
    },
    {
      id: 'r-amp-2025-06',
      unique_name: 'EXP-AMP-202506',
      client_id: 'amp',
      client_name: 'AMP',
      report_type: 'monthly_operating_expense',
      period_month: '2025-06-01',
      status: 'submitted',
      total_amount: 567024,
      created_at: now,
      updated_at: now,
      lines: [
        { line_code: 'staff_salary', amount: 300000, remark: '' },
        { line_code: 'medicine_consumables', amount: 33000, remark: 'Taken @INR 150 per patient' },
        { line_code: 'capex', amount: 0, remark: '' },
        { line_code: 'admin_consumables', amount: 2200, remark: '' },
        { line_code: 'compliances_licensing', amount: 12076, remark: '' },
        { line_code: 'miscellaneous', amount: 114200, remark: '' },
        { line_code: 'camp_cost', amount: 54000, remark: '3 camps in June' },
        { line_code: 'management_cost', amount: 51548, remark: '@10% of total expense' },
      ],
    },
  ];
};

const STORAGE_KEY = 'expense_reports_v1';

export const loadReports = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* fall through */
    }
  }
  const seeded = seedReports();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

export const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const computeTotal = (lines) =>
  (lines || []).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

export const buildUniqueName = (clientId, periodMonth) => {
  const ym = periodMonth.replace(/-/g, '').slice(0, 6);
  return `EXP-${clientId.toUpperCase()}-${ym}`;
};
