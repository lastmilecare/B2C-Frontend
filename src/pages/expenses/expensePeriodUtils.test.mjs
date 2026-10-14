import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addMonths,
  buildEffectivePeriods,
  formatMonYy,
  formatYyMon,
  nextPeriodAfterLatest,
  normalizePeriodMonth,
  periodMonthFromDate,
} from './expensePeriodUtils.js';

describe('normalizePeriodMonth', () => {
  it('parses date strings without timezone shift', () => {
    assert.equal(normalizePeriodMonth('2024-04-01'), '2024-04-01');
    assert.equal(normalizePeriodMonth('2024-04-01T00:00:00.000Z'), '2024-04-01');
  });
});

describe('labels', () => {
  it('formats Mon-YY consistently', () => {
    assert.equal(formatMonYy('2024-04-01'), 'Apr-24');
    assert.equal(formatMonYy('2028-05-01'), 'May-28');
  });

  it('formats YY-Mon for Honda compliance', () => {
    assert.equal(formatYyMon('2024-04-01'), '24-Apr');
  });
});

describe('addMonths', () => {
  it('steps chronologically across year boundary', () => {
    assert.equal(addMonths('2026-12-01', 1), '2027-01-01');
    assert.equal(addMonths('2026-11-01', 1), '2026-12-01');
  });
});

describe('buildEffectivePeriods', () => {
  it('does not add automatic future months (e.g. May-28) when monthsFuture is 0', () => {
    const periods = buildEffectivePeriods([], 'mon_yy', {
      monthsPast: 2,
      monthsFuture: 0,
      cellPeriods: [],
      customPeriods: [],
    });
    const labels = periods.map((p) => p.label);
    assert.ok(!labels.includes('May-28'));
    const nowPm = periodMonthFromDate(new Date());
    periods.forEach((p) => {
      assert.ok(p.period_month <= nowPm, `unexpected future month ${p.period_month}`);
    });
  });

  it('keeps saved cell months outside rolling window', () => {
    const periods = buildEffectivePeriods([], 'yy_mon', {
      monthsPast: 1,
      monthsFuture: 0,
      cellPeriods: ['2024-04-01'],
      customPeriods: [],
    });
    assert.ok(periods.some((p) => p.period_month === '2024-04-01'));
  });

  it('includes explicit future custom month', () => {
    const periods = buildEffectivePeriods([], 'mon_yy', {
      monthsPast: 0,
      monthsFuture: 0,
      cellPeriods: [],
      customPeriods: [{ period_month: '2028-05-01', label: 'May-28' }],
    });
    assert.ok(periods.some((p) => p.period_month === '2028-05-01'));
  });
});

describe('nextPeriodAfterLatest', () => {
  it('adds month after latest sorted period', () => {
    const next = nextPeriodAfterLatest(
      [
        { period_month: '2026-12-01', label: 'Dec-26' },
        { period_month: '2024-04-01', label: 'Apr-24' },
      ],
      'mon_yy',
    );
    assert.equal(next.period_month, '2027-01-01');
    assert.equal(next.label, 'Jan-27');
  });
});
