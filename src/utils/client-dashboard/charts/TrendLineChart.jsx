import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatValue } from "../../../lib/util"
import { CHART_PALETTE } from "../types";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { axisTick, gridStroke, axisLabel, yAxisLabel } from "./chartTheme";

export function TrendLineChart({
  data = [],
  series,
  valueKey = "value",
  xKey = "date",
  height = 320,
  valueFormat = "number",
  currency = false,
  xLabel = "Month",
  yLabel,
}) {
  const format = currency ? "currency" : valueFormat;
  const lines = series || [{ key: valueKey, name: yLabel || "Value", color: CHART_PALETTE[0] }];
  if (!data.length) return <ChartEmpty />;

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 12, bottom: xLabel ? 28 : 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey={xKey} tick={axisTick} interval="preserveStartEnd" label={axisLabel(xLabel)} />
          <YAxis
            tick={axisTick}
            width={76}
            tickFormatter={(value) => formatValue(value, format === "currency" ? "compact-currency" : format)}
            label={yAxisLabel(yLabel)}
          />
          <Tooltip content={<ChartTooltip valueFormat={format} />} />
          {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {lines.map((line, index) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color || CHART_PALETTE[index % CHART_PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
