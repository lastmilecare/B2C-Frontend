export const axisTick = { fontSize: 11, fill: "#64748b" };
export const gridStroke = "#e2e8f0";
export const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 13,
};

export function axisLabel(value) {
  if (!value) return undefined;
  return {
    value,
    position: "insideBottom",
    offset: -2,
    style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
  };
}

export function yAxisLabel(value) {
  if (!value) return undefined;
  return {
    value,
    angle: -90,
    position: "insideLeft",
    style: { fill: "#64748b", fontSize: 12, fontWeight: 500 },
  };
}
