import React, { useMemo } from 'react';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { useGetExpenseSheetQuery } from '../../redux/apiSlice';
import { getApiErrorMessage } from '../../utils/helper';
import { formatINR } from './expenseFormatters';
import MonthByCategoryGrid from './layouts/MonthByCategoryGrid';
import { hydrateMonthByCategory } from './expenseGridUtils';
import { getSheetDefinition } from './expenseSheetDefinitions';

const REPORT_TYPE = 'total_exp_summary';

/**
 * Honda Total Exp — read-only (derived from detail sheets on backend).
 */
const TotalExpReport = () => {
  const definition = getSheetDefinition(REPORT_TYPE);
  const { data, isLoading, isError, error } = useGetExpenseSheetQuery(REPORT_TYPE);

  const grid = useMemo(() => {
    if (!definition || !data?.cells) return {};
    return hydrateMonthByCategory(definition, data.cells).grid;
  }, [definition, data]);

  if (!definition) {
    return <div className="p-8 text-red-600">Total Exp definition missing.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10">
      <div className="mx-auto max-w-[100%] px-4 lg:px-8">
        <h1 className="mb-4 flex items-center gap-3 text-2xl font-bold">
          <span className="rounded-xl bg-slate-200 p-2">
            <CurrencyRupeeIcon className="h-6 w-6 text-slate-700" />
          </span>
          {definition.module_title}
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Read-only summary (replaces Google Sheet Total Exp tab). Values come from Postgres rollups.
        </p>

        {isLoading && <p className="text-slate-500">Loading...</p>}
        {isError && (
          <p className="mb-4 text-amber-800">
            {getApiErrorMessage(error, 'Could not load Total Exp')}. Backend view may not be ready yet.
          </p>
        )}

        {!isLoading && (
          <MonthByCategoryGrid definition={definition} grid={grid} readOnly />
        )}

        {data?.grand_total != null && (
          <p className="mt-4 text-lg font-semibold">
            Overall grand total: {formatINR(data.grand_total)}
          </p>
        )}
      </div>
    </div>
  );
};

export default TotalExpReport;
