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

export const getPatientDashboardData = (patientData, period) => {
  const patients = getPatientsArray(patientData);

  const now = new Date();

  let currentRegistrations = 0;
  let previousRegistrations = 0;

  if (period === "day") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    currentRegistrations = patients.filter((patient) =>
      isSameDay(new Date(patient.createdAt), now)
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameDay(new Date(patient.createdAt), yesterday)
    ).length;
  }

  if (period === "month") {
    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    currentRegistrations = patients.filter((patient) =>
      isSameMonth(new Date(patient.createdAt), now)
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameMonth(new Date(patient.createdAt), previousMonth)
    ).length;
  }

  if (period === "year") {
    const previousYear = new Date(
      now.getFullYear() - 1,
      0,
      1
    );

    currentRegistrations = patients.filter((patient) =>
      isSameYear(new Date(patient.createdAt), now)
    ).length;

    previousRegistrations = patients.filter((patient) =>
      isSameYear(new Date(patient.createdAt), previousYear)
    ).length;
  }

  return {
    registeredWorkers:
      patientData?.pagination?.totalRecords ?? patients.length,

    currentRegistrations,

    previousRegistrations,
  };
};