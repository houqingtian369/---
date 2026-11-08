(function (root) {
  'use strict';
  const DAY = 24;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  const sources = {
    NHS: 'https://www.nhs.uk/better-health/quit-smoking/',
    CDC: 'https://www.cdc.gov/tobacco/about/benefits-of-quitting.html',
  };
  // Time thresholds are public-health references, never measured personal recovery.
  const milestones = [
    ['心率开始回落', '约 20 分钟', 1 / 3, 1 / 3, 'early', '心率开始向平常水平恢复', '应用没有测量你的心率', 'NHS'],
    ['血氧水平开始恢复', '约 8 小时', 8, 8, 'early', '身体的供氧状况开始改善', '时间进度不代表血氧饱和度，也不能替代血氧检测', 'NHS'],
    ['一氧化碳水平下降', '约 8 小时', 8, 8, 'early', '血液中的一氧化碳水平通常明显降低', 'NHS 描述这一阶段水平约下降一半，实际情况因人及环境而异', 'NHS'],
    ['呼吸道开始清理黏液', '约 48 小时', 48, 48, 'early', '肺部开始清除积聚的黏液', '清理过程不等于肺部已恢复正常', 'NHS'],
    ['味觉开始改善', '约 48 小时', 48, 48, 'early', '吃东西时，可能更容易察觉味道', '可以留意食物的味道是否更明显。暂时没有感觉也不代表没有获益', 'NHS'],
    ['嗅觉开始改善', '约 48 小时', 48, 48, 'early', '对气味的感受可能逐渐敏锐', '可以留意熟悉的日常气味有没有变化', 'NHS'],
    ['支气管开始放松', '约 72 小时', 72, 72, 'early', '可能感觉呼吸比之前轻松', '这是常见的阶段变化，不表示呼吸系统疾病已经消失', 'NHS'],
    ['精力可能增加', '约 72 小时', 72, 72, 'early', '日常活动时，可能开始更有精神', '精力也受睡眠、情绪和戒断反应影响', 'NHS'],
    ['血液循环改善', '约 2—12 周', 14 * DAY, 84 * DAY, 'middle', '血液向心脏和肌肉输送得更顺畅', '达到 2 周时进入参考阶段；百分比以第 12 周为时间终点', 'NHS'],
    ['咳嗽可能减轻', '约 3—9 个月', 3 * MONTH, 9 * MONTH, 'middle', '留意咳嗽是否比过去减少', '持续或加重的咳嗽应咨询医生，不能仅用戒烟计时判断', 'NHS'],
    ['喘鸣可能减轻', '约 3—9 个月', 3 * MONTH, 9 * MONTH, 'middle', '呼吸时的喘鸣可能逐渐改善', '症状明显或加重时应寻求专业帮助', 'NHS'],
    ['呼吸困难可能改善', '约 3—9 个月', 3 * MONTH, 9 * MONTH, 'middle', '日常活动时可能更容易呼吸', '明显或突然的呼吸困难需要及时就医', 'NHS'],
    ['肺功能可能改善', '约 3—9 个月', 3 * MONTH, 9 * MONTH, 'middle', '身体的呼吸功能可能逐渐改善', '这里没有计算肺功能恢复比例。实际肺功能需要专业检查评估', 'NHS'],
    ['心脏病发作风险下降', '约 1—2 年', YEAR, 2 * YEAR, 'long', '持续戒烟后，心脏病发作风险显著下降', '这是相对继续吸烟的一般获益，不代表个人风险清零', 'CDC'],
    ['冠心病额外风险降低', '约 3—6 年', 3 * YEAR, 6 * YEAR, 'long', '吸烟带来的冠心病额外风险约降低一半', '额外风险指吸烟带来的风险增量，不能理解为个人患病概率直接减半', 'CDC'],
    ['口咽喉癌额外风险降低', '约 5—10 年', 5 * YEAR, 10 * YEAR, 'long', '口腔、咽部和喉部癌症的额外风险约降低一半', '这组癌症共享参考阶段；风险变化是人群统计趋势', 'CDC'],
    ['卒中风险下降', '约 5—10 年', 5 * YEAR, 10 * YEAR, 'long', '持续戒烟有助于降低卒中风险', '风险还受血压、年龄等因素影响；这里没有计算个人风险', 'CDC'],
    ['膀胱癌风险下降', '约 10 年', 10 * YEAR, 10 * YEAR, 'long', '持续戒烟后，膀胱癌风险下降', '相对继续吸烟的长期获益，不等于不存在患病风险', 'CDC'],
    ['食管癌风险下降', '约 10 年', 10 * YEAR, 10 * YEAR, 'long', '持续戒烟后，食管癌风险下降', '这是一般人群的长期变化，不能据此判断个人是否患病', 'CDC'],
    ['肾癌风险下降', '约 10 年', 10 * YEAR, 10 * YEAR, 'long', '持续戒烟后，肾癌风险下降', '个人风险也受其他健康因素影响', 'CDC'],
    ['肺癌额外风险降低', '约 10—15 年', 10 * YEAR, 15 * YEAR, 'long', '吸烟带来的肺癌额外风险约降低一半', '额外风险下降不等于降至从未吸烟者水平，也不能代替适用的筛查', 'CDC'],
    ['冠心病风险进一步下降', '约 15 年', 15 * YEAR, 15 * YEAR, 'long', '冠心病风险接近不吸烟者水平', '接近不等于完全相同；实际风险受个人健康状况影响', 'CDC'],
    ['口咽喉癌风险进一步下降', '约 20 年', 20 * YEAR, 20 * YEAR, 'long', '口腔、咽部和喉部癌症风险接近不吸烟者水平', '这是比额外风险下降更长期的参考节点', 'CDC'],
    ['胰腺癌风险下降', '约 20 年', 20 * YEAR, 20 * YEAR, 'long', '胰腺癌风险接近不吸烟者水平', '时间进度仍然不等于个人身体恢复比例', 'CDC'],
  ].map((row, index) => ({
    id: index + 1, title: row[0], time: row[1], start: row[2], end: row[3],
    group: row[4], description: row[5], detail: row[6], source: row[7],
  }));

  const savedAmount = (wins, packPrice, packCount = 20) => {
    if (!Number.isFinite(Number(packPrice)) || Number(packPrice) <= 0 || !Number.isInteger(Number(packCount)) || Number(packCount) <= 0) return null;
    const count = (wins || []).reduce((sum, entry) => sum + (Number(entry.cigarettes) || 0), 0);
    return (count * Number(packPrice) / Number(packCount)).toFixed(2);
  };
  const timedSavings = (elapsedMs, cigarettesPerDay, packPrice, packCount = 20, smokedCigarettes = 0) => {
    if (!Number.isFinite(Number(cigarettesPerDay)) || Number(cigarettesPerDay) <= 0 || !Number.isFinite(Number(packPrice)) || Number(packPrice) <= 0 || !Number.isInteger(Number(packCount)) || Number(packCount) <= 0) return null;
    return (Math.max(0, Math.max(0, elapsedMs) / 86400000 * Number(cigarettesPerDay) - smokedCigarettes) * Number(packPrice) / Number(packCount)).toFixed(3);
  };
  const timedSavingsCentProgress = (elapsedMs, cigarettesPerDay, packPrice, packCount = 20, smokedCigarettes = 0) => {
    if (!Number.isFinite(Number(cigarettesPerDay)) || Number(cigarettesPerDay) <= 0 || !Number.isFinite(Number(packPrice)) || Number(packPrice) <= 0 || !Number.isInteger(Number(packCount)) || Number(packCount) <= 0) return 0;
    const cents = Math.max(0, Math.max(0, elapsedMs) / 86400000 * Number(cigarettesPerDay) - smokedCigarettes) * Number(packPrice) / Number(packCount) * 100;
    return cents % 1;
  };
  const timePercent = (hours, end) => hours >= end ? '100.00' : Math.min(99.99, Math.max(0, hours) / end * 100).toFixed(2);
  const api = { milestones, sources, savedAmount, timedSavings, timedSavingsCentProgress, timePercent };
  root.HealthMilestones = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
