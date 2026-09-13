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

const getAmbulanceTrend = (ambulanceServices, period) => {
  const now = new Date();

  const labels = [];
  const counts = [];

  // Last 7 days
  if (period === "day") {
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - i);

      labels.push(
        targetDate.toLocaleDateString("en-US", {
          weekday: "short",
        }),
      );

      const count = ambulanceServices.filter((service) => {
        const date = new Date(service.createdAt);

        return isSameDay(date, targetDate);
      }).length;

      counts.push(count);
    }
  }

  // Last 6 months
  if (period === "month") {
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      labels.push(
        targetDate.toLocaleDateString("en-US", {
          month: "short",
        }),
      );

      const count = ambulanceServices.filter((service) => {
        const date = new Date(service.createdAt);

        return isSameMonth(date, targetDate);
      }).length;

      counts.push(count);
    }
  }

  // Last 5 years
  if (period === "year") {
    for (let i = 4; i >= 0; i--) {
      const targetYear = now.getFullYear() - i;

      labels.push(String(targetYear));

      const count = ambulanceServices.filter((service) => {
        const date = new Date(service.createdAt);

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

  const trend = getAmbulanceTrend(ambulanceServices, period);

  return {
    totalAmbulanceDispatches:
      ambulanceData?.pagination?.totalRecords ?? ambulanceServices.length,

    currentAmbulanceCount,
    previousAmbulanceCount,

    trend,
  };
};
