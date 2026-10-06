import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCompactCurrency, formatNumber } from "../../../lib/util";

export function TrendLineChart({
  data,
  valueKey = "value",
  xKey = "date",
  height = 320,
  currency = false,
}) {
  const formatter = currency
    ? (v) => formatCompactCurrency(v)
    : (v) => formatNumber(v);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatter} width={72} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => (currency ? formatCompactCurrency(value) : formatNumber(value))}
            labelFormatter={(label) => label}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Line
            type="monotone"
            dataKey={valueKey}
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3, fill: "#2563eb" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
