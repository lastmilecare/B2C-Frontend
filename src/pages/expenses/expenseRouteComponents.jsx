/**
 * Import these in route.config (each route needs a component with reportType set).
 *
 *   import {
 *     AmpOperatingExpensePage,
 *     HondaComplianceExpensePage,
 *     ...
 *   } from './expenses/expenseRouteComponents';
 */
import ExpensePage from "./ExpensePage";
import { EXPENSE_REPORT_TYPES } from "./expenseConfig";

// export const AmpOperatingExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.MONTHLY_OPERATING}
//     moduleTitle="Operating expenses"
//   />
// );

// export const HondaComplianceExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.COMPLIANCE_FEES}
//     moduleTitle="Compliances"
//   />
// );

// export const HondaMiscExpensePage = () => (
//   <ExpensePage reportType={EXPENSE_REPORT_TYPES.MISC} moduleTitle="MISC" />
// );
// export const HondaConsumablesExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.CONSUMABLES}
//     moduleTitle="Consumables"
//   />
// );

// export const HondaSatelliteExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.SATELLITE}
//     moduleTitle="Satelite center"
//   />
// );

// export const HondaSalaryExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.SALARY}
//     moduleTitle="Salary details"
//   />
// );

// export const HondaVendorExpensePage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.VENDOR}
//     moduleTitle="Vendor payment vs revenue"
//   />
// );

// export const HondaTotalExpPage = () => (
//   <ExpensePage
//     reportType={EXPENSE_REPORT_TYPES.TOTAL_EXP}
//     moduleTitle="Total Exp"
//   />
// );
/**
 * Import these in route.config (each route needs a component with reportType set).
 *
 *   import {
 *     AmpOperatingExpensePage,
 *     HondaComplianceExpensePage,
 *     ...
 *   } from './expenses/expenseRouteComponents';
 */
// import ExpensePage from './ExpensePage';
// import { EXPENSE_REPORT_TYPES } from './expenseConfig';

// export { default as AmpExpenseIndexRedirect } from './AmpExpenseIndexRedirect';

export const AmpOperatingExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.MONTHLY_OPERATING}
    moduleTitle="Monthly Operating Expenses"
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

export const HondaConsumablesExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.CONSUMABLES}
    moduleTitle="Consumables"
  />
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

export const HondaHrRecruitmentExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.HR_RECRUITMENT}
    moduleTitle="HR Recruitment & Management Cost"
  />
);

export const HondaHealthCampExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.HEALTH_CAMP}
    moduleTitle="Health Camp & Other Events"
  />
);

export const HondaIecBrandingExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.IEC_BRANDING}
    moduleTitle="IEC Branding and Promotion"
  />
);

export const HondaTechStackExpensePage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.TECH_STACK}
    moduleTitle="Tech Stack"
  />
);

export const HondaManagementExpPage = () => (
  <ExpensePage
    reportType={EXPENSE_REPORT_TYPES.MANAGEMENT_EXP}
    moduleTitle="Management Exp"
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

