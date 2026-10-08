import React from 'react';
import {
  cellInputClass,
  formatINR,
  stickyHeaderClass,
  stickyLabelClass,
} from '../expenseFormatters';
import { parseAmountInput, vendorRowTotal } from '../expenseGridUtils';

const VendorMonthGrid = ({ definition, grid, onCellChange }) => (
  <div className="overflow-x-auto rounded-xl border border-sky-100">
    <table className="min-w-max border-collapse text-sm">
      <thead>
        <tr className="bg-sky-50 text-sky-900">
          <th className={stickyHeaderClass} rowSpan={2}>{definition.row_label_header}</th>
          {definition.vendor_blocks.map((block) => (
            <th
              key={block.block_code}
              colSpan={definition.block_fields.length}
              className="border-l border-sky-200 px-2 py-2 text-center font-semibold"
            >
              {block.label}
            </th>
          ))}
          <th className="px-3 py-2 text-right font-semibold" rowSpan={2}>Total</th>
        </tr>
        <tr className="bg-sky-50/80 text-sky-800 text-xs">
          {definition.vendor_blocks.flatMap((block) =>
            definition.block_fields.map((f) => (
              <th
                key={`${block.block_code}-${f.field}`}
                className="border-l border-sky-100 px-1 py-1 font-medium whitespace-nowrap"
              >
                {f.label}
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {definition.periods.map((p) => (
          <tr key={p.period_month} className="border-t border-slate-100">
            <td className={stickyLabelClass}>{p.label}</td>
            {definition.vendor_blocks.flatMap((block) =>
              definition.block_fields.map((f) => (
                <td key={`${p.period_month}-${block.block_code}-${f.field}`} className="px-1 py-1">
                  <input
                    type="text"
                    inputMode="decimal"
                    className={cellInputClass}
                    value={grid[p.period_month]?.[block.block_code]?.[f.field] ?? ''}
                    onChange={(e) =>
                      onCellChange(
                        p.period_month,
                        block.block_code,
                        f.field,
                        parseAmountInput(e.target.value),
                      )
                    }
                    placeholder="0"
                  />
                </td>
              )),
            )}
            <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
              {formatINR(vendorRowTotal(definition, grid, p.period_month))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default VendorMonthGrid;
