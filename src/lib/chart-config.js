import { OHC_THEME } from "./ohc-theme";

const tickColor = "#94a3b8";
const gridColor = "#e2e8f0";
const labelColor = "#475569";

export const baseScales = {
  x: {
    ticks: { color: tickColor, font: { size: 11 }, maxRotation: 0 },
    grid: { color: gridColor },
    border: { display: false },
  },
  y: {
    ticks: {
      color: tickColor,
      font: { size: 11 },
      precision: 0,
      stepSize: 1,
    },
    grid: { color: gridColor },
    border: { display: false },
    beginAtZero: true,
  },
};

export function lineChartOptions(yLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      ...baseScales,
      y: {
        ...baseScales.y,
        title: yLabel
          ? { display: true, text: yLabel, color: labelColor, font: { size: 11 } }
          : undefined,
      },
    },
  };
}

export function barChartOptions(horizontal = false, unit = "") {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const value = horizontal ? ctx.parsed.x : ctx.parsed.y;
            return unit ? `${value} ${unit}` : `${value}`;
          },
        },
      },
    },
    scales: horizontal
      ? {
          x: { ...baseScales.x, grid: { color: gridColor } },
          y: {
            ticks: { color: labelColor, font: { size: 11 } },
            grid: { display: false },
            border: { display: false },
          },
        }
      : {
          x: { ...baseScales.x, grid: { display: false } },
          y: baseScales.y,
        },
  };
}

export function doughnutChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };
}

export function gradientBarColors(values) {
  const max = Math.max(...values, 1);
  return values.map((v) => {
    const ratio = v / max;
    const r = Math.round(110 - 105 * ratio);
    const g = Math.round(231 - 81 * ratio);
    const b = Math.round(183 - 78 * ratio);
    return `rgba(${r},${g},${b},0.9)`;
  });
}

export { OHC_THEME };
