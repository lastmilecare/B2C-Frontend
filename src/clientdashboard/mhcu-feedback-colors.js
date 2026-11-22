/** Semantic colours for survey answers (Yes/No/scale). */
export const MHCU_FEEDBACK_ANSWER_COLORS = {
  Yes: "#059669",
  No: "#dc2626",
  Good: "#059669",
  Moderate: "#d97706",
  "Not Good": "#dc2626",
  Other: "#64748b",
};

export function feedbackAnswerColor(name) {
  return MHCU_FEEDBACK_ANSWER_COLORS[name] ?? "#2563eb";
}