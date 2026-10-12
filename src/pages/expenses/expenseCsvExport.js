import { amountFromInput, monthRowTotal, rowTotalCategoryMonth } from './expenseGridUtils';

const escapeCsv = (value) => {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const rowToCsv = (cells) => cells.map(escapeCsv).join(',');

export const downloadCsvFile = (filename, csvContent) => {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const numCell = (raw) => {
  const n = amountFromInput(raw);
  return n === 0 ? '0' : String(n);
};

export const buildSheetCsv = (definition, state) => {
  if (!definition || !state?.grid) return '';

  const lines = [];

  switch (definition.layout) {
    case 'category_by_month': {
      const header = [
        definition.row_label_header || 'Categories',
        ...definition.periods.map((p) => p.label),
        'Total',
      ];
      if (definition.remarks_per_row) header.push('Remarks');
      lines.push(rowToCsv(header));

      definition.categories.forEach((cat) => {
        const row = [
          cat.label,
          ...definition.periods.map((p) =>
            numCell(state.grid[cat.line_code]?.[p.period_month]),
          ),
          String(rowTotalCategoryMonth(definition, state.grid, cat.line_code)),
        ];
        if (definition.remarks_per_row) {
          row.push(state.remarks?.[cat.line_code] || '');
        }
        lines.push(rowToCsv(row));
      });

      const totalRow = [
        'Total',
        ...definition.periods.map((p) => {
          const sum = definition.categories.reduce(
            (s, cat) => s + amountFromInput(state.grid[cat.line_code]?.[p.period_month]),
            0,
          );
          return String(sum);
        }),
        String(
          definition.categories.reduce(
            (s, cat) => s + rowTotalCategoryMonth(definition, state.grid, cat.line_code),
            0,
          ),
        ),
      ];
      if (definition.remarks_per_row) totalRow.push('');
      lines.push(rowToCsv(totalRow));
      break;
    }

    case 'month_by_category': {
      lines.push(
        rowToCsv([
          definition.row_label_header || 'Month',
          ...definition.columns.map((c) => c.label),
          'Total',
        ]),
      );
      definition.periods.forEach((p) => {
        lines.push(
          rowToCsv([
            p.label,
            ...definition.columns.map((col) =>
              numCell(state.grid[p.period_month]?.[col.line_code]),
            ),
            String(monthRowTotal(definition, state.grid, p.period_month)),
          ]),
        );
      });
      break;
    }

    case 'person_by_month': {
      lines.push(
        rowToCsv([
          'Name',
          'Subcategory',
          'Category',
          ...definition.periods.map((p) => p.label),
          'Total',
        ]),
      );
      (state.people || []).forEach((person) => {
        const id = person.person_id || person.id;
        const total = definition.periods.reduce(
          (s, p) => s + amountFromInput(state.grid[id]?.[p.period_month]),
          0,
        );
        lines.push(
          rowToCsv([
            person.name,
            person.subcategory || '',
            person.category || '',
            ...definition.periods.map((p) => numCell(state.grid[id]?.[p.period_month])),
            String(total),
          ]),
        );
      });
      break;
    }

    case 'vendor_month_blocks': {
      const blockHeaders = definition.vendor_blocks.flatMap((block) =>
        definition.block_fields.map((f) => `${block.label} - ${f.label}`),
      );
      lines.push(rowToCsv([definition.row_label_header || 'Month', ...blockHeaders, 'Total']));

      definition.periods.forEach((p) => {
        const cells = [];
        definition.vendor_blocks.forEach((block) => {
          definition.block_fields.forEach((f) => {
            cells.push(numCell(state.grid[p.period_month]?.[block.block_code]?.[f.field]));
          });
        });
        let rowSum = 0;
        definition.vendor_blocks.forEach((block) => {
          definition.block_fields.forEach((f) => {
            rowSum += amountFromInput(state.grid[p.period_month]?.[block.block_code]?.[f.field]);
          });
        });
        lines.push(rowToCsv([p.label, ...cells, String(rowSum)]));
      });
      break;
    }

    default:
      lines.push('No export layout defined');
  }

  return lines.join('\r\n');
};

export const exportSheetToCsv = (definition, state, filenameBase) => {
  const csv = buildSheetCsv(definition, state);
  const safeName = (filenameBase || definition.module_title || definition.report_type)
    .replace(/[^a-z0-9-_]+/gi, '_')
    .replace(/_+/g, '_');
  const date = new Date().toISOString().slice(0, 10);
  downloadCsvFile(`${safeName}_${date}.csv`, csv);
};
