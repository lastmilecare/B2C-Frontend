import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { Filter } from "lucide-react";

const { RangePicker } = DatePicker;

export function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <Filter className="h-3.5 w-3.5" />
        Filters
      </span>
      {filters.map((f) => {
        if (f.type === "dateRange") {
          return (
            <label key={f.id} className="flex min-w-[240px] flex-col gap-1 text-xs font-medium text-slate-500">
              {f.label || "Date"}
              <RangePicker
                value={values[f.id]}
                onChange={(dates) => onChange(f.id, dates)}
                format="DD/MM/YYYY"
                allowClear={false}
              />
            </label>
          );
        }
        return (
          <label key={f.id} className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-slate-500">
            {f.label || f.placeholder}
            <Select
              value={values[f.id]}
              onChange={(v) => onChange(f.id, v ?? "all")}
              options={f.options}
              placeholder={f.placeholder}
              allowClear={f.allowClear}
            />
          </label>
        );
      })}
    </div>
  );
}

export function defaultDateRange(start, end) {
  return [dayjs(start), dayjs(end)];
}
