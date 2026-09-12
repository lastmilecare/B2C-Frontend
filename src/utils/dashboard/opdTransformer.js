export const getOpdArray = (opdData) => {
  return opdData?.data ?? [];
};

const getRecordDate = (record) => {
  return new Date(record.AddedDate);
};

const isValidDate = (date) => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};
const getDayKey = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
};

const getMonthKey = (date) => {
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const getYearKey = (date) => {
  return String(date.getFullYear());
};
const getOpdTrend = (recordsWithVisitType, period) => {
  const now = new Date();

  const labels = [];
  const buckets = [];

  if (period === "day") {
    /*
     * Last 7 days including today
     */

    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i,
      );

      labels.push(
        date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
      );

      buckets.push({
        key: getDayKey(date),
        newPatients: 0,
        followUp: 0,
      });
    }

    recordsWithVisitType.forEach((record) => {
      const key = getDayKey(record.date);

      const bucket = buckets.find((item) => item.key === key);

      if (!bucket) return;

      if (record.visitType === "new") {
        bucket.newPatients += 1;
      } else {
        bucket.followUp += 1;
      }
    });
  }

  if (period === "month") {
    /*
     * Last 6 months including current month
     */

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      labels.push(
        date.toLocaleDateString("en-US", {
          month: "short",
        }),
      );

      buckets.push({
        key: getMonthKey(date),
        newPatients: 0,
        followUp: 0,
      });
    }

    recordsWithVisitType.forEach((record) => {
      const key = getMonthKey(record.date);

      const bucket = buckets.find((item) => item.key === key);

      if (!bucket) return;

      if (record.visitType === "new") {
        bucket.newPatients += 1;
      } else {
        bucket.followUp += 1;
      }
    });
  }

  if (period === "year") {
    /*
     * Last 5 years including current year
     */

    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear() - i, 0, 1);

      labels.push(String(date.getFullYear()));

      buckets.push({
        key: getYearKey(date),
        newPatients: 0,
        followUp: 0,
      });
    }

    recordsWithVisitType.forEach((record) => {
      const key = getYearKey(record.date);

      const bucket = buckets.find((item) => item.key === key);

      if (!bucket) return;

      if (record.visitType === "new") {
        bucket.newPatients += 1;
      } else {
        bucket.followUp += 1;
      }
    });
  }

  return {
    labels,
    newPatients: buckets.map((item) => item.newPatients),
    followUp: buckets.map((item) => item.followUp),
  };
};
export const getOpdDashboardData = (opdData, period) => {
  const opdRecords = getOpdArray(opdData)
    .filter((record) => record?.AddedDate)
    .map((record) => ({
      ...record,
      date: getRecordDate(record),
    }))
    .filter((record) => isValidDate(record.date));

  const now = new Date();

  /*
   * Sort oldest → newest.
   *
   * This is important because the first OPD record for a patient
   * will be treated as their "New Patient" visit.
   */
  const sortedRecords = [...opdRecords].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const seenPatients = new Set();

  const recordsWithVisitType = sortedRecords.map((record) => {
    const patientId = record.patient_id;

    const isNewPatient = !seenPatients.has(patientId);

    seenPatients.add(patientId);

    return {
      ...record,
      visitType: isNewPatient ? "new" : "followUp",
    };
  });
  const trend = getOpdTrend(recordsWithVisitType, period);
  /*
   * -----------------------------
   * CURRENT / PREVIOUS KPI COUNT
   * -----------------------------
   */

  let currentRecords = [];
  let previousRecords = [];

  if (period === "day") {
    const currentDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const previousDay = new Date(currentDay);
    previousDay.setDate(previousDay.getDate() - 1);

    currentRecords = recordsWithVisitType.filter((record) => {
      const date = record.date;

      return (
        date.getFullYear() === currentDay.getFullYear() &&
        date.getMonth() === currentDay.getMonth() &&
        date.getDate() === currentDay.getDate()
      );
    });

    previousRecords = recordsWithVisitType.filter((record) => {
      const date = record.date;

      return (
        date.getFullYear() === previousDay.getFullYear() &&
        date.getMonth() === previousDay.getMonth() &&
        date.getDate() === previousDay.getDate()
      );
    });
  }

  if (period === "month") {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

    currentRecords = recordsWithVisitType.filter((record) => {
      return (
        record.date.getFullYear() === currentYear &&
        record.date.getMonth() === currentMonth
      );
    });

    previousRecords = recordsWithVisitType.filter((record) => {
      return (
        record.date.getFullYear() === previousMonthDate.getFullYear() &&
        record.date.getMonth() === previousMonthDate.getMonth()
      );
    });
  }

  if (period === "year") {
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    currentRecords = recordsWithVisitType.filter(
      (record) => record.date.getFullYear() === currentYear,
    );

    previousRecords = recordsWithVisitType.filter(
      (record) => record.date.getFullYear() === previousYear,
    );
  }

  return {
    currentOpdCount: currentRecords.length,

    previousOpdCount: previousRecords.length,

    currentNewPatients: currentRecords.filter(
      (record) => record.visitType === "new",
    ).length,

    currentFollowUpPatients: currentRecords.filter(
      (record) => record.visitType === "followUp",
    ).length,

    previousNewPatients: previousRecords.filter(
      (record) => record.visitType === "new",
    ).length,

    previousFollowUpPatients: previousRecords.filter(
      (record) => record.visitType === "followUp",
    ).length,
    trend,
  };
};
