/**
 * Paste into your router (adjust base path / permissions).
 *
 * import ExpensePage from './expenses/ExpensePage';
 * import { EXPENSE_ROUTE_REGISTRY } from './expenses/expenseConfig';
 *
 * // AMP user menu — only registry.amp routes
 * {EXPENSE_ROUTE_REGISTRY.amp.map(({ path, reportType, menuLabel }) => (
 *   <Route
 *     key={path}
 *     path={`/expenses/${path}/*`}
 *     element={<ExpensePage reportType={reportType} moduleTitle={menuLabel} />}
 *   />
 * ))}
 *
 * // Honda user menu — registry.honda routes
 * {EXPENSE_ROUTE_REGISTRY.honda.map(({ path, reportType, menuLabel, readOnly }) => (
 *   <Route
 *     key={path}
 *     path={`/expenses/${path}/*`}
 *     element={<ExpensePage reportType={reportType} moduleTitle={menuLabel} />}
 *   />
 * ))}
 */

export {};
