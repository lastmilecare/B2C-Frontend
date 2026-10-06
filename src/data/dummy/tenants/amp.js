import { defaultDateRange } from "../../../utils/client-dashboard/FilterBar";
import { monthSeries, spread, sum } from "../allocate";
import {
  selectCost,
  selectDisease,
  selectFootfall,
  selectPatient,
  selectRevenue,
  selectThirdParty,
  selectThirdPartyCategory,
} from "../select";

const all = { value: "all", label: "All" };

const revenueServices = [
  { name: "Pharmacy", value: 7092347 },
  { name: "Suture/First Aid/Procedure", value: 3961169 },
  { name: "Diagnostics", value: 2751727 },
  { name: "Spectacle", value: 1016207 },
  { name: "X Ray", value: 696136 },
  { name: "Consultation", value: 372188 },
  { name: "Specialist Consultation", value: 364691 },
  { name: "B2B", value: 148872 },
  { name: "Satellite Center", value: 18048 },
  { name: "Camp", value: 0 },
];

const revenueKnown = [
  74980, 521000, 753340, 216630, 805330, 510770, 1396580, 552690, 469380, 466240,
  704580, 763140, 411250, 474800, 137890, 946170, 235370, 460000,
];
const revenueMonths = monthSeries("2024-07-01", [
  ...revenueKnown,
  ...spread(16421385 - sum(revenueKnown), Array(9).fill(1)),
]);

const revenueYearly = [
  { serviceCategory: "Pharmacy", y2024: 1089112, y2025: 2921469, y2026: 3081766, total: 7092347 },
  { serviceCategory: "Suture/First Aid/Procedure", y2024: 10575, y2025: 1428152, y2026: 2522442, total: 3961169 },
  { serviceCategory: "Diagnostics", y2024: 453234, y2025: 1165473, y2026: 1133020, total: 2751727 },
  { serviceCategory: "Spectacle", y2024: 159304, y2025: 450480, y2026: 406423, total: 1016207 },
  { serviceCategory: "X Ray", y2024: 45500, y2025: 294986, y2026: 355650, total: 696136 },
  { serviceCategory: "Consultation", y2024: 73680, y2025: 107678, y2026: 190830, total: 372188 },
  { serviceCategory: "Specialist Consultation", y2024: 38965, y2025: 91326, y2026: 234400, total: 364691 },
  { serviceCategory: "B2B", y2024: 0, y2025: 100848, y2026: 48024, total: 148872 },
  { serviceCategory: "Satellite Center", y2024: 11114, y2025: 6934, y2026: 0, total: 18048 },
  { serviceCategory: "Camp", y2024: 0, y2025: 0, y2026: 0, total: 0 },
];

const costCategories = [
  { name: "Salaries", value: 15652000 },
  { name: "Management Exp", value: 5400000 },
  { name: "Medicines", value: 4352000 },
  { name: "Tech Stack", value: 2315000 },
  { name: "Diagnostics", value: 1376000 },
  { name: "Dentist", value: 1340000 },
  { name: "Compliance & Certification", value: 688000 },
  { name: "Consumables HSVK", value: 2200000 },
  { name: "Misc", value: 2242166 },
];

const costKnown = [
  696000, 1587000, 1769000, 1417000, 1201000, 1552000, 981000, 1257000, 1224000, 1551000,
  1164000, 1418000, 1282000, 1293000, 1343000, 1422000, 1264000, 1241000, 1307000, 1300000,
  1457000, 1201000, 1301000, 1360000,
];
const costMonths = monthSeries("2024-04-01", [
  ...costKnown,
  ...spread(35565166 - sum(costKnown), [1, 1, 1]),
]);

const salaries = [
  { label: "Doctors", value: 6061000 },
  { label: "Management", value: 3609000 },
  { label: "Nursing", value: 1948000 },
  { label: "Pharmacist", value: 989000 },
  { label: "Optometrist", value: 584000 },
  { label: "X-Ray Tech", value: 516000 },
  { label: "Mobilizer", value: 478000 },
  { label: "Branding", value: 338000 },
  { label: "Housekeeping", value: 331000 },
  { label: "Reception", value: 294000 },
  { label: "GDA Staff", value: 158000 },
  { label: "MIS", value: 109000 },
  { label: "Customer Care", value: 86000 },
  { label: "Dentist", value: 61000 },
  { label: "Data Entry", value: 44000 },
  { label: "Marketing", value: 30000 },
  { label: "Co-Ordinator", value: 9000 },
  { label: "Dental Assistant", value: 4000 },
  { label: "Locum", value: 3000 },
];

const thirdPartyCategories = [
  { name: "Dentist", revenue: 1709056, cost: 1162329 },
  { name: "Diagnostics", revenue: 3076301, cost: 1964833 },
  { name: "Medicines", revenue: 5127169, cost: 4001912 },
  { name: "Physiotherapist", revenue: 911497, cost: 643790 },
  { name: "Specs Vendor", revenue: 569685, cost: 436379 },
];

const thirdPartyWeights = Array.from({ length: 24 }, (_, index) => 40 + index);
const thirdPartyLabels = monthSeries("2024-07-01", Array(24).fill(0));
const thirdPartyRevenue = spread(11393708, thirdPartyWeights);
const thirdPartyCost = spread(8209243, thirdPartyWeights);
const thirdPartyMonths = thirdPartyLabels.map((point, index) => ({
  ...point,
  revenue: thirdPartyRevenue[index],
  cost: thirdPartyCost[index],
}));

const categoryKeys = thirdPartyCategories.map((item) => item.name);
const categoryMonths = thirdPartyLabels.map((point, index) => {
  const row = { ...point };
  let used = 0;
  categoryKeys.slice(0, -1).forEach((key) => {
    const category = thirdPartyCategories.find((item) => item.name === key);
    const value = spread(category.revenue, thirdPartyWeights)[index];
    row[key] = value;
    used += value;
  });
  row[categoryKeys[categoryKeys.length - 1]] = thirdPartyRevenue[index] - used;
  return row;
});

const footfallTotal = [
  645, 462, 730, 1065, 2168, 1440, 885, 785, 956, 1339, 1407, 1208, 1282, 1273, 1602,
  2369, 2329, 1516, 1684, 1535, 1481, 1622, 1764, 1746, 1658, 1873, 2264, 3020, 3170,
];
const footfallUnique = [
  240, 254, 428, 329, 489, 1072, 672, 580, 685, 932, 983, 849, 861, 945, 1102,
  1555, 1607, 1092, 1156, 1138, 1100, 1198, 1256, 1222, 1204, 1340, 1572, 2113, 2242,
];

const diseases = [
  { name: "Fever", visits: 3901, category: "Fever & Viral", specialty: "General Medicine" },
  { name: "Musculoskeletal Pain", visits: 3253, category: "Musculoskeletal", specialty: "Orthopedics" },
  { name: "Blood Test", visits: 2952, category: "Investigations", specialty: "Laboratory" },
  { name: "Others", visits: 2581, category: "Others", specialty: "General Medicine" },
  { name: "Gastrointestinal Problem", visits: 1858, category: "Gastrointestinal", specialty: "Gastroenterology" },
  { name: "Eye Problem", visits: 1746, category: "Eye", specialty: "Ophthalmology" },
  { name: "Cough", visits: 1631, category: "Respiratory", specialty: "Respiratory" },
  { name: "Dental Problem", visits: 1462, category: "Dental", specialty: "Dental" },
  { name: "Report Review", visits: 1427, category: "Others", specialty: "General Medicine" },
  { name: "Weakness", visits: 1285, category: "General", specialty: "General Medicine" },
  { name: "Other diseases", visits: 8231, category: "Others", specialty: "Other specialties" },
];

const trendKeys = ["Fever", "Musculoskeletal Pain", "Blood Test", "Others", "Gastrointestinal Problem"];
const diseaseWeights = Array.from({ length: 21 }, (_, index) => 20 + index);
const diseaseLabels = monthSeries("2025-01-01", Array(21).fill(0));
const diseaseTrend = diseaseLabels.map((point, index) => {
  const row = { ...point };
  trendKeys.forEach((key) => {
    const disease = diseases.find((item) => item.name === key);
    row[key] = spread(disease.visits, diseaseWeights)[index];
  });
  return row;
});

const patientProfile = {
  uniqueHeadline: 23559,
  base: 23559,
  returning: 21719,
  totalPatients: 45278,
  byGenderCategory: {
    Male: { APL: 7152, BPL: 7285 },
    Female: { APL: 4572, BPL: 4547 },
    Other: { APL: 0, BPL: 3 },
  },
  age: [
    { name: "0-17", value: 4606 },
    { name: "18-44", value: 14005 },
    { name: "45-60", value: 2930 },
    { name: "60+", value: 2018 },
  ],
  ageByGender: {
    Male: [
      { name: "0-17", value: 2682 },
      { name: "18-44", value: 8866 },
      { name: "45-60", value: 1824 },
      { name: "60+", value: 1065 },
    ],
    Female: [
      { name: "0-17", value: 1921 },
      { name: "18-44", value: 5139 },
      { name: "45-60", value: 1106 },
      { name: "60+", value: 953 },
    ],
  },
  segmentation: {
    columns: ["Sex", "0-17", "18-44", "45-60", "60+", "Total"],
    rows: [
      { Sex: "Female", block: "Female", kind: "group", "0-17": "8.15%", "18-44": "21.81%", "45-60": "4.69%", "60+": "4.05%", Total: "38.71%" },
      { Sex: "APL", block: "Female", kind: "apl", "0-17": "4.03%", "18-44": "10.54%", "45-60": "2.28%", "60+": "2.54%", Total: "19.40%" },
      { Sex: "BPL", block: "Female", kind: "bpl", "0-17": "4.12%", "18-44": "11.27%", "45-60": "2.42%", "60+": "1.50%", Total: "19.31%" },
      { Sex: "Male", block: "Male", kind: "group", "0-17": "11.38%", "18-44": "37.63%", "45-60": "7.74%", "60+": "4.52%", Total: "61.28%" },
      { Sex: "APL", block: "Male", kind: "apl", "0-17": "5.31%", "18-44": "19.42%", "45-60": "3.28%", "60+": "2.35%", Total: "30.36%" },
      { Sex: "BPL", block: "Male", kind: "bpl", "0-17": "6.07%", "18-44": "18.21%", "45-60": "4.47%", "60+": "2.17%", Total: "30.92%" },
      { Sex: "Total", block: "Total", kind: "total", "0-17": "19.55%", "18-44": "59.45%", "45-60": "12.44%", "60+": "8.57%", Total: "100.00%" },
    ],
  },
  geo: [
    { area: "NAURANGPUR", patients: 5801 },
    { area: "BIHAR", patients: 1775 },
    { area: "NSG", patients: 1184 },
    { area: "RAMPURA", patients: 1116 },
    { area: "UTTAR PRADESH", patients: 977 },
    { area: "SHIKOHPUR", patients: 610 },
    { area: "BAR-GURJAR", patients: 438 },
    { area: "NAKHROLA", patients: 404 },
    { area: "M3M", patients: 394 },
    { area: "POLICE LINES MANESAR", patients: 386 },
  ],
};

const campProfile = {
  uniqueHeadline: 4800,
  base: 4800,
  totalPatients: 4800,
  extras: [
    { label: "Total Camps", value: 28, fixed: true },
    { label: "Medicine Dispensing Visits — Camp", value: 1920 },
  ],
  byGenderCategory: {
    Male: { APL: 1458, BPL: 1483 },
    Female: { APL: 932, BPL: 926 },
    Other: { APL: 0, BPL: 1 },
  },
  age: [
    { name: "0-17", value: 938 },
    { name: "18-44", value: 2854 },
    { name: "45-60", value: 597 },
    { name: "60+", value: 411 },
  ],
  ageByGender: {
    Male: [
      { name: "0-17", value: 546 },
      { name: "18-44", value: 1806 },
      { name: "45-60", value: 372 },
      { name: "60+", value: 217 },
    ],
    Female: [
      { name: "0-17", value: 392 },
      { name: "18-44", value: 1048 },
      { name: "45-60", value: 225 },
      { name: "60+", value: 193 },
    ],
  },
  segmentation: patientProfile.segmentation,
  geo: [
    { area: "NAURANGPUR", patients: 1182 },
    { area: "BIHAR", patients: 362 },
    { area: "NSG", patients: 241 },
    { area: "RAMPURA", patients: 227 },
    { area: "UTTAR PRADESH", patients: 199 },
    { area: "SHIKOHPUR", patients: 124 },
    { area: "BAR-GURJAR", patients: 89 },
    { area: "NAKHROLA", patients: 82 },
    { area: "M3M", patients: 80 },
    { area: "POLICE LINES MANESAR", patients: 79 },
  ],
};

const revenueSource = {
  total: 16421385,
  services: revenueServices,
  months: revenueMonths,
  yearly: revenueYearly,
};

const costSource = {
  total: 35565166,
  categories: costCategories,
  months: costMonths,
  salaries,
};

const genderOptions = [all, { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }];
const patientTypeOptions = [all, { value: "apl", label: "APL" }, { value: "bpl", label: "BPL" }];

export const ampTabs = {
  revenue: {
    initialFilters: () => ({
      dateRange: defaultDateRange("2024-07-01", "2026-09-30"),
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
    select: (filters) => selectRevenue(revenueSource, filters),
  },
  cost: {
    initialFilters: () => ({
      dateRange: defaultDateRange("2024-04-01", "2026-06-30"),
      category: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Date" },
      {
        id: "category",
        type: "select",
        label: "Categories",
        options: [all, ...costCategories.map((item) => ({ value: item.name, label: item.name }))],
      },
    ],
    select: (filters) => selectCost(costSource, filters),
  },
  "third-party": {
    initialFilters: () => ({
      dateRange: defaultDateRange("2024-07-01", "2026-06-30"),
      category: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Date" },
      {
        id: "category",
        type: "select",
        label: "Categories",
        options: [all, ...categoryKeys.map((name) => ({ value: name, label: name }))],
      },
    ],
    select: (filters) => selectThirdParty({ months: thirdPartyMonths, categories: thirdPartyCategories }, filters),
  },
  "third-party-category": {
    initialFilters: () => ({
      dateRange: defaultDateRange("2024-07-01", "2026-06-30"),
      category: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Months" },
      {
        id: "category",
        type: "select",
        label: "Categories",
        options: [all, ...categoryKeys.map((name) => ({ value: name, label: name }))],
      },
    ],
    select: (filters) => selectThirdPartyCategory({
      categoryMonths,
      categoryKeys,
      categories: thirdPartyCategories,
    }, filters),
  },
  "unique-patients": {
    initialFilters: () => ({ gender: "all", patientType: "all" }),
    filters: [
      { id: "gender", type: "select", label: "Gender", options: genderOptions },
      { id: "patientType", type: "select", label: "Patient type", options: patientTypeOptions },
    ],
    select: (filters) => selectPatient(patientProfile, filters, "patients"),
  },
  footfall: {
    initialFilters: () => ({ dateRange: defaultDateRange("2024-05-01", "2026-09-30") }),
    filters: [{ id: "dateRange", type: "dateRange", label: "Date" }],
    select: (filters) => selectFootfall({
      total: monthSeries("2024-05-01", footfallTotal),
      unique: monthSeries("2024-05-01", footfallUnique),
      headline: { totalPatients: 45278, uniquePatients: 23559, returningPatients: 21719 },
    }, filters),
  },
  disease: {
    initialFilters: () => ({
      dateRange: defaultDateRange("2025-01-01", "2026-09-30"),
      diseaseCategory: "all",
      specialty: "all",
    }),
    filters: [
      { id: "dateRange", type: "dateRange", label: "Date" },
      {
        id: "diseaseCategory",
        type: "select",
        label: "Disease category",
        options: [all, ...[...new Set(diseases.map((item) => item.category))].map((name) => ({ value: name, label: name }))],
      },
      {
        id: "specialty",
        type: "select",
        label: "Medical speciality",
        options: [all, ...[...new Set(diseases.map((item) => item.specialty))].map((name) => ({ value: name, label: name }))],
      },
    ],
    select: (filters) => selectDisease({
      opd: 45278,
      diseases,
      trend: diseaseTrend,
      trendKeys,
    }, filters),
  },
  "camp-profile": {
    initialFilters: () => ({ gender: "all", patientType: "all" }),
    filters: [
      { id: "gender", type: "select", label: "Gender", options: genderOptions },
      { id: "patientType", type: "select", label: "Patient type", options: patientTypeOptions },
    ],
    select: (filters) => selectPatient(campProfile, filters, "patients"),
  },
};
