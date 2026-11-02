(() => {
  const STORAGE_KEY = 'songkouqi.v1';
  const BACKGROUNDS = {
    blue: { label: '晴空蓝', color: '#e7eef8' },
    green: { label: '薄荷绿', color: '#e8ecd8' },
    warm: { label: '燕麦暖', color: '#f3eadc' },
    lavender: { label: '淡雾紫', color: '#eee8f5' },
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
  let secondsLeft = 300;
  let toastHandle = null;

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const applyPageBackground = () => {
    const choice = BACKGROUNDS[state?.pageBackground] || BACKGROUNDS.blue;
    document.documentElement.style.setProperty('--paper', choice.color);
  };
  const safeDate = (value) => {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  };
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const daysBetween = (from, to = new Date()) => Math.max(0, Math.floor((to - safeDate(from)) / 86400000));
  const planStarted = () => state && safeDate(state.currentStartAt).getTime() <= Date.now();
  const elapsedDays = () => state ? daysBetween(state.currentStartAt) : 0;
  const daysSinceLastSmoke = () => state && planStarted() ? daysBetween(state.lastLapseAt || state.currentStartAt) : 0;
  const lastSmokeTime = () => state?.lastLapseAt || state?.currentStartAt;
  const totalSmokeFreeMs = () => {
    if (!state) return 0;
    const routeStart = state.planType === 'reduce-to-quit' && state.plannedQuitDate
      ? safeDate(`${state.plannedQuitDate}T00:00:00`)
      : safeDate(state.currentStartAt);
    const now = Date.now();
    if (routeStart.getTime() >= now) return 0;
    let cursor = routeStart.getTime();
    let total = 0;
    const lapses = [...(state.lapses || [])].map((entry) => safeDate(entry.at).getTime()).filter((at) => at > cursor && at <= now).sort((a, b) => a - b);
    lapses.forEach((at) => { total += at - cursor; cursor = at; });
    return total + Math.max(0, now - cursor);
  };
  const formatTotalSmokeFree = () => {
    const totalMinutes = Math.floor(totalSmokeFreeMs() / 60000);
    return `${Math.floor(totalMinutes / 1440)}天 ${Math.floor((totalMinutes % 1440) / 60)}小时 ${totalMinutes % 60}分钟`;
  };
  const currentReductionQuota = () => {
    const baseline = Number(state?.cigarettesPerDay) || 0;
    if (!baseline) return null;
    const weeklyReduction = Number(state?.weeklyReduction) || 2;
    const weeks = Math.floor(Math.max(0, Date.now() - safeDate(state?.reductionStartedAt || state?.currentStartAt).getTime()) / (7 * 86400000));
    return Math.max(0, baseline - weeklyReduction * weeks);
  };
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
  const moneySaved = () => {
    if (!state?.cigarettesPerDay || !state?.packPrice) return null;
    return Math.floor((state.checkins || []).length * state.cigarettesPerDay * state.packPrice / 20);
  };
  const showToast = (message) => {
    toastNode.textContent = message;
    toastNode.classList.add('show');
    clearTimeout(toastHandle);
    toastHandle = setTimeout(() => toastNode.classList.remove('show'), 2400);
  };
  const todayCheckin = () => state?.checkins?.includes(todayKey());
  const smokedToday = () => (state?.lapses || []).some((entry) => todayKey(new Date(entry.at)) === todayKey());
  const todayUrgeWins = () => (state?.urgeWins || []).filter((entry) => todayKey(new Date(entry.at)) === todayKey());
  const todayAvoidedCigarettes = () => todayUrgeWins().reduce((total, entry) => total + (Number(entry.cigarettes) || 0), 0);
  const brand = () => `<div class="brand"><span class="brand-mark">${icon('leaf', 22)}</span><span>松口气</span></div>`;

  const renderOnboarding = () => {
    app.innerHTML = `<section class="onboarding-wrap"><form class="onboarding" id="start-form">
      ${brand()}
      <p class="eyebrow">A SMALL STEP, A NEW BREATH</p>
      <h1>想戒烟，今天就是<br>一个很好的开始。</h1>
      <p class="subtitle">我们会陪你走好眼前这一步。计划可以重新调整，<br>每一次尝试都算数。</p>
      <label class="form-field"><span>计划开始日</span><div class="input-wrap">${icon('calendar', 17)}<input id="start-date" name="startDate" type="date" required value="${todayKey()}" /></div><p class="form-help">默认从今天开始，也可以选一个未来的日子。</p></label>
      <label class="form-field"><span>平均每天抽几支 <i class="optional">选填</i></span><div class="input-wrap"><input name="cigarettesPerDay" type="number" min="1" max="100" step="1" placeholder="比如 10" /><em>支 / 天</em></div></label>
      <label class="form-field"><span>每包大约多少钱 <i class="optional">选填</i></span><div class="input-wrap"><input name="packPrice" type="number" min="1" max="1000" step="0.5" placeholder="比如 20" /><em>元 / 包</em></div><p class="form-help">填写这两项后，可以看到预估省下的钱。可以先跳过。</p></label>
      <button class="primary-button" type="submit">开始我的戒烟旅程 ${icon('arrow', 17)}</button>
      <p class="privacy-note">记录只保存在这台设备的浏览器里</p>
    </form></section>`;
    app.querySelector('#start-date').addEventListener('input', (event) => { event.target.max = ''; });
    app.querySelector('#start-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const start = safeDate(`${data.get('startDate')}T00:00:00`).toISOString();
      state = {
        createdAt: start,
        currentStartAt: start,
        cigarettesPerDay: Number(data.get('cigarettesPerDay')) || null,
        packPrice: Number(data.get('packPrice')) || null,
        checkins: [],
        urgeWins: [],
        lapses: [],
        lastLapseAt: null,
        reminderEnabled: false,
        reminderTime: '20:30',
      };
      save();
      currentPage = 'home';
      render();
      showToast('计划记下啦，今天一起加油 🌱');
    });
  };

  const nav = () => `<nav class="bottom-nav" aria-label="主导航">
    <button class="nav-button ${currentPage === 'home' ? 'active' : ''}" data-page="home">${icon('home')}<span>今天</span></button>
    <button class="nav-button ${currentPage === 'growth' ? 'active' : ''}" data-page="growth">${icon('chart')}<span>成长</span></button>
    <button class="nav-button ${currentPage === 'buddy' ? 'active' : ''}" data-page="buddy">${icon('people')}<span>找搭子</span></button>
    <button class="nav-button ${currentPage === 'settings' ? 'active' : ''}" data-page="settings">${icon('settings')}<span>设置</span></button>
  </nav>`;
  const topbar = () => `<header class="topbar">${brand()}<span class="top-pill">${icon('spark', 15)} 每一步都算数</span></header>`;

  const weekStrip = () => {
    const today = new Date();
    const dow = today.getDay();
    const mondayOffset = (dow + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    return `<div class="week-row">${labels.map((label, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const key = todayKey(date);
      const done = state.checkins.includes(key);
      const isToday = key === todayKey();
      return `<div class="day-cell"><div class="day-dot ${done ? 'done' : ''} ${isToday ? 'today' : ''}">${done ? icon('check', 14) : date.getDate()}</div>${label}</div>`;
    }).join('')}</div>`;
  };

  const renderHome = () => {
    const smokeFree = daysSinceLastSmoke();
    const saved = moneySaved();
    const started = planStarted();
    const alreadyCheckedIn = todayCheckin();
    const alreadySmokedToday = smokedToday();
    const urgeWins = todayUrgeWins();
    const avoidedToday = todayAvoidedCigarettes();
    app.innerHTML = `${topbar()}<section class="page">
      <div class="page-heading"><div><p class="eyebrow">YOUR NEW RHYTHM</p><h1>${started ? '今天，慢慢来。' : '你的计划准备好了。'}</h1><p class="subtitle">${started ? `${dateLabel(todayKey())} · 你已经开始照顾自己了` : `计划将于 ${dateLabel(state.currentStartAt, { month: 'long', day: 'numeric' })} 开始 · 现在可以先熟悉一下`}</p></div><span class="time-chip">${icon('spark', 14)} ${alreadyCheckedIn ? '今日已打卡' : started ? '今天也可以打卡' : '计划准备中'}</span></div>
      <div class="home-grid">
        <section class="hero-card"><div class="hero-topline"><span class="today-date">从 ${dateLabel(state.currentStartAt, { month: 'long', day: 'numeric' })} 开始的新旅程</span><span class="tiny-badge">${icon('spark', 12)} ${state.planType === 'reduce-to-quit' ? '逐步减量计划' : '设定戒烟日'}</span></div>
          <div class="hero-main"><div class="streak-orb"><span class="streak-number">${smokeFree}</span><span class="streak-label">${started ? '本轮无烟天数' : '准备中'}</span></div><div class="hero-copy"><p class="eyebrow">YOU'RE DOING GREAT</p><h2>${!started ? '把开始的日子，\n留给准备好的自己。' : smokeFree === 0 ? '从这一刻开始，\n给自己一点空间。' : `已经坚持 ${smokeFree} 天，\n真的很不容易。`}</h2><p>${!started ? '等到计划开始日，我们再一起打卡。' : smokeFree === 0 ? '小小的一步，也值得好好夸夸自己。' : '不用追求完美，一次只照顾好现在。'}</p><div class="live-counter-wrap">本轮连续无烟 <strong id="live-counter">${formatDuration(Date.now() - new Date(lastSmokeTime()).getTime())}</strong></div></div></div>
          <div class="hero-footer"><span class="plan-caption">累计 ${state.checkins.length} 个确认无烟日 · 已记录忍住 ${totalAvoidedCigarettes()} 根</span><button class="link-button" data-page="growth">看看我的变化 <span>→</span></button></div></section>
        <div class="right-stack"><section class="urge-card"><div><h2>烟瘾来了？<br>先陪自己待一会。</h2><p>不用硬扛，我们一起度过这几分钟。</p></div><button class="urge-action" data-action="urge">${icon('heart', 17)} 现在想抽，帮帮我</button></section>
          <div class="mini-stats"><div class="mini-stat"><strong>${saved === null ? '—' : `¥${saved}`}</strong><span>预估省下${saved === null ? ' · 可填写资料' : ''}</span></div><div class="mini-stat"><strong>${state.lapses.length}</strong><span>被记录的时刻</span></div></div></div>
      </div>
      <section class="card wins-card"><div class="section-title"><div><p class="eyebrow">SMALL WINS, REAL PROGRESS</p><h2>今天成功应对了几次？</h2></div><span class="section-note">每一根都由你亲自记录</span></div><div class="wins-summary"><div><strong>${urgeWins.length}</strong><span>次成功应对</span></div><div class="wins-divider"></div><div><strong>${avoidedToday}</strong><span>根实际忍住没抽</span></div><button class="primary-button" data-action="log-win">${icon('check', 16)} 刚刚忍住一次</button></div>${urgeWins.length ? `<div class="win-entries">${[...urgeWins].reverse().slice(0, 3).map((entry) => `<div class="win-entry"><span class="win-check">${icon('check', 13)}</span><span><strong>${dateLabel(entry.at, { hour: '2-digit', minute: '2-digit' })} · 忍住 ${entry.cigarettes} 根</strong><small>${entry.trigger ? `因为${entry.trigger}` : '一次真实的成功应对'}${entry.method ? ` · ${entry.method}` : ''}</small></span></div>`).join('')}</div>` : '<p class="wins-empty">每次烟瘾来时，忍住了几根，就在这里记下来。</p>'}</section>
      <div class="content-grid"><section class="card"><div class="section-title"><h2>给今天一个小小勾勾</h2><span class="section-note">每天一次就好</span></div><div class="checkin-card"><div class="checkin-copy"><span class="icon-box">${icon('check', 19)}</span><div><strong>${alreadyCheckedIn ? '今天已经做到了' : alreadySmokedToday ? '这次已经如实记下' : started ? '今天没有抽烟吗？' : '计划开始后再来打卡'}</strong><small>${alreadyCheckedIn ? '记录好了，明天见。' : alreadySmokedToday ? '本轮从这次之后重新计时，明天继续。' : started ? '记下这一天，给自己一点掌声。' : '先把这个小小的开始日期记住。'}</small></div></div><button class="${alreadyCheckedIn ? 'secondary-button' : 'primary-button'}" data-action="checkin" ${alreadyCheckedIn || !started || alreadySmokedToday ? 'disabled' : ''}>${alreadyCheckedIn ? '已打卡 ✓' : alreadySmokedToday ? '今天已记录吸烟' : started ? '打卡' : '准备中'}</button></div></section>
        <section class="card"><div class="section-title"><h2>这一周的小脚印</h2><span class="section-note">${state.checkins.length} 次打卡</span></div>${weekStrip()}</section></div>
      <div class="record-bar"><p>偶尔有波动，也不代表之前的努力白费。<br>需要的话，可以把这次记下来。</p><button class="danger-button" data-action="lapse">${icon('heart', 14)} 记录一次吸烟</button></div>
    </section>${nav()}`;
    bindCommon();
    if (liveClockHandle) clearInterval(liveClockHandle);
    const updateClock = () => { const node = app.querySelector('#live-counter'); if (node) node.textContent = formatDuration(Date.now() - new Date(lastSmokeTime()).getTime()); };
    updateClock();
    liveClockHandle = setInterval(updateClock, 1000);
  };

  const renderGrowth = () => {
    const saved = moneySaved();
    const today = new Date();
    const week = [];
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      week.push({ key: todayKey(d), day: ['一', '二', '三', '四', '五', '六', '日'][i] });
    }
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">LITTLE BY LITTLE</p><h1>看看你走了多远。</h1><p class="subtitle">记录每一步，比追求完美更重要。</p></div><button class="secondary-button" data-action="lapse">${icon('heart', 15)} 记录一次吸烟</button></div>
      <div class="stats-grid"><article class="stat-card"><span class="stat-label">累计无烟时间</span><strong class="duration-stat" id="total-smoke-free">${formatTotalSmokeFree()}</strong></article><article class="stat-card"><span class="stat-label">这次无烟</span><strong>${daysSinceLastSmoke()} <small>天</small></strong></article><article class="stat-card"><span class="stat-label">累计打卡</span><strong>${state.checkins.length} <small>次</small></strong></article><article class="stat-card"><span class="stat-label">预估省下</span><strong>${saved === null ? '—' : `¥${saved}`}</strong></article></div>
      <section class="card chart-card"><div class="section-title"><h2>这一周的每一次坚持</h2><span class="section-note">${week.filter(({ key }) => state.checkins.includes(key)).length} / 7 个确认无烟日</span></div><div class="chart">${week.map(({ key, day }) => { const done = state.checkins.includes(key); const wins = (state.urgeWins || []).filter((entry) => todayKey(new Date(entry.at)) === key).length; return `<div class="chart-column"><div class="chart-bar ${key === todayKey() ? 'today' : ''}" style="height:${done ? '82%' : key === todayKey() ? '26%' : '12%'}"></div><span>${day}${wins ? ` · ${wins}次` : ''}</span></div>`; }).join('')}</div><p class="chart-legend">绿色代表确认无烟日；成功应对会保留在每日记录中。</p></section>
      <section class="card savings-goal-card"><div class="section-title"><div><p class="eyebrow">A REWARD THAT MATTERS</p><h2>${escapeHtml(state.savingsGoalName || '给自己设一个奖励目标')}</h2></div><button class="link-button" data-page="settings">${state.savingsGoal ? '调整目标' : '设置目标'} →</button></div>${state.savingsGoal ? `<div class="goal-amount"><strong>¥${saved || 0}</strong><span> / ¥${state.savingsGoal} · 预估节省</span></div><div class="goal-track"><span style="width:${Math.min(100, Math.round((saved || 0) / state.savingsGoal * 100))}%"></span></div><p class="chart-legend">每个确认无烟日的成果都保留在这里。</p>` : '<p class="wins-empty">把戒烟带来的积累，连到一个你真心想要的奖励上。</p>'}</section>
      <section class="card history-card"><div class="section-title"><h2>旅程记录</h2><span class="section-note">累计忍住 ${totalAvoidedCigarettes()} 根</span></div>${[...(state.urgeWins || []).map((entry) => ({ ...entry, type: 'win' })), ...(state.lapses || []).map((entry) => ({ ...entry, type: 'lapse' }))].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12).map((entry) => `<div class="history-row"><div>${icon(entry.type === 'win' ? 'check' : 'heart', 16)} ${entry.type === 'win' ? `成功应对 · 忍住 ${entry.cigarettes} 根` : `吸烟记录 · ${entry.cigarettes || 1} 根`}<small>${dateLabel(entry.at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${entry.trigger ? ` · ${entry.trigger}` : ''}${entry.method ? ` · ${entry.method}` : ''}</small></div><span class="history-tag ${entry.type === 'win' ? 'success-tag' : ''}">${entry.type === 'win' ? '已记录' : '继续前行'}</span></div>`).join('') || '<div class="empty-state">这里会保存你的每次成功应对和吸烟记录。</div>'}</section>
    </section>${nav()}`;
    bindCommon();
    liveClockHandle = setInterval(() => {
      const node = app.querySelector('#total-smoke-free');
      if (node) node.textContent = formatTotalSmokeFree();
    }, 60000);
  };

  const renderBuddy = () => {
    const saved = moneySaved();
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">A FRIENDLY LITTLE NUDGE</p><h1>找个人，陪你走一段。</h1><p class="subtitle">和信任的人说一声，有时就会多一点勇气。</p></div></div>
      <section class="buddy-card"><div><p class="eyebrow">JUST FOR YOU AND YOUR FRIEND</p><h2>不用一个人扛着。</h2><p class="subtitle">邀请一个你信任的人，给你的戒烟旅程一点小小的支持。</p></div><article class="invite-preview"><div class="invite-art">${icon('leaf', 39)}</div><p class="eyebrow">MY LITTLE PROMISE</p><h2>我正在认真戒烟。</h2><p>从今天起，我想给自己多一点照顾。<br>如果你愿意，陪我聊聊天就很好。</p><div class="invite-stats"><div class="invite-stat"><strong>${daysSinceLastSmoke()}</strong><span>无烟天数</span></div><div class="invite-stat"><strong>${state.checkins.length}</strong><span>次打卡</span></div>${saved === null ? '' : `<div class="invite-stat"><strong>¥${saved}</strong><span>预估省下</span></div>`}</div></article><div class="centered-actions"><button class="primary-button" data-action="share-demo">${icon('people', 16)} 预览邀请卡</button><p>网页样稿仅演示邀请卡，不会真的发送或建立好友关系。</p></div></section>
    </section>${nav()}`;
    bindCommon();
  };

  const renderSettings = () => {
    const background = BACKGROUNDS[state.pageBackground] || BACKGROUNDS.blue;
    app.innerHTML = `${topbar()}<section class="page"><div class="page-heading"><div><p class="eyebrow">MAKE IT YOURS</p><h1>让陪伴刚刚好。</h1><p class="subtitle">按你的节奏来，随时可以调整。</p></div></div>
      <section class="card settings-list"><div class="setting-row"><div class="setting-info"><strong>每日鼓励提醒</strong><small>仅在网页样稿中保存设置，不会发送通知</small></div><input class="switch" id="reminder-toggle" type="checkbox" aria-label="开启每日鼓励提醒" ${state.reminderEnabled ? 'checked' : ''}></div><div class="setting-row"><div class="setting-info"><strong>提醒时间</strong><small>选一个你喜欢的时刻</small></div><input id="reminder-time" type="time" value="${state.reminderTime || '20:30'}" aria-label="提醒时间"></div><div class="subtle-copy">“松口气”是一个行为陪伴原型，不提供诊断或个性化医疗建议。如果戒烟过程中有健康或用药方面的疑问，可以咨询专业人士。</div></section>
      <section class="card history-card background-setting"><div class="setting-row"><div class="setting-info"><strong>页面底色</strong><small>当前：${background.label} · 只调整页面背景</small></div><button class="secondary-button" data-action="page-background">选择底色</button></div></section>
      <section class="card history-card plan-settings-card"><div class="section-title"><div><p class="eyebrow">YOUR QUIT PLAN</p><h2>选择适合自己的路线</h2></div></div><label class="form-field"><span>戒烟方式</span><select id="plan-type"><option value="quit-date" ${state.planType !== 'reduce-to-quit' ? 'selected' : ''}>立刻戒断 · 选定戒烟日，到日停止</option><option value="reduce-to-quit" ${state.planType === 'reduce-to-quit' ? 'selected' : ''}>逐步减量 · 每周下调每日配额</option></select><p class="form-help" id="plan-type-help"></p></label><label class="form-field"><span>计划戒烟日</span><input id="planned-quit-date" type="date" value="${state.plannedQuitDate || todayKey(safeDate(state.currentStartAt))}" /><p class="form-help">逐步减量路线会以这天作为最终停止吸烟的目标日。</p></label><label class="form-field reduction-field"><span>每周减少</span><div class="input-wrap"><input id="weekly-reduction" type="number" min="1" max="30" value="${state.weeklyReduction || 2}" /><em>支 / 天</em></div><p class="form-help">按你记录的日常烟量作为起点，每过一周下调配额。当前阶段建议每天不超过 ${currentReductionQuota() ?? '填写日常烟量后显示'}${currentReductionQuota() === null ? '' : ' 支'}。</p></label><div class="section-title goal-settings-title"><h2>我的奖励目标</h2></div><label class="form-field"><span>想为自己买什么</span><input id="savings-goal-name" type="text" value="${escapeHtml(state.savingsGoalName || '')}" placeholder="例如：耳机、旅行" /></label><label class="form-field"><span>目标金额</span><div class="input-wrap"><input id="savings-goal" type="number" min="1" max="100000" value="${state.savingsGoal || ''}" placeholder="比如 1200" /><em>元</em></div></label><button class="primary-button save-plan-button" data-action="save-plan">保存我的计划</button><div class="history-row"><div>吸烟量和烟价<small>${state.cigarettesPerDay && state.packPrice ? `${state.cigarettesPerDay} 支 / 天 · ¥${state.packPrice} / 包` : '用于估算累计省钱，可随时填写'}</small></div><button class="link-button" data-action="edit-estimate">${state.cigarettesPerDay && state.packPrice ? '修改' : '填写'}</button></div><div class="history-row"><div>重置本机样稿数据</div><button class="link-button" data-action="reset">重置</button></div></section>
    </section>${nav()}`;
    bindCommon();
    app.querySelector('#reminder-toggle').addEventListener('change', (event) => { state.reminderEnabled = event.target.checked; save(); showToast(state.reminderEnabled ? '提醒偏好已保存 🌱' : '提醒已关闭'); });
    app.querySelector('#reminder-time').addEventListener('change', (event) => { state.reminderTime = event.target.value || '20:30'; save(); showToast('提醒时间已保存'); });
    const planType = app.querySelector('#plan-type');
    const reductionField = app.querySelector('.reduction-field');
    const routeHelp = app.querySelector('#plan-type-help');
    const updateReductionField = () => {
      const gradual = planType.value === 'reduce-to-quit';
      reductionField.classList.toggle('hidden', !gradual);
      const quitDate = app.querySelector('#planned-quit-date');
      if (gradual && (!quitDate.value || quitDate.value <= todayKey())) {
        const suggestedDate = new Date();
        suggestedDate.setDate(suggestedDate.getDate() + 28);
        quitDate.value = todayKey(suggestedDate);
      }
      routeHelp.textContent = gradual
        ? '适合希望慢慢降低烟量的人。先在下方填写日常烟量，再设定每周配额和最终戒烟日。'
        : '适合准备从选定日期开始完全停止吸烟的人。烟瘾上来时可以使用急救陪伴。';
    };
    planType.addEventListener('change', updateReductionField);
    updateReductionField();
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
    if (action === 'checkin') {
      if (!planStarted()) { showToast('等计划开始日到了，再来打卡吧 🌱'); return; }
      if (smokedToday()) { showToast('今天的吸烟记录已经保存，明天继续记录无烟日'); return; }
      if (todayCheckin()) { showToast('今天已经打过卡啦'); return; }
      state.checkins.push(todayKey()); save(); render(); showToast('今天的小勾勾，完成啦！✨'); return;
    }
    if (action === 'lapse') { showLapseDialog(); return; }
    if (action === 'share-demo') { showToast('邀请卡预览完成，可以想象分享给朋友啦 🌿'); return; }
    if (action === 'start-timer') { startTimer(); return; }
    if (action === 'edit-date') { showDateDialog(); return; }
    if (action === 'edit-estimate') { showEstimateDialog(); return; }
    if (action === 'page-background') { showBackgroundDialog(); return; }
    if (action === 'save-plan') {
      const nextPlanType = app.querySelector('#plan-type').value;
      if (nextPlanType === 'reduce-to-quit' && state.planType !== 'reduce-to-quit') state.reductionStartedAt = new Date().toISOString();
      state.planType = nextPlanType;
      state.plannedQuitDate = app.querySelector('#planned-quit-date').value;
      state.weeklyReduction = Number(app.querySelector('#weekly-reduction')?.value) || 2;
      state.savingsGoalName = app.querySelector('#savings-goal-name').value.trim();
      state.savingsGoal = Number(app.querySelector('#savings-goal').value) || null;
      save(); render(); showToast('戒烟计划和奖励目标已保存'); return;
    }
    if (action === 'reset') { showResetDialog(); }
  };

  const modal = (content) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<section class="modal" role="dialog" aria-modal="true">${content}</section>`;
    backdrop.addEventListener('click', (event) => { if (event.target === backdrop) backdrop.remove(); });
    document.body.append(backdrop);
    const close = backdrop.querySelector('[data-close]');
    if (close) close.addEventListener('click', () => backdrop.remove());
    return backdrop;
  };

  const showUrgeWinDialog = (fromUrge = false) => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">ONE REAL WIN</p><h2>这次实际忍住了几根？</h2><p>按你这次原本想抽、最后忍住没抽的数量记录。每次都可以不同。</p><form id="win-form"><label class="form-field"><span>忍住的数量</span><div class="input-wrap"><input id="win-cigarettes" type="number" min="1" max="100" step="1" value="1" required /><em>根</em></div></label><label class="form-field"><span>当时的诱因 <i class="optional">选填</i></span><select id="win-trigger"><option value="">暂不填写</option><option>压力大</option><option>饭后习惯</option><option>应酬或社交</option><option>无聊</option><option>别人递烟</option><option>其他</option></select></label><label class="form-field"><span>帮到你的方法 <i class="optional">选填</i></span><select id="win-method"><option value="">暂不填写</option><option>慢慢呼吸</option><option>喝水</option><option>散步或换个地方</option><option>嚼无糖口香糖</option><option>分心做了别的事</option><option>其他</option></select></label><div class="modal-actions"><button class="primary-button" type="submit">保存这次成功</button></div></form>`);
    backdrop.querySelector('#win-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const cigarettes = Number(backdrop.querySelector('#win-cigarettes').value);
      if (!Number.isInteger(cigarettes) || cigarettes < 1 || cigarettes > 100) { showToast('请输入 1 到 100 之间的整数'); return; }
      state.urgeWins = state.urgeWins || [];
      state.urgeWins.push({ at: new Date().toISOString(), cigarettes, trigger: backdrop.querySelector('#win-trigger').value, method: backdrop.querySelector('#win-method').value });
      save(); backdrop.remove();
      if (fromUrge) { if (timerHandle) clearInterval(timerHandle); timerHandle = null; currentPage = 'home'; }
      render();
      showToast(`记下了这次成功：忍住 ${cigarettes} 根`);
    });
  };

  const showLapseDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">A GENTLE RESET</p><h2>这次记下来就好。</h2><p>之前的坚持仍然保留。本轮连续无烟会从这次之后重新计时，我们可以一起看看是什么情境触发了吸烟。</p><form id="lapse-form"><label class="form-field"><span>这次实际抽了几根</span><div class="input-wrap"><input id="lapse-cigarettes" type="number" min="1" max="100" value="1" required /><em>根</em></div></label><label class="form-field"><span>当时的诱因 <i class="optional">选填</i></span><select id="lapse-trigger"><option value="">暂不填写</option><option>压力大</option><option>饭后习惯</option><option>应酬或社交</option><option>无聊</option><option>别人递烟</option><option>其他</option></select></label><div class="modal-actions"><button class="primary-button" type="submit">记录并继续今天</button><button class="link-button" type="button" data-close>先不记录</button></div></form>`);
    backdrop.querySelector('#lapse-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const now = new Date().toISOString();
      const cigarettes = Number(backdrop.querySelector('#lapse-cigarettes').value);
      if (!Number.isInteger(cigarettes) || cigarettes < 1 || cigarettes > 100) { showToast('请输入 1 到 100 之间的整数'); return; }
      state.lapses.push({ at: now, cigarettes, trigger: backdrop.querySelector('#lapse-trigger').value, choice: 'continue' });
      state.lastLapseAt = now;
      save(); backdrop.remove(); render(); showToast('这次已经记录，本轮从现在继续');
    });
  };

  const showDateDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">YOUR PLAN</p><h2>调整计划日期</h2><p>选一个你觉得合适的开始日。</p><label class="form-field"><span>开始日期</span><input id="change-date" type="date" value="${todayKey(safeDate(state.currentStartAt))}" /></label><div class="modal-actions"><button class="primary-button" data-save-date>保存日期</button></div>`);
    backdrop.querySelector('[data-save-date]').addEventListener('click', () => {
      const value = backdrop.querySelector('#change-date').value;
      if (!value) { showToast('请选择一个日期'); return; }
      state.currentStartAt = safeDate(`${value}T00:00:00`).toISOString();
      state.lastLapseAt = null; save(); backdrop.remove(); render(); showToast('戒烟计划日期已更新');
    });
  };

  const showEstimateDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">YOUR ESTIMATE</p><h2>填上两项小资料。</h2><p>只用来估算省下的钱，可以随时修改。</p><label class="form-field"><span>平均每天抽几支</span><div class="input-wrap"><input id="edit-cigs" type="number" min="1" max="100" value="${state.cigarettesPerDay || ''}" placeholder="比如 10" /><em>支 / 天</em></div></label><label class="form-field"><span>每包大约多少钱</span><div class="input-wrap"><input id="edit-price" type="number" min="1" max="1000" step="0.5" value="${state.packPrice || ''}" placeholder="比如 20" /><em>元 / 包</em></div></label><div class="modal-actions"><button class="primary-button" data-save-estimate>保存</button><button class="link-button" data-clear-estimate>清除估算资料</button></div>`);
    backdrop.querySelector('[data-save-estimate]').addEventListener('click', () => {
      state.cigarettesPerDay = Number(backdrop.querySelector('#edit-cigs').value) || null;
      state.packPrice = Number(backdrop.querySelector('#edit-price').value) || null;
      save(); backdrop.remove(); render(); showToast('估算资料已更新');
    });
    backdrop.querySelector('[data-clear-estimate]').addEventListener('click', () => {
      state.cigarettesPerDay = null; state.packPrice = null; save(); backdrop.remove(); render(); showToast('估算资料已清除');
    });
  };

  const showResetDialog = () => {
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">START FRESH</p><h2>要重新开始体验吗？</h2><p>这会清除本机保存的戒烟计划、打卡和记录。</p><div class="modal-actions"><button class="danger-button" data-confirm-reset>清除并重新开始</button><button class="secondary-button" data-close>暂时不要</button></div>`);
    backdrop.querySelector('[data-confirm-reset]').addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); state = null; backdrop.remove(); render(); });
  };

  const showBackgroundDialog = () => {
    const selected = state.pageBackground || 'blue';
    const choices = Object.entries(BACKGROUNDS).map(([key, option]) => `<button class="background-choice ${selected === key ? 'selected' : ''}" data-background="${key}" aria-pressed="${selected === key}"><span class="background-swatch" style="--swatch:${option.color}"></span><span>${option.label}</span>${selected === key ? '<span class="background-check">✓</span>' : ''}</button>`).join('');
    const backdrop = modal(`<button class="modal-close" data-close aria-label="关闭">×</button><p class="eyebrow">PAGE APPEARANCE</p><h2>选择页面底色</h2><p>只会改变页面底色，卡片和其他颜色保持不变。</p><div class="background-options">${choices}</div>`);
    backdrop.querySelectorAll('[data-background]').forEach((button) => button.addEventListener('click', () => {
      state.pageBackground = button.dataset.background;
      save();
      applyPageBackground();
      backdrop.remove();
      render();
      showToast(`页面底色已设为${BACKGROUNDS[state.pageBackground].label}`);
    }));
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
    applyPageBackground();
    if (!state) { renderOnboarding(); return; }
    const pages = { home: renderHome, growth: renderGrowth, buddy: renderBuddy, settings: renderSettings, urge: renderUrge };
    (pages[currentPage] || renderHome)();
  };

  render();
})();
