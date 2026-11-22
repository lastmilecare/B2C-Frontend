export const TENANTS = {
  amp: {
    id: "amp",
    title: "AMP Dashboard",
    subtitle:
      "Revenue, cost, third-party performance, patients, footfall and disease",
    badge: {
      label: "AMP · v5.0",
      className: "bg-emerald-100 text-emerald-800",
    },
    tabs: [
      { id: "unique-patients", label: "Unique Patient Profile" },
      { id: "camp-profile", label: "Camp Patients Profile" },
      { id: "disease", label: "Patient Complaints Analysis" },
      { id: "camp-complaints", label: "Camp Patients Complaint Analysis" },
      { id: "footfall", label: "Patient Footfall" },
      { id: "feedback", label: "Patient Feedback" },
      { id: "revenue", label: "Revenue" },
      { id: "cost", label: "Cost" },
    ],
  },
  honda: {
    id: "honda",
    title: "Honda Dashboard",
    subtitle: "Patient profile, camps, complaints, feedback, revenue and cost",
    badge: { label: "Honda · v5.0", className: "bg-red-100 text-red-800" },
    tabs: [
      { id: "revenue", label: "Revenue" },
      { id: "cost", label: "Cost" },
      { id: "third-party", label: "3rd Party Analysis" },
      { id: "third-party-category", label: "3rd Party Category" },
      { id: "unique-patients", label: "Unique Patient Profile" },
      { id: "footfall", label: "Patient Footfall" },
      { id: "complaints", label: "Patient Complaints Analysis" },
    ],
  },
  "mhcu-adani": {
    id: "mhcu-adani",
    title: "MHCU Adani · Anuppur",
    subtitle:
      "16-village mobile health unit — screening, vitals, disease, medicines & community reports",
    badge: { label: "MHCU Adani", className: "bg-amber-100 text-amber-900" },
    tabs: [
      { id: "overview", label: "Program overview" },
      { id: "patients", label: "Patients & screening" },
      { id: "risk-zones", label: "Risk zones & vitals" },
      { id: "disease", label: "Disease & chronic" },
      // { id: "medicines", label: "Medicine consumption" },
      // { id: "inventory", label: "Stock & alerts" },
      { id: "home-care", label: "Home care" },
      // { id: "referrals", label: "Referrals" },
      // { id: "schemes", label: "Govt schemes" },
      // { id: "awareness", label: "Awareness" },
      { id: "village-scorecard", label: "Village scorecard" },
      { id: "feedback", label: "Patient feedback" },
      { id: "concern", label: "Concern cases" },
    ],
  },
};
