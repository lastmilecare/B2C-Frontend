/**
 * Import these in route.config (each route needs a component with reportType set).
 *
 *   import {
 *     AmpOperatingExpensePage,
 *     HondaComplianceExpensePage,
 *     ...
 *   } from './expenses/expenseRouteComponents';
 */
import ExpensePage from './ExpensePage';
import { EXPENSE_REPORT_TYPES } from './expenseConfig';

export const AmpOperatingExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.MONTHLY_OPERATING}
    moduleTitle="Operating expenses"
  />
);

export const HondaComplianceExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.COMPLIANCE_FEES}
    moduleTitle="Compliances"
  />
);

export const HondaMiscExpensePage = () => (
  <ExpensePage reportType={EXPENSE_REPORT_TYPES.MISC} moduleTitle="MISC" />
);

export const HondaSatelliteExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.SATELLITE}
    moduleTitle="Satelite center"
  />
);

export const HondaSalaryExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.SALARY}
    moduleTitle="Salary details"
  />
);

export const HondaVendorExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.VENDOR}
    moduleTitle="Vendor payment vs revenue"
  />
);

export const HondaTotalExpPage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.TOTAL_EXP}
    moduleTitle="Total Exp"
  />
);
