const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');

const renderOnboarding = () => {
  const fields = {
    startMode: 'continuing',
    startDate: '2026-11-05',
    startTime: '08:30:00',
    cigarettesPerDay: '12',
    packPrice: '25.5',
    packCount: '19',
    savingsGoalName: '一辆自行车',
    savingsGoal: '1299',
  };
  let submit;
  let saved;
  const now = new Date(2026, 10, 7, 20, 29, 37).getTime();
  const startDate = { value: '2026-11-07', min: '', max: '', readOnly: false, addEventListener() {} };
  const startTime = { value: '20:29:37', readOnly: false };
  const radios = ['now', 'continuing', 'planned'].map((value) => ({ value, checked: value === 'now', addEventListener(_event, callback) { this.change = callback; } }));
  const app = {
    innerHTML: '',
    classList: { toggle() {} },
    querySelector(selector) {
      if (selector === '#start-date') return startDate;
      if (selector === '#start-time') return startTime;
      if (selector === '#start-mode-help') return { textContent: '' };
      if (selector === '#start-form') return { addEventListener(_name, callback) { submit = callback; } };
      return null;
    },
    querySelectorAll(selector) { return selector === '[name="startMode"]' ? radios : []; },
  };
  vm.runInNewContext(source, {
    window: { HealthMilestones: require('../health-milestones.js'), CheckinPeriods: require('../checkin-periods.js'), RankProgress: require('../rank-progress.js') },
    document: {
      querySelector(selector) { return selector === '#app' ? app : { textContent: '', classList: { add() {}, remove() {} } }; },
      documentElement: { style: { setProperty() {} } },
    },
    localStorage: { getItem() { return null; }, setItem(_key, value) { saved = JSON.parse(value); } },
    FormData: class { constructor() {} get(name) { return fields[name]; } },
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [now])); }
      static now() { return now; }
    },
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
  });
  return { fields, radios, startDate, startTime, app, now, submit: () => submit({ preventDefault() {}, currentTarget: {} }), saved: () => saved };
};

test('首次进入选择正在戒烟时可填写过去日期，注册时间与戒烟开始时间分别保存', () => {
  const { fields, radios, startDate, app, now, submit, saved: getSaved } = renderOnboarding();
  for (const name of Object.keys(fields)) {
    assert.match(app.innerHTML, new RegExp(`name="${name}"`));
  }
  assert.match(app.innerHTML, /准备戒烟，从现在开始/);
  assert.match(app.innerHTML, /正在戒烟的路上，现在继续打卡记录/);
  assert.match(app.innerHTML, /有戒烟打算，选择一个好日子开始计划/);
  radios[0].checked = false;
  radios[1].checked = true;
  radios[1].change();
  assert.equal(startDate.max, '2026-11-06');
  assert.doesNotMatch(app.innerHTML, /主导航/);
  submit();
  const saved = getSaved();
  assert.equal(saved.createdAt, new Date(now).toISOString());
  assert.equal(saved.currentStartAt, new Date('2026-11-05T08:30:00').toISOString());
  assert.equal(saved.startMode, 'continuing');
  assert.equal(saved.cigarettesPerDay, 12);
  assert.equal(saved.packPrice, 25.5);
  assert.equal(saved.packCount, 19);
  assert.equal(saved.savingsGoalName, '一辆自行车');
  assert.equal(saved.savingsGoal, 1299);
  assert.match(app.innerHTML, /主导航/);
});

test('从现在开始使用提交时刻，忽略日期时间输入', () => {
  const { fields, startDate, startTime, now, submit, saved } = renderOnboarding();
  assert.equal(startDate.min, '2026-11-07');
  assert.equal(startDate.max, '2026-11-07');
  assert.equal(startDate.disabled, true);
  assert.equal(startTime.disabled, true);
  fields.startMode = 'now';
  fields.startDate = '2025-01-01';
  fields.startTime = '00:00:00';
  submit();
  assert.equal(saved().currentStartAt, new Date(now).toISOString());
});

test('未来计划只能选择明天及以后，今天不能提交', () => {
  const { fields, radios, startDate, app, submit, saved } = renderOnboarding();
  radios[0].checked = false;
  radios[2].checked = true;
  radios[2].change();
  assert.equal(startDate.min, '2026-11-08');
  fields.startMode = 'planned';
  fields.startDate = '2026-11-07';
  submit();
  assert.equal(saved(), undefined);
  fields.startDate = '2026-11-08';
  submit();
  assert.equal(saved().startMode, 'planned');
  assert.equal(saved().currentStartAt, new Date('2026-11-08T08:30:00').toISOString());
  assert.match(app.innerHTML, /计划准备中/);
  assert.match(app.innerHTML, /id="home-timed-savings-value"[^>]*>¥0\.000/);
});

test('继续打卡不能把今天作为历史开始日期', () => {
  const { fields, radios, submit, saved } = renderOnboarding();
  radios[0].checked = false;
  radios[1].checked = true;
  radios[1].change();
  fields.startDate = '2026-11-07';
  submit();
  assert.equal(saved(), undefined);
});
