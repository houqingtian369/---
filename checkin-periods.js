(function (root) {
  'use strict';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const dateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const periodAt = (anchor, index) => ({
    index,
    start: Number(anchor) + index * DAY_MS,
    end: Number(anchor) + (index + 1) * DAY_MS,
  });
  const currentPeriod = (anchor, now = Date.now()) => {
    if (now < anchor) return null;
    return periodAt(anchor, Math.floor((now - anchor) / DAY_MS));
  };
  const recentCompleted = (anchor, now = Date.now(), limit = 3) => {
    const current = currentPeriod(anchor, now);
    if (!current) return [];
    return Array.from({ length: Math.min(limit, current.index) }, (_, offset) => periodAt(anchor, current.index - offset - 1));
  };
  const periodForDate = (anchor, year, month, day) => {
    const dateStart = new Date(year, month, day).getTime();
    const index = Math.max(0, Math.ceil((dateStart - anchor) / DAY_MS));
    if (index < 0) return null;
    const period = periodAt(anchor, index);
    return dateKey(period.start) === dateKey(dateStart) ? period : null;
  };
  const periodStatus = (period, now, checkins = [], lapses = []) => {
    if (now < period.start) return 'future';
    if (lapses.some((entry) => {
      const at = Date.parse(entry.at);
      return at >= period.start && at < period.end;
    })) return 'smoked';
    if (now < period.end) return 'ongoing';
    if (checkins.includes(dateKey(period.start))) return 'confirmed';
    return now - period.end >= 3 * DAY_MS ? 'expired' : 'pending';
  };
  const intervalLength = (anchor, now, intervals) => {
    const clipped = intervals.map(({ start, end }) => ({ start: Math.max(anchor, Number(start)), end: Math.min(now, Number(end)) }))
      .filter(({ start, end }) => Number.isFinite(start) && Number.isFinite(end) && end > start)
      .sort((a, b) => a.start - b.start);
    let total = 0;
    let end = anchor;
    clipped.forEach((item) => {
      total += Math.max(0, item.end - Math.max(end, item.start));
      end = Math.max(end, item.end);
    });
    return total;
  };
  const recognizedElapsedMs = (anchor, now = Date.now(), gaps = []) => Math.max(0, now - anchor - intervalLength(anchor, now, gaps));
  const restoreInterval = (gaps, period) => gaps.flatMap(({ start, end }) => {
    if (end <= period.start || start >= period.end) return [{ start, end }];
    return [{ start, end: Math.min(end, period.start) }, { start: Math.max(start, period.end), end }]
      .filter((item) => item.end > item.start);
  });
  const cumulativeSmokeFreeMs = (anchor, now = Date.now(), lapses = [], gaps = []) => {
    const smokedPeriods = new Set(lapses.map((entry) => Date.parse(entry.at))
      .filter((at) => at >= anchor && at <= now)
      .map((at) => Math.floor((at - anchor) / DAY_MS)));
    const unavailable = [...gaps, ...[...smokedPeriods].map((index) => periodAt(anchor, index))];
    return Math.max(0, now - anchor - intervalLength(anchor, now, unavailable));
  };
  const completedSmokeFreeDays = (anchor, now = Date.now(), lapses = [], gaps = []) => Math.floor(cumulativeSmokeFreeMs(anchor, now, lapses, gaps) / DAY_MS);
  const api = { DAY_MS, dateKey, periodAt, currentPeriod, recentCompleted, periodForDate, periodStatus, recognizedElapsedMs, restoreInterval, cumulativeSmokeFreeMs, completedSmokeFreeDays };
  root.CheckinPeriods = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
