const getArray = (apiData) => apiData?.data ?? [];

/* ---------------- DATE HELPERS ---------------- */

const getDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (date, target) => {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
};

const isSameMonth = (date, target) => {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth()
  );
};

const isSameYear = (date, target) => {
  return date.getFullYear() === target.getFullYear();
};

/* ---------------- TIME BUCKETS ---------------- */

const getDayBuckets = () => {
  const buckets = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);

    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - i);

    buckets.push({
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      date,
    });
  }

  return buckets;
};

const getMonthBuckets = () => {
  const buckets = [];
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

    buckets.push({
      label: date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      date,
    });
  }

  return buckets;
};

const getYearBuckets = () => {
  const buckets = [];
  const currentYear = new Date().getFullYear();

  for (let i = 4; i >= 0; i--) {
    const date = new Date(currentYear - i, 0, 1);

    buckets.push({
      label: String(date.getFullYear()),
      date,
    });
  }

  return buckets;
};

/* ---------------- BUCKET MATCHING ---------------- */

const countByBuckets = (records, buckets, period, dateField) => {
  return buckets.map((bucket) => {
    return records.filter((record) => {
      const date = getDate(record?.[dateField]);

      if (!date) return false;

      if (period === "day") {
        return isSameDay(date, bucket.date);
      }

      if (period === "month") {
        return isSameMonth(date, bucket.date);
      }

      if (period === "year") {
        return isSameYear(date, bucket.date);
      }

      return false;
    }).length;
  });
};

/* ---------------- CARE FLOW ---------------- */

export const getCareFlowDashboardData = ({
  patientData,
  opdData,
  prescriptionData,
  period,
}) => {
  const patients = getArray(patientData);
  const opdRecords = getArray(opdData);
  const prescriptions = getArray(prescriptionData);

  let buckets = [];

  if (period === "day") {
    buckets = getDayBuckets();
  }

  if (period === "month") {
    buckets = getMonthBuckets();
  }

  if (period === "year") {
    buckets = getYearBuckets();
  }

  const registrations = countByBuckets(patients, buckets, period, "createdAt");

  const opdVisits = countByBuckets(opdRecords, buckets, period, "AddedDate");

  const prescriptionCounts = countByBuckets(
    prescriptions,
    buckets,
    period,
    "addedDate",
  );

  return {
    labels: buckets.map((bucket) => bucket.label),

    registrations,

    opdVisits,

    prescriptions: prescriptionCounts,  
  };
};
