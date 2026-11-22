import dayjs from "dayjs";
import { defaultDateRange } from "../utils/client-dashboard/FilterBar";
import { MHCU_VILLAGE_NAMES } from "../data/dummy/tenants/mhcu-adani/villages";

/**
 * Standard MHCU filter bar — add per tab when that tab’s API is wired.
 * Order: Date → Village → Category (APL/BPL) → Gender.
 */
const all = { value: "all", label: "All" };
export const MHCU_DEFAULT_DATE_RANGE = defaultDateRange("2026-01-01", "2026-11-30");
export const mhcuVillageOptions = [
  { value: "all", label: "All villages" },
  ...MHCU_VILLAGE_NAMES.map((name) => ({ value: name, label: name })),
];
export const mhcuPatientTypeOptions = [
  { value: "all", label: "All categories" },
  { value: "apl", label: "APL" },
  { value: "bpl", label: "BPL" },
];
export const mhcuGenderOptions = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
/** Filter field defs — pass `required: true` on every standard control. */
export function mhcuStandardFilters() {
  return [
    { id: "dateRange", type: "dateRange", label: "Date", required: true },
    {
      id: "village",
      type: "select",
      label: "Village",
      options: mhcuVillageOptions,
      required: true,
    },
    {
      id: "patientType",
      type: "select",
      label: "Category",
      options: mhcuPatientTypeOptions,
      required: true,
    },
    {
      id: "gender",
      type: "select",
      label: "Gender",
      options: mhcuGenderOptions,
      required: true,
    },
  ];
}
export function mhcuStandardInitialFilters() {
  return {
    dateRange: MHCU_DEFAULT_DATE_RANGE,
    village: "all",
    patientType: "all",
    gender: "all",
  };
}
/** API tabs: require a complete date range before calling the backend. */
export function mhcuApiFiltersReady(filters) {
  const range = filters?.dateRange;
  if (!range?.[0] || !range?.[1]) return false;
  const village = filters.village ?? "all";
  const patientType = filters.patientType ?? "all";
  const gender = filters.gender ?? "all";
  return (
    village !== "" &&
    patientType !== "" &&
    gender !== "" &&
    dayjs(range[0]).isValid() &&
    dayjs(range[1]).isValid()
  );
}
export function mhcuStandardQueryParams(filters, tabId) {
  const range = filters.dateRange;
  const base = {
    village: filters.village ?? "all",
    patientType: filters.patientType ?? "all",
    gender: filters.gender ?? "all",
    from: range?.[0] ? dayjs(range[0]).format("YYYY-MM-DD") : undefined,
    to: range?.[1] ? dayjs(range[1]).format("YYYY-MM-DD") : undefined,
  };
  if (tabId === "disease") {
    return {
      ...base,
      diagnosis: filters.complaint ?? "all",
    };
  }
  if (tabId === "concern") {
    return {
      ...base,
      concernLevel: filters.concernLevel ?? "all",
    };
  }
  return base;
}
/** Standard bar plus optional diagnosis filter (populated from API). */
export function mhcuDiseaseFilters() {
  return [
    ...mhcuStandardFilters(),
    {
      id: "complaint",
      type: "select",
      label: "Diagnosis",
      options: [{ value: "all", label: "All diagnoses" }],
    },
  ];
}
export function mhcuDiseaseInitialFilters() {
  return { ...mhcuStandardInitialFilters(), complaint: "all" };
}
export const mhcuConcernLevelOptions = [
  { value: "all", label: "High + moderate" },
  { value: "high", label: "High only" },
  { value: "moderate", label: "Moderate only" },
  { value: "normal", label: "Normal only" },
];
export function mhcuConcernFilters() {
  return [
    ...mhcuStandardFilters(),
    {
      id: "concernLevel",
      type: "select",
      label: "Concern level",
      options: mhcuConcernLevelOptions,
      required: true,
    },
  ];
}
export function mhcuConcernInitialFilters() {
  return { ...mhcuStandardInitialFilters(), concernLevel: "all" };
}
