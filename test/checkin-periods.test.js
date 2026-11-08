const test = require('node:test');
const assert = require('node:assert/strict');
let periods = {};
try { periods = require('../checkin-periods.js'); } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}

const start = new Date('2026-11-05T15:30:45+08:00').getTime();
const hour = 60 * 60 * 1000;

test('首次打卡只在完整的 24 小时后开放，精确到秒', () => {
  assert.equal(typeof periods.currentPeriod, 'function');
  assert.equal(periods.currentPeriod(start, start + 24 * hour - 1000).index, 0);
  assert.equal(periods.recentCompleted(start, start + 24 * hour - 1000).length, 0);
  assert.deepEqual(periods.recentCompleted(start, start + 24 * hour).map(({ index }) => index), [0]);
});

test('只允许最近三个已结束周期补卡', () => {
  assert.deepEqual(periods.recentCompleted(start, start + 5 * 24 * hour).map(({ index }) => index), [4, 3, 2]);
});

test('吸烟记录使对应周期无法确认，边界不随吸烟时间移动', () => {
  const lapse = new Date(start + 9 * hour).toISOString();
  const now = start + 24 * hour;
  assert.equal(periods.periodAt(start, 1).start, now);
  assert.equal(periods.periodStatus(periods.periodAt(start, 0), now, [], [{ at: lapse }]), 'smoked');
  assert.equal(periods.periodStatus(periods.periodAt(start, 0), now, ['2026-11-05'], [{ at: lapse }]), 'smoked');
  assert.equal(periods.periodStatus(periods.periodAt(start, 1), now, [], [{ at: lapse }]), 'ongoing');
  assert.equal(periods.periodStatus(periods.periodAt(start, 0), now, [], [{ at: new Date(now).toISOString() }]), 'pending');
});

test('进行中、待确认、已确认、过期状态依结束时刻判定', () => {
  const now = start + 5 * 24 * hour;
  assert.equal(periods.periodStatus(periods.periodAt(start, 5), now, [], []), 'ongoing');
  assert.equal(periods.periodStatus(periods.periodAt(start, 4), now, [], []), 'pending');
  assert.equal(periods.periodStatus(periods.periodAt(start, 4), now, ['2026-11-09'], []), 'confirmed');
  assert.equal(periods.periodStatus(periods.periodAt(start, 1), now, [], []), 'expired');
});

test('月历日期对应从该日期开始的周期，跨月仍标在开始日', () => {
  const anchor = new Date(2026, 10, 30, 15, 30, 45).getTime();
  assert.equal(periods.periodForDate(anchor, 2026, 10, 29), null);
  assert.equal(periods.periodForDate(anchor, 2026, 10, 30).index, 0);
  assert.equal(periods.periodForDate(anchor, 2026, 11, 1).index, 1);
});

test('累计无烟时长保留此前十天，吸烟的第十一段 24 小时不计', () => {
  const day = 24 * hour;
  const lapses = [
    { at: new Date(start + 10 * day + hour).toISOString() },
    { at: new Date(start + 10 * day + 3 * hour).toISOString() },
  ];
  assert.equal(periods.cumulativeSmokeFreeMs(start, start + 10 * day + 4 * hour, lapses), 10 * day);
  assert.equal(periods.cumulativeSmokeFreeMs(start, start + 11 * day + 12 * hour, lapses), 10 * day + 12 * hour);
});

test('累计无烟天数只计算已完成的 24 小时，同一天吸烟多次只扣一次', () => {
  const day = 24 * hour;
  const lapses = [
    { at: new Date(start + hour).toISOString() },
    { at: new Date(start + 2 * hour).toISOString() },
    { at: new Date(start + 2 * day + hour).toISOString() },
  ];
  assert.equal(periods.completedSmokeFreeDays(start, start + 2 * day + 2 * hour, lapses), 1);
  assert.equal(periods.completedSmokeFreeDays(start, start + 3 * day, lapses), 1);
});

test('五百天里有两个吸烟日时累计无烟天数为四百九十八天', () => {
  const day = 24 * hour;
  const lapses = [
    { at: new Date(start + 20 * day + hour).toISOString() },
    { at: new Date(start + 300 * day + hour).toISOString() },
  ];
  assert.equal(periods.completedSmokeFreeDays(start, start + 500 * day, lapses), 498);
  assert.equal(periods.cumulativeSmokeFreeMs(start, start + 500 * day, lapses), 498 * day);
});

test('超过三天未打开后只补最近三期，更早空白期不计入累计', () => {
  const day = 24 * hour;
  const gaps = [{ start: start + day, end: start + 6 * day }];
  assert.equal(periods.recognizedElapsedMs(start, start + 6 * day, gaps), day);
  const lastPeriod = periods.periodAt(start, 5);
  const restored = periods.restoreInterval(gaps, lastPeriod);
  assert.equal(periods.recognizedElapsedMs(start, start + 6 * day, restored), 2 * day);
  assert.equal(periods.cumulativeSmokeFreeMs(start, start + 6 * day, [], restored), 2 * day);
  assert.equal(periods.completedSmokeFreeDays(start, start + 6 * day, [], restored), 2);
  assert.deepEqual(restored, [{ start: start + day, end: start + 5 * day }]);
});
