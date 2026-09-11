export const getOpdArray = (opdData) => {
return opdData?.data ?? [];
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

export const getOpdDashboardData = (opdData, period) => {
const opdRecords = getOpdArray(opdData);
const now = new Date();

let currentOpdCount = 0;

if (period === "day") {
currentOpdCount = opdRecords.filter((record) =>
isSameDay(new Date(record.AddedDate), now)
).length;
}

if (period === "month") {
currentOpdCount = opdRecords.filter((record) =>
isSameMonth(new Date(record.AddedDate), now)
).length;
}

if (period === "year") {
currentOpdCount = opdRecords.filter((record) =>
isSameYear(new Date(record.AddedDate), now)
).length;
}

return {
totalOpdVisits: opdRecords.length,
currentOpdCount,
};
};
