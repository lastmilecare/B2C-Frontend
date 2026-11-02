import { useEffect, useMemo, useState } from "react";
import {
  buildEffectiveDefinition,
  extractPeriodsFromCells,
} from "./expenseDefinitionMerge";
import {
  buildSavePayload,
  grandTotalFromSheetCells,
  hydrateSheetState,
  initEmptySheetState,
  syncGridToDefinition,
  syncMonthCategoryPeriodRow,
  syncVendorBlockShare,
} from "./expenseGridUtils";
import {
  nextPeriodAfterLatest,
  normalizePeriodMonth,
  slugifyLineCode,
} from "./expensePeriodUtils";
import { getSheetDefinition } from "./expenseSheetDefinitions";

const emptyCustom = () => ({
  periods: [],
  categories: [],
  columns: [],
  people: [],
});

export const useExpenseSheetState = (
  reportType,
  sheetData,
  { isLoading, isFetching, isSuccess, isError },
) => {
  const baseDefinition = getSheetDefinition(reportType);
  const [state, setState] = useState(null);

  useEffect(() => {
    setState(null);
  }, [reportType]);

  useEffect(() => {
    if (!baseDefinition) return;
    const fetchSettled = !isLoading && !isFetching;
    if (!fetchSettled) return;

    const canHydrateFromApi =
      sheetData &&
      (isSuccess ||
        Boolean(sheetData.updated_at) ||
        (Array.isArray(sheetData.cells) && sheetData.cells.length > 0));

    if (canHydrateFromApi) {
      const cellPeriods = extractPeriodsFromCells(sheetData.cells);
      const custom = sheetData.custom || emptyCustom();
      const effective = buildEffectiveDefinition(baseDefinition, {
        custom,
        cellPeriods,
      });
      const hydrated = hydrateSheetState(effective, sheetData);
      setState(syncGridToDefinition(hydrated, effective));
      return;
    }

    const effective = buildEffectiveDefinition(baseDefinition, {});
    setState(syncGridToDefinition(initEmptySheetState(effective), effective));
  }, [baseDefinition, sheetData, isLoading, isFetching, isSuccess, isError]);

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
    return grandTotalFromSheetCells(effectiveDefinition, payload.cells);
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
    setState((prev) => {
      if (!baseDefinition) return prev;
      const effective = buildEffectiveDefinition(baseDefinition, {
        custom: prev.custom,
        cellPeriods: extractPeriodsFromCells(sheetData?.cells),
      });
      const col = effective.columns?.find((c) => c.line_code === lineCode);
      if (col?.computed) return prev;
      const periodRow = syncMonthCategoryPeriodRow(effective, {
        ...(prev.grid[periodMonth] || {}),
        [lineCode]: value,
      });
      return {
        ...prev,
        grid: { ...prev.grid, [periodMonth]: periodRow },
      };
    });
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
    if (field === "share") return;
    setState((prev) => {
      const periodRow = { ...(prev.grid[periodMonth] || {}) };
      const blockCells = syncVendorBlockShare({
        ...(periodRow[blockCode] || {}),
        [field]: value,
      });
      return {
        ...prev,
        grid: {
          ...prev.grid,
          [periodMonth]: {
            ...periodRow,
            [blockCode]: blockCells,
          },
        },
      };
    });
  };

  const addNextMonth = () => {
    if (!effectiveDefinition) return;
    const next = nextPeriodAfterLatest(
      effectiveDefinition.periods,
      effectiveDefinition.period_format,
    );
    const nextKey = normalizePeriodMonth(next.period_month);
    setState((prev) => {
      const existing = prev.custom?.periods || [];
      if (
        existing.some((p) => normalizePeriodMonth(p.period_month) === nextKey)
      ) {
        return prev;
      }
      const custom = { ...prev.custom, periods: [...existing, next] };
      const effective = buildEffectiveDefinition(baseDefinition, {
        custom,
        cellPeriods: extractPeriodsFromCells(sheetData?.cells),
      });
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
      const remarks = { ...prev.remarks, [line_code]: "" };
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

  const addStaffRow = (name, subcategory = "", category = "Salaries") => {
    const person_id = `p_${slugifyLineCode(name)}_${Date.now()}`;
    const person = {
      person_id,
      id: person_id,
      name,
      subcategory,
      category,
    };
    setState((prev) => {
      const people = [...(prev.people || []), person];
      const custom = { ...prev.custom, people: [] };
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
    state && effectiveDefinition
      ? buildSavePayload(effectiveDefinition, state)
      : null;

  const periodRangeLabel = useMemo(() => {
    if (!effectiveDefinition?.periods?.length) return "";
    const first = effectiveDefinition.periods[0].label;
    const last =
      effectiveDefinition.periods[effectiveDefinition.periods.length - 1].label;
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
