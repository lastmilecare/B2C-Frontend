/**
 * Maps UI tab + tenant to RTK Query endpoint mode.
 * AMP "Disease Analysis" uses the same backend as Honda "Patient Complaints Analysis".
 */
const TAB_MODES = {
  revenue: "revenue",
  cost: "cost",
  "unique-patients": "patientProfile",
  "camp-profile": "campPatientProfile",
  complaints: "patientComplaints",
  footfall: "patientFootfall",
};

export function resolveApiTabMode(tenantSlug, tabId) {
  if (tabId === "disease" && tenantSlug === "amp") {
    return "patientComplaints";
  }
  return TAB_MODES[tabId] ?? null;
}

export function usesPatientComplaintsApi(tenantSlug, tabId) {
  return resolveApiTabMode(tenantSlug, tabId) === "patientComplaints";
}
