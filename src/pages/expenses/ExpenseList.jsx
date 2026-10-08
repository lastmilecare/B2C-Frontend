import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UIComponents';
import { useGetExpenseSheetSummaryQuery } from '../../redux/apiSlice';
import { formatDate, getApiErrorMessage } from '../../utils/helper';
import { formatINR } from './expenseFormatters';
import { getSheetDefinition } from './expenseSheetDefinitions';

const ExpenseList = ({ reportType, listTitle }) => {
  const navigate = useNavigate();
  const definition = getSheetDefinition(reportType);
  const heading = listTitle || definition?.module_title || 'Expenses';

  const { data, isLoading, isError, error } = useGetExpenseSheetSummaryQuery(reportType, {
    skip: !reportType,
  });

  const summary = data || {
    grand_total: 0,
    status: 'draft',
    updated_at: null,
  };

  const goEdit = () => {
    navigate('edit', { state: { goToForm: true, mode: 'edit' } });
  };

  const goCreate = () => {
    navigate('edit', { state: { goToForm: true, mode: 'create' } });
  };

  const goView = () => {
    if (definition?.entry_mode === 'readonly') {
      navigate('../total-exp', { relative: 'path' });
      return;
    }
    goEdit();
  };

  const hasData = summary.updated_at || (summary.grand_total && summary.grand_total > 0);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <h1 className="mb-6 text-2xl font-semibold text-gray-700">{heading}</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading && <p className="text-slate-500">Loading...</p>}
        {isError && (
          <p className="mb-4 text-sm text-amber-700">
            {getApiErrorMessage(error, 'Summary unavailable')}. You can still open the sheet.
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
              {summary.updated_at && <> · Updated {formatDate(summary.updated_at)}</>}
            </p>
            <p className="mt-2 max-w-xl text-xs text-slate-500">
              Months extend automatically for future entry. On the sheet use <strong>Add next month</strong>
              or add rows/columns for new lines.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {definition?.entry_mode !== 'readonly' && (
              <>
                <Button variant="sky" onClick={goEdit}>
                  Edit sheet
                </Button>
                <Button variant="emerald" onClick={goCreate}>
                  {hasData ? 'Continue entry' : 'Start entry'}
                </Button>
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