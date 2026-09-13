export const getFitnessCertificateArray = (fitnessCertificateData) => {
  return Array.isArray(fitnessCertificateData)
    ? fitnessCertificateData
    : (fitnessCertificateData?.data ?? []);
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

const getFitnessCertificateTrend = (certificates, period) => {
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

      const count = certificates.filter((certificate) => {
        const date = new Date(certificate.created_at);

        return isSameDay(date, targetDate);
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

      const count = certificates.filter((certificate) => {
        const date = new Date(certificate.created_at);

        return isSameMonth(date, targetDate);
      }).length;

      counts.push(count);
    }
  }

  if (period === "year") {
    for (let i = 4; i >= 0; i--) {
      const targetYear = now.getFullYear() - i;

      labels.push(String(targetYear));

      const count = certificates.filter((certificate) => {
        const date = new Date(certificate.created_at);

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

export const getFitnessCertificateDashboardData = (
  fitnessCertificateData,
  period,
) => {
  const certificates = getFitnessCertificateArray(
    fitnessCertificateData,
  ).filter((certificate) => certificate.is_deleted !== true);

  const now = new Date();

  let currentCertificateCount = 0;
  let previousCertificateCount = 0;

  if (period === "day") {
    const previousDay = new Date(now);
    previousDay.setDate(now.getDate() - 1);

    currentCertificateCount = certificates.filter((certificate) =>
      isSameDay(new Date(certificate.created_at), now),
    ).length;

    previousCertificateCount = certificates.filter((certificate) =>
      isSameDay(new Date(certificate.created_at), previousDay),
    ).length;
  }

  if (period === "month") {
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    currentCertificateCount = certificates.filter((certificate) =>
      isSameMonth(new Date(certificate.created_at), now),
    ).length;

    previousCertificateCount = certificates.filter((certificate) =>
      isSameMonth(new Date(certificate.created_at), previousMonth),
    ).length;
  }

  if (period === "year") {
    const previousYear = new Date(now.getFullYear() - 1, 0, 1);

    currentCertificateCount = certificates.filter((certificate) =>
      isSameYear(new Date(certificate.created_at), now),
    ).length;

    previousCertificateCount = certificates.filter((certificate) =>
      isSameYear(new Date(certificate.created_at), previousYear),
    ).length;
  }

  return {
    totalFitnessCertificates: certificates.length,

    currentCertificateCount,
    previousCertificateCount,

    trend: getFitnessCertificateTrend(certificates, period),
  };
};
