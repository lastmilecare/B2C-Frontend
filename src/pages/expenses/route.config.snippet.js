/**
 * Add to your route.config array.
 *
 * import {
 *   AmpExpenseIndexRedirect,
 *   AmpOperatingExpensePage,
 *   HondaComplianceExpensePage,
 *   ...
 * } from './expenses/expenseRouteComponents';
 */

// ——— AMP (recommended URLs) ———
export const ampExpenseRoutes = [
  // Old bookmark: /expense-transactions → canonical AMP sheet
  {
    path: "/expense-transactions",
    component: "AmpExpenseIndexRedirect",
    permission: "read:add_expense",
    showInSidebar: false,
    exact: true,
  },
  {
    path: "/expense-transactions/operating/*",
    component: "AmpOperatingExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
];

// ——— Honda (one route per Google tab) ———
export const hondaExpenseRoutes = [
  {
    path: "/expense-transactions/compliances/*",
    component: "HondaComplianceExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/misc/*",
    component: "HondaMiscExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/consumables/*",
    component: "HondaConsumablesExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/satellite/*",
    component: "HondaSatelliteExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/salaries/*",
    component: "HondaSalaryExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/hr-recruitment/*",
    component: "HondaHrRecruitmentExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/health-camp/*",
    component: "HondaHealthCampExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/iec-branding/*",
    component: "HondaIecBrandingExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/tech-stack/*",
    component: "HondaTechStackExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/management-exp/*",
    component: "HondaManagementExpPage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/vendor-payments/*",
    component: "HondaVendorExpensePage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
  {
    path: "/expense-transactions/total-exp/*",
    component: "HondaTotalExpPage",
    permission: "read:add_expense",
    showInSidebar: false,
  },
];

/**
 * Optional: keep legacy AMP URL working (same as redirect + operating page):
 *   path: '/expense-transactions/*' → AmpOperatingExpensePage
 * Prefer /operating/* so report_type resolves from the URL like Honda tabs.
 */
