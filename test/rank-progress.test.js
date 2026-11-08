const test = require('node:test');
const assert = require('node:assert/strict');
const { stages, progress } = require('../rank-progress.js');

test('两条路线共有 10 个大段位和 34 个小段位', () => {
  for (const route of ['competitive', 'journey']) {
    assert.equal(new Set(stages(route).map((stage) => stage.tier)).size, 10);
    assert.equal(stages(route).length, 34);
    assert.deepEqual(stages(route).map((stage) => stage.startDay), stages('competitive').map((stage) => stage.startDay));
  }
});

test('同一大段位中 III 高于 I，路线切换只改变称号', () => {
  assert.equal(progress(90).current.label, '铂金 I');
  assert.equal(progress(150).current.label, '铂金 III');
  assert.equal(progress(150, 'journey').current.label, '远行者 III');
  assert.equal(progress(150).next.label, '铂金 IV');
  assert.equal(progress(150).remainingDays, 30);
});

test('三年到达最高段位，累计天数不倒退', () => {
  assert.equal(progress(1094).current.label, '黑鹰 III');
  assert.equal(progress(1095).current.label, '巅峰');
  assert.equal(progress(1095, 'journey').current.label, '传奇旅人');
  assert.equal(progress(2000, 'journey').next, null);
  assert.equal(progress(2000, 'journey').percent, 100);
});
