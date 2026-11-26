import React, { useMemo } from "react";
import {
  buildVitalsFlags,
  getConcernMeta,
  maxConcern,
  CONCERN_LEVELS,
} from "../../utils/healthFlags";
import { formatDate, formatDateTime2 } from "../../utils/helper";

const visitLabel = (visitDate) => {
  if (!visitDate) return null;
  // Show date+time so same-day revisits are distinguishable
  try {
    return formatDateTime2(visitDate);
  } catch {
    return formatDate(visitDate);
  }
};

const StatusBadge = ({ level, recordedOnly }) => {
  if (recordedOnly && level !== CONCERN_LEVELS.NA) {
    return (
      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        Recorded
      </span>
    );
  }
  const meta = getConcernMeta(level) || getConcernMeta(CONCERN_LEVELS.NA);
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

const formatReading = (item) => {
  if (item.display == null || item.display === "") return "—";
  return `${item.display}${item.unit ? ` ${item.unit}` : ""}`;
};

const emptyItem = (template) => ({
  ...template,
  display: null,
  level: CONCERN_LEVELS.NA,
});

/**
 * Previous + current visit vitals comparison with health flags & escalation.
 * Shows an empty first-visit table when UHID has no prescription vitals yet.
 */
const PreviousVisitHealthSummary = ({ previous, current, isLoading }) => {
  const emptyTemplateFlags = useMemo(() => buildVitalsFlags({}), []);

  const previousFlags = useMemo(
    () => (previous ? buildVitalsFlags(previous) : null),
    [previous],
  );
  const currentFlags = useMemo(
    () => (current ? buildVitalsFlags(current) : null),
    [current],
  );

  const comparisonKeys = (
    previousFlags?.items ||
    currentFlags?.items ||
    emptyTemplateFlags.items ||
    []
  ).filter((item) => item.key !== "bmi");

  if (isLoading) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 text-sm text-slate-600">
          Loading Visit Health Summary…
        </div>
      </section>
    );
  }

  const filterWithoutBmi = (flags) => {
    if (!flags) return null;
    const items = flags.items.filter((i) => i.key !== "bmi");
    const concerns = (flags.concerns || []).filter((c) => c.key !== "bmi");
    const highest = items
      .filter((i) => !i.recordedOnly)
      .reduce(
        (best, item) => maxConcern(best, item.level),
        CONCERN_LEVELS.NA,
      );
    return { ...flags, items, concerns, highest };
  };

  const previousFlagsNoBmi = filterWithoutBmi(previousFlags);
  const currentFlagsNoBmi = filterWithoutBmi(currentFlags);

  const highest = maxConcern(
    previousFlagsNoBmi?.highest || CONCERN_LEVELS.NA,
    currentFlagsNoBmi?.highest || CONCERN_LEVELS.NA,
  );

  // Side-by-side concern rows: one parameter per row (Previous | Current)
  const concernKeys = Array.from(
    new Set([
      ...(previousFlagsNoBmi?.concerns || []).map((c) => c.key),
      ...(currentFlagsNoBmi?.concerns || []).map((c) => c.key),
    ]),
  );
  const concernRows = concernKeys
    .map((key) => {
      const prevItem =
        previousFlagsNoBmi?.items?.find((i) => i.key === key) || null;
      const currItem =
        currentFlagsNoBmi?.items?.find((i) => i.key === key) || null;
      const label = prevItem?.label || currItem?.label || key;
      const prevIsConcern =
        prevItem &&
        !prevItem.recordedOnly &&
        prevItem.level !== CONCERN_LEVELS.NORMAL &&
        prevItem.level !== CONCERN_LEVELS.NA;
      const currIsConcern =
        currItem &&
        !currItem.recordedOnly &&
        currItem.level !== CONCERN_LEVELS.NORMAL &&
        currItem.level !== CONCERN_LEVELS.NA;
      if (!prevIsConcern && !currIsConcern) return null;
      return { key, label, prevItem, currItem, prevIsConcern, currIsConcern };
    })
    .filter(Boolean);

  return (
    <section className="mt-6 space-y-4">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-sky-800">
              Visit Health Summary
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Previous Visit:{" "}
              <span className="font-medium text-slate-800">
                {previous?.visitDate
                  ? visitLabel(previous.visitDate)
                  : "None (first visit / no prior prescription vitals)"}
              </span>
              {" · "}
              Current Visit:{" "}
              {current?.visitDate ? (
                <span className="font-medium text-slate-800">
                  {visitLabel(current.visitDate)}
                </span>
              ) : (
                <span className="text-slate-500">
                  Vitals not recorded yet (complete prescription to capture)
                </span>
              )}
            </p>
          </div>
          {highest !== CONCERN_LEVELS.NA && <StatusBadge level={highest} />}
        </div>

        {previous && current && (
          <p className="mb-3 text-sm text-sky-800 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            Comparing last two prescription vitals
            {previous.visitDate ? ` (${visitLabel(previous.visitDate)}` : ""}
            {current.visitDate ? ` → ${visitLabel(current.visitDate)})` : ")"}.
            Same-day revisits are included.
          </p>
        )}
        {previous && !current && (
          <p className="mb-3 text-sm text-sky-800 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2">
            Previous readings are from the last OPD prescription (
            {previous.visitDate ? visitLabel(previous.visitDate) : "prior visit"}
            ). Current stays empty until today&apos;s prescription vitals are
            saved.
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-100 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">
                  Health Parameter
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Previous Reading
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Previous Status
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Current Reading
                </th>
                <th className="px-3 py-2 text-left font-semibold">
                  Current Status
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonKeys.map((baseItem) => {
                const prevItem = previousFlagsNoBmi
                  ? previousFlagsNoBmi.items.find(
                      (i) => i.key === baseItem.key,
                    ) || emptyItem(baseItem)
                  : emptyItem(baseItem);
                const currItem = currentFlagsNoBmi
                  ? currentFlagsNoBmi.items.find(
                      (i) => i.key === baseItem.key,
                    ) || emptyItem(baseItem)
                  : emptyItem(baseItem);

                const isAbnormal =
                  (prevItem.level !== CONCERN_LEVELS.NORMAL &&
                    prevItem.level !== CONCERN_LEVELS.NA &&
                    !prevItem.recordedOnly) ||
                  (currItem.level !== CONCERN_LEVELS.NORMAL &&
                    currItem.level !== CONCERN_LEVELS.NA &&
                    !currItem.recordedOnly);

                return (
                  <tr
                    key={baseItem.key}
                    className={`border-t border-sky-50 ${
                      isAbnormal ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {baseItem.label}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {previous ? formatReading(prevItem) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {previous ? (
                        <StatusBadge
                          level={prevItem.level}
                          recordedOnly={prevItem.recordedOnly}
                        />
                      ) : (
                        <StatusBadge level={CONCERN_LEVELS.NA} />
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {current ? formatReading(currItem) : "Not recorded"}
                    </td>
                    <td className="px-3 py-2">
                      {current ? (
                        <StatusBadge
                          level={currItem.level}
                          recordedOnly={currItem.recordedOnly}
                        />
                      ) : (
                        <StatusBadge level={CONCERN_LEVELS.NA} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!previous && current && (
          <p className="mt-3 text-xs text-slate-500">
            No older visit found. Showing today&apos;s prescription vitals under
            Current Visit.
          </p>
        )}
        {previous && !current && (
          <p className="mt-3 text-xs text-slate-500">
            Showing last recorded prescription vitals under Previous. Current
            stays empty until today&apos;s prescription vitals are saved.
          </p>
        )}

        {concernRows.length > 0 && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-3">
              Health Concerns
            </h4>
            <div className="overflow-x-auto rounded-xl border border-orange-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-orange-100 text-orange-900">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">
                      Parameter
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
                      colSpan={2}
                    >
                      Previous
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold"
                      colSpan={2}
                    >
                      Current
                    </th>
                  </tr>
                  <tr className="bg-orange-50 text-orange-800 text-xs">
                    <th className="px-3 py-1.5 text-left font-medium" />
                    <th className="px-3 py-1.5 text-left font-medium">
                      Reading
                    </th>
                    <th className="px-3 py-1.5 text-left font-medium">
                      Status
                    </th>
                    <th className="px-3 py-1.5 text-left font-medium">
                      Reading
                    </th>
                    <th className="px-3 py-1.5 text-left font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {concernRows.map((row) => (
                    <tr key={row.key} className="border-t border-orange-100">
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {row.label}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {row.prevIsConcern
                          ? formatReading(row.prevItem)
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {row.prevIsConcern ? (
                          <StatusBadge level={row.prevItem.level} />
                        ) : (
                          <StatusBadge level={CONCERN_LEVELS.NA} />
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {row.currIsConcern
                          ? formatReading(row.currItem)
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {row.currIsConcern ? (
                          <StatusBadge level={row.currItem.level} />
                        ) : (
                          <StatusBadge level={CONCERN_LEVELS.NA} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PreviousVisitHealthSummary;
