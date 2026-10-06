export function ChartEmpty({ message = "No records for the selected filters." }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 px-4 text-center text-sm text-muted">
      {message}
    </div>
  );
}
