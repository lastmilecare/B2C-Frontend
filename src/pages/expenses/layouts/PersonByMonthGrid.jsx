import React from 'react';
import {
  cellInputClass,
  formatINR,
  stickyHeaderClass,
  stickyLabelClass,
} from '../expenseFormatters';
import { parseAmountInput, personRowTotal } from '../expenseGridUtils';

const PersonByMonthGrid = ({ definition, grid, people, onCellChange }) => {
  if (!people?.length) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No staff rows yet. Your API should return <code>people[]</code> with the salary roster
        (name, subcategory, category). Amounts are entered per person per month.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-sky-100">
      <table className="min-w-max border-collapse text-sm">
        <thead>
          <tr className="bg-sky-50 text-sky-900">
            <th className={stickyHeaderClass}>Name</th>
            <th className="px-2 py-2 font-semibold">Subcategory</th>
            <th className="px-2 py-2 font-semibold">Category</th>
            {definition.periods.map((p) => (
              <th key={p.period_month} className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                {p.label}
              </th>
            ))}
            <th className="px-3 py-2 text-right font-semibold">Row total</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const id = person.person_id || person.id;
            return (
              <tr key={id} className="border-t border-slate-100">
                <td className={stickyLabelClass}>{person.name}</td>
                <td className="px-2 py-2 text-xs text-slate-600">{person.subcategory || '—'}</td>
                <td className="px-2 py-2 text-xs text-slate-600">{person.category || '—'}</td>
                {definition.periods.map((p) => (
                  <td key={p.period_month} className="px-1 py-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      className={cellInputClass}
                      value={grid[id]?.[p.period_month] ?? ''}
                      onChange={(e) =>
                        onCellChange(id, p.period_month, parseAmountInput(e.target.value))
                      }
                      placeholder="0"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                  {formatINR(personRowTotal(definition, grid, id))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PersonByMonthGrid;
