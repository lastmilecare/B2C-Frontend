import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import { formatValue, percentOf } from "../../../lib/util";
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

function pieSliceLabel({ percent, name }) {
  if (percent < 0.06) return null;

  return `${name} ${percent}%`;
}

export function DonutChart({
  data = [],
  height = 300,
  showLegend = true,
  valueFormat = "number",
  variant = "donut",
}) {
  const slices = data.filter((item) => Number(item.value) > 0);
  if (!slices.length) return <ChartEmpty />;

  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const enriched = slices.map((item, index) => ({
    ...item,
    color: item.color || CHART_PALETTE[index % CHART_PALETTE.length],
    percent: item.percent ?? ((item.value / total) * 100).toFixed(2),
  }));

  const isPie = variant === "pie";

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enriched}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy={isPie ? "50%" : "46%"}
            {...(isPie
              ? {
                  outerRadius: "82%",
                  label: pieSliceLabel,
                  labelLine: { stroke: "#94a3b8", strokeWidth: 1 },
                }
              : {
                  innerRadius: "58%",
                  outerRadius: "78%",
                  paddingAngle: 2,
                })}
          >
            {enriched.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke={isPie ? "#fff" : "transparent"}
                strokeWidth={isPie ? 2 : 0}
              />
            ))}
            {!isPie && (
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox || typeof viewBox.cx !== "number") return null;
                  const { cx, cy } = viewBox;
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        dy="-0.4em"
                        className="fill-slate-500 text-[11px]"
                      >
                        Total
                      </tspan>
                      <tspan
                        x={cx}
                        dy="1.35em"
                        className="fill-slate-900 text-sm font-semibold"
                      >
                        {formatValue(total, valueFormat)}
                      </tspan>
                    </text>
                  );
                }}
              />
            )}
          </Pie>
          <Tooltip content={<CustomTooltip valueFormat={valueFormat} />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 12, paddingTop: isPie ? 4 : 8 }}
              formatter={(value, entry) => {
                const amount = entry?.payload?.value ?? 0;
                const share = entry?.payload?.percent;
                return `${value}: ${formatValue(amount, valueFormat)} (${share}%)`;
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      {isPie && (
        <p className="text-center text-xs text-muted">
          Total: {formatValue(total, valueFormat)} ({percentOf(total, total)})
        </p>
      )}
    </div>
  );
}

/** Full pie with on-slice labels — patient / feedback breakdowns. */
export function PieChartPanel(props) {
  return <DonutChart {...props} variant="pie" />;
}
