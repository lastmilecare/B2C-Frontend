const STANDARD_COMPLAINTS = {
  Fever: ["fever", "high fever", "viral fever", "dengue fever"],

  Cough: ["cough", "dry cough", "productive cough"],

  Headache: ["headache", "head pain", "migraine"],

  Fatigue: ["fatigue", "weakness", "tiredness"],

  Vomiting: ["vomiting", "emesis"],

  Nausea: ["nausea", "nauseous"],

  "Abdominal Pain": ["abdominal pain", "stomach pain", "stomach ache"],

  "Back Pain": ["back pain", "lower back pain", "lumbar pain"],

  "Chest Pain": ["chest pain", "chest discomfort"],

  Injury: ["injury", "workplace injury", "trauma"],

  Diarrhea: [
    "diarrhea",
    "loose motion",
    "loose motions",
    "loose stool",
    "loose stools",
  ],
};

const STANDARD_COMPLAINT_LABELS = [
  ...Object.keys(STANDARD_COMPLAINTS),
  "Other",
];

export const getPrescriptionArray = (prescriptionData) => {
  return prescriptionData?.data ?? [];
};

export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isSameMonth = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

export const isSameYear = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear();
};

const getPrescriptionTrend = (prescriptions, period) => {
  const now = new Date();

  const labels = [];
  const counts = [];

  if (period === "day") {
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);

      labels.push(
        targetDate.toLocaleDateString("en-US", {
          weekday: "short",
        }),
      );

      const count = prescriptions.filter((prescription) => {
        const date = new Date(prescription.addedDate);

        return (
          date.getFullYear() === targetDate.getFullYear() &&
          date.getMonth() === targetDate.getMonth() &&
          date.getDate() === targetDate.getDate()
        );
      }).length;

      counts.push(count);
    }
  }

  if (period === "month") {
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      labels.push(
        targetDate.toLocaleDateString("en-US", {
          month: "short",
        }),
      );

      const count = prescriptions.filter((prescription) => {
        const date = new Date(prescription.addedDate);

        return (
          date.getFullYear() === targetDate.getFullYear() &&
          date.getMonth() === targetDate.getMonth()
        );
      }).length;

      counts.push(count);
    }
  }

  if (period === "year") {
    for (let i = 4; i >= 0; i--) {
      const targetYear = now.getFullYear() - i;

      labels.push(String(targetYear));

      const count = prescriptions.filter((prescription) => {
        const date = new Date(prescription.addedDate);

        return date.getFullYear() === targetYear;
      }).length;

      counts.push(count);
    }
  }

  return {
    labels,
    counts,
  };
};

const normalizeComplaint = (complaint) => {
  const normalizedComplaint = complaint.trim().toLowerCase();

  if (!normalizedComplaint) {
    return "Other";
  }

  for (const [standardLabel, keywords] of Object.entries(STANDARD_COMPLAINTS)) {
    const matched = keywords.some((keyword) =>
      normalizedComplaint.includes(keyword.toLowerCase()),
    );

    if (matched) {
      return standardLabel;
    }
  }

  return "Other";
};

export const getChiefComplaintsData = (prescriptionData) => {
  const prescriptions = getPrescriptionArray(prescriptionData);

  const complaintCounts = Object.fromEntries(
    STANDARD_COMPLAINT_LABELS.map((label) => [label, 0]),
  );

  prescriptions.forEach((prescription) => {
    const chiefComplaints = prescription?.chiefComplaints;

    if (!chiefComplaints?.trim()) {
      return;
    }

    const complaints = chiefComplaints
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    complaints.forEach((complaint) => {
      const standardComplaint = normalizeComplaint(complaint);

      complaintCounts[standardComplaint] += 1;
    });
  });

  const labels = STANDARD_COMPLAINT_LABELS;

  const values = labels.map((label) => complaintCounts[label]);

  const total = values.reduce((sum, value) => sum + value, 0);

  const percentages = values.map((value) =>
    total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
  );

  return {
    labels,
    values,
    percentages,
    total,
  };
};

export const getPrescriptionDashboardData = (prescriptionData, period) => {
  const prescriptions = getPrescriptionArray(prescriptionData);
  const now = new Date();

  let currentPrescriptions = 0;
  let previousPrescriptions = 0;

  if (period === "day") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    currentPrescriptions = prescriptions.filter((prescription) =>
      isSameDay(new Date(prescription.addedDate), now),
    ).length;

    previousPrescriptions = prescriptions.filter((prescription) =>
      isSameDay(new Date(prescription.addedDate), yesterday),
    ).length;
  }

  if (period === "month") {
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    currentPrescriptions = prescriptions.filter((prescription) =>
      isSameMonth(new Date(prescription.addedDate), now),
    ).length;

    previousPrescriptions = prescriptions.filter((prescription) =>
      isSameMonth(new Date(prescription.addedDate), previousMonth),
    ).length;
  }

  if (period === "year") {
    const previousYear = new Date(now.getFullYear() - 1, 0, 1);

    currentPrescriptions = prescriptions.filter((prescription) =>
      isSameYear(new Date(prescription.addedDate), now),
    ).length;

    previousPrescriptions = prescriptions.filter((prescription) =>
      isSameYear(new Date(prescription.addedDate), previousYear),
    ).length;
  }

  const trend = getPrescriptionTrend(prescriptions, period);

  return {
    totalPrescriptions:
      prescriptionData?.pagination?.totalRecords ?? prescriptions.length,

    currentPrescriptions,
    previousPrescriptions,

    trend,
  };
};
