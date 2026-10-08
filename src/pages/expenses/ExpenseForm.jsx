import React, { useState } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CurrencyRupeeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Button, Select } from '../../components/UIComponents';
import {
  useGetExpenseSheetQuery,
  useSaveExpenseSheetMutation,
} from '../../redux/apiSlice';
import { healthAlerts } from '../../utils/healthSwal';
import { getApiErrorMessage } from '../../utils/helper';
import { formatINR } from './expenseFormatters';
import CategoryByMonthGrid from './layouts/CategoryByMonthGrid';
import MonthByCategoryGrid from './layouts/MonthByCategoryGrid';
import PersonByMonthGrid from './layouts/PersonByMonthGrid';
import VendorMonthGrid from './layouts/VendorMonthGrid';
import { useExpenseSheetState } from './useExpenseSheetState';
import SheetToolbars from './SheetToolbars';
const ExpenseForm = ({ reportType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.mode === 'edit' || location.state?.mode !== 'create';
  const [activeStep, setActiveStep] = useState(1);

  const { data: sheetData, isLoading } = useGetExpenseSheetQuery(reportType, {
    skip: !reportType,
  });
  const [saveSheet, { isLoading: isSaving }] = useSaveExpenseSheetMutation();

  const {
    effectiveDefinition,
    state,
    grandTotal,
    periodRangeLabel,
    setStatus,
    setCategoryCell,
    setRemark,
    setMonthCategoryCell,
    setPersonCell,
    setVendorCell,
    addNextMonth,
    addCategoryRow,
    addExpenseColumn,
    addStaffRow,
    resetGrid,
    savePayload,
    hasSavedData,
  } = useExpenseSheetState(reportType, sheetData, isLoading);

  const definition = effectiveDefinition;

  if (!reportType || !definition) {
    return (
      <div className="p-8 text-center text-red-600">
        Unknown sheet. Check <code>reportType</code> and expenseSheetDefinitions.js.
      </div>
    );
  }

  if (definition.entry_mode === 'readonly') {
    return (
      <div className="p-8 text-center text-slate-600">
        This sheet is read-only. Use <strong>Total Exp</strong> report route instead.
      </div>
    );
  }

  if (isLoading || !state) {
    return <div className="p-8 text-center text-slate-500">Loading sheet...</div>;
  }

  const moduleTitle = definition.module_title;

  const renderGrid = () => {
    switch (definition.layout) {
      case 'category_by_month':
        return (
          <CategoryByMonthGrid
            definition={definition}
            grid={state.grid}
            remarks={state.remarks}
            onCellChange={setCategoryCell}
            onRemarkChange={setRemark}
          />
        );
      case 'month_by_category':
        return (
          <MonthByCategoryGrid
            definition={definition}
            grid={state.grid}
            onCellChange={setMonthCategoryCell}
          />
        );
      case 'person_by_month':
        return (
          <PersonByMonthGrid
            definition={definition}
            grid={state.grid}
            people={state.people}
            onCellChange={setPersonCell}
          />
        );
      case 'vendor_month_blocks':
        return (
          <VendorMonthGrid
            definition={definition}
            grid={state.grid}
            onCellChange={setVendorCell}
          />
        );
      default:
        return <p>Unsupported layout: {definition.layout}</p>;
    }
  };

  const handleSubmit = async () => {
    try {
      await saveSheet(savePayload).unwrap();
      healthAlerts.success(
        isEditMode || hasSavedData ? 'Sheet updated successfully' : 'Sheet saved successfully',
        'Saved',
      );
      navigate('..', { state: { goToList: true }, relative: 'path' });
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, 'Save failed'), 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="mx-auto max-w-[100%] px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="flex items-center gap-3 text-2xl font-bold lg:text-3xl">
            <span className="rounded-xl bg-blue-100 p-2">
              <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
            </span>
            {moduleTitle}
            {(isEditMode || hasSavedData) && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                <PencilSquareIcon className="h-4 w-4" />
                Edit
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            <div className={`h-2 w-12 rounded-full ${activeStep >= 1 ? 'bg-sky-600' : 'bg-blue-100'}`} />
            <div className={`h-2 w-12 rounded-full ${activeStep >= 2 ? 'bg-sky-600' : 'bg-blue-100'}`} />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-white shadow-xl">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 p-4 lg:p-8">
            {activeStep === 1 && (
              <>
                <div className="mb-4 max-w-xs">
                  <Select
                    label="Status"
                    name="status"
                    value={state.status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                  </Select>
                </div>

                <SheetToolbars
                  layout={definition.layout}
                  periodRangeLabel={periodRangeLabel}
                  onAddNextMonth={addNextMonth}
                  onAddCategoryRow={addCategoryRow}
                  onAddExpenseColumn={addExpenseColumn}
                  onAddStaffRow={addStaffRow}
                />

                {renderGrid()}
              </>
            )}

            {activeStep === 2 && (
              <div className="space-y-3 rounded-xl border bg-sky-50 p-6">
                <h3 className="flex items-center gap-2 font-semibold text-sky-700">
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  Confirm save
                </h3>
                <p><b>Sheet:</b> {moduleTitle}</p>
                <p><b>Status:</b> {state.status}</p>
                <p><b>Period range:</b> {periodRangeLabel}</p>
                <p><b>Grand total (all cells):</b> {formatINR(grandTotal)}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={() => setActiveStep(1)}>Back</Button>
                )}
                {activeStep === 1 && (
                  <Button type="button" variant="gray" onClick={resetGrid}>
                    <ArrowPathIcon className="mr-1 inline h-5 w-5" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => navigate('..', { state: { goToList: true }, relative: 'path' })}
                >
                  Cancel
                </Button>
                {activeStep === 1 ? (
                  <Button type="button" variant="sky" onClick={() => setActiveStep(2)}>Continue</Button>
                ) : (
                  <Button type="button" variant="sky" onClick={handleSubmit} disabled={isSaving}>
                    <CheckCircleIcon className="mr-1 inline h-5 w-5" />
                    {hasSavedData || isEditMode ? 'Update sheet' : 'Save sheet'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
