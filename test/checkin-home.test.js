const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const health = require('../health-milestones.js');
const periods = require('../checkin-periods.js');
const ranks = require('../rank-progress.js');

const renderHome = (hoursSinceStart, lapses = [], options = {}) => {
  const start = options.startAt || new Date(Date.now() - hoursSinceStart * 3600000).toISOString();
  const makeupDates = { hidden: true };
  const makeupButton = {
    dataset: { action: 'toggle-makeup' },
    addEventListener(_type, callback) { options.clickMakeup = () => callback({ currentTarget: makeupButton }); },
    setAttribute(name, value) { if (name === 'aria-expanded') options.makeupExpanded = value; },
  };
  const growthButton = {
    dataset: { page: 'growth' },
    addEventListener(_type, callback) { options.goGrowth = callback; },
  };
  const buddyButton = {
    dataset: { page: 'buddy' },
    addEventListener(_type, callback) { options.goBuddy = callback; },
  };
  const settingsButton = {
    dataset: { page: 'settings' },
    addEventListener(_type, callback) { options.goSettings = callback; },
  };
  const homeButton = {
    dataset: { page: 'home' },
    addEventListener(_type, callback) { options.goHome = callback; },
  };
  const rankJourneyInput = {
    value: 'journey',
    addEventListener(_type, callback) { options.chooseJourney = callback; },
  };
  const checkinButton = {
    dataset: { action: 'checkin', periodIndex: '5' },
    addEventListener(_type, callback) { options.clickCheckin = () => callback({ currentTarget: checkinButton }); },
  };
  const saveGoalButton = {
    dataset: { action: 'save-goal' },
    addEventListener(_type, callback) { options.clickSaveGoal = () => callback({ currentTarget: saveGoalButton }); },
  };
  const nextGoalButton = {
    dataset: { action: 'next-goal' },
    addEventListener(_type, callback) { options.clickNextGoal = () => callback({ currentTarget: nextGoalButton }); },
  };
  const app = {
    innerHTML: '',
    classList: { toggle() {} },
    querySelectorAll(selector) {
      if (options.testMakeupClick && selector === '[data-action]') return [makeupButton];
      if (options.testCheckinClick && selector === '[data-action]') return [checkinButton];
      if ((options.testSaveGoal || options.testGoalRenewal) && selector === '[data-action]') return [saveGoalButton];
      if (options.testNextGoalDialog && selector === '[data-action]') return [nextGoalButton];
      if (options.testGoalRenewal && selector === '[data-page]') return [growthButton, settingsButton];
      if ((options.testGrowth || options.testNextGoalDialog) && selector === '[data-page]') return [growthButton];
      if (options.testBuddy && selector === '[data-page]') return [buddyButton];
      if (options.testSettings && selector === '[data-page]') return [settingsButton];
      if (options.testRankSelection && selector === '[data-page]') return [homeButton, growthButton, settingsButton];
      if (options.testRankSelection && selector === '[name="rankRoute"]') return [rankJourneyInput];
      return [];
    },
    querySelector(selector) {
      if (options.liveNodes?.[selector]) return options.liveNodes[selector];
      if (selector === '#makeup-dates') return makeupDates;
      if (selector === '#home-money-ring' && options.ringValues) return { setAttribute(_name, value) { options.ringValues.push(value); } };
      if (selector === '#reminder-toggle' || selector === '#reminder-time') return { addEventListener() {} };
      if (selector === '#savings-goal-name') return { value: options.goalInputName || '新的奖励' };
      if (selector === '#savings-goal') return { value: options.goalInputAmount || '500' };
      return null;
    },
  };
  const state = {
    currentStartAt: start,
    createdAt: options.registeredAt || start,
    checkins: options.checkins || [],
    checkinRuleVersion: options.legacy ? undefined : 2,
    startTimeNeedsReview: false,
    lapses,
    lastLapseAt: lapses.at(-1)?.at || null,
    urgeWins: options.urgeWins || [],
    cigarettesPerDay: options.cigarettesPerDay || null,
    packPrice: options.packPrice || null,
    packCount: 20,
    planType: options.planType || 'quit-date',
    savingsGoal: options.savingsGoal,
    savingsGoalName: options.savingsGoalName,
    savingsGoalStartAmount: options.savingsGoalStartAmount,
    savingsGoalHistory: options.savingsGoalHistory,
    rankRoute: options.rankRoute,
    startMode: options.startMode,
    lastSeenAt: options.lastSeenAt,
    unverifiedGaps: options.unverifiedGaps || [],
    plannedQuitDate: options.plannedQuitDate,
  };
  const nextGoalName = { value: options.goalInputName || '旅行' };
  const nextGoalAmount = { value: options.goalInputAmount || '100' };
  const dialogSave = { addEventListener(_type, callback) { this.click = callback; } };
  const dialog = { querySelector(selector) { return selector === 'h2' ? { id: '' } : null; }, setAttribute() {}, focus() {} };
  const backdrop = { innerHTML: '', addEventListener() {}, remove() {}, querySelector(selector) {
    if (selector === '.modal') return dialog;
    if (selector === '#next-goal-name') return nextGoalName;
    if (selector === '#next-goal-amount') return nextGoalAmount;
    if (selector === '[data-save-next-goal]') return dialogSave;
    return null;
  }, querySelectorAll() { return []; } };
  vm.runInNewContext(source, {
    window: { HealthMilestones: health, CheckinPeriods: periods, RankProgress: ranks },
    document: {
      querySelector(selector) { return selector === '#app' ? app : { classList: { add() {}, remove() {} } }; },
      documentElement: { style: { setProperty() {} } },
      body: { append() { options.dialogHtml = backdrop.innerHTML; } },
      createElement() { return backdrop; },
    },
    localStorage: { getItem() { return JSON.stringify(state); }, setItem(_key, value) { options.savedState = JSON.parse(value); } },
    Date: options.now === undefined ? Date : class extends Date {
      constructor(...args) { super(...(args.length ? args : [options.now])); }
      static now() { return options.now; }
    },
    setInterval(callback, delay) { if (delay === 1000) options.tick = callback; return 1; },
    clearInterval() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    requestAnimationFrame(callback) { options.nextFrame = callback; return 1; },
    cancelAnimationFrame() {},
  });
  if (options.testMakeupClick) {
    options.clickMakeup();
    options.makeupDatesHidden = makeupDates.hidden;
  }
  if (options.testGrowth) options.goGrowth();
  if (options.testNextGoalDialog) { options.goGrowth(); options.growthHtmlBefore = app.innerHTML; if (app.innerHTML.includes('data-action="next-goal"')) options.clickNextGoal(); options.clickSaveNextGoal = () => dialogSave.click(); }
  if (options.testBuddy) { options.homeHtml = app.innerHTML; options.goBuddy(); }
  if (options.testSettings) options.goSettings();
  if (options.testRankSelection) {
    options.goSettings();
    options.settingsHtml = app.innerHTML;
    options.chooseJourney();
    options.goHome();
    options.homeHtml = app.innerHTML;
    options.goGrowth();
    options.growthHtml = app.innerHTML;
    options.goSettings();
    options.settingsAfterSelection = app.innerHTML;
  }
  if (options.testSaveGoal) options.clickSaveGoal();
  if (options.testGoalRenewal) { options.goSettings(); options.clickSaveGoal(); options.goGrowth(); }
  if (options.testCheckinClick) options.clickCheckin();
  options.currentHtml = () => app.innerHTML;
  return app.innerHTML;
};

test('首页满 24 小时后才出现确认无烟按钮', () => {
  const ongoing = renderHome(23);
  assert.match(ongoing, /role="progressbar"/);
  assert.doesNotMatch(ongoing, /data-action="checkin"/);
  assert.match(renderHome(25), /data-action="checkin" data-period-index="0"/);
});

test('首页 01 模块展示戒烟天数、按日均烟量估算的戒掉支数和实时金额圆环', () => {
  const html = renderHome(49, [], { cigarettesPerDay: 12, packPrice: 24 });
  assert.match(html, /戒烟第/);
  assert.match(html, /id="home-smoke-free-days">2/);
  assert.match(html, /累计戒掉/);
  assert.match(html, /id="home-avoided-cigarettes">24<\/strong><em>根/);
  assert.match(html, /class="money-orbit home-money-orbit"/);
  assert.match(html, /id="home-timed-savings-value"/);
  assert.match(html, /¥29\.400/);
});

test('今天页首屏显示当前称号及下一称号所需累计无烟日，沿用设置页路线选择', () => {
  const competitive = renderHome(181 * 24);
  assert.match(competitive, /竞技段位 · 当前称号<\/span><strong>铂金 IV<\/strong>/);
  assert.match(competitive, /下一步<\/span><strong>钻石 I<\/strong><small>还需 29 个累计无烟日/);
  const journey = renderHome(181 * 24, [], { rankRoute: 'journey' });
  assert.match(journey, /探索旅程 · 当前称号<\/span><strong>远行者 IV<\/strong>/);
  assert.match(journey, /下一步<\/span><strong>越岭者 I<\/strong><small>还需 29 个累计无烟日/);
  assert.match(renderHome(1095 * 24), /已到达最高称号/);
});

test('称号风格与晋级线路在设置页分别展示，今天和成长页同步选中风格', () => {
  const options = { testRankSelection: true };
  renderHome(181 * 24, [], options);
  assert.match(options.settingsHtml, /称号风格与晋级线路/);
  assert.match(options.settingsHtml, /<summary>查看竞技段位的晋级线路<\/summary>/);
  assert.match(options.settingsHtml, /<summary>查看探索旅程的晋级线路<\/summary>/);
  assert.equal((options.settingsHtml.match(/class="rank-tier /g) || []).length, 20);
  assert.equal((options.settingsHtml.match(/class="rank-stage /g) || []).length, 68);
  assert.doesNotMatch(options.settingsHtml, /<details class="rank-route-details" open/);
  assert.match(options.settingsHtml, /青铜<\/strong><span><span class="rank-stage ">I · 0 天/);
  assert.match(options.settingsHtml, /启程者<\/strong><span><span class="rank-stage ">I · 0 天/);
  assert.match(options.settingsHtml, /class="rank-stage current">IV · 180 天/);
  assert.match(options.settingsHtml, /巅峰 · 1095 天/);
  assert.match(options.settingsHtml, /传奇旅人 · 1095 天/);
  assert.match(options.settingsHtml, /name="rankRoute" value="competitive" checked/);
  assert.match(options.settingsHtml, /name="rankRoute" value="journey"/);
  assert.equal(options.savedState.rankRoute, 'journey');
  assert.match(options.settingsAfterSelection, /name="rankRoute" value="journey" checked/);
  assert.match(options.homeHtml, /探索旅程 · 当前称号<\/span><strong>远行者 IV<\/strong>/);
  assert.match(options.growthHtml, /当前称号<\/span><strong>远行者 IV<\/strong>/);
  assert.doesNotMatch(options.growthHtml, /data-rank-route|name="rankRoute"|data-action="lapse"/);
  assert.match(options.homeHtml, /data-action="lapse"/);
});

test('记录吸烟后累计戒掉支数保留此前估算并扣除实际吸烟支数', () => {
  const now = new Date('2026-11-06T12:00:00Z').getTime();
  const startAt = new Date(now - 49 * 3600000).toISOString();
  const lapses = [{ at: new Date(now - 3600000).toISOString(), cigarettes: 1 }];
  const html = renderHome(0, lapses, { now, startAt, cigarettesPerDay: 12 });
  assert.match(html, /id="home-avoided-cigarettes">23<\/strong><em>根/);
});

test('记录吸烟后累计节省保留此前金额，只扣除实际抽掉的支数', () => {
  const now = Date.parse('2026-11-06T12:00:00Z');
  const startAt = new Date(now - 4 * 86400000).toISOString();
  const lapses = [{ at: new Date(now - 3600000).toISOString(), cigarettes: 1 }];
  const html = renderHome(0, lapses, { now, startAt, cigarettesPerDay: 20, packPrice: 14 });
  assert.match(html, /id="home-timed-savings-value"[^>]*>¥55\.300/);
});

test('今天页从选定的戒烟开始时间计算，中途吸烟不重置', () => {
  const now = new Date(2026, 10, 6, 20).getTime();
  const startAt = new Date(2025, 10, 5, 22, 8, 5).toISOString();
  const lapses = [{ at: new Date(2026, 10, 4, 18).toISOString() }];
  const registeredAt = new Date(2026, 10, 5, 12).toISOString();
  const html = renderHome(0, lapses, { now, startAt, registeredAt });
  assert.match(html, /id="home-smoke-free-days">365/);
  assert.match(html, /从戒烟开始累计已记录时间/);
  assert.doesNotMatch(html, />戒烟成果</);
});

test('继续戒烟的注册前时间明确标为历史估算', () => {
  const html = renderHome(48, [], { startMode: 'continuing' });
  assert.match(html, /含注册前历史估算/);
  assert.doesNotMatch(html, /从戒烟开始累计已记录时间/);
});

test('戒烟开始时为 0 天，满 24 小时才累计 1 天，时分秒每秒更新', () => {
  const startAt = new Date(2026, 10, 9, 9).toISOString();
  const options = {
    now: Date.parse(startAt), startAt,
    liveNodes: { '#home-quit-time': { textContent: '' }, '#home-smoke-free-days': { textContent: '' } },
  };
  const initial = renderHome(0, [], options);
  assert.match(initial, /id="home-smoke-free-days">0/);
  assert.match(initial, /id="home-quit-time"[^>]*>00小时 00分钟 00秒/);
  options.now += 1000;
  options.tick();
  assert.equal(options.liveNodes['#home-quit-time'].textContent, '00小时 00分钟 01秒');

  const afterDay = renderHome(0, [], { now: Date.parse(startAt) + 86400000, startAt });
  assert.match(afterDay, /id="home-smoke-free-days">1/);
  assert.match(afterDay, /id="home-quit-time"[^>]*>00小时 00分钟 00秒/);
});

test('成长页只计完成的整天，同一天多次吸烟只扣一天', () => {
  const start = new Date(2026, 10, 9, 9).getTime();
  const lapses = [
    { at: new Date(start + 2 * 3600000).toISOString() },
    { at: new Date(start + 4 * 3600000).toISOString() },
    { at: new Date(start + 2 * 86400000 + 3600000).toISOString() },
  ];
  const html = renderHome(0, lapses, { now: start + 2 * 86400000 + 2 * 3600000, startAt: new Date(start).toISOString(), testGrowth: true });
  assert.match(html, /累计已记录戒烟时长<\/span><strong[^>]*id="total-smoke-free">2\s*<small>天/);
  assert.match(html, /id="total-smoke-free-days">1<\/span>/);
});

test('各项数据下方有默认收起的计算说明，并解释 A B C 起算规则', () => {
  const home = renderHome(2, [], { startMode: 'now' });
  assert.match(home, /<div class="home-rule-row">/);
  assert.match(home, /<summary>戒掉支数怎么算<\/summary>/);
  assert.match(home, /<summary>节省金额怎么算<\/summary>/);
  const growthB = renderHome(24, [], { testGrowth: true, startMode: 'continuing' });
  assert.equal((growthB.match(/class="stat-card/g) || []).length, 4);
  assert.equal((growthB.match(/<details class="rule-disclosure">/g) || []).length, 6);
  assert.match(growthB, /B：从你填写的过去日期和时间起算/);
  assert.match(growthB, /累计戒烟时长（含历史估算）/);
  assert.match(growthB, /健康参考进度＝累计计入无烟时间/);
  assert.match(growthB, /累计节省＝（已计入时间/);
  const growthC = renderHome(0, [], { testGrowth: true, startMode: 'planned' });
  assert.match(growthC, /C：从你选定的未来日期和时间起算/);
  assert.doesNotMatch(growthC, /<details class="rule-disclosure" open/);
});

test('成长页在长期累计后再次吸烟时按累计无烟时间显示参考进度', () => {
  const start = Date.parse('2025-11-05T09:00:00Z');
  const now = start + 366 * 86400000 + 5000;
  const lapses = [{ at: new Date(now - 18000).toISOString(), cigarettes: 1 }];
  const options = { now, startAt: new Date(start).toISOString(), testGrowth: true,
    liveNodes: { '#health-continuous-time': { textContent: '' }, '#health-timeline-note': { textContent: '' } } };
  const html = renderHome(0, lapses, options);
  assert.match(html, /id="total-smoke-free">366\s*<small>天/);
  assert.match(html, /id="total-smoke-free-days">365<\/span>/);
  assert.match(html, /累计计入无烟时间/);
  assert.match(html, /id="health-continuous-time">365天 00:00:05/);
  assert.match(html, /累计无烟 365 天/);
  options.now += 1000;
  options.tick();
  assert.equal(options.liveNodes['#health-continuous-time'].textContent, '365天 00:00:06');
  assert.match(options.liveNodes['#health-timeline-note'].textContent, /累计无烟 365 天/);
});

test('奖励目标达到预估金额后显示鼓励和下一个目标入口，并在页面停留时更新', () => {
  const now = Date.parse('2026-11-10T09:00:00Z');
  const startAt = new Date(now - 86400000 + 10000).toISOString();
  const goalComplete = { hidden: true };
  const goalAction = { textContent: '' };
  const goalFill = { style: {} };
  const goalTrack = { setAttribute(name, value) { this[name] = value; } };
  const options = { now, startAt, testGrowth: true, cigarettesPerDay: 20, packPrice: 20,
    savingsGoal: 20, savingsGoalName: '旅行',
    liveNodes: { '#timed-savings-value': { textContent: '' }, '#goal-complete': goalComplete, '#goal-action-label': goalAction, '#goal-track-fill': goalFill, '#goal-track': goalTrack } };
  const initial = renderHome(0, [], options);
  assert.match(initial, /id="goal-complete"[^>]*hidden/);
  assert.match(initial, /id="goal-action-label">调整目标/);
  options.now += 11000;
  options.tick();
  assert.equal(goalComplete.hidden, false);
  assert.equal(goalAction.textContent, '设置下一个目标');
  assert.equal(goalFill.style.width, '100%');
  assert.equal(goalTrack['aria-valuenow'], '100');
  const reached = renderHome(48, [], { testGrowth: true, cigarettesPerDay: 20, packPrice: 20, savingsGoal: 20, savingsGoalName: '旅行' });
  assert.match(reached, /目标金额达成，真棒！/);
  assert.match(reached, /id="goal-action-label">设置下一个目标/);
  assert.doesNotMatch(reached, /id="goal-complete"[^>]*hidden/);
});

test('完成的奖励目标换新后从零累计并在下方保留完成记录', () => {
  const now = Date.parse('2026-11-10T09:00:00Z');
  const goalAmount = { textContent: '' };
  const goalFill = { style: {} };
  const goalTrack = { setAttribute(name, value) { this[name] = value; } };
  const options = { now, startAt: new Date(now - 48 * 3600000).toISOString(),
    testGoalRenewal: true, cigarettesPerDay: 20, packPrice: 20,
    savingsGoal: 20, savingsGoalName: '游戏', goalInputName: '旅行', goalInputAmount: '100',
    liveNodes: { '#timed-savings-value': { textContent: '' }, '#goal-saved-amount': goalAmount,
      '#goal-track-fill': goalFill, '#goal-track': goalTrack, '#goal-complete': { hidden: true } } };
  const html = renderHome(0, [], options);
  assert.equal(options.savedState.savingsGoalStartAmount, 40);
  assert.equal(options.savedState.savingsGoalHistory.length, 1);
  assert.equal(options.savedState.savingsGoalHistory[0].name, '游戏');
  assert.equal(options.savedState.savingsGoalHistory[0].amount, 20);
  assert.match(html, /目标奖励：旅行/);
  assert.match(html, /id="goal-saved-amount">¥0\.000/);
  assert.match(html, /id="goal-track"[^>]*aria-valuenow="0"/);
  assert.match(html, /游戏[\s\S]*¥20[\s\S]*已完成/);
  assert.ok(html.indexOf('目标奖励：旅行') < html.indexOf('已完成的目标'));
  assert.match(html, /id="goal-complete"[^>]*hidden/);
  options.now += 24 * 3600000;
  options.tick();
  assert.equal(goalAmount.textContent, '¥20.000');
  assert.equal(goalFill.style.width, '20%');
  assert.equal(goalTrack['aria-valuenow'], '20');
});

test('从已完成目标的入口开始新目标时直接归零并保留旧目标', () => {
  const now = Date.parse('2026-11-10T09:00:00Z');
  const options = { now, startAt: new Date(now - 48 * 3600000).toISOString(),
    testNextGoalDialog: true, cigarettesPerDay: 20, packPrice: 20,
    savingsGoal: 20, savingsGoalName: '游戏', goalInputName: '旅行', goalInputAmount: '100' };
  renderHome(0, [], options);
  assert.match(options.growthHtmlBefore, /data-action="next-goal"/);
  assert.match(options.dialogHtml, /开始新目标/);
  assert.match(options.dialogHtml, /当前目标会保留在.*已完成的目标/);
  options.clickSaveNextGoal();
  assert.equal(options.savedState.savingsGoalStartAmount, 40);
  assert.equal(options.savedState.savingsGoalHistory[0].name, '游戏');
  const html = options.currentHtml();
  assert.match(html, /目标奖励：旅行/);
  assert.match(html, /id="goal-saved-amount">¥0\.000/);
  assert.match(html, /id="goal-track"[^>]*aria-valuenow="0"/);
  assert.match(html, /游戏[\s\S]*已完成/);
});

test('尚未完成的目标修改时保留已有进度', () => {
  const now = Date.parse('2026-11-10T09:00:00Z');
  const options = { now, startAt: new Date(now - 24 * 3600000).toISOString(),
    testGoalRenewal: true, cigarettesPerDay: 20, packPrice: 20,
    savingsGoal: 100, savingsGoalName: '游戏', goalInputName: '旅行', goalInputAmount: '200' };
  const html = renderHome(0, [], options);
  assert.equal(options.savedState.savingsGoalHistory?.length || 0, 0);
  assert.match(html, /id="goal-saved-amount">¥20\.000/);
});

test('超过三天未打开时首页累计暂停，最近三期仍可补卡', () => {
  const day = 86400000;
  const start = Date.parse('2026-11-01T09:00:00Z');
  const options = { now: start + 6 * day, startAt: new Date(start).toISOString(), lastSeenAt: new Date(start + day).toISOString(), cigarettesPerDay: 20, packPrice: 14 };
  const html = renderHome(0, [], options);
  assert.equal(options.savedState.unverifiedGaps.length, 1);
  assert.match(html, /id="home-smoke-free-days">1<\/strong>/);
  assert.match(html, /id="home-avoided-cigarettes">20<\/strong>/);
  assert.match(html, /id="home-timed-savings-value"[^>]*>¥14\.000/);
  assert.match(html, /data-period-index="5"/);
  assert.match(html, /data-period-index="4"/);
  assert.match(html, /data-period-index="3"/);
  assert.doesNotMatch(html, /data-period-index="2"/);
  assert.match(html, /有一段时间尚未确认/);
  assert.match(html, /href="#daily-title">查看可补日期/);
});

test('补最近一期后仅恢复该期的累计时间', () => {
  const day = 86400000;
  const start = Date.parse('2026-11-01T09:00:00Z');
  const options = { now: start + 6 * day, startAt: new Date(start).toISOString(), lastSeenAt: new Date(start + day).toISOString(), cigarettesPerDay: 20, packPrice: 14, testCheckinClick: true };
  const html = renderHome(0, [], options);
  assert.deepEqual(options.savedState.unverifiedGaps, [{ start: start + day, end: start + 5 * day }]);
  assert.match(html, /id="home-smoke-free-days">2<\/strong>/);
  assert.match(html, /id="home-timed-savings-value"[^>]*>¥28\.000/);
});

test('找搭子邀请卡与首页圆环使用同一个累计预估金额', () => {
  const start = Date.parse('2026-11-01T09:00:00Z');
  const amountNode = { textContent: '' };
  const options = { now: start + 3 * 86400000, startAt: new Date(start).toISOString(), cigarettesPerDay: 20, packPrice: 14, testBuddy: true, liveNodes: { '#buddy-savings-value': amountNode } };
  const buddyHtml = renderHome(0, [], options);
  assert.match(options.homeHtml, /id="home-timed-savings-value"[^>]*>¥42\.000/);
  assert.match(buddyHtml, /<strong id="buddy-savings-value">¥42\.000<\/strong><span>预估省下<\/span>/);
  options.now += 3600000;
  options.tick();
  assert.equal(amountNode.textContent, '¥42.583');
});

test('邀请卡显示当前称号、预估戒掉、小红花和戒烟期间吸烟根数', () => {
  const start = Date.parse('2026-11-01T09:00:00Z');
  const now = start + 5 * 86400000;
  const lapses = [{ at: new Date(start + 2 * 86400000 + 3600000).toISOString(), cigarettes: 2 }];
  const options = { now, startAt: new Date(start).toISOString(), cigarettesPerDay: 20,
    packPrice: 14, rankRoute: 'journey', urgeWins: [{ cigarettes: 1 }, { cigarettes: 2 }], testBuddy: true };
  const html = renderHome(0, lapses, options);
  assert.match(html, /当前称号<\/span><strong id="buddy-rank">启程者 III<\/strong>/);
  assert.match(html, /<strong id="buddy-avoided">98 根<\/strong><span>预估戒掉<\/span>/);
  assert.match(html, /<strong id="buddy-flowers">2 朵<\/strong><span>忍住获得的小红花<\/span>/);
  assert.match(html, /<strong id="buddy-smoked">2 根<\/strong><span>戒烟期间吸烟<\/span>/);
  assert.ok(html.indexOf('class="invite-extra-stats"') < html.indexOf('class="invite-extra-rank"'));
});

test('邀请卡停留期间跨过无烟日时同步更新数据和称号', () => {
  const start = Date.parse('2026-11-01T09:00:00Z');
  const day = 86400000;
  const nodes = Object.fromEntries(['#buddy-smoke-free-days', '#buddy-checkins', '#buddy-avoided',
    '#buddy-flowers', '#buddy-smoked', '#buddy-rank'].map((key) => [key, { textContent: '' }]));
  const options = { now: start + 3 * day - 500, startAt: new Date(start).toISOString(),
    cigarettesPerDay: 20, rankRoute: 'journey', urgeWins: [{ cigarettes: 1 }, { cigarettes: 1 }],
    testBuddy: true, liveNodes: nodes };
  renderHome(0, [], options);
  options.now += 1000;
  options.tick();
  assert.equal(nodes['#buddy-smoke-free-days'].textContent, '3');
  assert.equal(nodes['#buddy-checkins'].textContent, '0');
  assert.equal(nodes['#buddy-avoided'].textContent, '60 根');
  assert.equal(nodes['#buddy-flowers'].textContent, '2 朵');
  assert.equal(nodes['#buddy-smoked'].textContent, '0 根');
  assert.equal(nodes['#buddy-rank'].textContent, '启程者 III');
});

test('设置页只读展示首次选择的模式与开始时刻', () => {
  const start = Date.parse('2026-11-10T09:00:00Z');
  const html = renderHome(0, [], { now: start - 86400000, startAt: new Date(start).toISOString(), startMode: 'planned', testSettings: true });
  assert.match(html, /有戒烟打算，选择一个好日子开始计划/);
  assert.match(html, /计划戒烟日/);
  assert.doesNotMatch(html, /id="planned-quit-date"|id="plan-type"|data-action="edit-date"/);
  assert.match(html, /id="savings-goal-name"/);
  assert.match(html, /每日鼓励提醒.*功能准备中，暂不发送通知/);
  assert.doesNotMatch(html, /id="reminder-toggle"|id="reminder-time"/);
});

test('设置页保存奖励目标不会改动首次选择的日期与戒烟路线', () => {
  const start = Date.parse('2026-11-10T09:00:00Z');
  const options = { now: start - 86400000, startAt: new Date(start).toISOString(), startMode: 'planned', planType: 'reduce-to-quit', plannedQuitDate: '2026-11-15', testSettings: true, testSaveGoal: true };
  renderHome(0, [], options);
  assert.equal(options.savedState.currentStartAt, new Date(start).toISOString());
  assert.equal(options.savedState.plannedQuitDate, '2026-11-15');
  assert.equal(options.savedState.planType, 'reduce-to-quit');
  assert.equal(options.savedState.savingsGoalName, '新的奖励');
  assert.equal(options.savedState.savingsGoal, 500);
});

test('金额圆环在一秒内持续前进，不等待数字刷新', () => {
  const now = Date.now();
  const options = { now, startAt: new Date(now).toISOString(), cigarettesPerDay: 20, packPrice: 216, ringValues: [] };
  renderHome(0, [], options);
  assert.equal(typeof options.nextFrame, 'function');
  options.now += 500;
  options.nextFrame();
  const first = Number(options.ringValues.at(-1).split(' ')[0]);
  options.now += 500;
  options.nextFrame();
  const second = Number(options.ringValues.at(-1).split(' ')[0]);
  assert.ok(first > 0 && second > first);
});

test('逐步减量且计划戒烟日未到时，戒烟天数和无烟成果不提前累计', () => {
  const future = new Date(Date.now() + 3 * 86400000);
  const plannedQuitDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
  const html = renderHome(20 * 24, [], { cigarettesPerDay: 20, packPrice: 25, planType: 'reduce-to-quit', plannedQuitDate });
  assert.match(html, /id="home-smoke-free-days">0/);
  assert.match(html, /id="home-avoided-cigarettes">0/);
  assert.match(html, /id="home-timed-savings-value"[^>]*>¥0\.000/);
});

test('首页只直接确认上一期，较早的两期收在补卡入口后', () => {
  const html = renderHome(5.5 * 24);
  assert.match(html, /data-action="checkin" data-period-index="4"/);
  assert.match(html, /忘记打卡了？/);
  assert.match(html, /data-action="toggle-makeup"[^>]*aria-expanded="false"/);
  assert.match(html, /id="makeup-dates"[^>]*hidden/);
  assert.match(html, /data-action="checkin" data-period-index="3"/);
  assert.match(html, /data-action="checkin" data-period-index="2"/);
  assert.doesNotMatch(html, /data-action="checkin" data-period-index="1"/);
  assert.equal((html.match(/data-action="checkin"/g) || []).length, 3);
});

test('点击补卡按钮后展开可补日期并更新展开状态', () => {
  const options = { testMakeupClick: true };
  renderHome(5.5 * 24, [], options);
  assert.equal(options.makeupDatesHidden, false);
  assert.equal(options.makeupExpanded, 'true');
});

test('上一期已确认时不显示多余的确认区域', () => {
  const startAt = new Date(Date.now() - 25 * 3600000).toISOString();
  const html = renderHome(25, [], { startAt, checkins: [periods.dateKey(startAt)] });
  assert.doesNotMatch(html, /上一期无烟确认|上一期已确认|class="checkin-periods"/);
});

test('周期内有吸烟记录时不出现确认按钮，月历显示吸烟状态', () => {
  const lapse = { at: new Date(Date.now() - 20 * 3600000).toISOString() };
  const html = renderHome(25, [lapse]);
  assert.doesNotMatch(html, /data-action="checkin"/);
  assert.match(html, /month-day smoked/);
});

test('旧版在周期结束前完成的打卡转为待确认，原始记录保留', () => {
  const key = periods.dateKey(Date.now() - 23 * 3600000);
  const options = { checkins: [key], legacy: true };
  const html = renderHome(23, [], options);
  assert.deepEqual(options.savedState.checkins, []);
  assert.deepEqual(options.savedState.legacyEarlyCheckins, [key]);
  assert.doesNotMatch(html, /data-action="checkin"/);
});
