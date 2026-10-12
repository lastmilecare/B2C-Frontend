export const parseAmountInput = (value) => value.replace(/[^0-9.-]/g, "");

export const amountFromInput = (value) => {
  if (value === "" || value === undefined || value === null) return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const emptyCategoryByMonthGrid = (definition) => {
  const grid = {};
  const remarks = {};
  definition.categories.forEach((cat) => {
    grid[cat.line_code] = {};
    remarks[cat.line_code] = "";
    definition.periods.forEach((p) => {
      grid[cat.line_code][p.period_month] = "";
    });
  });
  return { grid, remarks };
};

export const emptyMonthByCategoryGrid = (definition) => {
  const grid = {};
  definition.periods.forEach((p) => {
    grid[p.period_month] = {};
    definition.columns.forEach((col) => {
      grid[p.period_month][col.line_code] = "";
    });
  });
  return { grid };
};

export const emptyPersonByMonthGrid = (definition, people = []) => {
  const grid = {};
  people.forEach((person) => {
    const id = person.person_id || person.id;
    grid[id] = {};
    definition.periods.forEach((p) => {
      grid[id][p.period_month] = "";
    });
  });
  return { grid, people };
};

export const emptyVendorGrid = (definition) => {
  const grid = {};
  definition.periods.forEach((p) => {
    grid[p.period_month] = {};
    definition.vendor_blocks.forEach((block) => {
      grid[p.period_month][block.block_code] = {};
      definition.block_fields.forEach((f) => {
        grid[p.period_month][block.block_code][f.field] = "";
      });
    });
  });
  return { grid };
};

const formatAmountCell = (amount) =>
  amount === 0 || amount === "0" ? "" : String(amount);

export const hydrateCategoryByMonth = (
  definition,
  cells = [],
  remarks = {},
) => {
  const { grid, remarks: remarkState } = emptyCategoryByMonthGrid(definition);
  cells.forEach(({ line_code, period_month, amount }) => {
    if (grid[line_code] && period_month in grid[line_code]) {
      grid[line_code][period_month] = formatAmountCell(amount);
    }
  });
  Object.keys(remarkState).forEach((code) => {
    if (remarks[code]) remarkState[code] = remarks[code];
  });
  return { grid, remarks: remarkState };
};

export const hydrateMonthByCategory = (definition, cells = []) => {
  const { grid } = emptyMonthByCategoryGrid(definition);
  cells.forEach(({ line_code, period_month, amount }) => {
    if (grid[period_month] && line_code in grid[period_month]) {
      grid[period_month][line_code] = formatAmountCell(amount);
    }
  });
  return { grid };
};

export const hydratePersonByMonth = (definition, people = [], cells = []) => {
  const { grid, people: rowPeople } = emptyPersonByMonthGrid(
    definition,
    people,
  );
  cells.forEach(({ person_id, period_month, amount }) => {
    if (grid[person_id] && period_month in grid[person_id]) {
      grid[person_id][period_month] = formatAmountCell(amount);
    }
  });
  return { grid, people: rowPeople };
};

export const hydrateVendorGrid = (definition, cells = []) => {
  const { grid } = emptyVendorGrid(definition);
  cells.forEach(({ period_month, block_code, field, amount }) => {
    if (
      grid[period_month]?.[block_code] &&
      field in grid[period_month][block_code]
    ) {
      grid[period_month][block_code][field] = formatAmountCell(amount);
    }
  });
  return { grid };
};

export const flattenCategoryByMonth = (definition, grid, remarks) => {
  const cells = [];
  definition.categories.forEach((cat) => {
    definition.periods.forEach((p) => {
      cells.push({
        line_code: cat.line_code,
        period_month: p.period_month,
        amount: amountFromInput(grid[cat.line_code]?.[p.period_month]),
      });
    });
  });
  const remarksPayload = definition.remarks_per_row
    ? definition.categories.reduce((acc, cat) => {
        acc[cat.line_code] = remarks[cat.line_code] || "";
        return acc;
      }, {})
    : {};
  return { cells, remarks: remarksPayload };
};

export const flattenMonthByCategory = (definition, grid) => {
  const cells = [];
  definition.periods.forEach((p) => {
    definition.columns.forEach((col) => {
      cells.push({
        line_code: col.line_code,
        period_month: p.period_month,
        amount: amountFromInput(grid[p.period_month]?.[col.line_code]),
      });
    });
  });
  return { cells };
};

export const flattenPersonByMonth = (definition, grid, people) => {
  const cells = [];
  people.forEach((person) => {
    const person_id = person.person_id || person.id;
    definition.periods.forEach((p) => {
      cells.push({
        person_id,
        period_month: p.period_month,
        amount: amountFromInput(grid[person_id]?.[p.period_month]),
      });
    });
  });
  return { cells, people };
};

export const flattenVendorGrid = (definition, grid) => {
  const cells = [];
  definition.periods.forEach((p) => {
    definition.vendor_blocks.forEach((block) => {
      definition.block_fields.forEach((f) => {
        cells.push({
          period_month: p.period_month,
          block_code: block.block_code,
          field: f.field,
          amount: amountFromInput(
            grid[p.period_month]?.[block.block_code]?.[f.field],
          ),
        });
      });
    });
  });
  return { cells };
};

export const monthRowTotal = (definition, grid, periodMonth) =>
  definition.columns.reduce(
    (sum, col) => sum + amountFromInput(grid[periodMonth]?.[col.line_code]),
    0,
  );

export const rowTotalCategoryMonth = (definition, grid, lineCode) =>
  definition.periods.reduce(
    (sum, p) => sum + amountFromInput(grid[lineCode]?.[p.period_month]),
    0,
  );

export const periodTotalCategoryMonth = (definition, grid, periodMonth) =>
  definition.categories.reduce(
    (sum, cat) => sum + amountFromInput(grid[cat.line_code]?.[periodMonth]),
    0,
  );

export const personRowTotal = (definition, grid, personId) =>
  definition.periods.reduce(
    (sum, p) => sum + amountFromInput(grid[personId]?.[p.period_month]),
    0,
  );

export const vendorRowTotal = (definition, grid, periodMonth) => {
  let sum = 0;
  definition.vendor_blocks.forEach((block) => {
    definition.block_fields.forEach((f) => {
      sum += amountFromInput(grid[periodMonth]?.[block.block_code]?.[f.field]);
    });
  });
  return sum;
};

export const syncGridToDefinition = (state, definition) => {
  if (!state || !definition) return state;
  const grid = { ...state.grid };

  if (definition.layout === "category_by_month") {
    definition.categories.forEach((cat) => {
      if (!grid[cat.line_code]) grid[cat.line_code] = {};
      definition.periods.forEach((p) => {
        if (grid[cat.line_code][p.period_month] === undefined) {
          grid[cat.line_code][p.period_month] = "";
        }
      });
    });
  }

  if (definition.layout === "month_by_category") {
    definition.periods.forEach((p) => {
      if (!grid[p.period_month]) grid[p.period_month] = {};
      definition.columns.forEach((col) => {
        if (grid[p.period_month][col.line_code] === undefined) {
          grid[p.period_month][col.line_code] = "";
        }
      });
    });
  }

  if (definition.layout === "person_by_month") {
    (state.people || []).forEach((person) => {
      const id = person.person_id || person.id;
      if (!grid[id]) grid[id] = {};
      definition.periods.forEach((p) => {
        if (grid[id][p.period_month] === undefined)
          grid[id][p.period_month] = "";
      });
    });
  }

  if (definition.layout === "vendor_month_blocks") {
    definition.periods.forEach((p) => {
      if (!grid[p.period_month]) grid[p.period_month] = {};
      definition.vendor_blocks.forEach((block) => {
        if (!grid[p.period_month][block.block_code])
          grid[p.period_month][block.block_code] = {};
        definition.block_fields.forEach((f) => {
          if (grid[p.period_month][block.block_code][f.field] === undefined) {
            grid[p.period_month][block.block_code][f.field] = "";
          }
        });
      });
    });
  }

  return { ...state, grid };
};

export const buildSavePayload = (definition, state) => {
  const base = {
    report_type: definition.report_type,
    status: state.status,
    custom: state.custom || {
      periods: [],
      categories: [],
      columns: [],
      people: [],
    },
  };
  switch (definition.layout) {
    case "category_by_month":
      return {
        ...base,
        ...flattenCategoryByMonth(definition, state.grid, state.remarks),
      };
    case "month_by_category":
      return { ...base, ...flattenMonthByCategory(definition, state.grid) };
    case "person_by_month":
      return {
        ...base,
        ...flattenPersonByMonth(definition, state.grid, state.people),
      };
    case "vendor_month_blocks":
      return { ...base, ...flattenVendorGrid(definition, state.grid) };
    default:
      return base;
  }
};

const emptyCustom = () => ({
  periods: [],
  categories: [],
  columns: [],
  people: [],
});

export const hydrateSheetState = (definition, sheetData) => {
  if (!definition) return null;
  const status = sheetData?.status || "draft";
  const custom = sheetData?.custom || emptyCustom();

  switch (definition.layout) {
    case "category_by_month":
      return {
        status,
        custom,
        ...hydrateCategoryByMonth(
          definition,
          sheetData?.cells,
          sheetData?.remarks,
        ),
      };
    case "month_by_category":
      return {
        status,
        custom,
        ...hydrateMonthByCategory(definition, sheetData?.cells),
      };
    case "person_by_month":
      return {
        status,
        custom,
        ...hydratePersonByMonth(
          definition,
          [...(sheetData?.people || []), ...(custom.people || [])],
          sheetData?.cells,
        ),
      };
    case "vendor_month_blocks":
      return {
        status,
        custom,
        ...hydrateVendorGrid(definition, sheetData?.cells),
      };
    default:
      return {
        status,
        grid: {},
        remarks: {},
        people: [],
        custom: emptyCustom(),
      };
  }
};

export const initEmptySheetState = (definition) => {
  if (!definition) return null;
  const custom = emptyCustom();
  switch (definition.layout) {
    case "category_by_month":
      return {
        status: "draft",
        custom,
        ...emptyCategoryByMonthGrid(definition),
      };
    case "month_by_category":
      return {
        status: "draft",
        custom,
        ...emptyMonthByCategoryGrid(definition),
      };
    case "person_by_month":
      return {
        status: "draft",
        custom,
        ...emptyPersonByMonthGrid(definition, []),
      };
    case "vendor_month_blocks":
      return { status: "draft", custom, ...emptyVendorGrid(definition) };
    default:
      return { status: "draft", grid: {}, remarks: {}, people: [], custom };
  }
};
