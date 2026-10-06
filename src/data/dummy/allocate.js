import dayjs from "dayjs";

export function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function spread(total, weights) {
  const safe = weights.map((weight) => Math.max(0, weight));
  const weightSum = sum(safe);
  if (!weightSum || !safe.length) return safe.map(() => 0);
  const raw = safe.map((weight) => Math.floor((total * weight) / weightSum));
  let remainder = total - sum(raw);
  const order = safe
    .map((weight, index) => [weight, index])
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  let cursor = 0;
  while (remainder > 0) {
    raw[order[cursor % order.length][1]] += 1;
    remainder -= 1;
    cursor += 1;
  }
  return raw;
}

export function monthSeries(start, values) {
  let cursor = dayjs(start);
  return values.map((value) => {
    const point = {
      iso: cursor.format("YYYY-MM-DD"),
      label: cursor.format("MMM YYYY"),
      value,
    };
    cursor = cursor.add(1, "month");
    return point;
  });
}

export function monthOverlaps(iso, range) {
  if (!range?.[0] || !range?.[1]) return true;
  const start = range[0].startOf("month").format("YYYY-MM-DD");
  const end = range[1].endOf("month").format("YYYY-MM-DD");
  return iso >= start && iso <= end;
}

export function yearOverlaps(year, range) {
  if (!range?.[0] || !range?.[1]) return true;
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const rangeStart = range[0].format("YYYY-MM-DD");
  const rangeEnd = range[1].format("YYYY-MM-DD");
  return !(end < rangeStart || start > rangeEnd);
}

export function reconcile(slices, total, nameKey = "name", valueKey = "value") {
  if (!slices.length) return [];
  const next = slices.map((slice) => ({ ...slice }));
  const drift = total - next.reduce((acc, slice) => acc + slice[valueKey], 0);
  next[next.length - 1][valueKey] += drift;
  return next;
}
