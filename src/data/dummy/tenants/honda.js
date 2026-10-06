import { defaultDateRange } from "../../../utils/client-dashboard/FilterBar";
import { monthSeries, spread, sum } from "../allocate";
import {
  selectComplaints,
  selectCost,
  selectFeedback,
  selectPatient,
  selectRevenue,
} from "../select";

const all = { value: "all", label: "All" };

const ages = ["0-17", "18-29", "30-44", "45-60", "60+"];
const ageWeights = [18, 20, 30, 20, 12];

function complaintsByAge(pairs) {
  const parts = Object.fromEntries(pairs.map(([name, total]) => [name, spread(total, ageWeights)]));
  return ages.map((label, index) => {
    const row = { label };
    pairs.forEach(([name]) => {
      row[name] = parts[name][index];
    });
    return row;
  });
}

const patientProfile = {
  uniqueHeadline: 5458,
  base: 5458,
  returning: 5192,
  totalPatients: 10650,
  byGenderCategory: {
    Male: { APL: 2399, BPL: 710 },
    Female: { APL: 1535, BPL: 814 },
  },
  age: [
    { name: "0-17", value: 1129 },
    { name: "18-29", value: 1294 },
    { name: "30-44", value: 1659 },
    { name: "45-60", value: 953 },
    { name: "60+", value: 423 },
  ],
  ageByGender: {
    Male: [
      { name: "0-17", value: 634 },
      { name: "18-29", value: 740 },
      { name: "30-44", value: 952 },
      { name: "45-60", value: 602 },
      { name: "60+", value: 181 },
    ],
    Female: [
      { name: "0-17", value: 495 },
      { name: "18-29", value: 554 },
      { name: "30-44", value: 707 },
      { name: "45-60", value: 351 },
      { name: "60+", value: 242 },
    ],
  },
  segmentation: {
    columns: ["Sex", "0-17", "18-29", "30-44", "45-60", "60+", "Total"],
    rows: [
      { Sex: "Female", block: "Female", kind: "group", "0-17": "9.07%", "18-29": "10.15%", "30-44": "12.95%", "45-60": "6.43%", "60+": "4.43%", Total: "43.04%" },
      { Sex: "APL", block: "Female", kind: "apl", "0-17": "6.43%", "18-29": "7.05%", "30-44": "8.23%", "45-60": "3.85%", "60+": "2.57%", Total: "28.12%" },
      { Sex: "BPL", block: "Female", kind: "bpl", "0-17": "2.64%", "18-29": "3.10%", "30-44": "4.73%", "45-60": "2.58%", "60+": "1.87%", Total: "14.91%" },
      { Sex: "Male", block: "Male", kind: "group", "0-17": "11.62%", "18-29": "13.56%", "30-44": "17.44%", "45-60": "11.03%", "60+": "3.32%", Total: "56.96%" },
      { Sex: "APL", block: "Male", kind: "apl", "0-17": "8.79%", "18-29": "9.91%", "30-44": "14.16%", "45-60": "8.61%", "60+": "2.47%", Total: "43.95%" },
      { Sex: "BPL", block: "Male", kind: "bpl", "0-17": "2.82%", "18-29": "3.65%", "30-44": "3.28%", "45-60": "2.42%", "60+": "0.84%", Total: "13.01%" },
      { Sex: "Total", block: "Total", kind: "total", "0-17": "20.69%", "18-29": "23.71%", "30-44": "30.40%", "45-60": "17.46%", "60+": "7.75%", Total: "100.00%" },
    ],
  },
  geo: [
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
  ],
};

const campProfile = {
  uniqueHeadline: 3000,
  base: 3009,
  totalPatients: 3009,
  extras: [
    { label: "Total Camps", value: 44, fixed: true },
    { label: "Medicine Dispensing Visits — Camp", value: 1849 },
  ],
  byGenderCategory: {
    Female: { APL: 1246, BPL: 340 },
    Male: { APL: 1118, BPL: 305 },
  },
  age: [
    { name: "0-17", value: 825 },
    { name: "18-29", value: 564 },
    { name: "30-44", value: 821 },
    { name: "45-60", value: 505 },
    { name: "60+", value: 294 },
  ],
  ageByGender: {
    Male: [
      { name: "0-17", value: 462 },
      { name: "18-29", value: 221 },
      { name: "30-44", value: 349 },
      { name: "45-60", value: 262 },
      { name: "60+", value: 129 },
    ],
    Female: [
      { name: "0-17", value: 363 },
      { name: "18-29", value: 343 },
      { name: "30-44", value: 472 },
      { name: "45-60", value: 243 },
      { name: "60+", value: 165 },
    ],
  },
  segmentation: {
    columns: ["Sex", "0-17", "18-29", "30-44", "45-60", "60+", "Total"],
    rows: [
      { Sex: "Female", block: "Female", kind: "group", "0-17": "12.06%", "18-29": "11.40%", "30-44": "15.69%", "45-60": "8.08%", "60+": "5.48%", Total: "52.71%" },
      { Sex: "Male", block: "Male", kind: "group", "0-17": "15.35%", "18-29": "7.34%", "30-44": "11.60%", "45-60": "8.71%", "60+": "4.29%", Total: "47.29%" },
      { Sex: "Total", block: "Total", kind: "total", "0-17": "27.42%", "18-29": "18.74%", "30-44": "27.28%", "45-60": "16.78%", "60+": "9.77%", Total: "100.00%" },
    ],
  },
  geo: [
    { area: "KHANDSA", patients: 810 },
    { area: "NAHARPUR RUPA", patients: 366 },
    { area: "NURSINGPUR", patients: 272 },
    { area: "KADIPUR", patients: 263 },
    { area: "SHAKTI PARK", patients: 251 },
    { area: "MOHMADPUR", patients: 182 },
    { area: "BEGUMPUR KHATOLA", patients: 160 },
    { area: "LAL KUAN, DELHI", patients: 84 },
    { area: "KASHMERE GATE", patients: 81 },
    { area: "KHERKI DHOLA", patients: 78 },
  ],
};

const complaintNames = ["Fever/Cold/Cough", "Weakness", "Body Pain", "Allergy", "Hypertension"];
const complaintPairs = [
  ["Fever/Cold/Cough", 1645],
  ["Weakness", 1404],
  ["Body Pain", 1264],
  ["Allergy", 330],
  ["Hypertension", 267],
];
const complaintAreas = [
  { area: "KHANDSA", patients: 1978 },
  { area: "NARSINGPUR", patients: 454 },
  { area: "NAHARPUR RUPA", patients: 360 },
  { area: "MOHMADPUR", patients: 329 },
  { area: "SHAKTI PARK", patients: 316 },
];

const campComplaintNames = ["Pain", "Weakness/Fatigue", "Fever & Infection", "Allergy/Skin", "Cold Cough"];
const campComplaintPairs = [
  ["Pain", 812],
  ["Weakness/Fatigue", 604],
  ["Fever & Infection", 449],
  ["Allergy/Skin", 170],
  ["Cold Cough", 98],
];
const campComplaintAreas = [
  { area: "KHANDSA", patients: 734 },
  { area: "NAHARPUR RUPA", patients: 346 },
  { area: "SHAKTI PARK", patients: 236 },
  { area: "NARSINGPUR", patients: 229 },
  { area: "KADIPUR", patients: 220 },
];

const feedbackSlices = [
  { name: "Patient liked service", value: 5779 },
  { name: "Not Reachable", value: 2536 },
  { name: "Invalid number", value: 626 },
  { name: "Not Satisfied", value: 230 },
  { name: "Other", value: 70 },
  { name: "Under medication", value: 38 },
];

const revenueServices = [
  { name: "Pharmacy", value: 231636 },
  { name: "Random Blood Sugar Test", value: 4120 },
  { name: "Hemoglobin Test", value: 1190 },
  { name: "ECG", value: 700 },
  { name: "Consultation", value: 0 },
  { name: "Suture/First Aid/Procedure", value: 0 },
];
const revenueKnown = [5583, 8025, 11611, 14689, 10712, 13769, 13987, 21554, 16930, 22451, 23475];
const revenueMonths = monthSeries("2025-06-01", [
  ...revenueKnown,
  ...spread(237646 - sum(revenueKnown), Array(5).fill(1)),
]);

const costCategories = [
  { name: "Staff Salary", value: 4855000 },
  { name: "Medicine and Consumables", value: 1075800 },
  { name: "Camp Cost", value: 848000 },
  { name: "Management Cost", value: 828000 },
  { name: "CAPEX", value: 691200 },
  { name: "Miscellaneous", value: 508770 },
  { name: "Compliances and Licensing", value: 180000 },
  { name: "Admin Consumables", value: 128706 },
];
const costKnown = [118047, 1166301, 567024, 536735, 547730, 501134, 479338, 503737, 520230, 522138];
const costValues = [...costKnown, ...spread(9115476 - sum(costKnown), Array(7).fill(1))];
const costMonths = monthSeries("2025-04-01", costValues);

const quarterLabels = ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"];
const quarterWeights = [3, 3, 3, 3, 3, 2].map((months, index) =>
  sum(costValues.slice(index === 0 ? 0 : [0, 3, 6, 9, 12, 15][index], [3, 6, 9, 12, 15, 17][index])),
);
const quarterKeys = costCategories.map((item) => item.name);
const quarterly = quarterLabels.map((label, index) => {
  const row = { label };
  let used = 0;
  quarterKeys.slice(0, -1).forEach((key) => {
    const category = costCategories.find((item) => item.name === key);
    const value = spread(category.value, quarterWeights)[index];
    row[key] = value;
    used += value;
  });
  const quarterTotal = quarterWeights[index];
  row[quarterKeys[quarterKeys.length - 1]] = Math.max(0, quarterTotal - used);
  return row;
});

const fixedKeys = costCategories.map((item) => item.name);
const fixedVariable = [
  {
    label: "Fixed Cost",
    "Staff Salary": 4855000,
    "Management Cost": 828000,
    CAPEX: 691200,
  },
  {
    label: "Variable Cost",
    "Medicine and Consumables": 1075800,
    "Camp Cost": 848000,
    Miscellaneous: 508770,
    "Compliances and Licensing": 180000,
    "Admin Consumables": 128706,
  },
];

const genderOptions = [all, { value: "male", label: "Male" }, { value: "female", label: "Female" }];
const patientTypeOptions = [all, { value: "apl", label: "APL" }, { value: "bpl", label: "BPL" }];

export const hondaTabs = {
  "unique-patients": {
    initialFilters: () => ({ gender: "all", patientType: "all" }),
    filters: [
      { id: "gender", type: "select", label: "Gender", options: genderOptions },
      { id: "patientType", type: "select", label: "Patient type", options: patientTypeOptions },
    ],
    select: (filters) => selectPatient(patientProfile, filters, "patients"),
  },
  "camp-profile": {
    initialFilters: () => ({ gender: "all", patientType: "all" }),
    filters: [
      { id: "gender", type: "select", label: "Gender", options: genderOptions },
      { id: "patientType", type: "select", label: "Patient type", options: patientTypeOptions },
    ],
    select: (filters) => selectPatient(campProfile, filters, "patients"),
  },
  complaints: {
    initialFilters: () => ({ complaint: "all", area: "all" }),
    filters: [
      {
        id: "complaint",
        type: "select",
        label: "Complaints",
        options: [all, ...complaintNames.map((name) => ({ value: name, label: name }))],
      },
      {
        id: "area",
        type: "select",
        label: "Geographic area",
        options: [all, ...complaintAreas.map((area) => ({ value: area.area, label: area.area }))],
      },
    ],
    select: (filters) => selectComplaints({
      names: complaintNames,
      complaints: complaintPairs.map(([label, value]) => ({ label, value })),
      byAge: complaintsByAge(complaintPairs),
      areas: complaintAreas,
    }, filters, "complaints"),
  },
  "camp-complaints": {
    initialFilters: () => ({ complaint: "all", gender: "all", area: "all" }),
    filters: [
      {
        id: "complaint",
        type: "select",
        label: "Complaints",
        options: [all, ...campComplaintNames.map((name) => ({ value: name, label: name }))],
      },
      { id: "gender", type: "select", label: "Gender", options: genderOptions },
      {
        id: "area",
        type: "select",
        label: "Geographic area",
        options: [all, ...campComplaintAreas.map((area) => ({ value: area.area, label: area.area }))],
      },
    ],
    select: (filters) => selectComplaints({
      names: campComplaintNames,
      totalPatients: 3009,
      complaints: campComplaintPairs.map(([label, value]) => ({ label, value })),
      byAge: complaintsByAge(campComplaintPairs),
      areas: campComplaintAreas,
      gender: [
        { name: "Female", value: 1586 },
        { name: "Male", value: 1423 },
      ],
      revenueByComplaint: [
        { label: "Pain", value: 10137 },
        { label: "Weakness/Fatigue", value: 8379 },
        { label: "Fever & Infection", value: 4642 },
        { label: "General Consultation", value: 3140 },
        { label: "Allergy/Skin", value: 2323 },
        { label: "Other", value: 9513 },
      ],
    }, filters, "complaints"),
  },
  feedback: {
    initialFilters: () => ({ feedback: "all" }),
    filters: [
      {
        id: "feedback",
        type: "select",
        label: "Feedback category",
        options: [all, ...feedbackSlices.map((item) => ({ value: item.name, label: item.name }))],
      },
    ],
    select: (filters) => selectFeedback({
      totalPatients: 9279,
      respondedPct: 65.2,
      slices: feedbackSlices,
    }, filters),
  },
  revenue: {
    initialFilters: () => ({
      dateRange: defaultDateRange("2025-06-01", "2026-09-30"),
      service: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Date" },
      {
        id: "service",
        type: "select",
        label: "Service category",
        options: [all, ...revenueServices.map((service) => ({ value: service.name, label: service.name }))],
      },
    ],
    select: (filters) => {
      const view = selectRevenue({
        total: 237646,
        services: revenueServices,
        months: revenueMonths,
        yearly: [
          { serviceCategory: "Pharmacy", y2024: 0, y2025: 140000, y2026: 91636, total: 231636 },
          { serviceCategory: "Random Blood Sugar Test", y2024: 0, y2025: 2200, y2026: 1920, total: 4120 },
          { serviceCategory: "Hemoglobin Test", y2024: 0, y2025: 700, y2026: 490, total: 1190 },
          { serviceCategory: "ECG", y2024: 0, y2025: 400, y2026: 300, total: 700 },
          { serviceCategory: "Consultation", y2024: 0, y2025: 0, y2026: 0, total: 0 },
          { serviceCategory: "Suture/First Aid/Procedure", y2024: 0, y2025: 0, y2026: 0, total: 0 },
        ],
        utilization: [
          { service: "CONSULTATION", patients: 5706 },
          { service: "VALID CONSULTATION", patients: 5239 },
          { service: "RBS", patients: 641 },
          { service: "Hb", patients: 217 },
          { service: "ECG", patients: 23 },
          { service: "Hemoglobin Test (Digital Method)", patients: 2 },
          { service: "Blood Glucose Random (Digital Method)", patients: 1 },
          { service: "FIRST AID LEVEL 1 (MINOR)", patients: 1 },
        ],
        patientType: [
          { label: "OPD", APL: 5910, BPL: 100 },
          { label: "Pharmacy", APL: 228654, BPL: 2982 },
        ],
      }, filters);
      if (filters.service !== "all") {
        view.utilization = view.utilization?.filter((row) => {
          const map = {
            Pharmacy: ["CONSULTATION"],
            "Random Blood Sugar Test": ["RBS", "Blood Glucose Random (Digital Method)"],
            "Hemoglobin Test": ["Hb", "Hemoglobin Test (Digital Method)"],
            ECG: ["ECG"],
            Consultation: ["CONSULTATION", "VALID CONSULTATION"],
            "Suture/First Aid/Procedure": ["FIRST AID LEVEL 1 (MINOR)"],
          };
          return (map[filters.service] || []).includes(row.service);
        });
      }
      return view;
    },
  },
  cost: {
    initialFilters: () => ({
      dateRange: defaultDateRange("2025-04-01", "2026-08-31"),
      category: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Month" },
      {
        id: "category",
        type: "select",
        label: "Categories",
        options: [all, ...costCategories.map((item) => ({ value: item.name, label: item.name }))],
      },
    ],
    select: (filters) => selectCost({
      total: 9115476,
      categories: costCategories,
      months: costMonths,
      fixedVariable,
      fixedKeys,
      quarterly,
      quarterKeys,
    }, filters),
  },
};
