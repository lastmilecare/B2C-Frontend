import {
  buildEffectivePeriods,
  normalizePeriodMonth,
} from './expensePeriodUtils';

/**
 * Base sheet definition + dynamic periods/lines (future-proof).
 */
export const buildEffectiveDefinition = (baseDefinition, options = {}) => {
  if (!baseDefinition) return null;

  const {
    custom = {},
    cellPeriods = [],
    monthsPast,
    monthsFuture,
  } = options;

  const periodFormat = baseDefinition.period_format || 'yy_mon';
  const periods = buildEffectivePeriods(baseDefinition.periods, periodFormat, {
    customPeriods: custom.periods || [],
    cellPeriods,
    monthsPast,
    monthsFuture,
  });

  const mergeLines = (seed = [], extra = []) => {
    const map = new Map();
    seed.forEach((row) => map.set(row.line_code, row));
    extra.forEach((row) => {
      if (row?.line_code) map.set(row.line_code, { ...map.get(row.line_code), ...row });
    });
    return Array.from(map.values());
  };

  const customCategories = custom.categories || [];
  const customColumns = custom.columns || [];

  if (baseDefinition.layout === 'category_by_month') {
    return {
      ...baseDefinition,
      periods,
      categories: mergeLines(baseDefinition.categories, customCategories),
    };
  }

  if (baseDefinition.layout === 'month_by_category') {
    return {
      ...baseDefinition,
      periods,
      columns: mergeLines(baseDefinition.columns, customColumns),
    };
  }

  if (baseDefinition.layout === 'person_by_month') {
    return {
      ...baseDefinition,
      periods,
      // people list lives in state.people + custom.people
    };
  }

  if (baseDefinition.layout === 'vendor_month_blocks') {
    return {
      ...baseDefinition,
      periods,
    };
  }

  return { ...baseDefinition, periods };
};

export const extractPeriodsFromCells = (cells = []) => {
  const set = new Set();
  cells.forEach((c) => {
    const key = normalizePeriodMonth(c.period_month);
    if (key) set.add(key);
  });
  return Array.from(set);
};
