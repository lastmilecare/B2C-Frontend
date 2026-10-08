import { buildEffectivePeriods } from './expensePeriodUtils';

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

  const customCategories = custom.categories || [];
  const customColumns = custom.columns || [];

  if (baseDefinition.layout === 'category_by_month') {
    return {
      ...baseDefinition,
      periods,
      categories: [...(baseDefinition.categories || []), ...customCategories],
    };
  }

  if (baseDefinition.layout === 'month_by_category') {
    return {
      ...baseDefinition,
      periods,
      columns: [...(baseDefinition.columns || []), ...customColumns],
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
    if (c.period_month) set.add(c.period_month);
  });
  return Array.from(set);
};
