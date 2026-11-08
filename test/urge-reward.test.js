const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const health = require('../health-milestones.js');
const periods = require('../checkin-periods.js');
const ranks = require('../rank-progress.js');

test('鼓励语逐次轮换，保存成功才赠花，成长页累计显示', () => {
  const start = new Date(Date.now() - 2 * 86400000).toISOString();
  let saved = {
    currentStartAt: start, createdAt: start, checkinRuleVersion: 2,
    checkins: [], lapses: [{ at: start, cigarettes: 1, trigger: '压力大' }], urgeWins: [], packCount: 20, packPrice: 14,
    planType: 'quit-date',
  };
  let currentModal;
  let openWin;
  let openGrowth;
  const toast = { innerHTML: '', textContent: '', classList: { add() {}, remove() {} } };
  const app = {
    innerHTML: '',
    classList: { toggle() {} },
    querySelector() { return null; },
    querySelectorAll(selector) {
      if (selector === '[data-action]') return [{ dataset: { action: 'log-win' }, addEventListener(_event, callback) { openWin = callback; } }];
      if (selector === '[data-page]') return [{ dataset: { page: 'growth' }, addEventListener(_event, callback) { openGrowth = callback; } }];
      return [];
    },
  };
  const document = {
    documentElement: { style: { setProperty() {} } },
    querySelector(selector) { return selector === '#app' ? app : selector === '#toast' ? toast : null; },
    body: { append(modal) { currentModal = modal; } },
    createElement() {
      const callbacks = {};
      return {
        innerHTML: '',
        removed: false,
        remove() { this.removed = true; },
        addEventListener() {},
        querySelector(selector) {
          if (selector === '[data-close]') return { addEventListener(_event, callback) { callbacks.close = callback; } };
          if (selector === '#win-form') return { addEventListener(_event, callback) { callbacks.submit = callback; } };
          if (selector === '#win-cigarettes') return { value: '1' };
          if (selector === '#win-trigger' || selector === '#win-method') return { value: '' };
          return null;
        },
        close() { callbacks.close(); },
        submit() { callbacks.submit({ preventDefault() {} }); },
      };
    },
  };
  vm.runInNewContext(source, {
    window: { HealthMilestones: health, CheckinPeriods: periods, RankProgress: ranks },
    document,
    localStorage: { getItem() { return JSON.stringify(saved); }, setItem(_key, value) { saved = JSON.parse(value); } },
    setInterval() { return 1; }, clearInterval() {},
    setTimeout() { return 1; }, clearTimeout() {},
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
  });

  const messages = new Set();
  for (let i = 0; i < 12; i++) {
    openWin();
    const message = currentModal.innerHTML.match(/class="win-encouragement" role="status">([^<]+)</)?.[1];
    assert.ok(message);
    messages.add(message);
    assert.doesNotMatch(currentModal.innerHTML, /预计本次省下/);
    currentModal.close();
  }
  assert.equal(messages.size, 12);
  assert.equal(saved.urgeWins.length, 0);

  openWin();
  currentModal.submit();
  assert.equal(saved.urgeWins.length, 1);
  assert.match(toast.innerHTML, /<svg[^>]*>.*?送你一朵小红花/s);
  openGrowth();
  assert.match(app.innerHTML, /累计小红花<\/span><strong><svg[^>]*>.*?<span>1<\/span> <small>朵<\/small>/s);
  assert.match(app.innerHTML, /<h2>戒烟历程<\/h2>/);
  assert.match(app.innerHTML, /😄<\/span> 成功应对/);
  assert.match(app.innerHTML, /😭<\/span> 糟糕了，吸烟了/);
  assert.match(app.innerHTML, /class="history-tag success-tag"><svg[^>]*>.*?1 朵/s);
  assert.doesNotMatch(app.innerHTML, /\+¥0\.70/);
});
