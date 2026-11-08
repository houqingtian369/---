const test = require('node:test');
const assert = require('node:assert/strict');
const { milestones, savedAmount, timePercent, timedSavings, timedSavingsCentProgress } = require('../health-milestones.js');

test('逐支记录按烟价计算，并在总额处保留两位小数', () => {
  assert.equal(savedAmount([{ cigarettes: 1 }, { cigarettes: 2 }], 23, 20), '3.45');
  assert.equal(savedAmount([{ cigarettes: 1 }], 1, 3), '0.33');
  assert.equal(savedAmount([], 23, 20), '0.00');
  assert.equal(savedAmount([{ cigarettes: 2 }], null, 20), null);
});

test('里程碑有 24 条，区间进度按参考终点计算', () => {
  assert.equal(milestones.length, 24);
  const circulation = milestones.find((item) => item.title === '血液循环改善');
  assert.equal(timePercent(6 * 7 * 24, circulation.end), '50.00');
  assert.equal(timePercent(0, circulation.end), '0.00');
  assert.equal(timePercent(circulation.end, circulation.end), '100.00');
});

test('无烟时长按日常烟量连续估算节省金额，显示三位小数', () => {
  const day = 24 * 60 * 60 * 1000;
  assert.equal(timedSavings(0, 10, 15, 20), '0.000');
  assert.equal(timedSavings(day / 2, 10, 15, 20), '3.750');
  assert.equal(timedSavings(day, 10, 15, 20), '7.500');
  assert.equal(timedSavings(1000, 10, 15, 20), '0.000');
  assert.equal(timedSavings(day, null, 15, 20), null);
});

test('累计估算扣除已记录的吸烟支数且不会变成负数', () => {
  const day = 24 * 60 * 60 * 1000;
  assert.equal(timedSavings(3 * day, 20, 14, 20, 1), '41.300');
  assert.equal(timedSavings(day, 20, 14, 20, 30), '0.000');
});

test('每增加一分钱时圆环转满一圈并从固定起点重新增长', () => {
  const day = 24 * 60 * 60 * 1000;
  assert.equal(timedSavingsCentProgress(day / 4, 1, 0.02, 1), 0.5);
  assert.equal(timedSavingsCentProgress(day / 2, 1, 0.02, 1), 0);
  assert.equal(timedSavingsCentProgress(day * 3 / 4, 1, 0.02, 1), 0.5);
});
