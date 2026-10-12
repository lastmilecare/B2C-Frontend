import { useCallback } from 'react';
import { buildEffectiveDefinition, extractPeriodsFromCells } from './expenseDefinitionMerge';
import { hydrateSheetState, syncGridToDefinition } from './expenseGridUtils';
import { exportSheetToCsv } from './expenseCsvExport';
import { getSheetDefinition } from './expenseSheetDefinitions';

/**
 * Export from API-loaded sheet (list / report) without opening the form.
 */
export const sheetDataToExportState = (reportType, sheetData) => {
  const base = getSheetDefinition(reportType);
  if (!base || !sheetData) return null;
  const effective = buildEffectiveDefinition(base, {
    custom: sheetData.custom,
    cellPeriods: extractPeriodsFromCells(sheetData.cells),
  });
  const hydrated = hydrateSheetState(effective, sheetData);
  const state = syncGridToDefinition(hydrated, effective);
  return { definition: effective, state };
};

export const useExportExpenseCsvFromApi = (reportType, sheetData) => {
  return useCallback(() => {
    const packed = sheetDataToExportState(reportType, sheetData);
    if (!packed) return false;
    exportSheetToCsv(packed.definition, packed.state);
    return true;
  }, [reportType, sheetData]);
};
