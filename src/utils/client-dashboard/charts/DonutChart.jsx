import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatValue, percentOf } from "../../../lib/util"
import { CHART_PALETTE } from "../types";
import { ChartEmpty } from "./ChartEmpty";

function CustomTooltip({ active, payload, valueFormat }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-slate-800">{item.name}</p>
      <p className="text-muted">
        {formatValue(item.value, valueFormat)} ({item.percent}%)
      </p>
    </div>
  );
}

export function DonutChart({ data = [], height = 300, showLegend = true, valueFormat = "number" }) {
  const slices = data.filter((item) => Number(item.value) > 0);
  if (!slices.length) return <ChartEmpty />;

  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const enriched = slices.map((item, index) => ({
    ...item,
    color: item.color || CHART_PALETTE[index % CHART_PALETTE.length],
    percent: item.percent ?? ((item.value / total) * 100).toFixed(2),
  }));

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enriched}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius="52%"
            outerRadius="74%"
            paddingAngle={2}
          >
            {enriched.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip valueFormat={valueFormat} />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value, entry) => {
                const amount = entry?.payload?.value ?? 0;
                const share = entry?.payload?.percent;
                return `${value}: ${formatValue(amount, valueFormat)} (${share}%)`;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-muted">
        Total: {formatValue(total, valueFormat)} ({percentOf(total, total)})
      </p>
    </div>
  );
}
