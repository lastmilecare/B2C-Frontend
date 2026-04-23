import { format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Kolkata";

export const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const zoned = toZonedTime(date, TIME_ZONE);
  return format(zoned, "yyyy-MM-dd");
};

export const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const zoned = toZonedTime(date, TIME_ZONE);
  return format(zoned, "HH:mm");
};

export const combineDateTime = (date, time) => {
  if (!date || !time) return null;

  const local = `${date}T${time}:00`;
  const utcDate = fromZonedTime(local, TIME_ZONE);

  return utcDate.toISOString();
};