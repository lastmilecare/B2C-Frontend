/** Honda Dashboard 5.0 — revenue & cost analytics (dummy) */

export const hondaRevenueOverview = {
  totalRevenue: 16421385,
  dateRange: { start: "2024-05-01", end: "2026-09-30" },
};

export const hondaRevenueByService = [
  { name: "Pharmacy", value: 7092347, percent: 43.19 },
  { name: "Suture/First Aid/Procedure", value: 3961169, percent: 24.12 },
  { name: "Diagnostics", value: 2751727, percent: 16.76 },
  { name: "Spectacle", value: 1016207, percent: 6.19 },
  { name: "X Ray", value: 696136, percent: 4.24 },
  { name: "Consultation", value: 372188, percent: 2.27 },
  { name: "Specialist Consultation", value: 364691, percent: 2.22 },
  { name: "B2B", value: 148872, percent: 0.91 },
];

export const hondaRevenueTrend = [
  { date: "Jul 2024", value: 74980 },
  { date: "Aug 2024", value: 521000 },
  { date: "Sep 2024", value: 753340 },
  { date: "Oct 2024", value: 216630 },
  { date: "Nov 2024", value: 805330 },
  { date: "Dec 2024", value: 510770 },
  { date: "Jan 2025", value: 1396580 },
  { date: "Feb 2025", value: 552690 },
  { date: "Mar 2025", value: 469380 },
  { date: "Apr 2025", value: 466240 },
  { date: "May 2025", value: 704580 },
  { date: "Jun 2025", value: 763140 },
  { date: "Jul 2025", value: 411250 },
  { date: "Aug 2025", value: 474800 },
  { date: "Sep 2025", value: 137890 },
  { date: "Oct 2025", value: 946170 },
  { date: "Nov 2025", value: 235370 },
  { date: "Dec 2025", value: 460000 },
  { date: "Jan 2026", value: 620000 },
  { date: "Feb 2026", value: 580000 },
  { date: "Mar 2026", value: 710000 },
];

export const hondaRevenueTable = [
  {
    serviceCategory: "Pharmacy",
    y2024: 1089112,
    y2025: 2921469,
    y2026: 3081766,
    total: 7092347,
  },
  {
    serviceCategory: "Suture/First Aid/Procedure",
    y2024: 10575,
    y2025: 1428152,
    y2026: 2522442,
    total: 3961169,
  },
  {
    serviceCategory: "Diagnostics",
    y2024: 453234,
    y2025: 1165473,
    y2026: 1133020,
    total: 2751727,
  },
  {
    serviceCategory: "Spectacle",
    y2024: 159304,
    y2025: 450480,
    y2026: 406423,
    total: 1016207,
  },
  {
    serviceCategory: "X Ray",
    y2024: 45500,
    y2025: 294986,
    y2026: 355650,
    total: 696136,
  },
  {
    serviceCategory: "Consultation",
    y2024: 73680,
    y2025: 107678,
    y2026: 190830,
    total: 372188,
  },
  {
    serviceCategory: "Specialist Consultation",
    y2024: 38965,
    y2025: 91326,
    y2026: 234400,
    total: 364691,
  },
  {
    serviceCategory: "B2B",
    y2024: 100848,
    y2025: 48024,
    y2026: 0,
    total: 148872,
  },
];

export const hondaCostOverview = {
  totalCost: 35565166,
};

export const hondaCostByCategory = [
  { name: "Salaries", value: 15652000, percent: 44.01 },
  { name: "Management Exp", value: 5400000, percent: 15.18 },
  { name: "Medicines", value: 4352000, percent: 12.24 },
  { name: "Tech Stack", value: 2315000, percent: 6.51 },
  { name: "Diagnostics", value: 1376000, percent: 3.87 },
  { name: "Dentist", value: 1340000, percent: 3.77 },
  { name: "Compliance & Certification", value: 688000, percent: 1.94 },
  { name: "Misc", value: 2622166, percent: 7.38 },
];

export const hondaCostTrend = [
  { date: "Apr 2024", value: 696000 },
  { date: "May 2024", value: 1587000 },
  { date: "Jun 2024", value: 1769000 },
  { date: "Jul 2024", value: 1417000 },
  { date: "Aug 2024", value: 1201000 },
  { date: "Sep 2024", value: 1552000 },
  { date: "Oct 2024", value: 981000 },
  { date: "Nov 2024", value: 1257000 },
  { date: "Dec 2024", value: 1224000 },
  { date: "Jan 2025", value: 1551000 },
  { date: "Feb 2025", value: 1164000 },
  { date: "Mar 2025", value: 1418000 },
  { date: "Apr 2025", value: 1282000 },
  { date: "May 2025", value: 1293000 },
  { date: "Jun 2025", value: 1343000 },
  { date: "Jul 2025", value: 1422000 },
  { date: "Aug 2025", value: 1264000 },
  { date: "Sep 2025", value: 1241000 },
  { date: "Oct 2025", value: 1307000 },
  { date: "Nov 2025", value: 1300000 },
  { date: "Dec 2025", value: 1457000 },
  { date: "Jan 2026", value: 1201000 },
  { date: "Feb 2026", value: 1301000 },
  { date: "Mar 2026", value: 1360000 },
];

export const hondaSalaryBreakdown = [
  { label: "Doctors", value: 6061000 },
  { label: "Management", value: 3609000 },
  { label: "Nursing", value: 1948000 },
  { label: "Pharmacist", value: 989000 },
  { label: "Optometrist", value: 584000 },
  { label: "X-Ray Tech", value: 516000 },
  { label: "Mobilizer", value: 478000 },
  { label: "Reception", value: 338000 },
];

export const hondaFilterOptions = {
  financialCategory: [
    { value: "all", label: "All" },
    { value: "opl", label: "OPL" },
    { value: "ipl", label: "IPL" },
  ],
  serviceCategory: [
    { value: "all", label: "All" },
    ...hondaRevenueByService.map((s) => ({ value: s.name, label: s.name })),
  ],
  months: [
    { value: "all", label: "All" },
    { value: "q1", label: "Q1" },
    { value: "q2", label: "Q2" },
    { value: "q3", label: "Q3" },
    { value: "q4", label: "Q4" },
  ],
};
