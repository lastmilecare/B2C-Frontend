import { cn } from "../../lib/util";

export function DashboardCard({ title, action, children, className, noPadding }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
          {title && (
            <h2 className="text-sm font-semibold text-slate-800 sm:text-base">{title}</h2>
          )}
          {action}
        </div>
      )}
      <div className={cn(!noPadding && "p-4 sm:p-5")}>{children}</div>
    </section>
  );
}
