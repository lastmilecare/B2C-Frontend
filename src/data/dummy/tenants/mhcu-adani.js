import { monthSeries, spread } from "../allocate";
import { MHCU_VILLAGE_NAMES } from "./mhcu-adani/villages";

import {
  selectDisease,
  selectMhcuAwareness,
  selectMhcuConcern,
  selectMhcuHomeCare,
  selectMhcuInventory,
  selectMhcuMedicines,
  selectMhcuOverview,
  selectMhcuRisk,
  selectMhcuSchemes,
  selectMhcuTablePanel,
  selectMhcuVillageScorecard,
  selectPatient,
} from "./mhcu-adani/mhcu-select";
import {
  mhcuStandardFilters,
  mhcuStandardInitialFilters,
  mhcuDiseaseFilters,
  mhcuDiseaseInitialFilters,
  MHCU_DEFAULT_DATE_RANGE,
   mhcuConcernFilters,
  mhcuConcernInitialFilters,
} from "../../../clientdashboard/mhcu-filters";

const all = { value: "all", label: "All villages" };
const villageOptions = [
  all,
  ...MHCU_VILLAGE_NAMES.map((name) => ({ value: name, label: name })),
];

const genderOptions = [
  all,
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const defaultRange = MHCU_DEFAULT_DATE_RANGE;

const villageFilters = (extra = []) => [
  { id: "dateRange", type: "dateRange", label: "Date" },
  { id: "village", type: "select", label: "Village", options: villageOptions },
  ...extra,
];

const patientProfile = {
  uniqueHeadline: 4820,
  base: 4820,
  newHeadline: 1960,
  repeatHeadline: 2860,
  byGenderCategory: {
    Male: { APL: 1200, BPL: 980 },
    Female: { APL: 1450, BPL: 1190 },
  },
  age: [
    { name: "0-17", value: 1180 },
    { name: "18-44", value: 2140 },
    { name: "45-60", value: 920 },
    { name: "60+", value: 580 },
  ],
  ageByGender: {
    Male: [
      { name: "0-17", value: 520 },
      { name: "18-44", value: 980 },
      { name: "45-60", value: 380 },
      { name: "60+", value: 300 },
    ],
    Female: [
      { name: "0-17", value: 660 },
      { name: "18-44", value: 1160 },
      { name: "45-60", value: 540 },
      { name: "60+", value: 280 },
    ],
  },
  segmentation: {
    columns: ["Sex", "0-17", "18-44", "45-60", "60+", "Total"],
    rows: [
      {
        Sex: "Female",
        block: "Female",
        kind: "group",
        "0-17": "13.69%",
        "18-44": "24.07%",
        "45-60": "11.20%",
        "60+": "5.81%",
        Total: "54.77%",
      },
      {
        Sex: "Male",
        block: "Male",
        kind: "group",
        "0-17": "10.79%",
        "18-44": "20.33%",
        "45-60": "7.88%",
        "60+": "6.22%",
        Total: "45.23%",
      },
      {
        Sex: "Total",
        block: "Total",
        kind: "total",
        "0-17": "24.48%",
        "18-44": "44.40%",
        "45-60": "19.09%",
        "60+": "12.03%",
        Total: "100.00%",
      },
    ],
  },
  geo: MHCU_VILLAGE_NAMES.slice(0, 10).map((name, index) => ({
    area: name,
    patients: 520 - index * 28,
  })),
  specialCategories: [
    { name: "Pregnant women", value: 186 },
    { name: "Children under 5", value: 412 },
    { name: "Elderly 60+", value: 580 },
    { name: "Bedridden", value: 94 },
    { name: "Physically challenged", value: 67 },
    { name: "Home care", value: 128 },
  ],
};

const diseases = [
  {
    name: "Hypertension",
    visits: 620,
    category: "NCD",
    specialty: "General Medicine",
  },
  {
    name: "Diabetes",
    visits: 540,
    category: "NCD",
    specialty: "General Medicine",
  },
  {
    name: "Anaemia",
    visits: 480,
    category: "Nutrition",
    specialty: "General Medicine",
  },
  {
    name: "Fever",
    visits: 410,
    category: "Acute",
    specialty: "General Medicine",
  },
  {
    name: "Cough / cold",
    visits: 380,
    category: "Acute",
    specialty: "General Medicine",
  },
  {
    name: "Malaria",
    visits: 120,
    category: "Communicable",
    specialty: "General Medicine",
  },
  {
    name: "Typhoid",
    visits: 95,
    category: "Communicable",
    specialty: "General Medicine",
  },
  {
    name: "Musculoskeletal pain",
    visits: 340,
    category: "Other",
    specialty: "Orthopedics",
  },
];
const diseaseTrendKeys = [
  "Hypertension",
  "Diabetes",
  "Anaemia",
  "Fever",
  "Cough / cold",
];
const diseaseWeights = Array.from({ length: 11 }, (_, i) => 18 + i);
const diseaseTrend = monthSeries("2026-01-01", Array(11).fill(0)).map(
  (point, index) => {
    const row = { ...point };
    diseaseTrendKeys.forEach((key) => {
      const d = diseases.find((item) => item.name === key);
      row[key] = spread(d.visits, diseaseWeights)[index];
    });
    return row;
  },
);


const scorecardRows = MHCU_VILLAGE_NAMES.map((name, index) => ({
  village: name,
  opd: 420 - (index % 5) * 18,
  homeVisits: 28 - (index % 4),
  referrals: 12 - (index % 3),
  awareness: 2 + (index % 2),
  feedbackScore: (4.1 + (index % 8) * 0.05).toFixed(1),
}));

const visitTrendMonths = monthSeries(
  "2026-01-01",
  [280, 310, 340, 380, 420, 460, 490, 520, 540, 580, 610],
).map((point, index) => ({
  ...point,
  visits: [280, 310, 340, 380, 420, 460, 490, 520, 540, 580, 610][index],
  newPatients: [120, 130, 125, 140, 155, 165, 170, 178, 182, 190, 198][index],
}));

export const mhcuAdaniTabs = {
  overview: {
    initialFilters: () => mhcuStandardInitialFilters(),
    filters: mhcuStandardFilters(),
    select: (filters) =>
      selectMhcuOverview(
        {
          uniqueScreened: 4820,
          totalVisits: 6840,
          newPatients: 1960,
          repeatPatients: 2860,
          villagesCovered: 16,
          highConcern: 142,
          medicineTotal: 5120,
          visitTrend: visitTrendMonths,
          topVillages: MHCU_VILLAGE_NAMES.map((name, i) => ({
            name,
            visits: 480 - i * 12,
          })).slice(0, 10),
        },
        filters,
      ),
  },
  patients: {
    initialFilters: () => mhcuStandardInitialFilters(),
    filters: mhcuStandardFilters(),
    select: (filters) => {
      const view = selectPatient(patientProfile, filters, "patients");
      return {
        ...view,
        specialCategories: patientProfile.specialCategories.map((item) => ({
          ...item,
          value:
            filters.village === "all"
              ? item.value
              : Math.round(item.value * 0.08),
        })),
      };
    },
  },
  "risk-zones": {
    initialFilters: () => mhcuStandardInitialFilters(),
    filters: mhcuStandardFilters(),
    select: (filters) =>
      selectMhcuRisk(
        {
          abnormalPatients: 1240,
          byZone: [
            { name: "Red", value: 186 },
            { name: "Amber", value: 420 },
            { name: "Yellow", value: 380 },
            { name: "Green", value: 3840 },
          ],
          zoneKeys: ["Red", "Amber", "Yellow", "Green"],
          byTest: [
            { test: "BP", Red: 42, Amber: 98, Yellow: 76, Green: 620 },
            {
              test: "Blood sugar",
              Red: 38,
              Amber: 120,
              Yellow: 90,
              Green: 540,
            },
            {
              test: "Haemoglobin",
              Red: 56,
              Amber: 110,
              Yellow: 88,
              Green: 480,
            },
            { test: "Temperature", Red: 22, Amber: 40, Yellow: 60, Green: 380 },
            { test: "Pulse", Red: 12, Amber: 28, Yellow: 34, Green: 320 },
            { test: "SpO2", Red: 16, Amber: 24, Yellow: 32, Green: 280 },
          ],
        },
        filters,
      ),
  },
  disease: {
    initialFilters: () => mhcuDiseaseInitialFilters(),
    filters: mhcuDiseaseFilters(),
    select: (filters) =>
      selectDisease(
        {
          opd: 6840,
          diseases,
          trend: diseaseTrend,
          trendKeys: diseaseTrendKeys,
        },
        { ...filters, diseaseCategory: "all", specialty: "all" },
      ),
  },
  medicines: {
    initialFilters: () => ({ village: "all", dateRange: defaultRange }),
    filters: villageFilters(),
    select: (filters) =>
      selectMhcuMedicines(
        {
          dispensed: 5120,
          shortSupply: 86,
          trend: monthSeries(
            "2026-01-01",
            [380, 410, 440, 460, 480, 500, 520, 530, 540, 560, 580],
          ),
          topMedicines: [
            { label: "Paracetamol 500mg", value: 820 },
            { label: "Metformin", value: 640 },
            { label: "Amlodipine", value: 580 },
            { label: "Iron + folic acid", value: 520 },
            { label: "ORS", value: 410 },
          ],
        },
        filters,
      ),
  },
  inventory: {
    initialFilters: () => ({ village: "all" }),
    filters: [
      {
        id: "village",
        type: "select",
        label: "Village",
        options: villageOptions,
      },
    ],
    select: (filters) =>
      selectMhcuInventory(
        {
          belowMin: 12,
          expire30: 8,
          expire60: 14,
          expire90: 22,
          rows: [
            {
              medicine: "Paracetamol 500mg",
              batch: "P-2401",
              closing: 420,
              expiry: "2026-12-15",
              status: "OK",
            },
            {
              medicine: "Metformin 500mg",
              batch: "M-2398",
              closing: 86,
              expiry: "2026-04-10",
              status: "Low",
            },
            {
              medicine: "Amlodipine 5mg",
              batch: "A-2402",
              closing: 120,
              expiry: "2026-03-28",
              status: "Expiring 30d",
            },
            {
              medicine: "Iron tablets",
              batch: "I-2390",
              closing: 200,
              expiry: "2026-06-01",
              status: "OK",
            },
          ],
        },
        filters,
      ),
  },
  "home-care": {
    initialFilters: () => mhcuDiseaseInitialFilters(),
    filters: mhcuDiseaseFilters(),
    select: (filters) =>
      selectMhcuHomeCare(
        {
          visitsDone: 384,
          onRegister: 128,
          irregular: 34,
          trend: monthSeries(
            "2026-01-01",
            [28, 32, 35, 38, 40, 42, 44, 46, 48, 50, 52],
          ),
          byVillage: MHCU_VILLAGE_NAMES.map((name, i) => ({
            name,
            value: 32 - (i % 6),
          })),
        },
        filters,
      ),
  },
  referrals: {
    initialFilters: () => ({ village: "all", dateRange: defaultRange }),
    filters: villageFilters(),
    select: (filters) =>
      selectMhcuTablePanel(
        {
          total: 186,
          rows: [
            {
              patientId: "MHCU-1024",
              village: "Kothi",
              referredTo: "CHC Kotma",
              urgency: "Urgent",
              reason: "Uncontrolled BP",
              status: "Visited",
            },
            {
              patientId: "MHCU-0981",
              village: "Katkona",
              referredTo: "District hospital",
              urgency: "Routine",
              reason: "Suspected TB",
              status: "Pending",
            },
            {
              patientId: "MHCU-1102",
              village: "Baihatola",
              referredTo: "Specialist",
              urgency: "Urgent",
              reason: "Pregnancy complication",
              status: "Follow-up due",
            },
          ],
        },
        filters,
        "mhcu-referrals",
        [{ label: "Total referrals", key: "total" }],
      ),
  },
  schemes: {
    initialFilters: () => ({ village: "all", dateRange: defaultRange }),
    filters: villageFilters(),
    select: (filters) =>
      selectMhcuSchemes(
        {
          total: 2140,
          slices: [
            { name: "Ayushman Bharat", value: 980 },
            { name: "Immunisation", value: 620 },
            { name: "Maternal health", value: 340 },
            { name: "Other", value: 200 },
          ],
          statusBars: [
            {
              label: "Ayushman Bharat",
              awareness: 420,
              registered: 280,
              cardReceived: 180,
            },
            {
              label: "Immunisation",
              awareness: 380,
              registered: 320,
              cardReceived: 240,
            },
          ],
        },
        filters,
      ),
  },
  awareness: {
    initialFilters: () => ({ village: "all", dateRange: defaultRange }),
    filters: villageFilters(),
    select: (filters) =>
      selectMhcuAwareness(
        {
          sessions: 48,
          participants: 2860,
          rows: [
            {
              date: "2026-10-12",
              village: "Umarda",
              topic: "NCD prevention",
              participantsMale: 42,
              participantsFemale: 58,
            },
            {
              date: "2026-10-14",
              village: "Kothi",
              topic: "Maternal health",
              participantsMale: 28,
              participantsFemale: 72,
            },
            {
              date: "2026-10-16",
              village: "Chhatai",
              topic: "Sanitation & hygiene",
              participantsMale: 65,
              participantsFemale: 80,
            },
          ],
        },
        filters,
      ),
  },
  "village-scorecard": {
    initialFilters: () => mhcuStandardInitialFilters(),
    filters: mhcuStandardFilters(),
    select: (filters) =>
      selectMhcuVillageScorecard({ rows: scorecardRows }, filters),
  },
   feedback: {
    initialFilters: () => mhcuStandardInitialFilters(),
    filters: mhcuStandardFilters(),
    select: (filters) => {
      const share = filters.village === "all" ? 1 : 0.12;
      const yesNo = (yes, no, other = 4) => [
        { name: "Yes", value: Math.round(yes * share) },
        { name: "No", value: Math.round(no * share) },
        { name: "Other", value: Math.round(other * share) },
      ];
      return {
        panel: "feedback",
        kpis: [
          { label: "Feedback completed", value: Math.round(4628 * share) },
          { label: "Completion rate", value: 78, format: "percent" },
        ],
        questions: [
          {
            key: "health_improved",
            question: "Has your health improved?",
            total: Math.round(820 * share),
            slices: yesNo(520, 280),
          },
          {
            key: "wait_queue",
            question:
              "Did you have to wait too long or stand in a queue to see the doctor?",
            total: Math.round(820 * share),
            slices: yesNo(180, 610, 30),
          },
          {
            key: "medicine_regularly",
            question: "Are you taking medicine regularly?",
            total: Math.round(820 * share),
            slices: yesNo(640, 160),
          },
          {
            key: "all_medicine_received",
            question: "Did you get all the prescribed medicine?",
            total: Math.round(820 * share),
            slices: yesNo(580, 210, 30),
          },
          {
            key: "staff_behaviour",
            question: "How was the staff behaviour?",
            total: Math.round(820 * share),
            slices: [
              { name: "Good", value: Math.round(610 * share) },
              { name: "Moderate", value: Math.round(150 * share) },
              { name: "Not Good", value: Math.round(60 * share) },
            ],
          },
          {
            key: "overall_feedback",
            question: "Overall Feedback",
            total: Math.round(820 * share),
            slices: [
              { name: "Good", value: Math.round(520 * share) },
              { name: "Moderate", value: Math.round(210 * share) },
              { name: "Not Good", value: Math.round(90 * share) },
            ],
          },
        ],
      };
    },
  },
  concern: {
    initialFilters: () => mhcuConcernInitialFilters(),
    filters: mhcuConcernFilters(),
    select: (filters) =>
      selectMhcuConcern(
        {
          high: 142,
          moderate: 386,
          rows: [
            {
              patientId: "MHCU-0812",
              village: "Kothi",
              tier: "High",
              snapshot: "BP 168/112",
              lastVisit: "2026-11-08",
              followUp: "Due",
            },
            {
              patientId: "MHCU-0744",
              village: "Katkona",
              tier: "High",
              snapshot: "RBS 286",
              lastVisit: "2026-11-10",
              followUp: "Scheduled",
            },
            {
              patientId: "MHCU-0920",
              village: "Baihatola",
              tier: "Moderate",
              snapshot: "Hb 9.2",
              lastVisit: "2026-11-09",
              followUp: "Done",
            },
          ],
        },
        filters,
      ),
  },
};
