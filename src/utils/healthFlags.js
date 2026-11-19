/**
 * Health parameter concern levels & escalation (tenant-configured OHC).
 * Thresholds from clinical reference chart. Overlaps prefer higher severity.
 * Values outside all ranges map to the nearest available range.
 */

export const CONCERN_LEVELS = {
  HIGH: "high",
  MODERATE: "moderate",
  BORDERLINE: "borderline",
  NORMAL: "normal",
  NA: "na",
};

export const CONCERN_META = {
  [CONCERN_LEVELS.HIGH]: {
    label: "High Concern",
    color: "red",
    className: "bg-red-100 text-red-800 border-red-300",
    badgeClass: "bg-red-500 text-white",
  },
  [CONCERN_LEVELS.MODERATE]: {
    label: "Moderate Concern",
    color: "orange",
    className: "bg-orange-100 text-orange-800 border-orange-300",
    badgeClass: "bg-orange-500 text-white",
  },
  [CONCERN_LEVELS.BORDERLINE]: {
    label: "Borderline Range",
    color: "yellow",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    badgeClass: "bg-yellow-400 text-yellow-900",
  },
  [CONCERN_LEVELS.NORMAL]: {
    label: "Normal",
    color: "green",
    className: "bg-green-100 text-green-800 border-green-300",
    badgeClass: "bg-green-500 text-white",
  },
  [CONCERN_LEVELS.NA]: {
    label: "Not Available",
    color: "grey",
    className: "bg-gray-100 text-gray-600 border-gray-300",
    badgeClass: "bg-gray-400 text-white",
  },
};

export const ESCALATION_PROTOCOL = {
  [CONCERN_LEVELS.NORMAL]: {
    title: "Normal",
    recommendations: ["Pass.", "No additional escalation specified."],
  },
  [CONCERN_LEVELS.BORDERLINE]: {
    title: "Borderline Range",
    recommendations: [
      "Lifestyle counselling.",
      "Doctor consultation if needed.",
      "Provide health awareness pamphlets.",
      "Follow up if symptoms are observed.",
    ],
  },
  [CONCERN_LEVELS.MODERATE]: {
    title: "Moderate Concern",
    recommendations: [
      "Mandatory doctor consultation.",
      "Follow-up advice.",
      "Lifestyle counselling.",
      "Further investigations and medication where clinically indicated.",
      "Inform the relevant transporter SPOC through the specified communication process.",
    ],
  },
  [CONCERN_LEVELS.HIGH]: {
    title: "High Concern",
    recommendations: [
      "Mandatory doctor consultation.",
      "Immediate referral.",
      "Arrange urgent referral as advised by the doctor.",
      "Inform transporter SPOC through phone and email.",
      "Provide previous health records to the concerned person/doctor.",
      "Coordinate with the supervisor for follow-up.",
    ],
  },
};

const SEVERITY_RANK = {
  [CONCERN_LEVELS.HIGH]: 4,
  [CONCERN_LEVELS.MODERATE]: 3,
  [CONCERN_LEVELS.BORDERLINE]: 2,
  [CONCERN_LEVELS.NORMAL]: 1,
  [CONCERN_LEVELS.NA]: 0,
};

/**
 * Inclusive ranges from the clinical PARAMETER chart.
 * Checked High → Moderate → Borderline → Normal (overlaps prefer higher severity).
 * Chart gaps use nearest available range.
 */
export const HEALTH_THRESHOLDS = {
  temperature: {
    unit: "°F",
    label: "Temperature",
    ranges: {
      // High: > 102.1 | Low high N/A
      [CONCERN_LEVELS.HIGH]: [{ min: 102.11, max: Infinity }],
      // Moderate: 100.1–102 | < 95
      [CONCERN_LEVELS.MODERATE]: [
        { min: 100.1, max: 102 },
        { min: -Infinity, max: 94.999 },
      ],
      // Borderline: 99.1–100 | 95.1–96.9
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 99.1, max: 100 },
        { min: 95.1, max: 96.9 },
      ],
      // Normal: 97–99
      [CONCERN_LEVELS.NORMAL]: [{ min: 97, max: 99 }],
    },
  },
  spo2: {
    unit: "%",
    label: "SpO2",
    ranges: {
      // High: < 90
      [CONCERN_LEVELS.HIGH]: [{ min: -Infinity, max: 89.999 }],
      // Moderate: 91–94
      [CONCERN_LEVELS.MODERATE]: [{ min: 91, max: 94 }],
      // Borderline: 94.1–94.9
      [CONCERN_LEVELS.BORDERLINE]: [{ min: 94.1, max: 94.9 }],
      // Normal: 95–100
      [CONCERN_LEVELS.NORMAL]: [{ min: 95, max: 100 }],
    },
  },
  glucose: {
    unit: "mg/dL",
    label: "Random Blood Sugar",
    ranges: {
      // High: ≥ 350 | < 55
      [CONCERN_LEVELS.HIGH]: [
        { min: 350, max: Infinity },
        { min: -Infinity, max: 54.999 },
      ],
      // Moderate: 200–349 | 55–70
      [CONCERN_LEVELS.MODERATE]: [
        { min: 200, max: 349 },
        { min: 55, max: 70 },
      ],
      // Borderline: 141–199 | 71–110 (110 overlap with Normal → Borderline wins)
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 141, max: 199 },
        { min: 71, max: 110 },
      ],
      // Normal: 110–140
      [CONCERN_LEVELS.NORMAL]: [{ min: 110, max: 140 }],
    },
  },
  pulse: {
    unit: "bpm",
    label: "Pulse",
    ranges: {
      // High: > 140 | < 40
      [CONCERN_LEVELS.HIGH]: [
        { min: 140.01, max: Infinity },
        { min: -Infinity, max: 39.999 },
      ],
      // Moderate: 120–140 | 40–50
      [CONCERN_LEVELS.MODERATE]: [
        { min: 120, max: 140 },
        { min: 40, max: 50 },
      ],
      // Borderline: 100–119 | 51–59 (100 overlap with Normal → Borderline wins)
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 100, max: 119 },
        { min: 51, max: 59 },
      ],
      // Normal: 60–100
      [CONCERN_LEVELS.NORMAL]: [{ min: 60, max: 100 }],
    },
  },
  haemoglobin: {
    unit: "g/dL",
    label: "Haemoglobin",
    ranges: {
      // High: > 18 | < 8
      [CONCERN_LEVELS.HIGH]: [
        { min: 18.01, max: Infinity },
        { min: -Infinity, max: 7.999 },
      ],
      // Moderate: 8–9
      [CONCERN_LEVELS.MODERATE]: [{ min: 8, max: 9 }],
      // Borderline: 9.1–12.9
      [CONCERN_LEVELS.BORDERLINE]: [{ min: 9.1, max: 12.9 }],
      // Normal: 13–17
      [CONCERN_LEVELS.NORMAL]: [{ min: 13, max: 17 }],
    },
  },
  bmi: {
    unit: "kg/m²",
    label: "BMI",
    ranges: {
      // High: > 40 | < 14
      [CONCERN_LEVELS.HIGH]: [
        { min: 40.01, max: Infinity },
        { min: -Infinity, max: 13.999 },
      ],
      // Moderate: 30–40 | 14–15.99
      [CONCERN_LEVELS.MODERATE]: [
        { min: 30, max: 40 },
        { min: 14, max: 15.99 },
      ],
      // Borderline: 25–29.9 | 16–18.4
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 25, max: 29.9 },
        { min: 16, max: 18.4 },
      ],
      // Normal: 18.5–24.9
      [CONCERN_LEVELS.NORMAL]: [{ min: 18.5, max: 24.9 }],
    },
  },
  bpSystolic: {
    unit: "mmHg",
    label: "BP – Systolic",
    ranges: {
      // High: > 160 | < 80
      [CONCERN_LEVELS.HIGH]: [
        { min: 160.01, max: Infinity },
        { min: -Infinity, max: 79.999 },
      ],
      // Moderate: 140–160 | 80–89
      [CONCERN_LEVELS.MODERATE]: [
        { min: 140, max: 160 },
        { min: 80, max: 89 },
      ],
      // Borderline: 121–139 | 90–99
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 121, max: 139 },
        { min: 90, max: 99 },
      ],
      // Normal: 100–120
      [CONCERN_LEVELS.NORMAL]: [{ min: 100, max: 120 }],
    },
  },
  bpDiastolic: {
    unit: "mmHg",
    label: "BP – Diastolic",
    ranges: {
      // High: > 102 | < 50
      [CONCERN_LEVELS.HIGH]: [
        { min: 102.01, max: Infinity },
        { min: -Infinity, max: 49.999 },
      ],
      // Moderate: 90–101 | 50–59
      [CONCERN_LEVELS.MODERATE]: [
        { min: 90, max: 101 },
        { min: 50, max: 59 },
      ],
      // Borderline: 81–89 | 60–69
      [CONCERN_LEVELS.BORDERLINE]: [
        { min: 81, max: 89 },
        { min: 60, max: 69 },
      ],
      // Normal: 70–80
      [CONCERN_LEVELS.NORMAL]: [{ min: 70, max: 80 }],
    },
  },
};

export const calculateBMI = (weight, height) => {
  const w = Number(weight);
  const h = Number(height);
  if (!w || !h || h <= 0) return null;
  const heightInMeters = h / 100;
  return Number((w / (heightInMeters * heightInMeters)).toFixed(1));
};

const inRange = (value, range) => value >= range.min && value <= range.max;

const distanceToRange = (value, range) => {
  if (value < range.min) return range.min - value;
  if (value > range.max) return value - range.max;
  return 0;
};

/**
 * Classify a numeric reading. Exact matches prefer higher severity.
 * Gaps use nearest available range (option B).
 */
export const getConcernLevel = (parameterKey, rawValue) => {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return CONCERN_LEVELS.NA;
  }
  const value = Number(rawValue);
  if (Number.isNaN(value)) return CONCERN_LEVELS.NA;

  const config = HEALTH_THRESHOLDS[parameterKey];
  if (!config) return CONCERN_LEVELS.NA;

  const order = [
    CONCERN_LEVELS.HIGH,
    CONCERN_LEVELS.MODERATE,
    CONCERN_LEVELS.BORDERLINE,
    CONCERN_LEVELS.NORMAL,
  ];

  for (const level of order) {
    const ranges = config.ranges[level] || [];
    if (ranges.some((r) => inRange(value, r))) return level;
  }

  // Nearest available range
  let bestLevel = CONCERN_LEVELS.NA;
  let bestDist = Infinity;
  let bestSeverity = -1;

  for (const level of order) {
    for (const range of config.ranges[level] || []) {
      const dist = distanceToRange(value, range);
      const sev = SEVERITY_RANK[level];
      if (
        dist < bestDist ||
        (dist === bestDist && sev > bestSeverity)
      ) {
        bestDist = dist;
        bestLevel = level;
        bestSeverity = sev;
      }
    }
  }

  return bestLevel;
};

export const maxConcern = (...levels) => {
  return levels.reduce((best, level) => {
    if (!level || level === CONCERN_LEVELS.NA) return best;
    if (!best || best === CONCERN_LEVELS.NA) return level;
    return SEVERITY_RANK[level] > SEVERITY_RANK[best] ? level : best;
  }, CONCERN_LEVELS.NA);
};

export const getConcernMeta = (level) =>
  CONCERN_META[level] || CONCERN_META[CONCERN_LEVELS.NA];

export const getEscalation = (level) =>
  ESCALATION_PROTOCOL[level] || ESCALATION_PROTOCOL[CONCERN_LEVELS.NORMAL];

/**
 * Build flagged vitals summary from a prescription vitals object.
 */
export const buildVitalsFlags = (vitals = {}) => {
  const bmi = calculateBMI(vitals.weight, vitals.height);
  const systolic = getConcernLevel("bpSystolic", vitals.bpSystolic);
  const diastolic = getConcernLevel("bpDiastolic", vitals.bpDiastolic);

  const items = [
    {
      key: "bpSystolic",
      label: "BP – Systolic",
      unit: "mmHg",
      display: vitals.bpSystolic ?? null,
      level: systolic,
    },
    {
      key: "bpDiastolic",
      label: "BP – Diastolic",
      unit: "mmHg",
      display: vitals.bpDiastolic ?? null,
      level: diastolic,
    },
    {
      key: "glucose",
      label: "Blood Sugar",
      unit: "mg/dL",
      display: vitals.glucose ?? null,
      level: getConcernLevel("glucose", vitals.glucose),
    },
    {
      key: "haemoglobin",
      label: "Haemoglobin",
      unit: "g/dL",
      display: vitals.haemoglobin ?? null,
      level: getConcernLevel("haemoglobin", vitals.haemoglobin),
    },
    {
      key: "temperature",
      label: "Temperature",
      unit: "°F",
      display: vitals.temperature ?? null,
      level: getConcernLevel("temperature", vitals.temperature),
    },
    {
      key: "pulse",
      label: "Pulse",
      unit: "bpm",
      display: vitals.pulseRate ?? null,
      level: getConcernLevel("pulse", vitals.pulseRate),
    },
    {
      key: "spo2",
      label: "SpO2",
      unit: "%",
      display: vitals.spo2 ?? null,
      level: getConcernLevel("spo2", vitals.spo2),
    },
    {
      key: "weight",
      label: "Weight",
      unit: "kg",
      display: vitals.weight ?? null,
      level: vitals.weight ? CONCERN_LEVELS.NORMAL : CONCERN_LEVELS.NA,
      recordedOnly: true,
    },
    {
      key: "height",
      label: "Height",
      unit: "cm",
      display: vitals.height ?? null,
      level: vitals.height ? CONCERN_LEVELS.NORMAL : CONCERN_LEVELS.NA,
      recordedOnly: true,
    },
    {
      key: "bmi",
      label: "BMI",
      unit: "kg/m²",
      display: bmi,
      level: getConcernLevel("bmi", bmi),
    },
  ];

  const scored = items.filter((i) => !i.recordedOnly);
  const highest = scored.reduce(
    (best, item) => maxConcern(best, item.level),
    CONCERN_LEVELS.NA,
  );

  const concerns = scored.filter(
    (i) =>
      i.level !== CONCERN_LEVELS.NORMAL && i.level !== CONCERN_LEVELS.NA,
  );

  return {
    items,
    bmi,
    highest,
    concerns,
    escalation: getEscalation(
      highest === CONCERN_LEVELS.NA ? CONCERN_LEVELS.NORMAL : highest,
    ),
  };
};
