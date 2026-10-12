import {
  EXPENSE_TEMPLATES,
  buildUniqueName,
  computeTotal,
  loadReports,
  saveReports,
} from './expenseData';

const reject = (status, message) => {
  const err = new Error(message);
  err.status = status;
  err.data = { message };
  throw err;
};

const getAuthClientId = (getState) => {
  const clientId = getState()?.auth?.clientId;
  if (!clientId) reject(401, 'Not authenticated');
  return clientId;
};

const filterByClient = (reports, clientId) =>
  reports.filter((r) => r.client_id === clientId);

export const expenseMockHandlers = {
  getTemplates: ({ getState }) => {
    const clientId = getAuthClientId(getState);
    const template = EXPENSE_TEMPLATES[clientId];
    if (!template) reject(404, 'Template not found for client');
    return template;
  },

  listReports: ({ getState, page = 1, limit = 10, status, startDate, endDate, unique_name }) => {
    const clientId = getAuthClientId(getState);
    let rows = filterByClient(loadReports(), clientId);

    if (unique_name) {
      const q = unique_name.toUpperCase();
      rows = rows.filter((r) => r.unique_name.toUpperCase().includes(q));
    }
    if (status) rows = rows.filter((r) => r.status === status);
    if (startDate) rows = rows.filter((r) => r.period_month >= startDate);
    if (endDate) rows = rows.filter((r) => r.period_month <= endDate);

    rows.sort((a, b) => b.period_month.localeCompare(a.period_month));

    const totalRecords = rows.length;
    const start = (page - 1) * limit;
    const data = rows.slice(start, start + limit).map(({ lines, ...rest }) => rest);

    return {
      data,
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalRecords / limit)),
      },
    };
  },

  getReport: ({ getState, id }) => {
    const clientId = getAuthClientId(getState);
    const report = loadReports().find((r) => r.id === id);
    if (!report) reject(404, 'Report not found');
    if (report.client_id !== clientId) reject(403, 'Access denied for this client');
    const template = EXPENSE_TEMPLATES[clientId];
    const lines = template.lines.map((t) => {
      const existing = report.lines.find((l) => l.line_code === t.line_code);
      return {
        line_code: t.line_code,
        label: t.label,
        remark_allowed: t.remark_allowed,
        amount: existing?.amount ?? 0,
        remark: existing?.remark ?? '',
      };
    });
    return {
      ...report,
      lines,
      total_amount: computeTotal(lines),
    };
  },

  createReport: ({ getState, body }) => {
    const clientId = getAuthClientId(getState);
    const template = EXPENSE_TEMPLATES[clientId];
    const reports = loadReports();

    const duplicate = reports.find(
      (r) =>
        r.client_id === clientId &&
        r.report_type === template.report_type &&
        r.period_month === body.period_month,
    );
    if (duplicate) reject(409, 'A report already exists for this month');

    const now = new Date().toISOString();
    const id = `r-${clientId}-${body.period_month.slice(0, 7)}`;
    const lines = (body.lines || []).map((l) => ({
      line_code: l.line_code,
      amount: Number(l.amount) || 0,
      remark: l.remark || null,
    }));

    const report = {
      id,
      unique_name: buildUniqueName(clientId, body.period_month),
      client_id: clientId,
      client_name: clientId === 'amp' ? 'AMP' : 'Honda',
      report_type: template.report_type,
      period_month: body.period_month,
      status: body.status || 'draft',
      lines,
      total_amount: computeTotal(lines),
      created_at: now,
      updated_at: now,
    };

    reports.push(report);
    saveReports(reports);
    return expenseMockHandlers.getReport({ getState, id });
  },

  updateReport: ({ getState, id, body }) => {
    const clientId = getAuthClientId(getState);
    const reports = loadReports();
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) reject(404, 'Report not found');
    if (reports[idx].client_id !== clientId) reject(403, 'Access denied for this client');

    const lines = (body.lines || []).map((l) => ({
      line_code: l.line_code,
      amount: Number(l.amount) || 0,
      remark: l.remark || null,
    }));

    reports[idx] = {
      ...reports[idx],
      period_month: body.period_month || reports[idx].period_month,
      status: body.status || reports[idx].status,
      lines,
      total_amount: computeTotal(lines),
      updated_at: new Date().toISOString(),
    };

    saveReports(reports);
    return expenseMockHandlers.getReport({ getState, id });
  },

  deleteReport: ({ getState, id }) => {
    const clientId = getAuthClientId(getState);
    const reports = loadReports();
    const report = reports.find((r) => r.id === id);
    if (!report) reject(404, 'Report not found');
    if (report.client_id !== clientId) reject(403, 'Access denied for this client');
    if (report.status !== 'draft') reject(400, 'Only draft reports can be deleted');

    saveReports(reports.filter((r) => r.id !== id));
    return { success: true };
  },

  searchReports: ({ getState, q }) => {
    const clientId = getAuthClientId(getState);
    const needle = (q || '').toLowerCase();
    return filterByClient(loadReports(), clientId)
      .filter((r) => r.unique_name.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((r) => ({ unique_name: r.unique_name, period_month: r.period_month }));
  },
};
