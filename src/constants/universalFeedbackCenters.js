/** Fixed feedback module centers — must match backend feedback-center.config.ts IDs */
export const FEEDBACK_CENTERS = [
  { id: 45, name: "Kavach Kalinganagar" },
  { id: 46, name: "Kavach Meramandali" },
  { id: 47, name: "Kavach Rohtak" },
  { id: 50, name: "Kavach Angul" },
  { id: 147, name: "Kavach JSL Jajpur" },
  { id: 165, name: "Kavach Raigarh" },
  { id: 167, name: "Kavach NINL" },
  { id: 168, name: "Kavach Gate" },
  { id: 176, name: "Amp" },
  { id: 177, name: "Hsvk" },
];

export const UNIVERSAL_FEEDBACK_CENTER_IDS = FEEDBACK_CENTERS.map((c) => c.id);

export const UNIVERSAL_FEEDBACK_CENTER_LABELS = Object.fromEntries(
  FEEDBACK_CENTERS.map((c) => [c.id, c.name]),
);

export function getFeedbackCenterName(centerId) {
  return UNIVERSAL_FEEDBACK_CENTER_LABELS[Number(centerId)] || "";
}
