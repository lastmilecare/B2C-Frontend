import { normalizePeriodMonth } from "./expensePeriodUtils.js";

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

const roundMoney = (amount) => Math.round(Number(amount) * 100) / 100;

const formatAmountCell = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return "";
  return String(roundMoney(n));
};

export const shouldPersistMonthColumn = (definition, col) => {
  const allow = definition?.persist_column_codes;
  if (!allow?.length) return true;
  return allow.includes(col.line_code);
};

export const showMonthRowTotal = (definition) =>
  definition?.show_month_row_total !== false;

export const grandTotalFromSheetCells = (definition, cells = []) => {
  const allow = definition?.persist_column_codes;
  const list = cells || [];
  if (allow?.length) {
    return list
      .filter((c) => allow.includes(c.line_code))
      .reduce((s, c) => s + (Number(c.amount) || 0), 0);
  }
  return list.reduce((s, c) => s + (Number(c.amount) || 0), 0);
};

export const hydrateCategoryByMonth = (
  definition,
  cells = [],
  remarks = {},
) => {
  const { grid, remarks: remarkState } = emptyCategoryByMonthGrid(definition);
  cells.forEach(({ line_code, period_month, amount }) => {
    const pm = normalizePeriodMonth(period_month);
    if (!line_code || !pm) return;
    if (!grid[line_code]) grid[line_code] = {};
    grid[line_code][pm] = formatAmountCell(amount);
  });
  Object.keys(remarkState).forEach((code) => {
    if (remarks[code]) remarkState[code] = remarks[code];
  });
  return { grid, remarks: remarkState };
};

export const isMonthCategoryColumnComputed = (col) => Boolean(col?.computed);

export const monthCategoryComputedAmount = (col, periodRow = {}) => {
  if (col?.formula === "salaries_times_0_3") {
    return roundMoney(amountFromInput(periodRow.salaries) * 0.03);
  }
  return 0;
};

export const syncMonthCategoryPeriodRow = (definition, periodRow = {}) => {
  const row = { ...periodRow };
  (definition.columns || []).forEach((col) => {
    if (!isMonthCategoryColumnComputed(col)) return;
    const amount = monthCategoryComputedAmount(col, row);
    row[col.line_code] = formatAmountCell(amount);
  });
  return row;
};

export const recomputeMonthCategoryGrid = (definition, grid = {}) => {
  const next = { ...grid };
  definition.periods.forEach((p) => {
    next[p.period_month] = syncMonthCategoryPeriodRow(
      definition,
      next[p.period_month] || {},
    );
  });
  return next;
};

export const hydrateMonthByCategory = (definition, cells = []) => {
  const { grid } = emptyMonthByCategoryGrid(definition);
  const computedCodes = new Set(
    (definition.columns || [])
      .filter(isMonthCategoryColumnComputed)
      .map((col) => col.line_code),
  );
  const persistComputed = new Set(definition.persist_column_codes || []);
  cells.forEach(({ line_code, period_month, amount }) => {
    const pm = normalizePeriodMonth(period_month);
    if (!line_code || !pm) return;
    if (computedCodes.has(line_code) && !persistComputed.has(line_code)) return;
    if (!grid[pm]) grid[pm] = {};
    grid[pm][line_code] = formatAmountCell(amount);
  });
  if (definition.report_type === "hr_recruitment") {
    Object.keys(grid).forEach((pm) => {
      const row = grid[pm];
      if (!row) return;
      const salaries = amountFromInput(row.salaries);
      const cost = amountFromInput(row.cost);
      if (!salaries && cost) {
        row.salaries = formatAmountCell(roundMoney(cost / 0.3));
      }
    });
  }
  return { grid: recomputeMonthCategoryGrid(definition, grid) };
};

export const normalizeSalaryPersonName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** API `people[]` + legacy `custom.people` — dedupe by person_id, then by normalized name. */
export const mergeSalaryPeople = (apiPeople = [], customPeople = []) => {
  const map = new Map();

  const canonicalIdFor = (person) => {
    const person_id = String(person.person_id || person.id || "").trim();
    const nameKey = normalizeSalaryPersonName(person.name);
    if (nameKey) {
      for (const existing of map.values()) {
        if (normalizeSalaryPersonName(existing.name) === nameKey) {
          return existing.person_id;
        }
      }
    }
    return person_id;
  };

  const add = (person) => {
    if (!person || typeof person !== "object") return;
    let person_id = canonicalIdFor(person);
    const nameKey = normalizeSalaryPersonName(person.name);
    if (!person_id) {
      if (!nameKey) return;
      person_id = `legacy_${nameKey.replace(/\W+/g, "_")}`;
    }
    const existing = map.get(person_id);
    map.set(person_id, {
      ...existing,
      ...person,
      person_id,
      id: person_id,
    });
  };

  apiPeople.forEach(add);
  customPeople.forEach(add);
  return Array.from(map.values());
};

/** Maps duplicate roster ids (same person, different ids) to the merged canonical person_id. */
export const salaryPersonIdAliases = (
  apiPeople = [],
  customPeople = [],
  merged = [],
) => {
  const aliases = new Map();
  const source = [...apiPeople, ...customPeople];
  merged.forEach((canonical) => {
    const nameKey = normalizeSalaryPersonName(canonical.name);
    if (!nameKey) return;
    source.forEach((person) => {
      const pid = String(person.person_id || person.id || "").trim();
      if (!pid) return;
      if (normalizeSalaryPersonName(person.name) === nameKey) {
        aliases.set(pid, canonical.person_id);
      }
    });
  });
  return aliases;
};

export const hydratePersonByMonth = (
  definition,
  people = [],
  cells = [],
  personIdAliases = null,
) => {
  const roster = mergeSalaryPeople(people, []);
  const { grid, people: rowPeople } = emptyPersonByMonthGrid(
    definition,
    roster,
  );
  cells.forEach(({ person_id, period_month, amount }) => {
    const pm = normalizePeriodMonth(period_month);
    if (!person_id || !pm) return;
    let pid = String(person_id);
    if (personIdAliases?.size) {
      pid = personIdAliases.get(pid) || pid;
    }
    if (!grid[pid]) grid[pid] = {};
    const total = amountFromInput(grid[pid][pm]) + Number(amount ?? 0);
    grid[pid][pm] = formatAmountCell(total);
  });
  return { grid, people: rowPeople };
};

export const isVendorShareField = (fieldDef) =>
  Boolean(fieldDef?.computed || fieldDef?.field === "share");

/** MediKavach share = Revenue − Payment (per vendor block, per month). */
export const vendorBlockShareAmount = (blockCells) =>
  amountFromInput(blockCells?.revenue) -
  amountFromInput(blockCells?.vendor_payment);

export const syncVendorBlockShare = (blockCells) => {
  if (!blockCells) return blockCells;
  const share = vendorBlockShareAmount(blockCells);
  return { ...blockCells, share: formatAmountCell(share) };
};

export const recomputeVendorGridShares = (grid) => {
  const next = { ...grid };
  Object.keys(next).forEach((periodMonth) => {
    next[periodMonth] = { ...next[periodMonth] };
    Object.keys(next[periodMonth]).forEach((blockCode) => {
      next[periodMonth][blockCode] = syncVendorBlockShare(
        next[periodMonth][blockCode],
      );
    });
  });
  return next;
};

export const hydrateVendorGrid = (definition, cells = []) => {
  const { grid } = emptyVendorGrid(definition);
  cells.forEach(({ period_month, block_code, field, amount }) => {
    const pm = normalizePeriodMonth(period_month);
    if (!pm || !block_code || !field) return;
    if (field === "share") return;
    if (!grid[pm]) grid[pm] = {};
    if (!grid[pm][block_code]) grid[pm][block_code] = {};
    grid[pm][block_code][field] = formatAmountCell(amount);
  });
  return { grid: recomputeVendorGridShares(grid) };
};

const pushCellIfNonZero = (cells, cell, amount) => {
  if (amount !== 0) cells.push({ ...cell, amount });
};

export const flattenCategoryByMonth = (definition, grid, remarks) => {
  const cells = [];
  definition.categories.forEach((cat) => {
    definition.periods.forEach((p) => {
      const amount = amountFromInput(grid[cat.line_code]?.[p.period_month]);
      pushCellIfNonZero(
        cells,
        {
          line_code: cat.line_code,
          period_month: p.period_month,
        },
        amount,
      );
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
  const syncedGrid = recomputeMonthCategoryGrid(definition, grid);
  definition.periods.forEach((p) => {
    const periodRow = syncedGrid[p.period_month] || {};
    definition.columns.forEach((col) => {
      if (!shouldPersistMonthColumn(definition, col)) return;
      const amount = amountFromInput(periodRow[col.line_code]);
      pushCellIfNonZero(
        cells,
        {
          line_code: col.line_code,
          period_month: p.period_month,
        },
        amount,
      );
    });
  });
  return { cells };
};

export const flattenPersonByMonth = (definition, grid, people) => {
  const cells = [];
  people.forEach((person) => {
    const person_id = person.person_id || person.id;
    definition.periods.forEach((p) => {
      const amount = amountFromInput(grid[person_id]?.[p.period_month]);
      pushCellIfNonZero(
        cells,
        {
          person_id,
          period_month: p.period_month,
        },
        amount,
      );
    });
  });
  return { cells, people };
};

export const flattenVendorGrid = (definition, grid) => {
  const cells = [];
  definition.periods.forEach((p) => {
    definition.vendor_blocks.forEach((block) => {
      const blockCells = syncVendorBlockShare(
        grid[p.period_month]?.[block.block_code],
      );
      if (!blockCells) return;

      const revenue = amountFromInput(blockCells.revenue);
      const payment = amountFromInput(blockCells.vendor_payment);
      const share = vendorBlockShareAmount(blockCells);

      pushCellIfNonZero(
        cells,
        {
          period_month: p.period_month,
          block_code: block.block_code,
          field: "revenue",
        },
        revenue,
      );
      pushCellIfNonZero(
        cells,
        {
          period_month: p.period_month,
          block_code: block.block_code,
          field: "vendor_payment",
        },
        payment,
      );
      pushCellIfNonZero(
        cells,
        {
          period_month: p.period_month,
          block_code: block.block_code,
          field: "share",
        },
        share,
      );
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

export const vendorRowTotal = (definition, grid, periodMonth) =>
  definition.vendor_blocks.reduce((sum, block) => {
    const blockCells = grid[periodMonth]?.[block.block_code];
    return sum + vendorBlockShareAmount(blockCells);
  }, 0);

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
      grid[p.period_month] = syncMonthCategoryPeriodRow(
        definition,
        grid[p.period_month],
      );
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

const normalizeCustomPeriods = (custom) => {
  const c = custom || { periods: [], categories: [], columns: [], people: [] };
  const periods = (c.periods || [])
    .map((p) => {
      const period_month = normalizePeriodMonth(p.period_month);
      if (!period_month) return null;
      return { ...p, period_month };
    })
    .filter(Boolean);
  return { ...c, periods };
};

export const buildSavePayload = (definition, state) => {
  const base = {
    report_type: definition.report_type,
    status: state.status,
    custom: normalizeCustomPeriods(state.custom),
  };
  switch (definition.layout) {
    case "category_by_month":
      return {
        ...base,
        ...flattenCategoryByMonth(definition, state.grid, state.remarks),
      };
    case "month_by_category":
      return { ...base, ...flattenMonthByCategory(definition, state.grid) };
    case "person_by_month": {
      const flattened = flattenPersonByMonth(
        definition,
        state.grid,
        state.people,
      );
      return {
        ...base,
        ...flattened,
        custom: { ...base.custom, people: [] },
      };
    }
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
    case "person_by_month": {
      const apiPeople = sheetData?.people || [];
      const customPeople = custom.people || [];
      const mergedPeople = mergeSalaryPeople(apiPeople, customPeople);
      const personIdAliases = salaryPersonIdAliases(
        apiPeople,
        customPeople,
        mergedPeople,
      );
      return {
        status,
        custom: { ...custom, people: [] },
        ...hydratePersonByMonth(
          definition,
          mergedPeople,
          sheetData?.cells,
          personIdAliases,
        ),
      };
    }
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
