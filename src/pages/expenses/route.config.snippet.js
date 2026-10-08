/**
 * Add to your route.config array.
 * Paths use `/*` so `/edit` works (ExpenseForm list → Open sheet).
 *
 * import {
 *   AmpOperatingExpensePage,
 *   HondaComplianceExpensePage,
 *   HondaMiscExpensePage,
 *   HondaSatelliteExpensePage,
 *   HondaSalaryExpensePage,
 *   HondaVendorExpensePage,
 *   HondaTotalExpPage,
 * } from './expenses/expenseRouteComponents';
 */

// ——— AMP (single sheet — keeps your existing URL) ———
export const ampExpenseRoutes = [
  {
    path: '/expense-transactions/*',
    component: 'AmpOperatingExpensePage', // use AmpOperatingExpensePage import in real file
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
];

// ——— Honda (one route per Google tab) ———
export const hondaExpenseRoutes = [
  {
    path: '/expense-transactions/compliances/*',
    component: 'HondaComplianceExpensePage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
  {
    path: '/expense-transactions/misc/*',
    component: 'HondaMiscExpensePage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
  {
    path: '/expense-transactions/satellite/*',
    component: 'HondaSatelliteExpensePage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
  {
    path: '/expense-transactions/salaries/*',
    component: 'HondaSalaryExpensePage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
  {
    path: '/expense-transactions/vendor-payments/*',
    component: 'HondaVendorExpensePage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
  {
    path: '/expense-transactions/total-exp/*',
    component: 'HondaTotalExpPage',
    permission: 'read:client_dashboard',
    showInSidebar: false,
  },
];

/**
 * If your router registers ALL routes for every user, split at runtime instead:
 * spread only ampExpenseRoutes OR hondaExpenseRoutes when building the config,
 * or guard with a layout that redirects wrong client.
 */
