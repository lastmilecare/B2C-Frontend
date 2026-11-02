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
  "third-party": "thirdParty",
  "third-party-category": "thirdPartyCategory",
};

export function resolveApiTabMode(tenantSlug, tabId) {
  if (tabId === "disease" && tenantSlug === "amp") {
    return "patientComplaints";
  }
  if (tabId === "feedback" && tenantSlug === "amp") {
    return "patientFeedback";
  }
  return TAB_MODES[tabId] ?? null;
}

export function usesPatientComplaintsApi(tenantSlug, tabId) {
  return resolveApiTabMode(tenantSlug, tabId) === "patientComplaints";
}
