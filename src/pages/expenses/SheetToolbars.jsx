import React, { useState } from 'react';
import { Button, Input } from '../../components/UIComponents';
import { healthAlerts } from '../../utils/healthSwal';

/**
 * Add month / row / column controls (future-proof sheet structure).
 */
const SheetToolbars = ({
  layout,
  periodRangeLabel,
  onAddNextMonth,
  onAddCategoryRow,
  onAddExpenseColumn,
  onAddStaffRow,
}) => {
  const [rowLabel, setRowLabel] = useState('');
  const [colLabel, setColLabel] = useState('');
  const [staffName, setStaffName] = useState('');

  const submitRow = () => {
    const label = rowLabel.trim();
    if (!label) {
      healthAlerts.warning('Enter a name for the new row');
      return;
    }
    if (layout === 'person_by_month') {
      onAddStaffRow?.(label);
    } else if (layout === 'category_by_month') {
      onAddCategoryRow?.(label);
    } else {
      healthAlerts.warning('Use “Add month” for new periods on this sheet type');
      return;
    }
    setRowLabel('');
  };

  const submitColumn = () => {
    const label = colLabel.trim();
    if (!label) {
      healthAlerts.warning('Enter a name for the new column');
      return;
    }
    onAddExpenseColumn?.(label);
    setColLabel('');
  };

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-800">Period range:</span> {periodRangeLabel}
          <span className="ml-2 text-xs text-slate-500">
            (includes rolling past/future months — not limited to Aug-26)
          </span>
        </p>
        <Button type="button" variant="sky" className="!py-1.5 !text-xs" onClick={onAddNextMonth}>
          + Add next month
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-3">
        {(layout === 'category_by_month' || layout === 'person_by_month') && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px]">
              <Input
                label={layout === 'person_by_month' ? 'New staff name' : 'New category row'}
                name="new_row"
                value={rowLabel}
                onChange={(e) => setRowLabel(e.target.value)}
                placeholder={layout === 'person_by_month' ? 'Employee name' : 'e.g. New expense line'}
              />
            </div>
            <Button type="button" variant="gray" onClick={submitRow}>Add row</Button>
          </div>
        )}

        {layout === 'month_by_category' && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px]">
              <Input
                label="New expense column"
                name="new_col"
                value={colLabel}
                onChange={(e) => setColLabel(e.target.value)}
                placeholder="e.g. New fee type"
              />
            </div>
            <Button type="button" variant="gray" onClick={submitColumn}>Add column</Button>
          </div>
        )}

        {layout === 'vendor_month_blocks' && (
          <p className="text-xs text-slate-500">
            Vendor blocks are fixed for now. Use <strong>Add next month</strong> for new periods.
          </p>
        )}
      </div>
    </div>
  );
};

export default SheetToolbars;
