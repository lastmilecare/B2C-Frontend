import { defaultDateRange } from "../../../../utils/client-dashboard";
import { monthSeries, spread, sum } from "../../allocate";
import {
  clip,
  isFull,
  selectDisease,
  selectFeedback,
  selectPatient,
} from "../../select";
import { MHCU_TOTAL_POP, MHCU_VILLAGES } from "./villages";

export function villageShare(filters) {
  if (filters.village === "all" || !filters.village) return 1;
  const row = MHCU_VILLAGES.find((v) => v.name === filters.village);
  return row ? row.population / MHCU_TOTAL_POP : 0;
}

export function selectMhcuOverview(source, filters) {
  const share = villageShare(filters);
  const months = clip(source.visitTrend, filters.dateRange);
  if (!months.length) return { panel: "mhcu-overview", empty: true };

  const full = isFull(source.visitTrend, filters.dateRange) && filters.village === "all";
  const ratio = full ? 1 : months.length / source.visitTrend.length;

  return {
    panel: "mhcu-overview",
    kpis: [
      { label: "Patients screened (unique)", value: Math.round(source.uniqueScreened * share * ratio) },
      { label: "OPD + home visits", value: Math.round(source.totalVisits * share * ratio) },
      { label: "New patients", value: Math.round(source.newPatients * share * ratio) },
      { label: "Repeat patients", value: Math.round(source.repeatPatients * share * ratio) },
      { label: "Villages with visits", value: filters.village === "all" ? source.villagesCovered : 1 },
      { label: "High concern cases", value: Math.round(source.highConcern * share * ratio) },
      { label: "Medicine dispensings", value: Math.round(source.medicineTotal * share * ratio) },
    ],
    visitTrend: months.map((p) => ({
      date: p.label,
      visits: Math.round(p.visits * share),
      newPatients: Math.round((p.newPatients || 0) * share),
    })),
    topVillages: source.topVillages
      .filter((row) => filters.village === "all" || row.name === filters.village)
      .map((row) => ({
        ...row,
        visits: Math.round(row.visits * (filters.village === "all" ? 1 : share)),
      })),
  };
}

export function selectMhcuRisk(source, filters) {
  const share = villageShare(filters);
  const zones = source.byZone.map((row) => ({
    ...row,
    value: Math.round(row.value * share),
  }));
  const tests = source.byTest.map((row) => {
    const next = { test: row.test };
    Object.keys(row).forEach((key) => {
      if (key === "test") return;
      next[key] = Math.round((row[key] || 0) * share);
    });
    return next;
  });
  if (!sum(zones.map((z) => z.value))) return { panel: "mhcu-risk", empty: true };

  return {
    panel: "mhcu-risk",
    kpis: [
      { label: "Patients with abnormal vitals", value: Math.round(source.abnormalPatients * share) },
      { label: "Red zone", value: zones.find((z) => z.name === "Red")?.value ?? 0 },
      { label: "Amber zone", value: zones.find((z) => z.name === "Amber")?.value ?? 0 },
    ],
    byZone: zones,
    byTest: tests,
    zoneKeys: source.zoneKeys,
  };
}

export function selectMhcuVillageScorecard(source, filters) {
  const share = villageShare(filters);
  let rows = source.rows.map((row) => ({
    ...row,
    opd: Math.round(row.opd * share),
    homeVisits: Math.round(row.homeVisits * share),
    referrals: Math.round(row.referrals * share),
    awareness: Math.round(row.awareness * share),
    feedbackScore: row.feedbackScore,
  }));
  if (filters.village !== "all") {
    rows = rows.filter((row) => row.village === filters.village);
  }
  return { panel: "mhcu-village-scorecard", rows };
}

export function selectMhcuTablePanel(source, filters, panel, kpiConfig) {
  const share = villageShare(filters);
  let rows = source.rows.map((row) => {
    const next = { ...row };
    Object.keys(row).forEach((key) => {
      if (typeof row[key] === "number") next[key] = Math.round(row[key] * share);
    });
    return next;
  });
  if (filters.village !== "all") {
    rows = rows.filter((row) => !row.village || row.village === filters.village);
  }
  const kpis = (kpiConfig || []).map((k) => ({
    label: k.label,
    value: typeof source[k.key] === "number" ? Math.round(source[k.key] * share) : source[k.key],
    format: k.format,
  }));
  return { panel, kpis, rows };
}

export function selectMhcuMedicines(source, filters) {
  const share = villageShare(filters);
  const months = clip(source.trend, filters.dateRange);
  return {
    panel: "mhcu-medicines",
    kpis: [
      { label: "Prescriptions dispensed", value: Math.round(source.dispensed * share) },
      { label: "Short supply events", value: Math.round(source.shortSupply * share) },
    ],
    trend: months.map((p) => ({ date: p.label, value: Math.round(p.value * share) })),
    topMedicines: source.topMedicines.map((m) => ({
      ...m,
      value: Math.round(m.value * share),
    })),
  };
}

export function selectMhcuInventory(source, filters) {
  const share = villageShare(filters);
  return {
    panel: "mhcu-inventory",
    kpis: [
      { label: "Below minimum stock", value: source.belowMin },
      { label: "Expiring in 30 days", value: source.expire30 },
      { label: "Expiring in 60 days", value: source.expire60 },
      { label: "Expiring in 90 days", value: source.expire90 },
    ],
    rows: source.rows,
  };
}

export function selectMhcuHomeCare(source, filters) {
  const share = villageShare(filters);
  const months = clip(source.trend, filters.dateRange);
  return {
    panel: "mhcu-home-care",
    kpis: [
      { label: "Home visits completed", value: Math.round(source.visitsDone * share) },
      { label: "Patients on register", value: Math.round(source.onRegister * share) },
      { label: "Irregular adherence", value: Math.round(source.irregular * share) },
    ],
    trend: months.map((p) => ({ date: p.label, value: Math.round(p.value * share) })),
    byVillage: source.byVillage
      .filter((row) => filters.village === "all" || row.name === filters.village)
      .map((row) => ({ ...row, value: Math.round(row.value * share) })),
  };
}

export function selectMhcuSchemes(source, filters) {
  const share = villageShare(filters);
  return {
    panel: "mhcu-schemes",
    kpis: [{ label: "Beneficiaries tracked", value: Math.round(source.total * share) }],
    slices: source.slices.map((s) => ({ ...s, value: Math.round(s.value * share) })),
    statusBars: source.statusBars.map((row) => ({
      label: row.label,
      awareness: Math.round(row.awareness * share),
      registered: Math.round(row.registered * share),
      cardReceived: Math.round(row.cardReceived * share),
    })),
  };
}

export function selectMhcuAwareness(source, filters) {
  const share = villageShare(filters);
  let rows = source.rows.map((row) => ({
    ...row,
    participantsMale: Math.round(row.participantsMale * share),
    participantsFemale: Math.round(row.participantsFemale * share),
  }));
  if (filters.village !== "all") rows = rows.filter((r) => r.village === filters.village);
  return {
    panel: "mhcu-awareness",
    kpis: [
      { label: "Sessions held", value: Math.round(source.sessions * share) },
      { label: "Total participants", value: Math.round(source.participants * share) },
    ],
    rows,
  };
}

export function selectMhcuConcern(source, filters) {
  const share = villageShare(filters);
  let rows = source.rows;
  if (filters.village !== "all") rows = rows.filter((r) => r.village === filters.village);
  return {
    panel: "mhcu-concern",
    kpis: [
      { label: "High concern", value: Math.round(source.high * share) },
      { label: "Moderate concern", value: Math.round(source.moderate * share) },
    ],
    rows: rows.slice(0, Math.max(3, Math.round(rows.length * share))),
  };
}

export { selectPatient, selectDisease, selectFeedback, defaultDateRange, monthSeries };