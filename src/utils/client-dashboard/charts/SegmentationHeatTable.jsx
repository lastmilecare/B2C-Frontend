import { cn } from "../../../lib/util";

function cellTone(value) {
  const num = parseFloat(String(value).replace("%", ""));
  if (Number.isNaN(num)) return "bg-slate-50";
  if (num >= 15) return "bg-brand-100 text-brand-700 font-medium";
  if (num >= 8) return "bg-blue-50 text-slate-800";
  if (num >= 4) return "bg-slate-50";
  return "bg-white text-slate-600";
}

export function SegmentationHeatTable({ title, columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            {columns.map((col) => (
              <th
                key={col}
                className={cn(
                  "px-3 py-2 text-left font-semibold text-slate-700",
                  col === "Total" && "bg-slate-100",
                )}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {columns.map((col) => {
                const val = row[col];
                const isFirst = col === columns[0];
                const isPercent =
                  !isFirst && col !== "Total" && String(val).includes("%");
                return (
                  <td
                    key={col}
                    className={cn(
                      "px-3 py-2",
                      isFirst && "font-medium text-slate-800 whitespace-nowrap",
                      isPercent && cellTone(val),
                      col === "Total" && "bg-slate-50 font-semibold",
                    )}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {title && (
        <p className="mt-2 text-xs text-muted">{title}</p>
      )}
    </div>
  );
}
