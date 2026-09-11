import { OHC_THEME } from "../lib/chart-config";

export function ChartLegend({ items }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {items.map(({ color, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 text-xs text-slate-500"
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: color }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm ${className}`}
    >
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mb-4 text-xs text-slate-400">{subtitle}</p>
      {children}
    </div>
  );
}

export function ChartCanvas({ height = 220 }) {
  return <div style={{ position: "relative", height }} />;
}

export { OHC_THEME };
