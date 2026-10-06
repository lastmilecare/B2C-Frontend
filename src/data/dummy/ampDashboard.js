/** AMP Dashboard 5.0 — patient & camp analytics (dummy) */

export const ampOverview = {
  uniquePatients: 5458,
  totalFootfall: 10650,
  returningPatients: 5192,
  totalCamps: 44,
  campVisits: 1849,
  dateRange: { start: "2025-06-24", end: "2026-10-01" },
};

export const ampGenderSplit = [
  { name: "Male", value: 3109, percent: 56.96 },
  { name: "Female", value: 2349, percent: 43.04 },
];

export const ampCategorySplit = [
  { name: "APL", value: 3934, percent: 72.08 },
  { name: "BPL", value: 1524, percent: 27.92 },
];

export const ampAgeGroups = [
  { name: "0-17", value: 1129, percent: 20.69 },
  { name: "18-29", value: 1294, percent: 23.71 },
  { name: "30-44", value: 1659, percent: 30.4 },
  { name: "45-60", value: 953, percent: 17.46 },
  { name: "60+", value: 423, percent: 7.75 },
];

export const ampMaleByAge = [
  { name: "0-17", value: 634 },
  { name: "18-29", value: 740 },
  { name: "30-44", value: 952 },
  { name: "45-60", value: 602 },
  { name: "60+", value: 181 },
];

export const ampFemaleByAge = [
  { name: "0-17", value: 495 },
  { name: "18-29", value: 554 },
  { name: "30-44", value: 707 },
  { name: "45-60", value: 351 },
  { name: "60+", value: 242 },
];

export const ampSegmentation = {
  columns: ["Sex", "0-17", "18-29", "30-44", "45-60", "60+", "Total"],
  rows: [
    {
      Sex: "Female",
      "0-17": "9.07%",
      "18-29": "10.15%",
      "30-44": "12.95%",
      "45-60": "6.43%",
      "60+": "4.43%",
      Total: "43.04%",
    },
    {
      Sex: "APL",
      "0-17": "6.43%",
      "18-29": "7.05%",
      "30-44": "8.23%",
      "45-60": "3.85%",
      "60+": "2.57%",
      Total: "28.12%",
    },
    {
      Sex: "BPL",
      "0-17": "2.64%",
      "18-29": "3.10%",
      "30-44": "4.73%",
      "45-60": "2.58%",
      "60+": "1.87%",
      Total: "14.91%",
    },
    {
      Sex: "Male",
      "0-17": "11.62%",
      "18-29": "13.56%",
      "30-44": "17.44%",
      "45-60": "11.03%",
      "60+": "3.32%",
      Total: "56.96%",
    },
    {
      Sex: "APL",
      "0-17": "8.79%",
      "18-29": "9.91%",
      "30-44": "14.16%",
      "45-60": "8.61%",
      "60+": "2.47%",
      Total: "43.95%",
    },
    {
      Sex: "BPL",
      "0-17": "2.82%",
      "18-29": "3.65%",
      "30-44": "3.28%",
      "45-60": "2.42%",
      "60+": "0.84%",
      Total: "13.01%",
    },
    {
      Sex: "Total",
      "0-17": "20.69%",
      "18-29": "23.71%",
      "30-44": "30.40%",
      "45-60": "17.46%",
      "60+": "7.75%",
      Total: "100.00%",
    },
  ],
};

export const ampGeoTop10 = [
  { area: "KHANDSA", patients: 1813 },
  { area: "NARSINGPUR", patients: 483 },
  { area: "MOHMADPUR", patients: 480 },
  { area: "NAHARPUR RUPA", patients: 389 },
  { area: "SHAKTI PARK", patients: 329 },
  { area: "KADIPUR", patients: 242 },
  { area: "BEGUMPUR KHATOLA", patients: 188 },
  { area: "DELHI", patients: 91 },
  { area: "KHERKI DHOLA", patients: 91 },
  { area: "KHERKI DAULA", patients: 77 },
];

export const ampComplaints = [
  { label: "Fever/Cold/Cough", value: 1645 },
  { label: "Weakness", value: 1404 },
  { label: "Body Pain", value: 1264 },
  { label: "Allergy", value: 330 },
  { label: "Hypertension", value: 267 },
];

export const ampFilterOptions = {
  gender: [
    { value: "all", label: "All" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ],
  residency: [
    { value: "all", label: "All" },
    { value: "resident", label: "Resident" },
    { value: "non-resident", label: "Non-resident" },
  ],
  patientType: [
    { value: "all", label: "All" },
    { value: "apl", label: "APL" },
    { value: "bpl", label: "BPL" },
  ],
};
