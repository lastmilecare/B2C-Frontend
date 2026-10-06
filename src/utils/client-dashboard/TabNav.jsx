import { cn } from "../../lib/util";

export function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              selected
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-800",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
