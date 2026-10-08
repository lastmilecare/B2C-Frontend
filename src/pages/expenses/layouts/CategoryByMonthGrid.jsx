import React from 'react';
import {
  cellInputClass,
  formatINR,
  stickyHeaderClass,
  stickyLabelClass,
} from '../expenseFormatters';
import {
  parseAmountInput,
  periodTotalCategoryMonth,
  rowTotalCategoryMonth,
} from '../expenseGridUtils';

const CategoryByMonthGrid = ({ definition, grid, remarks, onCellChange, onRemarkChange }) => (
  <div className="overflow-x-auto rounded-xl border border-sky-100">
    <table className="min-w-max border-collapse text-sm">
      <thead>
        <tr className="bg-sky-50 text-sky-900">
          <th className={stickyHeaderClass}>{definition.row_label_header}</th>
          {definition.periods.map((p) => (
            <th key={p.period_month} className="px-2 py-2 text-center font-semibold whitespace-nowrap">
              {p.label}
            </th>
          ))}
          <th className="px-3 py-2 text-right font-semibold">Row total</th>
          {definition.remarks_per_row && (
            <th className="min-w-[200px] px-3 py-2 text-left font-semibold">Remarks</th>
          )}
        </tr>
      </thead>
      <tbody>
        {definition.categories.map((cat) => (
          <tr key={cat.line_code} className="border-t border-slate-100">
            <td className={stickyLabelClass}>{cat.label}</td>
            {definition.periods.map((p) => (
              <td key={p.period_month} className="px-1 py-1">
                <input
                  type="text"
                  inputMode="decimal"
                  className={cellInputClass}
                  value={grid[cat.line_code]?.[p.period_month] ?? ''}
                  onChange={(e) =>
                    onCellChange(cat.line_code, p.period_month, parseAmountInput(e.target.value))
                  }
                  placeholder="0"
                />
              </td>
            ))}
            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
              {formatINR(rowTotalCategoryMonth(definition, grid, cat.line_code))}
            </td>
            {definition.remarks_per_row && (
              <td className="px-2 py-1">
                <input
                  type="text"
                  className="w-full min-w-[180px] rounded-md border border-slate-200 px-2 py-1.5 text-sm"
                  value={remarks[cat.line_code] || ''}
                  onChange={(e) => onRemarkChange(cat.line_code, e.target.value)}
                  placeholder="Remark"
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-sky-200 bg-slate-50 font-semibold">
          <td className={`${stickyHeaderClass} bg-slate-50`}>Total</td>
          {definition.periods.map((p) => (
            <td key={p.period_month} className="px-2 py-2 text-right text-xs whitespace-nowrap">
              {formatINR(periodTotalCategoryMonth(definition, grid, p.period_month))}
            </td>
          ))}
          <td className="px-3 py-2 text-right">
            {formatINR(
              definition.categories.reduce(
                (s, c) => s + rowTotalCategoryMonth(definition, grid, c.line_code),
                0,
              ),
            )}
          </td>
          {definition.remarks_per_row && <td />}
        </tr>
      </tfoot>
    </table>
  </div>
);

export default CategoryByMonthGrid;
