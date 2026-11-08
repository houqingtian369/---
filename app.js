(() => {
  const STORAGE_KEY = 'songkouqi.v1';
  const { milestones, sources, timedSavings, timedSavingsCentProgress, timePercent } = window.HealthMilestones;
  const { DAY_MS, dateKey: periodDateKey, periodAt, currentPeriod, recentCompleted, periodForDate, periodStatus, recognizedElapsedMs, restoreInterval, cumulativeSmokeFreeMs, completedSmokeFreeDays } = window.CheckinPeriods;
  const { routes: rankRoutes, stages: rankStages, progress: rankProgress } = window.RankProgress;
  const BACKGROUNDS = {
    blue: { label: '晴空蓝', description: '清爽明亮', color: '#e7eef8', surface: '#e4edf8', soft: '#d5e5f5', strong: '#c9dcf0' },
    mist: { label: '晨雾灰', description: '安静中性', color: '#edf2f3', surface: '#f6f9fa', soft: '#e0eaed', strong: '#d2e1e5' },
    sea: { label: '海盐青', description: '清透柔和', color: '#e7f2f3', surface: '#f3f9f9', soft: '#d8e9eb', strong: '#c9e0e3' },
    mint: { label: '薄荷绿', description: '清新舒展', color: '#e7f3f0', surface: '#f2faf7', soft: '#d9ebe6', strong: '#cbe2dc' },
    sage: { label: '鼠尾草', description: '自然沉静', color: '#e8f0e9', surface: '#f3f8f2', soft: '#dceadd', strong: '#cfe2d2' },
    green: { label: '嫩芽绿', description: '温柔生长', color: '#e8ecd8', surface: '#f3f5e9', soft: '#e2ead3', strong: '#d6e3c8' },
    cream: { label: '奶油白', description: '柔亮百搭', color: '#f8f4e9', surface: '#fffaf1', soft: '#f3ecd8', strong: '#ece2ca' },
    warm: { label: '燕麦暖', description: '暖而安定', color: '#f3eadc', surface: '#faf4e9', soft: '#f1e2d0', strong: '#e9d9c5' },
    sand: { label: '浅沙米', description: '平和素雅', color: '#f4efe6', surface: '#fbf7ef', soft: '#eee5d8', strong: '#e7dac9' },
    peach: { label: '杏桃粉', description: '轻暖活力', color: '#faeee8', surface: '#fff7f2', soft: '#f6e3d8', strong: '#efd6c8' },
    blush: { label: '樱雾粉', description: '柔软轻盈', color: '#f8edf1', surface: '#fff7f9', soft: '#f2dfe8', strong: '#e9d1dd' },
    lavender: { label: '淡雾紫', description: '舒缓静谧', color: '#eee8f5', surface: '#f7f2fb', soft: '#e9e0f2', strong: '#dfd4eb' },
    periwinkle: { label: '晚星紫', description: '清雅宁静', color: '#ecedfa', surface: '#f7f7fe', soft: '#e1e3f4', strong: '#d6d9ed' },
    midnight: { label: '午夜蓝', description: '沉稳克制', color: '#172633', surface: '#243645', soft: '#2d4252', strong: '#385163', tone: 'dark' },
    pine: { label: '深松绿', description: '安定庄重', color: '#1b2b24', surface: '#293d32', soft: '#344b3d', strong: '#405a49', tone: 'dark' },
    graphite: { label: '石墨灰', description: '简洁严谨', color: '#22292c', surface: '#303b3e', soft: '#3c494c', strong: '#4a585a', tone: 'dark' },
    plum: { label: '深梅紫', description: '内敛安静', color: '#292431', surface: '#382f40', soft: '#493c50', strong: '#5a4960', tone: 'dark' },
    walnut: { label: '胡桃棕', description: '温厚沉静', color: '#2c2521', surface: '#3c312b', soft: '#4c3d34', strong: '#5d4c40', tone: 'dark' },
  };
  const app = document.querySelector('#app');
  const toastNode = document.querySelector('#toast');
  const icon = (name, size = 20) => {
    const paths = {
      leaf: '<path d="M20 4c-7.5 0-13 3.7-13 10a6 6 0 0 0 6 6c6.3 0 10-5.5 10-13V4h-3Z"/><path d="M5 22c3-5 6-8 12-12"/>',
      home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
      chart: '<path d="M4 19V5m0 14h17"/><path d="m7 15 4-4 3 2 6-7"/>',
      people: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a7.9 7.9 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a7.9 7.9 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a7.9 7.9 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a7.9 7.9 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1 0 2Z" transform="translate(-1 -1)"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      fire: '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 3-3 6-2-1-3-3-3-5-2 2-4 5-4 9a7 7 0 0 0 7 7Z"/><path d="M12 22a3 3 0 0 0 3-3c0-2-2-3-3-5-1 2-3 3-3 5a3 3 0 0 0 3 3Z"/>',
      arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
      heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
      cup: '<path d="M5 8h12v7a6 6 0 0 1-12 0V8Z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3l2 2M13 3l2 2M4 21h14"/>',
      walk: '<circle cx="13" cy="4" r="2"/><path d="m7 21 3-6-2-3 3-4 3 3 4 1M10 15l5 2 2 4"/>',
      close: '<path d="m18 6-12 12M6 6l12 12"/>',
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  };

  const todayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  };
  let state = load();
  if (state && !Array.isArray(state.urgeWins)) state.urgeWins = [];
  let currentPage = 'home';
  let timerHandle = null;
  let liveClockHandle = null;
  let moneyRingFrameHandle = null;
  let healthProgressObserver = null;
  const healthProgressFrames = new Set();
  let secondsLeft = 300;
  let toastHandle = null;
  let healthFilter = 'all';

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const recordVisit = () => {
    if (!state) return;
    const now = Date.now();
    const previous = Date.parse(state.lastSeenAt);
    if (Number.isFinite(previous) && now - previous > 3 * DAY_MS) {
      state.unverifiedGaps = [...(state.unverifiedGaps || []), { start: previous, end: now }];
    }
    state.lastSeenAt = new Date(now).toISOString();
    save();
  };
  const applyPageBackground = (key = state?.pageBackground) => {
    const choice = BACKGROUNDS[key] || BACKGROUNDS.blue;
    if (document.documentElement.dataset) document.documentElement.dataset.themeTone = choice.tone || 'light';
    document.documentElement.style.setProperty('--paper', choice.color);
    document.documentElement.style.setProperty('--white', choice.surface);
    document.documentElement.style.setProperty('--card-soft', choice.soft);
    document.documentElement.style.setProperty('--card-strong', choice.strong);
  };
  const safeDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  };
  const timeInputValue = (value = new Date()) => {
    const date = safeDate(value);
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map((part) => String(part).padStart(2, '0')).join(':');
  };
  const checkinAnchor = () => safeDate(state.currentStartAt).getTime();
  const checkinStatus = (period, now = Date.now()) => periodStatus(period, now, state.checkins || [], state.lapses || []);
  const retireUnfinishedCheckins = (anchor, now = Date.now()) => {
    const unfinished = state.checkins.filter((key) => {
      const parts = key.split('-').map(Number);
      const period = parts.length === 3 ? periodForDate(anchor, parts[0], parts[1] - 1, parts[2]) : null;
      return period && period.end > now;
    });
    if (unfinished.length) {
      state.legacyEarlyCheckins = [...new Set([...(state.legacyEarlyCheckins || []), ...unfinished])];
      state.checkins = state.checkins.filter((key) => !unfinished.includes(key));
    }
  };
  const ENCOURAGEMENTS = [
    '你刚刚为自己守住了这一刻。',
    '这一次忍住，值得认真记下来。',
    '想抽的时候停住脚步，你做到了。',
    '每一次选择，都在帮你走得更远。',
    '今天的你，又为自己多争取了一点自由。',
    '烟瘾来了又走，你把决定权留给了自己。',
    '这一步不容易，感谢你坚持了下来。',
    '你不需要完美，这一次已经很棒。',
    '把这次成功收好，下一次也能想起它。',
    '你刚刚证明自己可以跨过这一阵。',
    '给自己的这份照顾，值得一朵小红花。',
    '慢慢来，你已经走过了刚才最难的一步。',
  ];
  if (state && !state.checkinRuleVersion) {
    retireUnfinishedCheckins(checkinAnchor());
    state.startTimeNeedsReview = true;
    state.checkinRuleVersion = 2;
    save();
  }
  recordVisit();
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const daysBetween = (from, to = new Date()) => Math.max(0, Math.floor((to - safeDate(from)) / 86400000));
  const planStarted = () => state && safeDate(state.currentStartAt).getTime() <= Date.now();
  const elapsedDays = () => state ? daysBetween(state.currentStartAt) : 0;
  const lastSmokeTime = () => new Date(Math.max(safeDate(state?.currentStartAt).getTime(), state?.lastLapseAt ? safeDate(state.lastLapseAt).getTime() : 0)).toISOString();
  const quitStartTime = () => {
    if (!state) return Date.now();
    const routeStart = state.planType === 'reduce-to-quit' && state.plannedQuitDate
      ? safeDate(`${state.plannedQuitDate}T00:00:00`)
      : safeDate(state.currentStartAt);
    return routeStart.getTime();
  };
  const healthStartTime = () => Math.max(quitStartTime(), state?.lastLapseAt ? safeDate(state.lastLapseAt).getTime() : 0);
  const recognizedQuitMs = () => recognizedElapsedMs(quitStartTime(), Date.now(), state?.unverifiedGaps || []);
  const cumulativeHealthHours = () => cumulativeSmokeFreeMs(quitStartTime(), Date.now(), state?.lapses || [], state?.unverifiedGaps || []) / 3600000;
  const healthElapsedHours = () => cumulativeHealthHours();
  const quitElapsedDays = () => {
    return Math.floor(recognizedQuitMs() / DAY_MS);
  };
  const quitElapsedTime = () => {
    const seconds = Math.floor(recognizedQuitMs() / 1000) % 86400;
    return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}小时 ${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}分钟 ${String(seconds % 60).padStart(2, '0')}秒`;
  };
  const totalSmokeFreeDays = () => completedSmokeFreeDays(quitStartTime(), Date.now(), state?.lapses || [], state?.unverifiedGaps || []);
  const formatDuration = (value) => {
    const total = Math.max(0, Math.floor(value / 1000));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${String(days).padStart(2, '0')}天 ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const totalAvoidedCigarettes = () => (state?.urgeWins || []).reduce((sum, entry) => sum + (Number(entry.cigarettes) || 0), 0);
  const dateLabel = (value, options = { month: 'long', day: 'numeric', weekday: 'long' }) => safeDate(value).toLocaleDateString('zh-CN', options);
  const smokedCigarettesSinceQuit = () => {
    const start = quitStartTime();
    const now = Date.now();
    return (state?.lapses || []).reduce((total, entry) => {
      const at = Date.parse(entry.at);
      return at >= start && at <= now ? total + (Number(entry.cigarettes) || 1) : total;
    }, 0);
  };
  const smokeFreeSavings = () => timedSavings(recognizedQuitMs(), state?.cigarettesPerDay, state?.packPrice, state?.packCount || 20, smokedCigarettesSinceQuit());
  const moneyRingDash = () => `${(timedSavingsCentProgress(recognizedQuitMs(), state?.cigarettesPerDay, state?.packPrice, state?.packCount || 20, smokedCigarettesSinceQuit()) * 503).toFixed(2)} 503`;
  const estimatedAvoidedCigarettes = () => {
    if (!state?.cigarettesPerDay) return null;
    const expected = Math.floor(recognizedQuitMs() / DAY_MS * Number(state.cigarettesPerDay));
    return Math.max(0, expected - smokedCigarettesSinceQuit());
  };
  const moneyBag = () => `<svg viewBox="0 0 64 64" width="51" height="51" fill="none" aria-hidden="true"><path d="M19 26c0-7 6-11 13-11s13 4 13 11l4 23c1 7-6 11-17 11S14 56 15 49l4-23Z" fill="#e63842"/><path d="M24 15c0-4 4-7 8-7s8 3 8 7l-3 7H27l-3-7Z" fill="#f16b6b"/><path d="M20 26h24" stroke="#ad1d31" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="35" r="9" fill="#f7d58a"/><path d="M28 35h8m-4-4v8" stroke="#c77b36" stroke-width="2" stroke-linecap="round"/></svg>`;
  const flowerIcon = (size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4c4 0 6 4 6 8 4-2 8-1 10 2 2 4-1 7-5 9 4 2 5 6 3 9-3 4-7 3-11 0-1 5-5 7-9 5-3-2-3-6-2-10-5 1-9-1-9-5 0-4 4-6 8-7-3-4-2-8 1-10 3-2 6 0 8 4Z" fill="#e83e50"/><circle cx="20" cy="20" r="6" fill="#ffd466"/></svg>`;
  const showToast = (message, withFlower = false) => {
    if (withFlower) {
      toastNode.innerHTML = `${flowerIcon(22)}<span>${escapeHtml(message)}</span>`;
      toastNode.classList.add('reward-toast');
    } else {
      toastNode.textContent = message;
      toastNode.classList.remove('reward-toast');
    }
    toastNode.classList.add('show');
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => toastNode.classList.remove('show'), 2400);
  };
  const todayUrgeWins = () => (state?.urgeWins || []).filter((entry) => todayKey(new Date(entry.at)) === todayKey());
  const todayAvoidedCigarettes = () => todayUrgeWins().reduce((total, entry) => total + (Number(entry.cigarettes) || 0), 0);
  const confirmedCheckins = () => (state?.checkins || []).filter((key) => {
    const parts = key.split('-').map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) return false;
    const period = periodForDate(checkinAnchor(), parts[0], parts[1] - 1, parts[2]);
    return period && checkinStatus(period) === 'confirmed';
  });
  const brand = () => `<div class="brand"><span class="brand-mark">${icon('leaf', 22)}</span><span>松口气</span></div>`;
  const ruleDisclosure = (content, label = '计算说明') => `<details class="rule-disclosure"><summary>${label}</summary><p>${content}</p></details>`;
  const startRule = () => {
    const mode = state.startMode === 'continuing' ? 'B：从你填写的过去日期和时间起算，注册前未记录的时间按无烟估算。' : state.startMode === 'planned' ? 'C：从你选定的未来日期和时间起算，开始前均为 0。' : 'A：从提交计划的当下起算。';
    return `${mode}累计计入时间＝从开始至今的时间－超过 3 天未打开后尚未补确认的空白时间；每满 24 小时计 1 天。`;
  };

  const clearFieldError = (input) => {
    if (!input?.closest) return;
    input.removeAttribute?.('aria-invalid');
    input.removeAttribute?.('aria-describedby');
    input.closest('.form-field')?.querySelector('.field-error')?.remove();
  };
  const showFieldError = (input, message) => {
    const field = input?.closest?.('.form-field');
    if (!field || !document.createElement) { showToast(message); return; }
    clearFieldError(input);
    const error = document.createElement('p');
    error.className = 'field-error';
    error.id = `${input.id || input.name}-error`;
    error.textContent = message;
    field.append(error);
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
    input.focus();
  };

  const renderOnboarding = () => {
    app.innerHTML = `<section class="onboarding-wrap"><form class="onboarding" id="start-form">
      ${brand()}
      <p class="eyebrow">A SMALL STEP, A NEW BREATH</p>
      <h1>想戒烟，先找到<br>适合自己的起点。</h1>
      <p class="subtitle">选择现在开始、继续已有的坚持，或为将来定一个开始的日子。</p>
      <div class="onboarding-section-title">01 · 戒烟从这里开始</div>
      <fieldset class="start-mode-options"><legend class="sr-only">选择开始方式</legend>
        <label class="start-mode-option"><input type="radio" name="startMode" value="now" checked required /><span><strong>A · 准备戒烟，从现在开始</strong><small>今天开始，自动记录此刻的时间</small></span></label>
        <label class="start-mode-option"><input type="radio" name="startMode" value="continuing" required /><span><strong>B · 正在戒烟的路上，现在继续打卡记录</strong><small>选择今天以前的开始日期</small></span></label>
        <label class="start-mode-option"><input type="radio" name="startMode" value="planned" required /><span><strong>C · 有戒烟打算，选择一个好日子开始计划</strong><small>选择明天或之后的日期</small></span></label>
      </fieldset>
      <p class="form-help" id="start-mode-help">从此刻开始，时间自动记录。</p>
      <div class="onboarding-field-grid"><label class="form-field"><span>戒烟开始日期</span><div class="input-wrap">${icon('calendar', 17)}<input id="start-date" name="startDate" type="date" required value="${todayKey()}" /></div></label>
      <label class="form-field"><span>开始时间</span><div class="input-wrap">${icon('clock', 17)}<input id="start-time" name="startTime" type="time" step="1" required value="${timeInputValue()}" /></div></label></div>
      <p class="form-help">每满 24 小时可确认一次无烟日，时间精确到秒。</p>
      <div class="onboarding-section-title">02 · 以前的吸烟习惯</div>
      <label class="form-field"><span>平均每天抽几支</span><div class="input-wrap"><input name="cigarettesPerDay" type="number" min="1" max="100" step="1" inputmode="numeric" placeholder="比如 10" required /><em>支 / 天</em></div></label>
      <div class="onboarding-field-grid"><label class="form-field"><span>每包多少钱</span><div class="input-wrap"><input name="packPrice" type="number" min="0.01" max="1000" step="0.01" inputmode="decimal" placeholder="比如 20" required /><em>元 / 包</em></div></label>
      <label class="form-field"><span>每包有几支</span><div class="input-wrap"><input name="packCount" type="number" min="1" max="100" step="1" inputmode="numeric" value="20" required /><em>支 / 包</em></div></label></div>
      <div class="onboarding-section-title">03 · 给自己一个奖励</div>
      <label class="form-field"><span>省下的钱想为自己买什么</span><div class="input-wrap"><input name="savingsGoalName" type="text" maxlength="40" placeholder="比如一辆自行车" required /></div></label>
      <label class="form-field"><span>预计花费多少</span><div class="input-wrap"><input name="savingsGoal" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal" placeholder="比如 1200" required /><em>元</em></div></label>
      <button class="primary-button" type="submit">开始我的戒烟旅程 ${icon('arrow', 17)}</button>
      <p class="privacy-note">记录只保存在这台设备的浏览器里</p>
    </form></section>`;
    const startDateInput = app.querySelector('#start-date');
    const startTimeInput = app.querySelector('#start-time');
    const startModeInputs = [...app.querySelectorAll('[name="startMode"]')];
    const updateStartMode = () => {
      const mode = startModeInputs.find((input) => input.checked)?.value || 'now';
      const now = new Date();
      const today = todayKey(now);
      const yesterday = todayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      const tomorrow = todayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
      startDateInput.disabled = startTimeInput.disabled = mode === 'now';
      startDateInput.min = mode === 'planned' ? tomorrow : mode === 'now' ? today : '';
      startDateInput.max = mode === 'continuing' ? yesterday : mode === 'now' ? today : '';
      if (mode === 'now') { startDateInput.value = today; startTimeInput.value = timeInputValue(now); }
      else if (mode === 'continuing' && (!startDateInput.value || startDateInput.value >= today)) startDateInput.value = yesterday;
      else if (mode === 'planned' && (!startDateInput.value || startDateInput.value <= today)) startDateInput.value = tomorrow;
      app.querySelector('#start-mode-help').textContent = mode === 'now' ? '从此刻开始，时间自动记录。' : mode === 'continuing' ? '选择今天以前的日期；此前未记录的时间按无烟时间估算。' : '选择明天或之后的日期；到开始时间前不会累计进度。';
    };
    startModeInputs.forEach((input) => input.addEventListener('change', updateStartMode));
    updateStartMode();
    app.querySelector('#start-form').addEventListener('input', (event) => clearFieldError(event.target));
    app.querySelector('#start-form').addEventListener('invalid', (event) => {
      event.preventDefault();
      if (!app.querySelector('.field-error')) showFieldError(event.target, event.target.validationMessage || '请检查这一项');
    }, true);
    app.querySelector('#start-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const goalName = String(data.get('savingsGoalName') || '').trim();
      if (!goalName) { showFieldError(app.querySelector('[name="savingsGoalName"]'), '请填写想为自己买的东西'); return; }
      const mode = String(data.get('startMode') || '');
      const now = new Date();
      const today = todayKey(now);
      const date = String(data.get('startDate') || '');
      const time = String(data.get('startTime') || '');
      if (!['now', 'continuing', 'planned'].includes(mode)) { showToast('请选择开始方式'); return; }
      if (mode === 'continuing' && (!date || date >= today)) { showFieldError(startDateInput, '继续打卡只能选择今天以前的日期'); return; }
      if (mode === 'planned' && (!date || date <= today)) { showFieldError(startDateInput, '计划开始日期请从明天起选择'); return; }
      if (mode !== 'now' && !time) { showFieldError(startTimeInput, '请选择开始时间'); return; }
      const startDate = mode === 'now' ? now : safeDate(`${date}T${time}`);
      if (!Number.isFinite(startDate.getTime()) || (mode !== 'now' && todayKey(startDate) !== date)) { showFieldError(startDateInput, '请选择有效的开始日期和时间'); return; }
      const start = startDate.toISOString();
      state = {
        createdAt: now.toISOString(),
        currentStartAt: start,
        startMode: mode,
        planType: 'quit-date',
        cigarettesPerDay: Number(data.get('cigarettesPerDay')),
        packPrice: Number(data.get('packPrice')),
        packCount: Number(data.get('packCount')),
        savingsGoalName: goalName,
        savingsGoal: Number(data.get('savingsGoal')),
        checkins: [],
        checkinRuleVersion: 2,
        startTimeNeedsReview: false,
        urgeWins: [],
        lapses: [],
        lastLapseAt: null,
        lastSeenAt: now.toISOString(),
        unverifiedGaps: [],
      };
      save();
      currentPage = 'home';
      render();
      showToast(mode === 'planned' ? '计划记下啦，到那天一起开始 🌱' : mode === 'continuing' ? '欢迎回来，继续记录 🌱' : '计划记下啦，今天一起加油 🌱');
    });
  };

  const nav = () => `<nav class="bottom-nav" aria-label="主导航">
    <button class="nav-button ${currentPage === 'home' ? 'active' : ''}" data-page="home" ${currentPage === 'home' ? 'aria-current="page"' : ''}>${icon('home')}<span>今天</span></button>
    <button class="nav-button ${currentPage === 'growth' ? 'active' : ''}" data-page="growth" ${currentPage === 'growth' ? 'aria-current="page"' : ''}>${icon('chart')}<span>成长</span></button>
    <button class="nav-button ${currentPage === 'buddy' ? 'active' : ''}" data-page="buddy" ${currentPage === 'buddy' ? 'aria-current="page"' : ''}>${icon('people')}<span>找搭子</span></button>
    <button class="nav-button ${currentPage === 'settings' ? 'active' : ''}" data-page="settings" ${currentPage === 'settings' ? 'aria-current="page"' : ''}>${icon('settings')}<span>设置</span></button>
  </nav>`;
  const topbar = () => `<header class="topbar">${brand()}<span class="top-pill">${icon('spark', 15)} 每一步都算数</span></header>`;

  const monthCalendar = () => {
    const today = new Date();
    const now = today.getTime();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingDays = (new Date(year, month, 1).getDay() + 6) % 7;
    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const period = periodForDate(checkinAnchor(), year, month, day);
      return { day, status: period ? checkinStatus(period, now) : 'future', isToday: day === today.getDate() };
    });
    const statusNames = { confirmed: '已确认', pending: '待确认，可补卡', smoked: '有吸烟记录', ongoing: '进行中', expired: '已过补卡期', future: '尚未开始' };
    const days = monthDays.map(({ day, status, isToday }) => `<div class="month-day ${status} ${isToday ? 'today' : ''}" role="listitem" aria-label="${month + 1}月${day}日${isToday ? '，今天' : ''}，${statusNames[status]}"><span class="month-day-number">${day}</span><span class="month-day-mark" aria-hidden="true">${status === 'confirmed' ? icon('check', 11) : status === 'smoked' ? icon('close', 10) : status === 'pending' ? '待' : status === 'ongoing' ? '进' : ''}</span></div>`).join('');
    const confirmedCount = monthDays.filter(({ status }) => status === 'confirmed').length;
    return `<div class="month-heading"><strong>本月打卡</strong><span>${year}年${month + 1}月 · 已确认 ${confirmedCount} 天</span></div><div class="month-weekdays" aria-hidden="true">${labels.map((label) => `<span>${label}</span>`).join('')}</div><div class="month-days" role="list" aria-label="${year}年${month + 1}月打卡日历">${'<span class="month-blank" aria-hidden="true"></span>'.repeat(leadingDays)}${days}</div><div class="month-legend"><span class="confirmed">已确认</span><span class="pending">待确认</span><span class="ongoing">进行中</span><span class="smoked">有吸烟记录</span><span class="expired">已过补卡期</span></div>`;
  };
  const formatCycleTime = (value) => new Date(value).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formatRemaining = (value) => {
    const seconds = Math.max(0, Math.ceil(value / 1000));
    return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((part) => String(part).padStart(2, '0')).join(':');
  };
  const cycleProgress = (now = Date.now()) => {
    const anchor = checkinAnchor();
    const period = currentPeriod(anchor, now);
    if (!period) return { index: -1, status: 'future', title: '计划还未开始', detail: '距离开始还有', remaining: anchor - now, percent: 0, boundary: formatCycleTime(anchor) };
    const status = checkinStatus(period, now);
    return {
      index: period.index,
      status,
      title: status === 'smoked' ? '这 24 小时有吸烟记录' : '今天正在戒烟中',
      detail: status === 'smoked' ? '距离下一个 24 小时开始还有' : '距离满 24 小时还有',
      remaining: period.end - now,
      percent: status === 'smoked' ? 0 : Math.min(100, recognizedElapsedMs(period.start, now, state.unverifiedGaps || []) / DAY_MS * 100),
      boundary: formatCycleTime(period.end),
    };
  };

  const renderHome = () => {
    const quitDay = quitElapsedDays();
    const rankRoute = state.rankRoute === 'journey' ? 'journey' : 'competitive';
    const rank = rankProgress(totalSmokeFreeDays(), rankRoute);
    const avoided = estimatedAvoidedCigarettes();
    const saved = smokeFreeSavings();
    const started = planStarted();
    const quitStarted = healthStartTime() <= Date.now();
    const cycle = cycleProgress();
    const completedPeriods = recentCompleted(checkinAnchor());
    const pendingPeriods = completedPeriods.filter((period) => checkinStatus(period) === 'pending');
    const hasUnverifiedGap = (state.unverifiedGaps || []).some(({ start, end }) => end > start);
    const historicalEstimate = state.startMode === 'continuing';
    const latestPeriod = completedPeriods[0];
    const latestStatus = latestPeriod ? checkinStatus(latestPeriod) : null;
    const makeupPeriods = completedPeriods.slice(1).filter((period) => checkinStatus(period) === 'pending');
    const urgeWins = todayUrgeWins();
    const avoidedToday = todayAvoidedCigarettes();
    app.innerHTML = `${topbar()}<section class="page home-page" aria-label="今日戒烟陪伴">
      <div class="page-heading home-heading"><div><p class="eyebrow">ONE DAY AT A TIME</p><h1>${started ? '今天，慢慢来。' : '准备好，新的开始。'}</h1><p class="subtitle">${dateLabel(todayKey())} · 一天一天来</p></div><span class="home-status">${icon(pendingPeriods.length ? 'check' : 'leaf', 14)} ${!started ? '计划准备中' : pendingPeriods.length ? `${pendingPeriods.length} 期待确认` : cycle.status === 'smoked' ? '已记录，继续坚持' : '24 小时目标进行中'}</span></div>
      <div class="home-flow">
        ${hasUnverifiedGap ? `<aside class="gap-notice" role="status"><strong>有一段时间尚未确认</strong><span>超过 3 天未打开的空白期不计入累计；${pendingPeriods.length ? `最近有 ${pendingPeriods.length} 期可补确认。` : '目前没有可补日期。'}</span>${pendingPeriods.length ? '<a href="#daily-title">查看可补日期</a>' : ''}</aside>` : ''}
        <section class="home-section" aria-labelledby="progress-title"><div class="home-section-heading"><span class="home-section-index">01</span><div><h2 id="progress-title">我的戒烟进度</h2><p>先看看现在走到了哪里</p></div></div>
          <div class="home-progress"><div class="home-progress-top"><span class="home-plan">${state.planType === 'reduce-to-quit' ? '逐步减量计划' : '我的戒烟计划'}</span></div>
            <div class="home-rank" aria-label="我的称号进度"><div class="home-rank-current"><span>${rankRoutes[rankRoute].label} · 当前称号</span><strong>${rank.current.label}</strong></div><div class="home-rank-next"><span>下一步</span><strong>${rank.next ? rank.next.label : '已到达最高称号'}</strong><small>${rank.next ? `还需 ${rank.remainingDays} 个累计无烟日` : '继续记录每个无烟日子'}</small></div></div>
            <div class="home-progress-main"><div class="home-progress-stats"><div class="home-metric"><span id="home-quit-label">${quitStartTime() > Date.now() ? '戒烟尚未开始' : quitDay === 0 ? '戒烟' : '戒烟第'}</span><div><strong id="home-smoke-free-days">${quitDay}</strong><em>天</em></div><span class="home-quit-time" id="home-quit-time" aria-live="off">${quitElapsedTime()}</span><small>${historicalEstimate ? '含注册前历史估算；' : '从戒烟开始累计已记录时间，'}满 24 小时计 1 天</small></div><div class="home-metric"><span>累计戒掉</span><div><strong id="home-avoided-cigarettes">${avoided === null ? '—' : avoided}</strong><em>根</em></div><small>${avoided === null ? '填写日均烟量后显示' : `按原先每天 ${state.cigarettesPerDay} 根估算`}</small></div></div><div class="money-orbit home-money-orbit" aria-label="节省金钱实时预估"><svg class="home-progress-ring" viewBox="0 0 180 180" aria-hidden="true"><circle id="home-money-ring" cx="90" cy="90" r="80" stroke-dasharray="${moneyRingDash()}" /></svg><div class="money-orbit-core">${moneyBag()}<strong id="home-timed-savings-value" aria-live="off">${saved === null ? '—' : `¥${saved}`}</strong><span>累计节省 · 实时预估</span></div></div></div>
            <div class="home-rule-row">${ruleDisclosure(startRule(), '戒烟天数怎么算')}${ruleDisclosure('累计戒掉支数＝已计入时间 ÷ 24 小时 × 原先日均支数－已记录吸烟支数，取整数且最低为 0。它是与以前习惯相比的估算，不等于逐根核实。', '戒掉支数怎么算')}${ruleDisclosure('节省金额＝（已计入时间 ÷ 24 小时 × 原先日均支数－已记录吸烟支数）× 每包价格 ÷ 每包支数，最低为 0。此前金额保留，未确认空白期暂停累计。', '节省金额怎么算')}</div>
            <div class="home-clock">${icon('clock', 16)}<span>${started ? quitStarted ? '本次持续无烟' : '减量计划已进行' : '等待计划开始'}</span><strong id="live-counter" aria-live="off">${formatDuration(recognizedElapsedMs(new Date(lastSmokeTime()).getTime(), Date.now(), state.unverifiedGaps || []))}</strong></div>
            <div class="home-progress-footer"><span>从戒烟开始累计估算，扣除已记录吸烟与未确认空白期${hasUnverifiedGap ? '；最近 3 期可补确认' : ''}</span><button class="link-button" data-page="growth">查看完整成长记录 ${icon('arrow', 16)}</button></div>
          </div></section>
        <section class="home-section" aria-labelledby="daily-title"><div class="home-section-heading"><span class="home-section-index">02</span><div><h2 id="daily-title">今天的记录</h2><p>每满 24 小时，再确认上一期</p></div></div>
          <div class="home-daily"><div class="home-checkin"><div class="home-daily-label">24 小时无烟目标</div>
            <div class="cycle-summary"><strong id="cycle-title">${cycle.title}</strong><span><span id="cycle-detail">${cycle.detail}</span> <b id="cycle-remaining">${formatRemaining(cycle.remaining)}</b></span></div>
            <div class="cycle-track ${cycle.status}" id="cycle-track" role="progressbar" aria-label="24 小时目标时间进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(cycle.percent)}" aria-valuetext="${cycle.title}，${cycle.detail} ${formatRemaining(cycle.remaining)}"><span id="cycle-fill" style="width:${cycle.percent}%"></span></div>
            ${cycle.status === 'smoked' ? '<p class="cycle-lapse-note">由于这一天有抽烟，所以进度条归零，这天不能确认无烟。</p>' : ''}
            <p class="cycle-boundary">${cycle.status === 'smoked' ? '这 24 小时不能确认无烟；下一个 24 小时仍按原定时间开始。' : cycle.status === 'future' ? '计划开始于' : '这 24 小时结束于'} ${cycle.boundary}</p>
            ${state.startTimeNeedsReview ? '<p class="cycle-review">旧计划只记录了日期，暂按 00:00 计算。</p>' : ''}
            ${latestStatus === 'pending' || makeupPeriods.length ? `<div class="checkin-periods">
              ${latestStatus === 'pending' ? `<div class="checkin-period-row"><div><strong>${dateLabel(latestPeriod.start, { month: 'numeric', day: 'numeric' })} 这一期</strong><small>${timeInputValue(latestPeriod.start)} 至次日 ${timeInputValue(latestPeriod.end)}</small></div><button class="primary-button" data-action="checkin" data-period-index="${latestPeriod.index}">确认无烟</button></div>` : ''}
              ${makeupPeriods.length ? `<div class="checkin-makeup"><span>忘记打卡了？</span><button class="secondary-button" data-action="toggle-makeup" aria-controls="makeup-dates" aria-expanded="false">补卡</button></div><div class="makeup-dates" id="makeup-dates" hidden><p>选择要补确认的日期</p>${makeupPeriods.map((period) => `<div class="checkin-period-row"><div><strong>${dateLabel(period.start, { month: 'numeric', day: 'numeric' })} 这一期</strong><small>${timeInputValue(period.start)} 至次日 ${timeInputValue(period.end)}</small></div><button class="secondary-button" data-action="checkin" data-period-index="${period.index}">补这一天</button></div>`).join('')}</div>` : ''}
            </div>` : ''}</div>
            <div class="home-month">${monthCalendar()}</div>
            <div class="home-lapse"><p>如果抽了，也请如实记录。之后仍可以继续。</p><button class="danger-button" data-action="lapse">记录一次吸烟</button></div>
          </div></section>
        <section class="home-section" aria-labelledby="help-title"><div class="home-section-heading"><span class="home-section-index">03</span><div><h2 id="help-title">应对烟瘾</h2><p>想抽时先求助，忍住后再记录</p></div></div>
          <div class="home-coping"><div class="home-coping-actions"><div class="home-help"><span class="home-action-icon">${icon('heart', 23)}</span><div><h3>现在想抽？</h3><p>先跟着呼吸，撑过这一阵。</p></div><button class="urge-action" data-action="urge">帮我缓一缓 ${icon('arrow', 17)}</button></div><div class="home-win-action"><span class="home-action-icon">${icon('check', 22)}</span><div><h3>刚刚忍住了？</h3><p>把这次成功记下来。</p></div><button class="primary-button" data-action="log-win">记录一次成功</button></div></div>
            <div class="home-wins"><div class="home-wins-summary"><div><strong>${urgeWins.length}<small>次</small></strong><span>今天成功应对</span></div><div><strong>${avoidedToday}<small>根</small></strong><span>今天实际忍住</span></div></div>
              ${urgeWins.length ? `<div class="win-entries">${[...urgeWins].reverse().slice(0, 3).map((entry) => `<div class="win-entry"><span class="win-check">${icon('check', 13)}</span><span><strong>${dateLabel(entry.at, { hour: '2-digit', minute: '2-digit' })} · 忍住 ${entry.cigarettes} 根</strong><small>${entry.trigger ? `因为${escapeHtml(entry.trigger)}` : '一次真实的成功应对'}${entry.method ? ` · ${escapeHtml(entry.method)}` : ''}</small></span></div>`).join('')}</div>` : '<p class="home-wins-note">今天还没有记录。下一次忍住时，可以在这里留下它。</p>'}</div>
          </div></section>
      </div><p class="home-footnote">${icon('leaf', 14)} 不用一下子变好，我们一天一天来。</p>
    </section>${nav()}`;
    bindCommon();
    if (liveClockHandle) clearInterval(liveClockHandle);
    if (moneyRingFrameHandle !== null) cancelAnimationFrame(moneyRingFrameHandle);
    const moneyRing = app.querySelector('#home-money-ring');
    const drawMoneyRing = () => {
      if (currentPage !== 'home') { moneyRingFrameHandle = null; return; }
      moneyRing.setAttribute('stroke-dasharray', moneyRingDash());
      moneyRingFrameHandle = requestAnimationFrame(drawMoneyRing);
    };
    if (moneyRing) drawMoneyRing();
    const renderedDate = todayKey();
    const updateClock = () => {
      if (currentPage !== 'home') return;
      const now = Date.now();
      const progress = cycleProgress(now);
      if (progress.index !== cycle.index || todayKey() !== renderedDate) { renderHome(); return; }
      const counter = app.querySelector('#live-counter');
      if (counter) counter.textContent = formatDuration(recognizedElapsedMs(new Date(lastSmokeTime()).getTime(), now, state.unverifiedGaps || []));
      const daysNode = app.querySelector('#home-smoke-free-days');
      if (daysNode) daysNode.textContent = quitElapsedDays();
      const quitLabelNode = app.querySelector('#home-quit-label');
      if (quitLabelNode) quitLabelNode.textContent = quitStartTime() > now ? '戒烟尚未开始' : quitElapsedDays() === 0 ? '戒烟' : '戒烟第';
      const quitTimeNode = app.querySelector('#home-quit-time');
      if (quitTimeNode) quitTimeNode.textContent = quitElapsedTime();
      const avoidedNode = app.querySelector('#home-avoided-cigarettes');
      if (avoidedNode) avoidedNode.textContent = estimatedAvoidedCigarettes() ?? '—';
      const savingsNode = app.querySelector('#home-timed-savings-value');
      if (savingsNode) {
        const amount = smokeFreeSavings();
        savingsNode.textContent = amount === null ? '—' : `¥${amount}`;
      }
      const remaining = app.querySelector('#cycle-remaining');
      if (remaining) remaining.textContent = formatRemaining(progress.remaining);
      const fill = app.querySelector('#cycle-fill');
      if (fill) fill.style.width = `${progress.percent}%`;
      const track = app.querySelector('#cycle-track');
      if (track) {
        track.setAttribute('aria-valuenow', String(Math.floor(progress.percent)));
        track.setAttribute('aria-valuetext', `${progress.title}，${progress.detail} ${formatRemaining(progress.remaining)}`);
      }
    };
    updateClock();
    liveClockHandle = setInterval(updateClock, 1000);
  };

  const healthTimeLeft = (hours) => {
    const minutes = Math.max(0, Math.ceil(hours * 60));
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)} 天 ${Math.floor(minutes % 1440 / 60)} 小时`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
    return `${minutes} 分钟`;
  };
  const milestoneCards = (animate = false) => milestones.filter((item) => healthFilter === 'all' || item.group === healthFilter).map((item) => {
    const hours = healthElapsedHours();
    const reached = hours >= item.end;
    const target = Math.min(100, hours / item.end * 100);
    return `<article class="health-milestone ${reached ? 'reached' : ''}" data-health-id="${item.id}">
      <div class="health-milestone-top"><span>${String(item.id).padStart(2, '0')} / 24</span><span class="health-status">${reached ? '已到达参考时间' : hours >= item.start && item.start !== item.end ? '已进入参考阶段' : '正在积累'}</span></div>
      <h3>${item.title}</h3><p class="health-time">参考阶段 · ${item.time}</p>
      <p class="health-description">${item.description}</p>
      <div class="health-progress-label"><span>参考时间进度</span><strong aria-hidden="true">${animate ? '0.00' : timePercent(hours, item.end)}%</strong></div>
      <div class="health-progress-track" data-health-id="${item.id}" data-target-value="${target}" role="progressbar" aria-label="${item.title}的参考时间进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${timePercent(hours, item.end)}"><span class="health-progress-fill" style="transform:scaleX(${animate ? 0 : target / 100})"></span></div>
      <p class="health-remaining">${reached ? '已到达参考时间 · 不代表恢复完成' : `距参考${item.start === item.end ? '节点' : '期终点'}还有 ${healthTimeLeft(item.end - hours)}`}</p>
      <details><summary>变化说明与来源</summary><p>${item.detail}</p><p>${item.start === item.end ? '达到该时间只表示经过了参考时长，不表示身体检测达标。' : '以参考范围的终点计算时间进度，进入范围不等于变化已完成。'}</p><a href="${sources[item.source]}" target="_blank" rel="noopener noreferrer">查看 ${item.source} 原始资料 ↗</a></details>
    </article>`;
  }).join('');
  const renderHealthSection = () => {
    const hours = healthElapsedHours();
    const next = milestones.find((item) => hours < item.end);
    const systemReducesMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const healthMotionOn = state.healthMotion === 'on';
    return `<section class="card health-section" aria-labelledby="health-title">
      <div class="section-title"><div><p class="eyebrow">BODY CHANGES OVER TIME</p><h2 id="health-title">身体变化里程碑</h2></div><span class="section-note"><strong id="health-reached">${milestones.filter((item) => hours >= item.end).length}</strong> / 24 个时间节点</span></div>
      <p class="health-explainer">百分比表示到达参考时间的进度，不代表身体恢复比例。个人变化速度有所不同。</p>
      ${systemReducesMotion ? `<div class="health-motion-choice"><span>${healthMotionOn ? '进度动画已由你开启。' : '设备设置了减少动态效果，进度暂时直接显示。'}</span><button type="button" data-health-motion aria-pressed="${healthMotionOn}">${healthMotionOn ? '关闭进度动画' : '开启进度动画'}</button></div>` : ''}
      <div class="health-timeline"><div><strong>累计计入无烟时间</strong><span id="health-continuous-time">${formatDuration(cumulativeHealthHours() * 3600000)}</span></div><p id="health-timeline-note">吸烟日和未确认空白期不计入；累计无烟 ${totalSmokeFreeDays()} 天。参考进度不等于实际身体恢复程度。</p></div>
      ${ruleDisclosure('健康参考进度＝累计计入无烟时间 ÷ 对应里程碑的参考时长，上限 100%。有吸烟记录的整个 24 小时周期及未确认空白期不计入；此前无烟时间保留。B 的历史估算计入，C 到开始时间才计入。这只是时间参考，不是身体恢复比例或检查结果。')}
      <div class="health-next"><div><span class="health-next-kicker">下一份值得期待的变化</span><h3 id="health-next-title">${next ? next.title : '24 个参考时间节点，全部到达'}</h3><p id="health-next-copy">${next ? `${next.time} · ${next.description}` : '长期坚持值得纪念，继续照顾好自己。'}</p></div><div class="health-next-progress"><strong id="health-next-percent">${next ? timePercent(hours, next.end) : '100.00'}%</strong><span>参考时间进度</span></div></div>
      <div class="health-filters" role="group" aria-label="筛选身体变化里程碑">
        <button type="button" data-health-filter="all" aria-pressed="${healthFilter === 'all'}">全部 24</button>
        <button type="button" data-health-filter="early" aria-pressed="${healthFilter === 'early'}">初期 · 3 天内</button>
        <button type="button" data-health-filter="middle" aria-pressed="${healthFilter === 'middle'}">中期 · 数周至数月</button>
        <button type="button" data-health-filter="long" aria-pressed="${healthFilter === 'long'}">长期 · 持续获益</button>
      </div>
      <div class="health-milestone-grid" id="health-milestone-grid">${milestoneCards(true)}</div>
      <p class="health-source-note">资料参考 <a href="${sources.NHS}" target="_blank" rel="noopener noreferrer">NHS</a> 与 <a href="${sources.CDC}" target="_blank" rel="noopener noreferrer">CDC</a>。这里按累计无烟时间显示参考进度，不代表实际医学恢复；范围类节点按参考期终点计算，月按 30 天、年按 365 天折算。</p>
    </section>`;
  };
  const stopHealthProgress = () => {
    healthProgressObserver?.disconnect();
    healthProgressObserver = null;
    healthProgressFrames.forEach((frame) => cancelAnimationFrame(frame));
    healthProgressFrames.clear();
  };
  const animateHealthProgress = () => {
    const bars = [...app.querySelectorAll('.health-progress-track')]
      .filter((bar) => Number(bar.dataset.targetValue) > 0);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches && state.healthMotion !== 'on';
    const setBarValue = (bar, value) => {
      bar.querySelector('.health-progress-fill').style.transform = `scaleX(${value / 100})`;
      bar.closest('.health-milestone').querySelector('.health-progress-label strong').textContent = `${value.toFixed(2)}%`;
    };
    const schedule = (callback) => {
      const frame = requestAnimationFrame((timestamp) => { healthProgressFrames.delete(frame); callback(timestamp); });
      healthProgressFrames.add(frame);
    };
    const startBar = (bar) => {
      if (bar.dataset.inView === 'true') return;
      const target = Number(bar.dataset.targetValue);
      bar.dataset.inView = 'true';
      const token = Number(bar.dataset.animationToken || 0) + 1;
      bar.dataset.animationToken = String(token);
      setBarValue(bar, 0);
      if (reducedMotion) { setBarValue(bar, target); return; }
      let startedAt = null;
      const step = (timestamp) => {
        if (currentPage !== 'growth' || bar.dataset.inView !== 'true' || Number(bar.dataset.animationToken) !== token) return;
        if (startedAt === null) startedAt = timestamp;
        const progress = Math.min(1, (timestamp - startedAt) / 2200);
        setBarValue(bar, target * progress * progress * (3 - 2 * progress));
        if (progress < 1) schedule(step);
      };
      schedule(step);
    };
    const resetBar = (bar) => {
      if (bar.dataset.inView !== 'true') return;
      bar.dataset.inView = 'false';
      bar.dataset.animationToken = String(Number(bar.dataset.animationToken) + 1);
      setBarValue(bar, 0);
    };
    if (!window.IntersectionObserver) { bars.forEach(startBar); return; }
    healthProgressObserver = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? startBar(entry.target) : resetBar(entry.target));
    }, { threshold: 0.1 });
    bars.forEach((bar) => healthProgressObserver.observe(bar));
  };
  const bindHealthSection = () => {
    app.querySelectorAll('[data-health-motion]').forEach((button) => button.addEventListener('click', () => {
      state.healthMotion = state.healthMotion === 'on' ? 'off' : 'on';
      save();
      renderGrowth();
    }));
    app.querySelectorAll('[data-health-filter]').forEach((button) => button.addEventListener('click', () => {
      stopHealthProgress();
      healthFilter = button.dataset.healthFilter;
      app.querySelectorAll('[data-health-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      app.querySelector('#health-milestone-grid').innerHTML = milestoneCards(true);
      animateHealthProgress();
    }));
  };
  const refreshHealthSection = () => {
    const grid = app.querySelector('#health-milestone-grid');
    if (!grid) return;
    stopHealthProgress();
    const opened = new Set([...grid.querySelectorAll('details[open]')].map((detail) => detail.closest('[data-health-id]').dataset.healthId));
    const hours = healthElapsedHours();
    const next = milestones.find((item) => hours < item.end);
    app.querySelector('#health-reached').textContent = milestones.filter((item) => hours >= item.end).length;
    app.querySelector('#health-next-title').textContent = next ? next.title : '24 个参考时间节点，全部到达';
    app.querySelector('#health-next-copy').textContent = next ? `${next.time} · ${next.description}` : '长期坚持值得纪念，继续照顾好自己。';
    app.querySelector('#health-next-percent').textContent = `${next ? timePercent(hours, next.end) : '100.00'}%`;
    grid.innerHTML = milestoneCards(true);
    grid.querySelectorAll('[data-health-id]').forEach((card) => {
      if (opened.has(card.dataset.healthId)) card.querySelector('details').open = true;
    });
    animateHealthProgress();
  };
  const renderAutoSavingsSection = () => {
    const amount = smokeFreeSavings();
    return `<section class="card auto-savings-card" aria-labelledby="auto-savings-title">
      <div class="auto-savings-copy"><p class="eyebrow">EVERY MOMENT ADDS UP</p><h2 id="auto-savings-title">累计预估省下</h2><p>从戒烟开始按已计入时间、原先烟量和烟价累计估算，扣除已记录的吸烟支数；未确认空白期暂停累计。</p><p class="auto-savings-formula">日均 ${state.cigarettesPerDay || '—'} 支 · ¥${state.packPrice || '—'} / ${state.packCount || 20} 支</p>${ruleDisclosure('累计节省＝（已计入时间 ÷ 24 小时 × 原先日均支数－戒烟开始后记录的吸烟支数）× 每包价格 ÷ 每包支数，最低为 0。B 的注册前历史估算计入，C 在开始前为 0。吸烟只扣实际记录的支数，以前省下的金额不清零；未确认空白期不计入时间。')}${amount === null ? '<button class="secondary-button" data-page="settings">填写烟量与烟价 →</button>' : '<span class="auto-savings-note">这项累计估算与逐支记录金额分别显示</span>'}</div>
      <div class="money-orbit" aria-label="无烟时间预估节省金额"><div class="money-orbit-core">${moneyBag()}<strong id="timed-savings-value" aria-live="off">${amount === null ? '—' : `¥${amount}`}</strong><span>实时预估</span></div></div>
    </section>`;
  };

  const renderRankSection = () => {
    const route = state.rankRoute === 'journey' ? 'journey' : 'competitive';
    const days = totalSmokeFreeDays();
    const { current, next, remainingDays, percent } = rankProgress(days, route);
    const stages = rankStages(route);
    return `<section class="card rank-section" id="rank-section" data-days="${days}" aria-labelledby="rank-title">
      <div class="section-title"><div><p class="eyebrow">YOUR JOURNEY</p><h2 id="rank-title">我的晋级路线</h2></div><span class="section-note">${rankRoutes[route].label} · 累计无烟 ${days} 天</span></div>
      <div class="rank-summary"><div><span>当前称号</span><strong>${current.label}</strong><small>第 ${current.tier + 1} / 10 大段位 · 第 ${stages.findIndex((stage) => stage.startDay === current.startDay) + 1} / 34 小段位</small></div><div class="rank-summary-next"><span>下一步</span><strong>${next ? next.label : '已到达最高段位'}</strong><small>${next ? `还需 ${remainingDays} 个累计无烟日` : '继续记录每个无烟日子'}</small></div></div>
      <div class="rank-progress-label"><span>当前小段位进度</span><strong>${percent}%</strong></div><progress max="100" value="${percent}" aria-label="当前小段位进度 ${percent}%"></progress>
      <p class="rank-explainer">称号只依据累计无烟天数，不评价健康状况或个人能力。有吸烟记录的 24 小时周期及未确认空白期不计入，之前积累的天数保留。</p>
      <details class="rank-path"><summary>查看完整晋级路线 · 10 大段位 / 34 小段位</summary><ol>${rankRoutes[route].names.map((name, tier) => {
        const tierStages = stages.filter((stage) => stage.tier === tier);
        return `<li class="rank-tier ${tier === current.tier ? 'current' : ''}"><strong>${name}</strong><span>${tierStages.map((stage) => `<span class="rank-stage ${stage.startDay === current.startDay ? 'current' : ''}">${stage.division || name} · ${stage.startDay} 天</span>`).join('')}</span></li>`;
      }).join('')}</ol></details>
    </section>`;
  };
  const renderGrowth = () => {
    stopHealthProgress();
    const goalSaved = smokeFreeSavings();
    const goalReached = Number(state.savingsGoal) > 0 && Number(goalSaved) >= Number(state.savingsGoal);
    const recentWins = [...(state.urgeWins || [])].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
    const recentLapses = [...(state.lapses || [])].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
    const historyRows = (entries, type) => entries.map((entry) => `<div class="history-row"><div>${type === 'win' ? `忍住 ${entry.cigarettes} 根` : `吸烟 ${entry.cigarettes || 1} 根`}<small>${dateLabel(entry.at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${entry.trigger ? ` · ${escapeHtml(entry.trigger)}` : ''}${entry.method ? ` · ${escapeHtml(entry.method)}` : ''}</small></div><span class="history-tag ${type === 'win' ? 'success-tag' : ''}">${type === 'win' ? `${flowerIcon(17)} 1 朵` : '已记录'}</span></div>`).join('');
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">LITTLE BY LITTLE</p><h1>看看你走了多远。</h1><p class="subtitle">记录每一步，比追求完美更重要。</p></div></div>
      ${renderRankSection()}
      <div class="stats-grid"><article class="stat-card"><span class="stat-label">${state.startMode === 'continuing' ? '累计戒烟时长（含历史估算）' : '累计已记录戒烟时长'}</span><strong id="total-smoke-free">${quitElapsedDays()} <small>天</small></strong>${ruleDisclosure(startRule())}</article><article class="stat-card"><span class="stat-label">累计无烟天数</span><strong><span id="total-smoke-free-days">${totalSmokeFreeDays()}</span> <small>天</small></strong>${ruleDisclosure('累计无烟时间＝已计入戒烟时间－有吸烟记录的 24 小时周期；未确认空白期也不计入。累计满 24 小时显示 1 天。同一期吸烟多次只扣除这一个周期，以前的无烟时间保留。')}</article><article class="stat-card"><span class="stat-label">累计打卡</span><strong>${confirmedCheckins().length} <small>次</small></strong>${ruleDisclosure('每满一个 24 小时周期，确认无烟后增加 1 次。只能补最近三个已结束的周期；有吸烟记录的周期不能确认。B 的历史估算计入累计时间，但不会自动生成打卡次数。')}</article><article class="stat-card flower-stat"><span class="stat-label">累计小红花</span><strong>${flowerIcon()}<span>${(state.urgeWins || []).length}</span> <small>朵</small></strong>${ruleDisclosure('每保存一次“成功忍住”记录，增加 1 朵小红花。小红花按记录次数计算，不按忍住的支数计算，也不因之后吸烟清零。')}</article></div>
      ${renderAutoSavingsSection()}
      ${renderHealthSection()}
      <section class="card savings-goal-card"><div class="section-title"><div><p class="eyebrow">A REWARD THAT MATTERS</p><h2>${escapeHtml(state.savingsGoalName || '给自己设一个奖励目标')}</h2></div><button class="link-button" data-page="settings"><span id="goal-action-label">${goalReached ? '设置下一个目标' : state.savingsGoal ? '调整目标' : '设置目标'}</span> →</button></div>${state.savingsGoal ? `<div class="goal-amount"><strong id="goal-saved-amount">¥${goalSaved || 0}</strong><span> / ¥${state.savingsGoal} · 预估节省</span></div><div class="goal-track" id="goal-track" role="progressbar" aria-label="奖励目标预估节省进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.round((Number(goalSaved) || 0) / state.savingsGoal * 100))}"><span id="goal-track-fill" style="width:${Math.min(100, Math.round((Number(goalSaved) || 0) / state.savingsGoal * 100))}%"></span></div><div class="goal-complete" id="goal-complete" role="status" aria-live="polite" ${goalReached ? '' : 'hidden'}><strong>目标金额达成，真棒！</strong><p>这份坚持是你一天一天攒下来的。预估节省已达到目标金额，可以修改目标，开始期待下一件想做的事。</p></div><p class="chart-legend">从戒烟开始累计估算，并扣除已记录的吸烟支数。</p>` : '<p class="wins-empty">把戒烟带来的积累，连到一个你真心想要的奖励上。</p>'}</section>
      <section class="card history-card"><div class="section-title"><h2>戒烟历程</h2><span class="section-note">累计忍住 ${totalAvoidedCigarettes()} 根</span></div><div class="history-groups"><section class="history-group" aria-labelledby="win-history-title"><div class="history-group-heading"><h3 id="win-history-title"><span aria-hidden="true">😄</span> 成功应对</h3><small>已收获 ${(state.urgeWins || []).length} 朵小红花</small></div>${recentWins.length ? historyRows(recentWins, 'win') : '<p class="history-group-empty">还没有成功应对记录。</p>'}</section><section class="history-group" aria-labelledby="lapse-history-title"><div class="history-group-heading"><h3 id="lapse-history-title"><span aria-hidden="true">😭</span> 糟糕了，吸烟了</h3><small>已记录 ${(state.lapses || []).length} 次</small></div>${recentLapses.length ? historyRows(recentLapses, 'lapse') : '<p class="history-group-empty">还没有吸烟记录。</p>'}</section></div></section>
    </section>${nav()}`;
    bindCommon();
    bindHealthSection();
    animateHealthProgress();
    let seconds = 0;
    liveClockHandle = setInterval(() => {
      const node = app.querySelector('#total-smoke-free');
      if (node) node.innerHTML = `${quitElapsedDays()} <small>天</small>`;
      const daysNode = app.querySelector('#total-smoke-free-days');
      if (daysNode) daysNode.textContent = totalSmokeFreeDays();
      const rankDays = Number(app.querySelector('#rank-section')?.dataset.days);
      if (Number.isFinite(rankDays) && rankDays !== totalSmokeFreeDays()) {
        app.querySelector('#rank-section').outerHTML = renderRankSection();
      }
      const healthTimeNode = app.querySelector('#health-continuous-time');
      if (healthTimeNode) healthTimeNode.textContent = formatDuration(cumulativeHealthHours() * 3600000);
      const healthNoteNode = app.querySelector('#health-timeline-note');
      if (healthNoteNode) healthNoteNode.textContent = `吸烟日和未确认空白期不计入；累计无烟 ${totalSmokeFreeDays()} 天。参考进度不等于实际身体恢复程度。`;
      const savingsNode = app.querySelector('#timed-savings-value');
      if (savingsNode) {
        const amount = smokeFreeSavings();
        savingsNode.textContent = amount === null ? '—' : `¥${amount}`;
        if (state.savingsGoal) {
          const goalPercent = Math.min(100, Math.round((Number(amount) || 0) / state.savingsGoal * 100));
          const goalAmountNode = app.querySelector('#goal-saved-amount');
          if (goalAmountNode) goalAmountNode.textContent = `¥${amount || 0}`;
          const goalFill = app.querySelector('#goal-track-fill');
          if (goalFill) goalFill.style.width = `${goalPercent}%`;
          app.querySelector('#goal-track')?.setAttribute('aria-valuenow', String(goalPercent));
          const goalComplete = app.querySelector('#goal-complete');
          if (goalComplete && goalComplete.hidden !== (Number(amount) < Number(state.savingsGoal))) {
            goalComplete.hidden = Number(amount) < Number(state.savingsGoal);
            app.querySelector('#goal-action-label').textContent = goalComplete.hidden ? '调整目标' : '设置下一个目标';
          }
        }
      }
      if (++seconds % 60 === 0) refreshHealthSection();
    }, 1000);
  };

  const renderBuddy = () => {
    const saved = smokeFreeSavings();
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">A FRIENDLY LITTLE NUDGE</p><h1>找个人，陪你走一段。</h1><p class="subtitle">和信任的人说一声，有时就会多一点勇气。</p></div></div>
      <section class="buddy-card"><div><p class="eyebrow">JUST FOR YOU AND YOUR FRIEND</p><h2>不用一个人扛着。</h2><p class="subtitle">邀请一个你信任的人，给你的戒烟旅程一点小小的支持。</p></div><article class="invite-preview"><div class="invite-art">${icon('leaf', 39)}</div><p class="eyebrow">MY LITTLE PROMISE</p><h2>我正在认真戒烟。</h2><p>从今天起，我想给自己多一点照顾。<br>如果你愿意，陪我聊聊天就很好。</p><div class="invite-stats"><div class="invite-stat"><strong>${totalSmokeFreeDays()}</strong><span>无烟天数</span></div><div class="invite-stat"><strong>${confirmedCheckins().length}</strong><span>次打卡</span></div>${saved === null ? '' : `<div class="invite-stat"><strong id="buddy-savings-value">¥${saved}</strong><span>预估省下</span></div>`}</div></article><div class="centered-actions"><button class="primary-button" data-action="share-demo">${icon('people', 16)} 预览邀请卡</button><p>网页样稿仅演示邀请卡，不会真的发送或建立好友关系。</p></div></section>
    </section>${nav()}`;
    bindCommon();
    if (saved !== null) liveClockHandle = setInterval(() => {
      const amount = app.querySelector('#buddy-savings-value');
      if (currentPage === 'buddy' && amount) amount.textContent = `¥${smokeFreeSavings()}`;
    }, 1000);
  };

  const renderSettings = () => {
    const background = BACKGROUNDS[state.pageBackground] || BACKGROUNDS.blue;
    const route = state.rankRoute === 'journey' ? 'journey' : 'competitive';
    const startModeLabel = { now: 'A · 准备戒烟，从现在开始', continuing: 'B · 正在戒烟的路上，现在继续打卡记录', planned: 'C · 有戒烟打算，选择一个好日子开始计划' }[state.startMode] || '原有计划（未记录首次选择）';
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">MAKE IT YOURS</p><h1>让陪伴刚刚好。</h1><p class="subtitle">最初的起点保存在这里，其他偏好可以按需调整。</p></div></div>
      <section class="card settings-list"><div class="setting-row"><div class="setting-info"><strong>每日鼓励提醒</strong><small>功能准备中，暂不发送通知</small></div><span class="setting-coming-soon">即将开放</span></div><div class="subtle-copy">“松口气”是一个行为陪伴原型，不提供诊断或个性化医疗建议。如果戒烟过程中有健康或用药方面的疑问，可以咨询专业人士。</div></section>
      <section class="card history-card background-setting"><div class="setting-row"><div class="setting-info"><strong>页面配色</strong><small>当前：${background.label} · 背景与卡片同步搭配</small></div><button class="secondary-button" data-action="page-background">选择配色</button></div></section>
      <section class="card rank-setting-card" aria-labelledby="rank-setting-title"><div class="section-title"><div><p class="eyebrow">YOUR JOURNEY</p><h2 id="rank-setting-title">称号路线</h2></div></div><p class="rank-setting-note">选择一种称号风格，今天和成长页面会同步显示。累计无烟天数和晋级进度不会改变。</p><fieldset class="rank-route-options"><legend class="sr-only">选择称号路线</legend>${Object.entries(rankRoutes).map(([key, value]) => `<label class="rank-route-option"><input type="radio" name="rankRoute" value="${key}" ${route === key ? 'checked' : ''} /><span><strong>${value.label}</strong><small>${value.names[0]} → ${value.names[value.names.length - 1]}</small></span></label>`).join('')}</fieldset></section>
      <section class="card history-card plan-settings-card"><div class="section-title"><div><p class="eyebrow">YOUR QUIT PLAN</p><h2>最初的戒烟计划</h2></div></div><div class="history-row"><div>开始方式<small>${escapeHtml(startModeLabel)}</small></div></div><div class="history-row"><div>${state.startMode === 'planned' ? '计划戒烟日' : '戒烟开始日期'}<small>${dateLabel(state.currentStartAt, { year: 'numeric', month: 'numeric', day: 'numeric' })} ${timeInputValue(state.currentStartAt)} · 每日打卡边界</small></div></div><div class="section-title goal-settings-title"><h2>我的奖励目标</h2></div><label class="form-field"><span>想为自己买什么</span><input id="savings-goal-name" type="text" value="${escapeHtml(state.savingsGoalName || '')}" placeholder="例如：耳机、旅行" /></label><label class="form-field"><span>目标金额</span><div class="input-wrap"><input id="savings-goal" type="number" min="1" max="100000" value="${state.savingsGoal || ''}" placeholder="比如 1200" /><em>元</em></div></label><button class="primary-button save-plan-button" data-action="save-goal">保存奖励目标</button><div class="history-row"><div>吸烟量和烟价<small>${state.packPrice ? '¥' + state.packPrice + ' / ' + (state.packCount || 20) + ' 支' + (state.cigarettesPerDay ? ' · 日常 ' + state.cigarettesPerDay + ' 支 / 天' : '') : '填写烟价后按逐支记录估算金额'}</small></div><button class="link-button" data-action="edit-estimate">${state.packPrice ? '修改' : '填写'}</button></div><div class="history-row"><div>重置本机样稿数据</div><button class="link-button" data-action="reset">重置</button></div></section>
    </section>${nav()}`;
    bindCommon();
    app.querySelectorAll('[name="rankRoute"]').forEach((input) => input.addEventListener('change', () => {
      if (input.value === state.rankRoute) return;
      state.rankRoute = input.value;
      save();
    }));
    ['#savings-goal-name', '#savings-goal'].forEach((selector) => {
      const input = app.querySelector(selector);
      input?.addEventListener?.('input', () => clearFieldError(input));
    });
  };

  const renderUrge = () => {
    if (timerHandle) clearInterval(timerHandle);
    secondsLeft = 300;
    app.innerHTML = `${topbar()}<section class="page urge-page"><div class="page-heading"><div><p class="eyebrow">THIS FEELING WILL PASS</p><h1>先陪自己待一会。</h1><p class="subtitle">烟瘾会起起落落。现在不用做决定，先照顾好这一分钟。</p></div></div>
      <section class="breath-card"><span class="time-chip">${icon('clock', 14)} 五分钟小练习</span><div class="breath-ring" id="breath-ring"><div><div class="breath-time" id="timer">05:00</div><span class="breath-caption">留一点时间给自己</span></div></div><div class="breath-instruction" id="breath-instruction">吸气 4 秒 · 慢慢呼气 6 秒</div><p class="breath-subtitle" id="urge-message">鼻子轻轻吸气，嘴巴慢慢呼出去。<br>不需要做得完美，跟着自己的节奏就好。</p><button class="primary-button" data-action="start-timer" id="timer-button">${icon('spark', 16)} 开始五分钟</button></section>
      <div class="urge-steps"><button class="urge-step" data-action="urge-method" data-method="呼吸练习"><span>01 · 呼吸</span><strong>${icon('leaf', 15)} 先慢下来</strong><small>慢慢吸气，再舒适地呼出去。</small></button><button class="urge-step" data-action="urge-method" data-method="喝几口水"><span>02 · 换个感觉</span><strong>${icon('cup', 15)} 喝几口水</strong><small>去倒杯水，让嘴巴忙一小会。</small></button><button class="urge-step" data-action="urge-method" data-method="出去走走"><span>03 · 动一动</span><strong>${icon('walk', 15)} 走一小圈</strong><small>站起来伸伸懒腰，换个地方。</small></button></div>
      <div class="urge-buttons"><button class="secondary-button" data-action="urge-continue">我还想抽</button><button class="secondary-button" data-action="urge-lapse">我已经抽了</button><button class="primary-button" data-action="urge-success">${icon('check', 15)} 这次我忍住了</button></div>
    </section>${nav()}`;
    bindCommon();
  };

  const bindCommon = () => {
    app.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => {
      if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
      if (liveClockHandle) { clearInterval(liveClockHandle); liveClockHandle = null; }
      currentPage = button.dataset.page;
      render();
    }));
    app.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', (event) => handleAction(button.dataset.action, event)));
  };

  const handleAction = (action, event) => {
    if (action === 'urge') { currentPage = 'urge'; render(); return; }
    if (action === 'log-win') { showUrgeWinDialog(); return; }
    if (action === 'urge-success') { showUrgeWinDialog(true); return; }
    if (action === 'urge-method') {
      const messages = { 呼吸练习: '跟着自己的呼吸就好，不需要做得完美。', 喝几口水: '慢慢喝几口水，给自己一点停顿。', 出去走走: '换个地方，走一小圈，再看看感觉有没有变化。' };
      app.querySelectorAll('.urge-step').forEach((step) => step.classList.toggle('selected', step.dataset.method === event.currentTarget.dataset.method));
      const selected = app.querySelector('.urge-step.selected');
      const message = app.querySelector('#urge-message');
      if (selected && message) message.textContent = messages[selected.dataset.method];
      return;
    }
    if (action === 'urge-continue') { secondsLeft = 300; const timer = app.querySelector('#timer'); if (timer) timer.textContent = '05:00'; startTimer(); showToast('我们再陪你一会儿'); return; }
    if (action === 'urge-lapse') { if (timerHandle) clearInterval(timerHandle); timerHandle = null; showLapseDialog(); return; }
    if (action === 'go-home' || action === 'urge-done') {
      if (timerHandle) clearInterval(timerHandle);
      timerHandle = null;
      currentPage = 'home'; render();
      if (action === 'urge-done') showToast('能照顾好这一刻，已经很棒了 🌱');
      return;
    }
    if (action === 'toggle-makeup') {
      const dates = app.querySelector('#makeup-dates');
      dates.hidden = !dates.hidden;
      event.currentTarget.setAttribute('aria-expanded', String(!dates.hidden));
      return;
    }
    if (action === 'checkin') {
      const index = Number(event.currentTarget.dataset.periodIndex);
      const period = periodAt(checkinAnchor(), index);
      const eligible = Number.isInteger(index) && recentCompleted(checkinAnchor()).some((item) => item.index === index);
      if (!eligible || checkinStatus(period) !== 'pending') { showToast('这一期还不能确认，或已超过补卡期限'); render(); return; }
      state.checkins.push(periodDateKey(period.start));
      state.unverifiedGaps = restoreInterval(state.unverifiedGaps || [], period);
      save(); render(); showToast('已确认这一期的 24 小时无烟记录 🌱'); return;
    }
    if (action === 'lapse') { showLapseDialog(); return; }
    if (action === 'share-demo') { showToast('邀请卡预览完成，可以想象分享给朋友啦 🌿'); return; }
    if (action === 'start-timer') { startTimer(); return; }
    if (action === 'edit-estimate') { showEstimateDialog(); return; }
    if (action === 'page-background') { showBackgroundDialog(); return; }
    if (action === 'save-goal') {
      const nameInput = app.querySelector('#savings-goal-name');
      const amountInput = app.querySelector('#savings-goal');
      const amount = amountInput.value.trim() ? Number(amountInput.value) : null;
      if (amount !== null && (!Number.isFinite(amount) || amount <= 0 || amount > 100000)) { showFieldError(amountInput, '目标金额请输入 1 到 100000 元'); return; }
      if (amount !== null && !nameInput.value.trim()) { showFieldError(nameInput, '请填写奖励目标名称'); return; }
      state.savingsGoalName = nameInput.value.trim();
      state.savingsGoal = amount;
      save(); render(); showToast('奖励目标已保存'); return;
    }
    if (action === 'reset') { showResetDialog(); }
  };

  const closeModal = (backdrop) => {
    backdrop.onDismiss?.();
    backdrop.remove();
    app.inert = false;
    if (backdrop.returnFocus?.isConnected !== false) backdrop.returnFocus?.focus?.();
  };
  const modal = (content) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true">${content}</section>`;
    backdrop.returnFocus = document.activeElement;
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeModal(backdrop); });
    backdrop.addEventListener('input', (event) => clearFieldError(event.target));
    backdrop.addEventListener('invalid', (event) => {
      event.preventDefault();
      if (!backdrop.querySelector('.field-error')) showFieldError(event.target, event.target.validationMessage || '请检查这一项');
    }, true);
    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeModal(backdrop); return; }
      if (event.key !== 'Tab') return;
      const focusable = [...backdrop.querySelectorAll('button, input, select, textarea, a[href]')].filter((item) => !item.disabled && !item.hidden && (!item.getClientRects || item.getClientRects().length));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === backdrop.querySelector('.modal'))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.body.append(backdrop);
    app.inert = true;
    const dialog = backdrop.querySelector('.modal');
    const title = dialog?.querySelector('h2');
    if (dialog && title) { dialog.tabIndex = -1; title.id = 'modal-title'; dialog.setAttribute('aria-labelledby', title.id); dialog.focus(); }
    const closeButtons = backdrop.querySelectorAll?.('[data-close]') || [backdrop.querySelector('[data-close]')].filter(Boolean);
    closeButtons.forEach((close) => close.addEventListener('click', () => closeModal(backdrop)));
    return backdrop;
  };

  const playCoinDrop = () => {
    const audio = document.querySelector('#coin-drop-sound');
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  };

  const showUrgeWinDialog = (fromUrge = false) => {
    state.lastEncouragementIndex = (Number.isInteger(state.lastEncouragementIndex) ? state.lastEncouragementIndex + 1 : 0) % ENCOURAGEMENTS.length;
    save();
    const encouragement = ENCOURAGEMENTS[state.lastEncouragementIndex];
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">ONE REAL WIN</p><h2>这次实际忍住了几根？</h2><p>按你这次原本想抽、最后忍住没抽的数量记录。每次都可以不同。</p><form id="win-form"><label class="form-field"><span>忍住的数量</span><div class="input-wrap"><input id="win-cigarettes" type="number" min="1" max="100" step="1" value="1" required /><em>根</em></div></label><label class="form-field"><span>当时的诱因 <i class="optional">选填</i></span><select id="win-trigger"><option value="">暂不填写</option><option>压力大</option><option>饭后习惯</option><option>应酬或社交</option><option>无聊</option><option>别人递烟</option><option>其他</option></select></label><label class="form-field"><span>帮到你的方法 <i class="optional">选填</i></span><select id="win-method"><option value="">暂不填写</option><option>慢慢呼吸</option><option>喝水</option><option>散步或换个地方</option><option>嚼无糖口香糖</option><option>分心做了别的事</option><option>其他</option></select></label><p class="win-encouragement" role="status">${encouragement}</p><div class="modal-actions"><button class="primary-button" type="submit">保存这次成功</button></div></form>`);
    backdrop.querySelector('#win-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const cigarettes = Number(backdrop.querySelector('#win-cigarettes').value);
      if (!Number.isInteger(cigarettes) || cigarettes < 1 || cigarettes > 100) { showFieldError(backdrop.querySelector('#win-cigarettes'), '请输入 1 到 100 之间的整数'); return; }
      state.urgeWins = state.urgeWins || [];
      state.urgeWins.push({ at: new Date().toISOString(), cigarettes, trigger: backdrop.querySelector('#win-trigger').value, method: backdrop.querySelector('#win-method').value });
      save(); closeModal(backdrop); playCoinDrop();
      if (fromUrge) { if (timerHandle) clearInterval(timerHandle); timerHandle = null; currentPage = 'home'; }
      render();
      showToast('记录成功，送你一朵小红花！', true);
    });
  };

  const showLapseDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">A GENTLE RESET</p><h2>这次记下来就好。</h2><p>之前的坚持仍然保留。这次吸烟所在的 24 小时周期不计入累计无烟时长，我们可以一起看看是什么情境触发了吸烟。</p><form id="lapse-form"><label class="form-field"><span>这次实际抽了几根</span><div class="input-wrap"><input id="lapse-cigarettes" type="number" min="1" max="100" value="1" required /><em>根</em></div></label><label class="form-field"><span>当时的诱因 <i class="optional">选填</i></span><select id="lapse-trigger"><option value="">暂不填写</option><option>压力大</option><option>饭后习惯</option><option>应酬或社交</option><option>无聊</option><option>别人递烟</option><option>其他</option></select></label><div class="modal-actions"><button class="primary-button" type="submit">记录并继续今天</button><button class="link-button" type="button" data-close>先不记录</button></div></form>`);
    backdrop.querySelector('#lapse-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const now = new Date().toISOString();
      const cigarettes = Number(backdrop.querySelector('#lapse-cigarettes').value);
      if (!Number.isInteger(cigarettes) || cigarettes < 1 || cigarettes > 100) { showFieldError(backdrop.querySelector('#lapse-cigarettes'), '请输入 1 到 100 之间的整数'); return; }
      state.lapses.push({ at: now, cigarettes, trigger: backdrop.querySelector('#lapse-trigger').value, choice: 'continue' });
      state.lastLapseAt = now;
      save(); closeModal(backdrop); render(); showToast('已记录，这次吸烟所在的 24 小时周期不计入累计无烟时长');
    });
  };

  const showEstimateDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">YOUR ESTIMATE</p><h2>设置烟价与每包支数</h2><p>按你记录忍住的支数估算省下的钱。</p><label class="form-field"><span>平均每天抽几支</span><div class="input-wrap"><input id="edit-cigs" type="number" min="1" max="100" value="${state.cigarettesPerDay || ''}" placeholder="比如 10" /><em>支 / 天</em></div></label><label class="form-field"><span>每包大约多少钱</span><div class="input-wrap"><input id="edit-price" type="number" min="0.01" max="1000" step="0.01" value="${state.packPrice || ''}" placeholder="比如 20" /><em>元 / 包</em></div></label><label class="form-field"><span>每包有几支</span><div class="input-wrap"><input id="edit-pack-count" type="number" min="1" max="100" step="1" value="${state.packCount || 20}" required /><em>支 / 包</em></div></label><div class="modal-actions"><button class="primary-button" data-save-estimate>保存</button><button class="link-button" data-clear-estimate>清除估算资料</button></div>`);
    backdrop.querySelector('[data-save-estimate]').addEventListener('click', () => {
      const cigsInput = backdrop.querySelector('#edit-cigs');
      const priceInput = backdrop.querySelector('#edit-price');
      const count = Number(backdrop.querySelector('#edit-pack-count').value);
      const cigs = cigsInput.value.trim() ? Number(cigsInput.value) : null;
      const price = priceInput.value.trim() ? Number(priceInput.value) : null;
      if (cigs !== null && (!Number.isInteger(cigs) || cigs < 1 || cigs > 100)) { showFieldError(cigsInput, '日均支数请输入 1 到 100 的整数'); return; }
      if (price !== null && (!Number.isFinite(price) || price <= 0 || price > 1000)) { showFieldError(priceInput, '每包价格请输入 0.01 到 1000 元'); return; }
      if (!Number.isInteger(count) || count < 1 || count > 100) { showFieldError(backdrop.querySelector('#edit-pack-count'), '每包支数请输入 1 到 100 的整数'); return; }
      state.cigarettesPerDay = cigs;
      state.packPrice = price;
      state.packCount = count;
      save(); closeModal(backdrop); render(); showToast('估算资料已更新');
    });
    backdrop.querySelector('[data-clear-estimate]').addEventListener('click', () => {
      state.cigarettesPerDay = null; state.packPrice = null; state.packCount = 20; save(); closeModal(backdrop); render(); showToast('估算资料已清除');
    });
  };

  const showResetDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">START FRESH</p><h2>要重新开始体验吗？</h2><p>这会清除本机保存的戒烟计划、打卡和记录。</p><div class="modal-actions"><button class="danger-button" data-confirm-reset>清除并重新开始</button><button class="secondary-button" data-close>暂时不要</button></div>`);
    backdrop.querySelector('[data-confirm-reset]').addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); state = null; closeModal(backdrop); render(); });
  };

  const showBackgroundDialog = () => {
    const selected = BACKGROUNDS[state.pageBackground] ? state.pageBackground : 'blue';
    let preview = selected;
    const selectedTone = BACKGROUNDS[selected].tone || 'light';
    const choiceButton = ([key, option]) => `<button type="button" class="background-choice ${selected === key ? 'selected' : ''}" data-background="${key}" aria-pressed="${selected === key}" style="--swatch:${option.color};--swatch-card:${option.soft};--swatch-deep:${option.strong}"><span class="background-swatch" aria-hidden="true"></span><span class="background-choice-copy"><strong>${option.label}</strong><small>${option.description}</small></span><span class="background-check" aria-hidden="true">${selected === key ? '✓' : ''}</span></button>`;
    const options = Object.entries(BACKGROUNDS);
    const lightChoices = options.filter(([, option]) => option.tone !== 'dark').map(choiceButton).join('');
    const darkChoices = options.filter(([, option]) => option.tone === 'dark').map(choiceButton).join('');
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><div class="background-picker"><p class="eyebrow">PAGE APPEARANCE</p><h2>选择页面底色</h2><p>点击色卡可立即预览页面效果，确认后保存。</p><div class="palette-tone-switch" role="group" aria-label="配色类别"><button type="button" data-palette-tone="light" aria-pressed="${selectedTone === 'light'}">柔和浅色 · 13 款</button><button type="button" data-palette-tone="dark" aria-pressed="${selectedTone === 'dark'}">沉稳深色 · 5 款</button></div><div data-tone-panel="light" ${selectedTone === 'dark' ? 'hidden' : ''}><h3 class="background-group-title">柔和浅色</h3><div class="background-options" role="group" aria-label="柔和浅色">${lightChoices}</div></div><div data-tone-panel="dark" ${selectedTone === 'light' ? 'hidden' : ''}><h3 class="background-group-title">沉稳深色</h3><div class="background-options" role="group" aria-label="沉稳深色">${darkChoices}</div></div><div class="background-picker-actions"><p class="background-preview-status" role="status">当前使用：${BACKGROUNDS[selected].label}</p><button class="primary-button" type="button" data-confirm-background>确认使用此配色</button><button class="link-button" type="button" data-close>取消</button></div></div>`);
    backdrop.onDismiss = () => applyPageBackground();
    backdrop.querySelectorAll('[data-palette-tone]').forEach((button) => button.addEventListener('click', () => {
      const tone = button.dataset.paletteTone;
      backdrop.querySelectorAll('[data-palette-tone]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      backdrop.querySelectorAll('[data-tone-panel]').forEach((panel) => { panel.hidden = panel.dataset.tonePanel !== tone; });
    }));
    backdrop.querySelectorAll('[data-background]').forEach((button) => button.addEventListener('click', () => {
      preview = button.dataset.background;
      applyPageBackground(preview);
      backdrop.querySelectorAll('[data-background]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('selected', active);
        item.setAttribute('aria-pressed', String(active));
        item.querySelector('.background-check').textContent = active ? '✓' : '';
      });
      backdrop.querySelector('.background-preview-status').textContent = `正在预览：${BACKGROUNDS[preview].label} · 确认后保存`;
    }));
    backdrop.querySelector('[data-confirm-background]').addEventListener('click', () => {
      state.pageBackground = preview;
      save();
      backdrop.onDismiss = null;
      closeModal(backdrop);
      render();
      showToast(`页面底色已设为${BACKGROUNDS[state.pageBackground].label}`);
    });
  };

  const startTimer = () => {
    if (timerHandle) return;
    const button = app.querySelector('#timer-button');
    const timer = app.querySelector('#timer');
    const instruction = app.querySelector('#breath-instruction');
    const message = app.querySelector('#urge-message');
    const ring = app.querySelector('#breath-ring');
    button.textContent = '正在陪你度过这一刻'; button.disabled = true;
    ring.classList.add('running');
    instruction.textContent = '吸气 4 秒 · 慢慢呼气 6 秒';
    message.innerHTML = '再喝几口水，或者起身走一走。<br>这阵感觉会慢慢过去。';
    timerHandle = setInterval(() => {
      secondsLeft -= 1;
      const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
      const seconds = String(secondsLeft % 60).padStart(2, '0');
      timer.textContent = `${minutes}:${seconds}`;
      instruction.textContent = Math.floor((300 - secondsLeft) / 10) % 2 === 0 ? '慢慢吸气 · 不用着急' : '慢慢呼出去 · 肩膀放松';
      if (secondsLeft <= 0) {
        clearInterval(timerHandle); timerHandle = null;
        timer.textContent = '完成'; instruction.textContent = '这一波，你陪自己度过了。';
        message.innerHTML = '辛苦啦。喝口水，感受一下现在的自己。<br>你不需要一次解决所有事。';
        button.textContent = '记录这次成功'; button.disabled = false;
        button.dataset.action = 'urge-success';
      }
    }, 1000);
  };

  const render = () => {
    if ((!state || currentPage !== 'home') && moneyRingFrameHandle !== null) { cancelAnimationFrame(moneyRingFrameHandle); moneyRingFrameHandle = null; }
    if (!state || currentPage !== 'growth') stopHealthProgress();
    app.classList.toggle('home-ui', Boolean(state) && currentPage === 'home');
    applyPageBackground();
    if (!state) { renderOnboarding(); return; }
    const pages = { home: renderHome, growth: renderGrowth, buddy: renderBuddy, settings: renderSettings, urge: renderUrge };
    (pages[currentPage] || renderHome)();
  };

  document.addEventListener?.('visibilitychange', () => { recordVisit(); if (document.visibilityState === 'visible') render(); });
  setInterval(() => { if (document.visibilityState !== 'hidden') recordVisit(); }, 30000);
  render();
})();
