/** Semantic risk-zone colors (pie + stacked bars). */
export const MHCU_RISK_ZONE_COLORS = {
  Red: "#dc2626",
  Amber: "#d97706",
  Yellow: "#eab308",
  Green: "#059669",
};

export function mhcuRiskZoneSeries(zoneKeys = []) {
  return zoneKeys.map((name) => ({
    key: name,
    name,
    color: MHCU_RISK_ZONE_COLORS[name] ?? "#64748b",
  }));
}

export function mhcuRiskZonePieData(byZone = []) {
  return byZone.map((row) => ({
    ...row,
    color: MHCU_RISK_ZONE_COLORS[row.name] ?? undefined,
  }));
}