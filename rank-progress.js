(() => {
  const thresholds = [
    [0, 1, 3], [7, 10, 14], [21, 30, 45, 60], [90, 120, 150, 180],
    [210, 240, 270, 300, 330], [365, 410, 455, 500, 545],
    [590, 635, 680], [725, 770, 815], [860, 940, 1020], [1095],
  ];
  const routes = {
    competitive: { label: '竞技段位', names: ['青铜', '白银', '黄金', '铂金', '钻石', '先锋', '精锐', '王牌', '黑鹰', '巅峰'] },
    journey: { label: '探索旅程', names: ['启程者', '探路者', '行路者', '远行者', '越岭者', '领航者', '开拓者', '远征者', '山海旅人', '传奇旅人'] },
  };
  const divisions = ['I', 'II', 'III', 'IV', 'V'];
  const stages = (route = 'competitive') => {
    const selected = routes[route] || routes.competitive;
    return thresholds.flatMap((days, tier) => days.map((startDay, index) => ({
      tier, startDay, name: selected.names[tier], division: days.length === 1 ? '' : divisions[index],
      label: `${selected.names[tier]}${days.length === 1 ? '' : ` ${divisions[index]}`}`,
    })));
  };
  const progress = (days, route = 'competitive') => {
    const all = stages(route);
    const count = Math.max(0, Math.floor(Number(days) || 0));
    const currentIndex = all.reduce((index, stage, position) => stage.startDay <= count ? position : index, 0);
    const current = all[currentIndex];
    const next = all[currentIndex + 1] || null;
    return { current, next, currentIndex, days: count, remainingDays: next ? next.startDay - count : 0,
      percent: next ? Math.round((count - current.startDay) / (next.startDay - current.startDay) * 100) : 100 };
  };
  const api = { routes, stages, progress };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.RankProgress = api;
})();
