import React from 'react';
import {
  cellInputClass,
  formatINR,
  stickyHeaderClass,
  stickyLabelClass,
} from '../expenseFormatters';
import { monthRowTotal, parseAmountInput } from '../expenseGridUtils';

const MonthByCategoryGrid = ({ definition, grid, onCellChange, readOnly = false }) => (
  <div className="overflow-x-auto rounded-xl border border-sky-100">
    <table className="min-w-max border-collapse text-sm">
      <thead>
        <tr className="bg-sky-50 text-sky-900">
          <th className={stickyHeaderClass}>{definition.row_label_header}</th>
          {definition.columns.map((col) => (
            <th key={col.line_code} className="px-2 py-2 text-center font-semibold whitespace-nowrap">
              {col.label}
            </th>
          ))}
          <th className="px-3 py-2 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {definition.periods.map((p) => (
          <tr key={p.period_month} className="border-t border-slate-100">
            <td className={stickyLabelClass}>{p.label}</td>
            {definition.columns.map((col) => (
              <td key={col.line_code} className="px-1 py-1">
                {readOnly ? (
                  <span className="block px-2 py-1.5 text-right text-slate-800">
                    {formatINR(grid[p.period_month]?.[col.line_code])}
                  </span>
                ) : (
                  <input
                    type="text"
                    inputMode="decimal"
                    className={cellInputClass}
                    value={grid[p.period_month]?.[col.line_code] ?? ''}
                    onChange={(e) =>
                      onCellChange?.(p.period_month, col.line_code, parseAmountInput(e.target.value))
                    }
                    placeholder="0"
                  />
                )}
              </td>
            ))}
            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
              {formatINR(monthRowTotal(definition, grid, p.period_month))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MonthByCategoryGrid;
