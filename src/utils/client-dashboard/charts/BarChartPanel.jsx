import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatValue } from "../../../lib/util";
import { CHART_PALETTE } from "../types";
import { ChartEmpty } from "./ChartEmpty";
import { ChartTooltip } from "./ChartTooltip";
import { axisTick, gridStroke, axisLabel, yAxisLabel } from "./chartTheme";

export function BarChartPanel({
  data = [],
  dataKeys,
  xKey = "label",
  height = 300,
  layout = "vertical",
  stacked = false,
  normalize = false,
  valueFormat = "number",
  xLabel,
  yLabel,
  categoryWidth = 120,
  showShare = true,
}) {
  const keys = dataKeys || [{ key: "value", name: "Value", color: CHART_PALETTE[0] }];
  if (!data.length) return <ChartEmpty />;

  const display = normalize
    ? data.map((row) => {
        const sum = keys.reduce((total, key) => total + (Number(row[key.key]) || 0), 0) || 1;
        const next = { ...row };
        keys.forEach((key) => {
          next[`__${key.key}`] = Number(row[key.key]) || 0;
          next[key.key] = (Number(row[key.key]) || 0) / sum;
        });
        return next;
      })
    : data;

  const valueTick = (value) =>
    normalize ? `${Math.round(value * 100)}%` : formatValue(value, valueFormat === "currency" ? "compact-currency" : valueFormat);

  const bottom = xLabel ? 36 : 8;

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={display}
          layout={layout}
          margin={{
            top: 8,
            right: 16,
            left: layout === "vertical" ? 8 : yLabel ? 16 : 0,
            bottom,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" tick={axisTick} tickFormatter={valueTick} label={axisLabel(xLabel)} />
              <YAxis
                type="category"
                dataKey={xKey}
                width={categoryWidth}
                tick={axisTick}
                tickFormatter={(value) => (String(value).length > 22 ? `${String(value).slice(0, 20)}…` : value)}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={axisTick} interval="preserveStartEnd" label={axisLabel(xLabel)} />
              <YAxis tick={axisTick} width={72} tickFormatter={valueTick} label={yAxisLabel(yLabel)} />
            </>
          )}
          <Tooltip content={<ChartTooltip valueFormat={valueFormat} normalize={normalize} showShare={showShare} />} />
          {(keys.length > 1 || stacked) && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {keys.map((key, index) => (
            <Bar
              key={key.key}
              dataKey={key.key}
              name={key.name}
              fill={key.color || CHART_PALETTE[index % CHART_PALETTE.length]}
              stackId={stacked ? "stack" : undefined}
              radius={stacked ? 0 : layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
