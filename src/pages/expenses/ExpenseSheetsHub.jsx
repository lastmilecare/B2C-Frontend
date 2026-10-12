import React from 'react';
import { Link } from 'react-router-dom';
import { useGetExpenseSheetIndexQuery } from '../redux/apiSlice';
import { formatDate, getApiErrorMessage } from '../utils/helper';
import { formatINR } from './expenseFormatters';
import { getExpenseSheetsForUser } from './expenseClient';
import { STATUS_COLORS } from './expenseConfig';
import { pathForReportType } from './expenseRouteRegistry';

/**
 * Optional Honda/AMP landing: one card per sheet for the logged-in client.
 * Pass `user` from your auth selector and `basePath` e.g. `/expense-transactions`.
 */
const ExpenseSheetsHub = ({ user, basePath = '/expense-transactions' }) => {
  const catalog = getExpenseSheetsForUser(user);
  const { data, isLoading, isError, error } = useGetExpenseSheetIndexQuery(undefined, {
    skip: !catalog.length,
  });

  const byType = React.useMemo(() => {
    const map = {};
    (data?.sheets || []).forEach((row) => {
      map[row.report_type] = row;
    });
    return map;
  }, [data]);

  if (!catalog.length) {
    return (
      <p className="p-6 text-sm text-slate-600">
        No expense sheets configured for this account. Check JWT mapping in{' '}
        <code>expenseClient.js</code>.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-700">Expense sheets</h1>
      {isError && (
        <p className="mb-4 text-sm text-amber-700">
          {getApiErrorMessage(error, 'Could not load save status')}. You can still open each sheet.
        </p>
      )}
      {isLoading && <p className="text-slate-500">Loading status…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((def) => {
          const summary = byType[def.report_type] || {};
          const hasData = Boolean(
            summary.has_data || summary.updated_at || summary.grand_total > 0,
          );
          const linkTo = `${basePath}/${pathForReportType(def.report_type)}`;

          return (
            <Link
              key={def.report_type}
              to={linkTo}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300"
            >
              <h2 className="font-semibold text-slate-800">{def.module_title}</h2>
              <p className="mt-2 text-sm">
                Total: <strong>{formatINR(summary.grand_total || 0)}</strong>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                <span
                  className={`inline rounded px-2 py-0.5 capitalize ${
                    STATUS_COLORS[summary.status || 'draft'] || STATUS_COLORS.draft
                  }`}
                >
                  {hasData ? summary.status || 'draft' : 'not started'}
                </span>
                {hasData && summary.updated_at && (
                  <> · {formatDate(summary.updated_at)}</>
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseSheetsHub;
