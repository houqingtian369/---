const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const health = require('../health-milestones.js');
const periods = require('../checkin-periods.js');
const ranks = require('../rank-progress.js');

test('每次进入成长页，里程碑进度条从 0 平滑增长到实际值', () => {
  const start = new Date(Date.now() - 49 * 3600000).toISOString();
  const state = { currentStartAt: start, createdAt: start, checkinRuleVersion: 2, checkins: [], lapses: [], urgeWins: [], packCount: 20, planType: 'quit-date' };
  let html = '';
  let bars = [];
  let goGrowth;
  let goHome;
  let frame;
  let observer;
  let toggleMotion;
  let motionReduced = false;
  const app = {
    classList: { toggle() {} },
    get innerHTML() { return html; },
    set innerHTML(value) {
      html = value;
      bars = [...value.matchAll(/<div class="health-progress-track"[^>]*data-health-id="([^"]+)"[^>]*data-target-value="([^"]+)"/g)]
        .map((match) => {
          const fill = { style: { transform: 'scaleX(0)' } };
          const label = { textContent: '0.00%' };
          return {
            dataset: { healthId: match[1], targetValue: match[2] }, fill, label,
            querySelector(selector) { return selector === '.health-progress-fill' ? fill : null; },
            closest() { return { querySelector() { return label; } }; },
          };
        });
    },
    querySelector() { return null; },
    querySelectorAll(selector) {
      if (selector === '.health-progress-track') return bars;
      if (selector === '[data-page]') return [
        { dataset: { page: 'growth' }, addEventListener(_event, callback) { goGrowth = callback; } },
        { dataset: { page: 'home' }, addEventListener(_event, callback) { goHome = callback; } },
      ];
      if (selector === '[data-health-motion]' && html.includes('data-health-motion')) return [
        { addEventListener(_event, callback) { toggleMotion = callback; } },
      ];
      return [];
    },
  };
  vm.runInNewContext(source, {
    window: {
      HealthMilestones: health, CheckinPeriods: periods, RankProgress: ranks,
      matchMedia() { return { matches: motionReduced }; },
      IntersectionObserver: class {
        constructor(callback) { this.callback = callback; observer = this; }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    },
    document: {
      querySelector(selector) { return selector === '#app' ? app : { classList: { add() {}, remove() {} } }; },
      documentElement: { style: { setProperty() {} } },
    },
    localStorage: { getItem() { return JSON.stringify(state); }, setItem() {} },
    setInterval() { return 1; }, clearInterval() {},
    requestAnimationFrame(callback) { frame = callback; return 1; }, cancelAnimationFrame() {},
  });

  goGrowth();
  assert.equal(bars.length, 24);
  assert.ok(bars.every((bar) => bar.fill.style.transform === 'scaleX(0)'));
  const reached = bars[0];
  assert.equal(Number(reached.dataset.targetValue), 100);
  observer.callback([{ target: reached, isIntersecting: true }]);
  frame(0);
  frame(1100);
  assert.notEqual(reached.fill.style.transform, 'scaleX(0)');
  assert.notEqual(reached.fill.style.transform, 'scaleX(1)');
  assert.notEqual(reached.label.textContent, '100.00%');
  assert.ok(Number(reached.fill.style.transform.match(/scaleX\(([^)]+)\)/)[1]) < 0.6);
  frame(2200);
  assert.equal(reached.fill.style.transform, 'scaleX(1)');
  assert.equal(reached.label.textContent, '100.00%');
  assert.equal(bars[1].fill.style.transform, 'scaleX(0)');

  observer.callback([{ target: reached, isIntersecting: false }]);
  assert.equal(reached.fill.style.transform, 'scaleX(0)');
  observer.callback([{ target: reached, isIntersecting: true }]);
  frame(0);
  frame(900);
  assert.notEqual(reached.fill.style.transform, 'scaleX(0)');
  assert.notEqual(reached.fill.style.transform, 'scaleX(1)');
  frame(2200);
  assert.equal(reached.fill.style.transform, 'scaleX(1)');

  goHome();
  goGrowth();
  assert.ok(bars.every((bar) => bar.fill.style.transform === 'scaleX(0)'));

  goHome();
  motionReduced = true;
  goGrowth();
  assert.match(html, /开启进度动画/);
  observer.callback([{ target: bars[0], isIntersecting: true }]);
  assert.equal(bars[0].fill.style.transform, 'scaleX(1)');
  toggleMotion();
  assert.match(html, /关闭进度动画/);
  assert.equal(bars[0].fill.style.transform, 'scaleX(0)');
  observer.callback([{ target: bars[0], isIntersecting: true }]);
  frame(0);
  frame(450);
  assert.notEqual(bars[0].fill.style.transform, 'scaleX(0)');
  assert.notEqual(bars[0].fill.style.transform, 'scaleX(1)');
  goHome();
  goGrowth();
  observer.callback([{ target: bars[0], isIntersecting: true }]);
  frame(0);
  frame(450);
  assert.notEqual(bars[0].fill.style.transform, 'scaleX(1)');
  toggleMotion();
  observer.callback([{ target: bars[0], isIntersecting: true }]);
  assert.equal(bars[0].fill.style.transform, 'scaleX(1)');
});
