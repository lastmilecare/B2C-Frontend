import {
  useGetPatientsQuery,
  useGetOpdBillingQuery,
  useGetPrescriptionsListQuery,
  useGetLowStockItemsQuery,
  useGetPatientsTrendQuery,
} from "../redux/apiSlice";
import { getPatientDashboardData } from "../utils/dashboard/patientTransformer";
const CENTER_SCALE = {
  All: 1,
  XYZ: 0.35,
  TTT: 0.22,
  IIIS: 0.18,
  VAX: 0.15,
};

const PERIOD_LABELS = {
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  year: ["2021", "2022", "2023", "2024", "2025"],
};

/** Deterministic pseudo-random multiplier per index for realistic variation */
function wave(index, seed, amplitude = 0.18) {
  return 1 + amplitude * Math.sin(index * 1.4 + seed);
}

function scaleSeries(values, center) {
  const factor = CENTER_SCALE[center];
  return values.map((v) => Math.round(v * factor));
}

function buildSeries(base, center, seed) {
  const varied = base.map((v, i) => Math.round(v * wave(i, seed)));
  return scaleSeries(varied, center);
}

const TEST_LABELS = ["CBC", "X-Ray", "ECG", "MRI", "LFT", "RFT"];
const COMPLAINT_LABELS = [
  "Fever",
  "Back pain",
  "Cough",
  "Fatigue",
  "Headache",
  "Injury",
  "Other",
];

const PERIOD_BASE = {
  day: {
    workers: [18, 22, 26, 24, 28, 12, 8],
    opdNew: [14, 18, 21, 19, 23, 10, 6],
    opdFu: [10, 12, 15, 14, 16, 7, 4],
    rx: [12, 15, 18, 16, 20, 8, 5],
    fitness: [4, 5, 6, 5, 7, 3, 2],
    ambulance: [1, 2, 1, 2, 1, 0, 1],
    tests: [48, 52, 58, 55, 62, 28, 18],
    complaints: [22, 18, 15, 14, 12, 10, 9],
  },
  month: {
    workers: [120, 145, 168, 182, 205, 224],
    opdNew: [42, 55, 68, 75, 88, 96],
    opdFu: [30, 38, 50, 60, 72, 84],
    rx: [38, 50, 62, 70, 82, 90],
    fitness: [28, 34, 40, 46, 52, 58],
    ambulance: [8, 10, 12, 11, 14, 16],
    tests: [340, 280, 210, 160, 130, 95],
    complaints: [22, 18, 15, 14, 12, 10],
  },
  year: {
    workers: [980, 1120, 1280, 1450, 1620],
    opdNew: [320, 380, 440, 510, 580],
    opdFu: [240, 290, 340, 390, 450],
    rx: [290, 350, 410, 470, 540],
    fitness: [180, 210, 245, 280, 320],
    ambulance: [72, 84, 96, 108, 124],
    tests: [2100, 1980, 1850, 1720, 1600],
    complaints: [24, 21, 19, 17, 15],
  },
};

const PERIOD_TITLES = {
  day: "Last 7 days (end-of-day view)",
  month: "Last 6 months (end-of-month view)",
  year: "Last 5 years (end-of-year view)",
};

function reorderComplaints(base, center) {
  const shifts = {
    All: 0,
    XYZ: 1,
    TTT: 2,
    IIIS: 3,
    VAX: 4,
  };
  const shift = shifts[center];
  const labels = [...COMPLAINT_LABELS];
  const data = [...base];
  if (shift === 0) return { labels, data };
  const rotatedLabels = labels.slice(shift).concat(labels.slice(0, shift));
  const rotatedData = data.slice(shift).concat(data.slice(0, shift));
  return { labels: rotatedLabels, data: rotatedData };
}

function reorderTests(base, center) {
  const order = {
    All: [0, 1, 2, 3, 4, 5],
    XYZ: [0, 1, 2, 3, 4, 5],
    TTT: [2, 0, 1, 3, 4, 5],
    IIIS: [0, 4, 1, 2, 5, 3],
    VAX: [1, 0, 2, 4, 3, 5],
  };
  const idx = order[center];
  return {
    labels: idx.map((i) => TEST_LABELS[i]),
    data: idx.map((i) => base[i]),
  };
}

export function getDashboardData(period, center,patientDashboard) {
  const base = PERIOD_BASE[period];
  const labels = PERIOD_LABELS[period];

  const workersVisited = buildSeries(base.workers, center, 1.2);
  const newPatients = buildSeries(base.opdNew, center, 2.1);
  const followUp = buildSeries(base.opdFu, center, 3.4);
  const prescriptions = buildSeries(base.rx, center, 4.2);
  const fitnessCertificates = buildSeries(base.fitness, center, 5.1);
  const ambulanceDispatches = buildSeries(base.ambulance, center, 6.3);

  const scaledTests = scaleSeries(base.tests, center);
  const scaledComplaints = scaleSeries(base.complaints, center);

  const last = labels.length - 1;
  const prev = labels.length - 2;

  const totalWorkers = workersVisited.reduce((a, b) => a + b, 0);
  const prevWorkersSum =
    workersVisited.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(prev, 1);

  return {
    labels,
    periodLabel: PERIOD_TITLES[period],
    kpis: [
      {
        label: "Registered Workers",
        value: patientDashboard.registeredWorkers,
        previous: patientDashboard.previousRegistrations,
        icon: "users",
      },
      {
        label:
          period === "day"
            ? "Today's Registrations"
            : period === "month"
              ? "This Month's Registrations"
              : "This Year's Registrations",
        value: patientDashboard.currentRegistrations,
        previous: patientDashboard.previousRegistrations,
        icon: "clipboard",
      },
      {
        label: "OPD Health Checkups",
        value: newPatients[last] + followUp[last],
        previous: newPatients[prev] + followUp[prev],
        icon: "stethoscope",
      },
      {
        label: "Prescriptions Issued",
        value: prescriptions[last],
        previous: prescriptions[prev],
        icon: "pill",
      },
      {
        label: "Doctor Assessments",
        value: Math.round((newPatients[last] + followUp[last]) * 0.92),
        previous: Math.round((newPatients[prev] + followUp[prev]) * 0.92),
        icon: "activity",
      },
      {
        label: "Fitness Certificates",
        value: fitnessCertificates[last],
        previous: fitnessCertificates[prev],
        icon: "file",
      },
      {
        label: "Ambulance Dispatches",
        value: ambulanceDispatches.reduce((a, b) => a + b, 0),
        previous: Math.round(
          ambulanceDispatches.slice(0, -1).reduce((a, b) => a + b, 0) *
            (labels.length / Math.max(prev, 1)),
        ),
        icon: "ambulance",
      },
    ],
    opd: { newPatients, followUp },
    workersVisited,
    prescriptions,
    fitnessCertificates,
    ambulanceDispatches,
    careFlow: {
      registrations: workersVisited,
      opdVisits: newPatients.map((n, i) => n + followUp[i]),
      prescriptions,
    },
    tests: reorderTests(scaledTests, center),
    complaints: reorderComplaints(scaledComplaints, center),
  };
}

export function formatDelta(current, previous) {
  if (previous === 0) return "+100%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
