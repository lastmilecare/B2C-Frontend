import { cn, formatValue } from "../../lib/util";

export function KpiCard({ label, value, format = "number", sublabel, className }) {
  const display = format === "text" || typeof value === "string"
    ? value
    : formatValue(value, format);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {display}
      </p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}

export function KpiGrid({ children, columns = 4 }) {
  const colClass = {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 xl:grid-cols-5",
  }[columns] || "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-1 gap-4", colClass)}>{children}</div>
  );
}
