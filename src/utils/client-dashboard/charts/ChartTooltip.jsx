import { formatValue, percentOf } from "../../../lib/util";

export function ChartTooltip({ active, payload, label, valueFormat = "number", normalize = false, showShare = true }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((item) => item.value != null && item.dataKey !== "name");
  const rawTotal = rows.reduce((sum, item) => {
    const raw = normalize ? item.payload?.[`__${item.dataKey}`] : item.value;
    return sum + (Number(raw) || 0);
  }, 0);

  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-lg">
      {label != null && label !== "" && (
        <p className="mb-1 font-medium text-slate-800">{label}</p>
      )}
      <ul className="space-y-0.5">
        {rows.map((item) => {
          const raw = normalize ? item.payload?.[`__${item.dataKey}`] : item.value;
          return (
            <li key={item.dataKey} className="flex items-center justify-between gap-4 text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.name}
              </span>
              <span className="font-medium text-slate-800">
                {formatValue(raw, valueFormat)}
                {showShare && rawTotal ? ` (${percentOf(raw, rawTotal)})` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
