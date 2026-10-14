import React,{useMemo} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/UIComponents";
import {
  useGetExpenseSheetSummaryQuery,
  useGetExpenseSheetQuery,
} from "../../redux/apiSlice";
import { formatDate, getApiErrorMessage } from "../../utils/helper";
import { formatINR } from "./expenseFormatters";
import { getSheetDefinition } from "./expenseSheetDefinitions";
import { useExportExpenseCsvFromApi } from "./useExportExpenseCsv";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { healthAlerts } from "../../utils/healthSwal";
import {
  mergeExpenseListSummary,
  normalizeExpenseSheetResponse,
  summaryFromFullSheet,
} from './expenseApiNormalize';
import { resolveReportType } from './expenseReportTypeResolve';

const ExpenseList = ({ reportType: reportTypeProp, listTitle, onOpenForm }) => {
  const reportType = resolveReportType(reportTypeProp);
  const navigate = useNavigate();
  const definition = getSheetDefinition(reportType);
  const heading = listTitle || definition?.module_title || 'Expenses';

  if (!reportType || !definition) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center text-red-600">
        Unknown expense sheet. Use <code>AmpOperatingExpensePage</code> or path{' '}
        <code>/expense-transactions/operating</code>.
      </div>
    );
  }

  const {
    data: rawSummaryData,
    isLoading,
    isError,
    error,
  } = useGetExpenseSheetSummaryQuery(reportType, {
    skip: !reportType,
  });

  const { data: rawSheetData, isLoading: sheetLoading } = useGetExpenseSheetQuery(
    reportType,
    {
      skip: !reportType,
      refetchOnMountOrArgChange: true,
    },
  );

  const sheetData = normalizeExpenseSheetResponse(rawSheetData, reportType);

  const exportCsv = useExportExpenseCsvFromApi(reportType, sheetData);

  const summary = useMemo(
    () => mergeExpenseListSummary(rawSummaryData, sheetData, reportType),
    [rawSummaryData, sheetData, reportType],
  );

  const sheetSummaryFallback = summaryFromFullSheet(sheetData);
  const showSummaryWarning = isError && !sheetSummaryFallback?.has_data;

  const goEdit = () => {
    if (onOpenForm) {
      onOpenForm('edit');
      return;
    }
    navigate('edit', { relative: 'path', state: { goToForm: true, mode: 'edit' } });
  };

  const goCreate = () => {
    if (onOpenForm) {
      onOpenForm('create');
      return;
    }
    navigate('edit', { relative: 'path', state: { goToForm: true, mode: 'create' } });
  };

  const goView = () => {
    if (definition?.entry_mode === 'readonly') {
      navigate('../total-exp', { relative: 'path' });
      return;
    }
    goEdit();
  };

  const handleExport = () => {
    if (!reportType) {
      healthAlerts.warning('Unknown sheet type for export');
      return;
    }
    if (sheetLoading) {
      healthAlerts.warning('Sheet is still loading');
      return;
    }
    const cellCount = sheetData?.cells?.length ?? 0;
    if (cellCount === 0 && hasData) {
      healthAlerts.warning(
        'Summary shows saved data but cells did not load. Open Edit once, or check GET /expense-sheets uses the correct report_type.',
      );
      return;
    }
    if (!exportCsv()) {
      healthAlerts.warning('No data to export yet');
      return;
    }
    healthAlerts.success('CSV file downloaded', 'Export');
  };

  const hasData = Boolean(
    summary.has_data ||
      summary.updated_at ||
      (summary.grand_total && summary.grand_total > 0),
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h1 className="mb-6 text-2xl font-semibold text-gray-700">{heading}</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading && <p className="text-slate-500">Loading...</p>}
        {showSummaryWarning && (
          <p className="mb-4 text-sm text-amber-700">
            {getApiErrorMessage(error, 'Summary unavailable')}. Showing totals from the
            loaded sheet instead.
          </p>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Sheet</p>
            <p className="text-lg font-semibold">{heading}</p>
            <p className="mt-2 text-sm">
              Grand total: <strong>{formatINR(summary.grand_total)}</strong>
            </p>
            <p className="text-sm text-slate-500">
              Status: <span className="capitalize">{summary.status || 'draft'}</span>
              {!hasData && <> · Not started yet</>}
              {hasData && summary.updated_at && (
                <> · Last saved {formatDate(summary.updated_at)}</>
              )}
            </p>
            <p className="mt-2 max-w-xl text-xs text-slate-500">
              Export downloads the same grid layout as your Google Sheet (UTF-8 CSV).
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="gray" onClick={handleExport} disabled={sheetLoading}>
              <ArrowDownTrayIcon className="mr-1 inline h-5 w-5" />
              Export CSV
            </Button>
            {definition?.entry_mode !== 'readonly' && (
              <>
                {hasData ? (
                  <Button variant="sky" onClick={goEdit}>Edit sheet</Button>
                ) : (
                  <Button variant="emerald" onClick={goCreate}>Start entry</Button>
                )}
              </>
            )}
            {definition?.entry_mode === 'readonly' && (
              <Button variant="emerald" onClick={goView}>View report</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;
