import React, { useMemo } from 'react';
import { CurrencyRupeeIcon,ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useGetExpenseSheetQuery } from '../../redux/apiSlice';
import { getApiErrorMessage } from '../../utils/helper';
import { formatINR } from './expenseFormatters';
import MonthByCategoryGrid from './layouts/MonthByCategoryGrid';
import { hydrateMonthByCategory } from './expenseGridUtils';
import { getSheetDefinition } from './expenseSheetDefinitions';
import { exportSheetToCsv } from './expenseCsvExport';
import { buildEffectiveDefinition, extractPeriodsFromCells } from './expenseDefinitionMerge';
import {  Button } from '../../components/UIComponents';
/**
 * Honda Total Exp — read-only (derived from detail sheets on backend).
 */
const REPORT_TYPE = 'total_exp_summary';

const TotalExpReport = () => {
  const definition = getSheetDefinition(REPORT_TYPE);
  const { data, isLoading, isError, error } = useGetExpenseSheetQuery(REPORT_TYPE);

  const effectiveDefinition = useMemo(() => {
    if (!definition) return null;
    return buildEffectiveDefinition(definition, {
      cellPeriods: extractPeriodsFromCells(data?.cells),
      custom: data?.custom,
    });
  }, [definition, data]);

  const grid = useMemo(() => {
    if (!effectiveDefinition || !data?.cells) return {};
    return hydrateMonthByCategory(effectiveDefinition, data.cells).grid;
  }, [effectiveDefinition, data]);

  const handleExport = () => {
    if (!effectiveDefinition) return;
    exportSheetToCsv(effectiveDefinition, { grid, status: 'submitted' }, REPORT_TYPE);
    healthAlerts.success('CSV file downloaded', 'Export');
  };

  if (!definition) {
    return <div className="p-8 text-red-600">Total Exp definition missing.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10">
      <div className="mx-auto max-w-[100%] px-4 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <span className="rounded-xl bg-slate-200 p-2">
              <CurrencyRupeeIcon className="h-6 w-6 text-slate-700" />
            </span>
            {definition.module_title}
          </h1>
          <Button variant="gray" onClick={handleExport} disabled={isLoading}>
            <ArrowDownTrayIcon className="mr-1 inline h-5 w-5" />
            Export CSV
          </Button>
        </div>
        <p className="mb-6 text-sm text-slate-600">
          Read-only summary (replaces Google Sheet Total Exp tab). Values come from Postgres rollups.
        </p>

        {isLoading && <p className="text-slate-500">Loading...</p>}
        {isError && (
          <p className="mb-4 text-amber-800">
            {getApiErrorMessage(error, 'Could not load Total Exp')}. Backend view may not be ready yet.
          </p>
        )}

        {!isLoading && effectiveDefinition && (
          <MonthByCategoryGrid definition={effectiveDefinition} grid={grid} readOnly />
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
