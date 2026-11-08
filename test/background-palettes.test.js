const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../app.js'), 'utf8');
const health = require('../health-milestones.js');
const periods = require('../checkin-periods.js');
const ranks = require('../rank-progress.js');

test('页面配色提供多种搭配，选择后保存并同步背景与卡片色阶', () => {
  const start = new Date(Date.now() - 86400000).toISOString();
  let saved = { currentStartAt: start, createdAt: start, checkinRuleVersion: 2, checkins: [], lapses: [], urgeWins: [], planType: 'quit-date', pageBackground: 'blue' };
  const colors = {};
  let openSettings;
  let openPicker;
  let modal;
  const app = {
    innerHTML: '',
    classList: { toggle() {} },
    querySelector(selector) { return selector === '#reminder-toggle' || selector === '#reminder-time' ? { addEventListener() {} } : null; },
    querySelectorAll(selector) {
      if (selector === '[data-page]') return [{ dataset: { page: 'settings' }, addEventListener(_type, callback) { openSettings = callback; } }];
      if (selector === '[data-action]') return [{ dataset: { action: 'page-background' }, addEventListener(_type, callback) { openPicker = callback; } }];
      return [];
    },
  };
  const toast = { classList: { add() {}, remove() {} }, textContent: '' };
  const document = {
    documentElement: { dataset: {}, style: { setProperty(name, value) { colors[name] = value; } } },
    querySelector(selector) { return selector === '#app' ? app : toast; },
    body: { append(value) { modal = value; } },
    createElement() {
      let paletteButtons;
      let toneButtons;
      let tonePanels;
      const closeButton = { addEventListener(_type, callback) { this.click = callback; } };
      const confirmButton = { addEventListener(_type, callback) { this.click = callback; } };
      const previewStatus = { textContent: '' };
      return {
        innerHTML: '',
        addEventListener() {},
        remove() { this.removed = true; },
        querySelector(selector) {
          if (selector === '[data-confirm-background]') return confirmButton;
          if (selector === '.background-preview-status') return previewStatus;
          return null;
        },
        querySelectorAll(selector) {
          if (selector === '[data-background]') {
            paletteButtons ||= [...this.innerHTML.matchAll(/data-background="([^"]+)"/g)].map((match) => ({
              dataset: { background: match[1] },
              addEventListener(_type, callback) { this.click = callback; },
              classList: { toggle(name, selected) { this[name] = selected; } },
              setAttribute(name, value) { this[name] = value; },
              querySelector() { return { textContent: '' }; },
            }));
            return paletteButtons;
          }
          if (selector === '[data-close]') return [closeButton];
          if (selector === '[data-palette-tone]') {
            toneButtons ||= ['light', 'dark'].map((tone) => ({ dataset: { paletteTone: tone }, addEventListener(_type, callback) { this.click = callback; }, setAttribute(name, value) { this[name] = value; } }));
            return toneButtons;
          }
          if (selector === '[data-tone-panel]') {
            tonePanels ||= ['light', 'dark'].map((tone) => ({ dataset: { tonePanel: tone }, hidden: tone === 'dark' }));
            return tonePanels;
          }
          return [];
        },
      };
    },
  };
  vm.runInNewContext(source, {
    window: { HealthMilestones: health, CheckinPeriods: periods, RankProgress: ranks }, document,
    localStorage: { getItem() { return JSON.stringify(saved); }, setItem(_key, value) { saved = JSON.parse(value); } },
    setInterval() { return 1; }, clearInterval() {}, setTimeout() { return 1; }, clearTimeout() {},
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {},
  });
  openSettings();
  openPicker();
  assert.equal((modal.innerHTML.match(/class="background-choice /g) || []).length, 18);
  assert.match(modal.innerHTML, /沉稳深色/);
  assert.match(modal.innerHTML, /data-background="blue" aria-pressed="true"/);
  assert.match(modal.innerHTML, /点击色卡可立即预览页面效果，确认后保存/);
  assert.match(modal.innerHTML, /data-confirm-background/);
  assert.match(modal.innerHTML, /data-palette-tone="dark" aria-pressed="false"/);
  const warm = modal.querySelectorAll('[data-background]').find((button) => button.dataset.background === 'warm');
  warm.click();
  assert.equal(saved.pageBackground, 'blue');
  assert.notEqual(modal.removed, true);
  assert.equal(colors['--paper'], '#f3eadc');
  assert.equal(colors['--white'], '#faf4e9');
  assert.equal(colors['--card-soft'], '#f1e2d0');
  assert.equal(colors['--card-strong'], '#e9d9c5');
  assert.match(app.innerHTML, /当前：晴空蓝 · 背景与卡片同步搭配/);
  assert.equal(document.documentElement.dataset.themeTone, 'light');
  modal.querySelector('[data-confirm-background]').click();
  assert.equal(saved.pageBackground, 'warm');
  assert.equal(modal.removed, true);
  assert.match(app.innerHTML, /当前：燕麦暖 · 背景与卡片同步搭配/);
  openPicker();
  modal.querySelectorAll('[data-palette-tone]')[1].click();
  assert.equal(modal.querySelectorAll('[data-tone-panel]')[0].hidden, true);
  assert.equal(modal.querySelectorAll('[data-tone-panel]')[1].hidden, false);
  const pine = modal.querySelectorAll('[data-background]').find((button) => button.dataset.background === 'pine');
  pine.click();
  assert.equal(saved.pageBackground, 'warm');
  assert.equal(colors['--paper'], '#1b2b24');
  assert.equal(colors['--white'], '#293d32');
  assert.equal(colors['--card-soft'], '#344b3d');
  assert.equal(colors['--card-strong'], '#405a49');
  assert.equal(document.documentElement.dataset.themeTone, 'dark');
  modal.querySelectorAll('[data-close]')[0].click();
  assert.equal(saved.pageBackground, 'warm');
  assert.equal(colors['--paper'], '#f3eadc');
  assert.equal(document.documentElement.dataset.themeTone, 'light');
  openPicker();
  modal.querySelectorAll('[data-palette-tone]')[1].click();
  modal.querySelectorAll('[data-background]').find((button) => button.dataset.background === 'pine').click();
  modal.querySelector('[data-confirm-background]').click();
  assert.equal(saved.pageBackground, 'pine');
  assert.match(app.innerHTML, /当前：深松绿 · 背景与卡片同步搭配/);
  assert.doesNotMatch(app.innerHTML, /id="reminder-toggle"/);
});
