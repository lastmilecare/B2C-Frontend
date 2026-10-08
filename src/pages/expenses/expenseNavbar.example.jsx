/**
 * Example navbar snippet — merge into your Navbar.
 * Use your existing `can`, `MenuGroup`, `NavLink`, `subNavItem`, `setIsOpen`.
 *
 * Option A: show menus by client from auth (recommended).
 */
import {
  AmpOperatingExpensePage,
} from './expenseRouteComponents';
import { EXPENSE_ROUTE_REGISTRY } from './expenseConfig';

// --- Inside Navbar component ---
// const { user } = useAuth(); // or however you read client: 'amp' | 'honda'

/*
{can('read:client_dashboard') && user?.client_id === 'amp' && (
  <MenuGroup menuKey="ExpenseTransactions" icon={BuildingOffice2Icon} label="Expense Transactions">
    <NavLink to="/expense-transactions" className={subNavItem} onClick={() => setIsOpen(false)} end>
      Operating expenses sheet
    </NavLink>
  </MenuGroup>
)}

{can('read:client_dashboard') && user?.client_id === 'honda' && (
  <MenuGroup menuKey="ExpenseTransactions" icon={BuildingOffice2Icon} label="Expense Transactions">
    <NavLink to="/expense-transactions/compliances" className={subNavItem} onClick={() => setIsOpen(false)}>
      Compliances
    </NavLink>
    <NavLink to="/expense-transactions/misc" className={subNavItem} onClick={() => setIsOpen(false)}>
      MISC
    </NavLink>
    <NavLink to="/expense-transactions/satellite" className={subNavItem} onClick={() => setIsOpen(false)}>
      Satelite center
    </NavLink>
    <NavLink to="/expense-transactions/salaries" className={subNavItem} onClick={() => setIsOpen(false)}>
      Salary details
    </NavLink>
    <NavLink to="/expense-transactions/vendor-payments" className={subNavItem} onClick={() => setIsOpen(false)}>
      Vendor vs revenue
    </NavLink>
    <NavLink to="/expense-transactions/total-exp" className={subNavItem} onClick={() => setIsOpen(false)}>
      Total Exp (report)
    </NavLink>
  </MenuGroup>
)}
*/

export {};
