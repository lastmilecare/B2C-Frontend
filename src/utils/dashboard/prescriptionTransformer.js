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

export const getPrescriptionDashboardData = (prescriptionData, period) => {
  const prescriptions = getPrescriptionArray(prescriptionData);
debugger;
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

  return {
    totalPrescriptions:
      prescriptionData?.pagination?.totalRecords ?? prescriptions.length,

    currentPrescriptions,
    previousPrescriptions,
  };
};
