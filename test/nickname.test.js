const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');

test('昵称仅在设置中自愿填写、修改或清空，并同步显示', () => {
  const start = new Date(Date.now() - 86400000).toISOString();
  let saved = { createdAt: start, currentStartAt: start, checkinRuleVersion: 2, checkins: [], lapses: [], urgeWins: [], planType: 'quit-date' };
  const nicknameInput = { value: '', readOnly: true, addEventListener() {}, focus() { this.focused = true; } };
  const nicknameButton = { dataset: { action: 'edit-nickname' }, textContent: '修改', addEventListener(_type, callback) { this.click = () => callback({ currentTarget: this }); } };
  const pages = {};
  const app = {
    get innerHTML() { return this.html; },
    set innerHTML(html) {
      this.html = html;
      if (html.includes('id="nickname"')) {
        nicknameInput.value = saved.nickname || '';
        nicknameInput.readOnly = true;
        nicknameButton.dataset.action = 'edit-nickname';
        nicknameButton.textContent = '修改';
      }
    },
    classList: { toggle() {} },
    querySelector(selector) { return selector === '#nickname' ? nicknameInput : null; },
    querySelectorAll(selector) {
      if (selector === '[data-page]') return ['settings', 'home', 'buddy'].map((page) => ({ dataset: { page }, addEventListener(_type, callback) { pages[page] = callback; } }));
      if (selector === '[data-action]') return [nicknameButton];
      return [];
    },
  };
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  vm.runInNewContext(source, {
    window: { HealthMilestones: require('../health-milestones.js'), CheckinPeriods: require('../checkin-periods.js'), RankProgress: require('../rank-progress.js') },
    document: { querySelector(selector) { return selector === '#app' ? app : toast; }, documentElement: { dataset: {}, style: { setProperty() {} } } },
    localStorage: { getItem() { return JSON.stringify(saved); }, setItem(_key, value) { saved = JSON.parse(value); } },
    setTimeout() { return 1; }, clearTimeout() {}, setInterval() { return 1; }, clearInterval() {},
  });
  assert.match(app.innerHTML, /今天，慢慢来/);
  assert.doesNotMatch(app.innerHTML, /data-page="profile"/);
  pages.settings();
  assert.match(app.innerHTML, /id="nickname"[^>]*readonly/);
  assert.match(app.innerHTML, /data-action="edit-nickname">修改/);
  assert.equal(nicknameInput.readOnly, true);
  nicknameButton.click();
  assert.equal(nicknameInput.readOnly, false);
  assert.equal(nicknameButton.textContent, '确认');
  assert.equal(nicknameInput.focused, true);
  assert.equal(saved.nickname, undefined);
  nicknameInput.value = '小松';
  nicknameButton.click();
  assert.equal(saved.nickname, '小松');
  assert.equal(nicknameInput.readOnly, true);
  assert.match(app.innerHTML, /小松 · 每一步都算数/);
  pages.home();
  assert.match(app.innerHTML, /小松，今天慢慢来/);
  pages.buddy();
  assert.match(app.innerHTML, /小松正在认真戒烟/);
  pages.settings();
  nicknameButton.click();
  nicknameInput.value = '<img src=x>';
  nicknameButton.click();
  pages.home();
  assert.match(app.innerHTML, /&lt;img src=x&gt;，今天慢慢来/);
  assert.doesNotMatch(app.innerHTML, /<img src=x>/);
  pages.settings();
  nicknameButton.click();
  nicknameInput.value = '';
  nicknameButton.click();
  assert.equal(saved.nickname, '');
  pages.home();
  assert.match(app.innerHTML, /今天，慢慢来/);
});
