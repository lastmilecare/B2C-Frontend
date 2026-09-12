export const getPatientsArray = (patientData) => {
  return patientData?.data ?? [];
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
export const getWorkersVisitedSeries = (patients, period, now = new Date()) => {
  if (period === "day") {
    const result = [];

    // Last 7 days, oldest → newest
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);

      targetDate.setDate(now.getDate() - i);

      const count = patients.filter((patient) => {
        const createdDate = new Date(patient.createdAt);

        return isSameDay(createdDate, targetDate);
      }).length;

      result.push(count);
    }

    return result;
  }

  if (period === "month") {
    const result = [];

    // Last 6 months, oldest → newest
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const count = patients.filter((patient) => {
        const createdDate = new Date(patient.createdAt);

        return isSameMonth(createdDate, targetDate);
      }).length;

      result.push(count);
    }

    return result;
  }

  if (period === "year") {
    const result = [];

    // Last 5 years, oldest → newest
    for (let i = 4; i >= 0; i--) {
      const targetYear = now.getFullYear() - i;

      const count = patients.filter((patient) => {
        const createdDate = new Date(patient.createdAt);

        return createdDate.getFullYear() === targetYear;
      }).length;

      result.push(count);
    }

    return result;
  }

  return [];
};
export const getPatientDashboardData = (patientData, period) => {
  const patients = getPatientsArray(patientData);

  const now = new Date();

  let currentRegistrations = 0;
  let previousRegistrations = 0;

  if (period === "day") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    currentRegistrations = patients.filter((patient) =>
      isSameDay(new Date(patient.createdAt), now),
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameDay(new Date(patient.createdAt), yesterday),
    ).length;
  }

  if (period === "month") {
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    currentRegistrations = patients.filter((patient) =>
      isSameMonth(new Date(patient.createdAt), now),
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameMonth(new Date(patient.createdAt), previousMonth),
    ).length;
  }

  if (period === "year") {
    const previousYear = new Date(now.getFullYear() - 1, 0, 1);

    currentRegistrations = patients.filter((patient) =>
      isSameYear(new Date(patient.createdAt), now),
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameYear(new Date(patient.createdAt), previousYear),
    ).length;
  }
  const workersVisited = getWorkersVisitedSeries(patients, period, now);
  return {
    registeredWorkers: patientData?.pagination?.totalRecords ?? patients.length,

    currentRegistrations,

    previousRegistrations,
    workersVisitedSeries: workersVisited,
  };
};
