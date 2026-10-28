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
      { id: "unique-patients", label: "Unique Patient Profile" },
      { id: "third-party", label: "3rd Party Analysis" },
      { id: "third-party-category", label: "3rd Party Category" },
      { id: "footfall", label: "Patient Footfall" },
      { id: "complaints", label: "Patient Complaints Analysis" },
    ],
  },
};
