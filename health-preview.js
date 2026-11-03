'use strict';
const HOUR = 3600000;
const DAY = 24;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;
const sources = { NHS: 'https://www.nhs.uk/better-health/quit-smoking/', CDC: 'https://www.cdc.gov/tobacco/about/benefits-of-quitting.html' };
// Reference times describe population-level changes, never measured recovery.
const milestones = [
  ['心率开始回落','约 20 分钟',1/3,1/3,'early','心率开始向平常水平恢复。','可以留意自己的感受；应用没有测量你的心率。','NHS'],
  ['血氧水平开始恢复','约 8 小时',8,8,'early','身体的供氧状况开始改善。','时间进度不代表血氧饱和度，也不能替代血氧检测。','NHS'],
  ['一氧化碳水平下降','约 8 小时',8,8,'early','血液中的一氧化碳水平通常明显降低。','NHS 描述这一阶段水平约下降一半，实际情况因人及环境而异。','NHS'],
  ['呼吸道开始清理黏液','约 48 小时',48,48,'early','肺部开始清除积聚的黏液。','清理过程不等于肺部已恢复正常，也不能用计时解释所有咳嗽症状。','NHS'],
  ['味觉开始改善','约 48 小时',48,48,'early','吃东西时，可能更容易察觉味道。','下次吃饭时，可以留意食物的味道是否更明显。暂时没有感觉也不代表没有获益。','NHS'],
  ['嗅觉开始改善','约 48 小时',48,48,'early','对气味的感受可能逐渐敏锐。','留意日常熟悉的气味有没有变化，不需要刻意接触刺激性气味。','NHS'],
  ['支气管开始放松','约 72 小时',72,72,'early','可能感觉呼吸比之前轻松。','这是常见的阶段变化，不表示呼吸系统疾病已经消失。','NHS'],
  ['精力可能增加','约 72 小时',72,72,'early','日常活动时，可能开始更有精神。','精力也受睡眠、情绪和戒断反应影响，不必要求自己准时出现变化。','NHS'],
  ['血液循环改善','约 2—12 周',14*DAY,84*DAY,'middle','血液向心脏和肌肉输送得更顺畅。','达到 2 周时进入参考阶段；百分比以第 12 周为时间终点。','NHS'],
  ['咳嗽可能减轻','约 3—9 个月',3*MONTH,9*MONTH,'middle','留意咳嗽是否比过去减少。','这是一般变化范围。持续或加重的咳嗽应咨询医生，不能仅用戒烟计时判断。','NHS'],
  ['喘鸣可能减轻','约 3—9 个月',3*MONTH,9*MONTH,'middle','呼吸时的喘鸣可能逐渐改善。','是否改善需要结合个人状况；症状明显或加重时应寻求专业帮助。','NHS'],
  ['呼吸困难可能改善','约 3—9 个月',3*MONTH,9*MONTH,'middle','日常活动时可能更容易呼吸。','不要为了验证节点强行运动；明显或突然的呼吸困难需要及时就医。','NHS'],
  ['肺功能可能改善','约 3—9 个月',3*MONTH,9*MONTH,'middle','身体的呼吸功能可能逐渐改善。','这里没有计算肺功能恢复比例。实际肺功能需要通过专业检查评估。','NHS'],
  ['心脏病发作风险下降','约 1—2 年',YEAR,2*YEAR,'long','持续戒烟后，心脏病发作风险显著下降。','这是相对继续吸烟的一般获益，不代表个人风险已经清零。','CDC'],
  ['冠心病额外风险降低','约 3—6 年',3*YEAR,6*YEAR,'long','吸烟带来的冠心病额外风险约降低一半。','额外风险指吸烟带来的风险增量，不能理解为个人患病概率直接减半。','CDC'],
  ['口咽喉癌额外风险降低','约 5—10 年',5*YEAR,10*YEAR,'long','口腔、咽部和喉部癌症的额外风险约降低一半。','这组癌症共享参考阶段。风险变化是人群统计趋势，不是个人检测结论。','CDC'],
  ['卒中风险下降','约 5—10 年',5*YEAR,10*YEAR,'long','持续戒烟有助于降低卒中风险。','风险还受血压、年龄及其他因素影响；这个节点没有给出个人风险数值。','CDC'],
  ['膀胱癌风险下降','约 10 年',10*YEAR,10*YEAR,'long','持续戒烟后，膀胱癌风险下降。','与继续吸烟相比的长期获益；到达时间节点不等于不存在患病风险。','CDC'],
  ['食管癌风险下降','约 10 年',10*YEAR,10*YEAR,'long','持续戒烟后，食管癌风险下降。','这是一般人群的长期变化，不能据此判断个人是否患病。','CDC'],
  ['肾癌风险下降','约 10 年',10*YEAR,10*YEAR,'long','持续戒烟后，肾癌风险下降。','戒烟的长期收益持续积累，个人风险也与其他健康因素有关。','CDC'],
  ['肺癌额外风险降低','约 10—15 年',10*YEAR,15*YEAR,'long','吸烟带来的肺癌额外风险约降低一半。','额外风险下降不等于降至从未吸烟者水平，也不能代替适用的筛查。','CDC'],
  ['冠心病风险进一步接近','约 15 年',15*YEAR,15*YEAR,'long','冠心病风险接近不吸烟者水平。','接近不等于完全相同；实际风险受个人健康状况影响。','CDC'],
  ['口咽喉癌风险进一步接近','约 20 年',20*YEAR,20*YEAR,'long','口腔、咽部和喉部癌症风险接近不吸烟者水平。','这是更长期的参考节点，与前面的额外风险下降描述不同阶段。','CDC'],
  ['胰腺癌风险进一步接近','约 20 年',20*YEAR,20*YEAR,'long','胰腺癌风险接近不吸烟者水平。','长期坚持值得肯定；时间进度仍然不等于个人身体恢复比例。','CDC']
].map((m,i)=>({id:i+1,title:m[0],time:m[1],start:m[2],end:m[3],group:m[4],description:m[5],detail:m[6],source:m[7]}));
let startAt = Date.now()-18*HOUR;
let avoided = 10;
let packPrice = 23;
let packCount = 20;
let filter = 'all';
const $ = (id) => document.getElementById(id);
const elapsedHours = () => Math.max(0,(Date.now()-startAt)/HOUR);
const percentage = (hours,end) => hours >= end ? '100.00' : Math.min(99.99,hours/end*100).toFixed(2);
const remaining = (hours) => {
  const minutes = Math.max(0,Math.ceil(hours*60));
  if(minutes>=1440) return `${Math.floor(minutes/1440)} 天 ${Math.floor(minutes%1440/60)} 小时`;
  if(minutes>=60) return `${Math.floor(minutes/60)} 小时 ${minutes%60} 分钟`;
  return `${minutes} 分钟`;
};
function renderCards(){
  const visible=milestones.filter(m=>filter==='all'||m.group===filter);
  $('list-count').textContent=`显示 ${visible.length} / 24 条`;
  $('milestone-grid').innerHTML=visible.map(m=>`<article class="milestone" id="milestone-${m.id}" data-id="${m.id}"><div class="milestone-top"><span class="number">${String(m.id).padStart(2,'0')} / 24</span><span class="status"></span></div><h3>${m.title}</h3><p class="reference-time">参考阶段 · ${m.time}</p><p class="milestone-description">${m.description}</p><div class="progress-line"><span>参考时间进度</span><strong class="percent"></strong></div><progress max="100" value="0" aria-label="${m.title}：参考时间进度"></progress><p class="remaining"></p><details><summary>变化说明与来源</summary><p>${m.detail}</p><p>${m.start!==m.end?'以参考范围的终点计算时间进度，进入范围不等于变化已完成。':'达到该时间只表示经过了参考时长，不表示检测达标。'}</p><a href="${sources[m.source]}" target="_blank" rel="noopener noreferrer">查看 ${m.source} 原始资料 ↗</a></details></article>`).join('');
  updateTime();
}
function updateTime(){
  const hours=elapsedHours();
  const seconds=Math.floor(hours*3600);
  $('elapsed').innerHTML=`<strong>${Math.floor(seconds/86400)}</strong><small>天</small>${String(Math.floor(seconds%86400/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('reached').textContent=milestones.filter(m=>hours>=m.end).length;
  const next=milestones.find(m=>hours<m.end);
  $('next-heading').textContent=next?next.title:'24 个参考时间节点，全部到达';
  $('next-description').textContent=next?`${next.time} · ${next.description}`:'长期坚持值得纪念，继续照顾好自己。到达节点不代表健康风险归零。';
  $('next-remaining').textContent=next?`距离参考${next.start!==next.end?'期终点':'节点'}还有 ${remaining(next.end-hours)}`:'每一段坚持，都有意义';
  $('next-percent').textContent=next?`${percentage(hours,next.end)}%`:'100.00%';
  $('next-bar').value=next?Math.min(100,hours/next.end*100):100;
  $('next-link').textContent=next?'了解这个节点 →':'回看全部里程碑 →';
  $('next-link').dataset.id=next?next.id:'';
  $('next-link').href=next?`#milestone-${next.id}`:'#milestones';
  document.querySelectorAll('.milestone').forEach(card=>{
    const m=milestones[Number(card.dataset.id)-1];
    const done=hours>=m.end;
    card.classList.toggle('done',done);
    card.querySelector('.status').textContent=done?'✓ 已到达时间节点':hours>=m.start&&m.start!==m.end?'已进入参考阶段':'正在积累';
    card.querySelector('.percent').textContent=`${percentage(hours,m.end)}%`;
    card.querySelector('progress').value=Math.min(100,hours/m.end*100);
    card.querySelector('.remaining').textContent=done?'已到达参考时间 · 不代表恢复完成':`距参考${m.start!==m.end?'期终点':'节点'}还有 ${remaining(m.end-hours)}`;
  });
}
function updateMoney(){
  $('money').textContent=(avoided*packPrice/packCount).toFixed(2);
  $('savings-caption').textContent=`已记录忍住 ${avoided} 支 · 按 ¥${packPrice.toFixed(2)} / ${packCount} 支估算`;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  renderCards();
}));
$('stage').addEventListener('change',()=>{startAt=Date.now()-Number($('stage').value)*HOUR;updateTime();});
$('next-link').addEventListener('click',()=>{
  if(filter!=='all') document.querySelector('[data-filter="all"]').click();
  const card=$(`milestone-${$('next-link').dataset.id}`);
  if(card) card.querySelector('details').open=true;
});
$('win-form').addEventListener('submit',event=>{
  event.preventDefault();
  const count=Number($('win-count').value);
  if(!Number.isInteger(count)||count<1||count>100) return;
  avoided+=count;updateMoney();
  $('feedback').textContent=`这次少抽 ${count} 支，预估省下 ¥${(count*packPrice/packCount).toFixed(2)}。已记录这次坚持。`;
});
['pack-price','pack-count'].forEach(id=>$(id).addEventListener('input',()=>{
  if(!$('pack-price').checkValidity()||!$('pack-count').checkValidity()){
    $('price-error').textContent='请输入有效烟价及整数支数，金额暂按上次有效设置计算。';return;
  }
  packPrice=Number($('pack-price').value);packCount=Number($('pack-count').value);
  $('price-error').textContent='';$('feedback').textContent='已按新的烟价重新估算全部示例记录。';updateMoney();
}));
renderCards();updateMoney();setInterval(updateTime,1000);
