export const getAmbulanceArray = (ambulanceData) => {
  return ambulanceData?.data ?? [];
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

export const getAmbulanceDashboardData = (ambulanceData, period) => {
  const ambulanceServices = getAmbulanceArray(ambulanceData);

  const now = new Date();

  let currentAmbulanceCount = 0;
  let previousAmbulanceCount = 0;

  if (period === "day") {
    const previousDay = new Date(now);
    previousDay.setDate(now.getDate() - 1);

    currentAmbulanceCount = ambulanceServices.filter((service) =>
      isSameDay(new Date(service.createdAt), now),
    ).length;

    previousAmbulanceCount = ambulanceServices.filter((service) =>
      isSameDay(new Date(service.createdAt), previousDay),
    ).length;
  }

  if (period === "month") {
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    currentAmbulanceCount = ambulanceServices.filter((service) =>
      isSameMonth(new Date(service.createdAt), now),
    ).length;

    previousAmbulanceCount = ambulanceServices.filter((service) =>
      isSameMonth(new Date(service.createdAt), previousMonth),
    ).length;
  }

  if (period === "year") {
    const previousYear = new Date(now.getFullYear() - 1, 0, 1);

    currentAmbulanceCount = ambulanceServices.filter((service) =>
      isSameYear(new Date(service.createdAt), now),
    ).length;

    previousAmbulanceCount = ambulanceServices.filter((service) =>
      isSameYear(new Date(service.createdAt), previousYear),
    ).length;
  }

  return {
    totalAmbulanceDispatches:
      ambulanceData?.pagination?.totalRecords ?? ambulanceServices.length,

    currentAmbulanceCount,

    previousAmbulanceCount,
  };
};
