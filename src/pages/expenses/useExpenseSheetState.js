import { useEffect, useMemo, useState } from 'react';
import { buildEffectiveDefinition, extractPeriodsFromCells } from './expenseDefinitionMerge';
import {
  buildSavePayload,
  hydrateSheetState,
  initEmptySheetState,
  syncGridToDefinition,
} from './expenseGridUtils';
import { nextPeriodAfterLatest, slugifyLineCode } from './expensePeriodUtils';
import { getSheetDefinition } from './expenseSheetDefinitions';

export const useExpenseSheetState = (reportType, sheetData, sheetLoading) => {
  const baseDefinition = getSheetDefinition(reportType);
  const [state, setState] = useState(null);

  useEffect(() => {
    if (!baseDefinition) return;
    if (sheetLoading) return;

    const cellPeriods = extractPeriodsFromCells(sheetData?.cells);
    const custom = sheetData?.custom || state?.custom;
    const effective = buildEffectiveDefinition(baseDefinition, { custom, cellPeriods });

    if (sheetData) {
      const hydrated = hydrateSheetState(effective, sheetData);
      setState(syncGridToDefinition(hydrated, effective));
      return;
    }

    setState((prev) => {
      if (prev) return syncGridToDefinition(prev, effective);
      return syncGridToDefinition(initEmptySheetState(effective), effective);
    });
  }, [baseDefinition, sheetData, sheetLoading]);

  const effectiveDefinition = useMemo(() => {
    if (!baseDefinition || !state) return baseDefinition;
    return buildEffectiveDefinition(baseDefinition, {
      custom: state.custom,
      cellPeriods: extractPeriodsFromCells(sheetData?.cells),
    });
  }, [baseDefinition, state?.custom, sheetData?.cells]);

  const grandTotal = useMemo(() => {
    if (!effectiveDefinition || !state?.grid) return 0;
    const payload = buildSavePayload(effectiveDefinition, state);
    return (payload.cells || []).reduce((s, c) => s + (Number(c.amount) || 0), 0);
  }, [effectiveDefinition, state]);

  const setStatus = (status) => setState((prev) => ({ ...prev, status }));

  const setCategoryCell = (lineCode, periodMonth, value) => {
    setState((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        [lineCode]: { ...prev.grid[lineCode], [periodMonth]: value },
      },
    }));
  };

  const setRemark = (lineCode, value) => {
    setState((prev) => ({
      ...prev,
      remarks: { ...prev.remarks, [lineCode]: value },
    }));
  };

  const setMonthCategoryCell = (periodMonth, lineCode, value) => {
    setState((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        [periodMonth]: { ...prev.grid[periodMonth], [lineCode]: value },
      },
    }));
  };

  const setPersonCell = (personId, periodMonth, value) => {
    setState((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        [personId]: { ...prev.grid[personId], [periodMonth]: value },
      },
    }));
  };

  const setVendorCell = (periodMonth, blockCode, field, value) => {
    setState((prev) => ({
      ...prev,
      grid: {
        ...prev.grid,
        [periodMonth]: {
          ...prev.grid[periodMonth],
          [blockCode]: {
            ...prev.grid[periodMonth][blockCode],
            [field]: value,
          },
        },
      },
    }));
  };

  const addNextMonth = () => {
    if (!effectiveDefinition) return;
    const next = nextPeriodAfterLatest(
      effectiveDefinition.periods,
      effectiveDefinition.period_format,
    );
    setState((prev) => {
      const custom = { ...prev.custom, periods: [...(prev.custom?.periods || []), next] };
      const effective = buildEffectiveDefinition(baseDefinition, { custom });
      return syncGridToDefinition({ ...prev, custom }, effective);
    });
  };

  const addCategoryRow = (label) => {
    const line_code = slugifyLineCode(label);
    const row = { line_code, label };
    setState((prev) => {
      const custom = {
        ...prev.custom,
        categories: [...(prev.custom?.categories || []), row],
      };
      const effective = buildEffectiveDefinition(baseDefinition, { custom });
      const remarks = { ...prev.remarks, [line_code]: '' };
      return syncGridToDefinition({ ...prev, custom, remarks }, effective);
    });
  };

  const addExpenseColumn = (label) => {
    const line_code = slugifyLineCode(label);
    const col = { line_code, label };
    setState((prev) => {
      const custom = {
        ...prev.custom,
        columns: [...(prev.custom?.columns || []), col],
      };
      const effective = buildEffectiveDefinition(baseDefinition, { custom });
      return syncGridToDefinition({ ...prev, custom }, effective);
    });
  };

  const addStaffRow = (name, subcategory = '', category = 'Salaries') => {
    const person_id = `p_${slugifyLineCode(name)}_${Date.now()}`;
    const person = {
      person_id,
      id: person_id,
      name,
      subcategory,
      category,
    };
    setState((prev) => {
      const custom = {
        ...prev.custom,
        people: [...(prev.custom?.people || []), person],
      };
      const people = [...(prev.people || []), person];
      const effective = buildEffectiveDefinition(baseDefinition, { custom });
      return syncGridToDefinition({ ...prev, custom, people }, effective);
    });
  };

  const resetGrid = () => {
    if (!baseDefinition) return;
    const effective = buildEffectiveDefinition(baseDefinition, {});
    setState(syncGridToDefinition(initEmptySheetState(effective), effective));
  };

  const savePayload =
    state && effectiveDefinition ? buildSavePayload(effectiveDefinition, state) : null;

  const periodRangeLabel = useMemo(() => {
    if (!effectiveDefinition?.periods?.length) return '';
    const first = effectiveDefinition.periods[0].label;
    const last = effectiveDefinition.periods[effectiveDefinition.periods.length - 1].label;
    return `${first} → ${last}`;
  }, [effectiveDefinition]);

  return {
    baseDefinition,
    effectiveDefinition,
    state,
    grandTotal,
    periodRangeLabel,
    setStatus,
    setCategoryCell,
    setRemark,
    setMonthCategoryCell,
    setPersonCell,
    setVendorCell,
    addNextMonth,
    addCategoryRow,
    addExpenseColumn,
    addStaffRow,
    resetGrid,
    savePayload,
    hasSavedData: Boolean(sheetData?.updated_at || sheetData?.cells?.length),
  };
};
