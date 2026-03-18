"use client"; // 关键：首页现在需要监听本地存储状态
export const runtime = 'edge'; // 强制使用边缘运行时

import { useProfile } from '@/hooks/useProfile';
import { calculateProfile } from '@/lib/profile-utils';
import { BaziEngine, Element } from '@/lib/bazi-engine';
import { StrengthEngine } from '@/lib/strength-engine';
import { mapFortuneToVisuals } from '@/lib/visual-mapper';
import { getUserMetaphysics } from '@/lib/fortune';
import { FortuneCanvas } from '@/components/visuals/FortuneCanvas';
import { GoalCard } from '@/components/goals/GoalCard';
import { Lunar } from 'lunar-javascript';
import { ShieldAlert, Sparkles, Compass, Loader2, Calendar } from 'lucide-react';
import { useMemo } from 'react';

export default function HomePage() {
  // 1. 获取持久化的用户档案
  const { profile } = useProfile();
  
  // 2. 核心计算逻辑：使用 useMemo 优化性能，只有 profile 改变时才重新计算
  const fortuneData = useMemo(() => {
    const date = new Date(profile.birthDate);
    if (isNaN(date.getTime())) return null;

    const lunar = Lunar.fromYmdHms(
      date.getFullYear(), 
      date.getMonth() + 1, 
      date.getDate(), 
      date.getHours(), 
      date.getMinutes(), 0
    );

    const wuxingScores = BaziEngine.calculateEnergy(lunar);
    const strength = StrengthEngine.calculate(lunar);
    const meta = calculateProfile(profile.birthDate);

    // 映射视觉参数
    const visualConfig = mapFortuneToVisuals({
      wuxing: wuxingScores,
      strength: strength
    });

    return { lunar, wuxingScores, strength, meta, visualConfig };
  }, [profile.birthDate]);

  // 3. 获取今日黄历信息
  const todayAlmanac = useMemo(() => {
    try {
      const today = new Date();
      return getUserMetaphysics(today);
    } catch (error) {
      console.error('获取今日黄历失败:', error);
      return null;
    }
  }, []);

  // 4. 加载中状态处理（防止 Hydration 错误）
  if (!fortuneData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-500" />
      </div>
    );
  }

  const { wuxingScores, strength, meta, visualConfig } = fortuneData;

  // 5. 生成动态能量状态描述
  const generateEnergyDescription = () => {
    if (!todayAlmanac || !meta) return '';

    // 获取日主元素
    const baziParts = meta.bazi.split(' ');
    if (baziParts.length < 3) return '命理数据解析异常。';
    const riGanElement = baziParts[2].substring(0, 1);
    const riElement = BaziEngine.ELEMENT_MAP[riGanElement];
    if (!riElement) return '五行映射数据异常。';

    // 五行名称映射
    const elementNames: Record<Element, string> = {
      mu: '木', huo: '火', tu: '土', jin: '金', shui: '水'
    };

    // MBTI性格特征映射
    const mbtiTraits: Record<string, string> = {
      INTJ: '战略规划', INTP: '逻辑分析', ENTJ: '领导决策', ENTP: '创新思维',
      INFJ: '深度洞察', INFP: '理想主义', ENFJ: '激励引导', ENFP: '热情探索',
      ISTJ: '严谨执行', ISFJ: '细致关怀', ESTJ: '高效管理', ESFJ: '社交协调',
      ISTP: '实践解决', ISFP: '艺术感知', ESTP: '冒险行动', ESFP: '活力表现'
    };

    // 星座元素映射
    const zodiacElements: Record<string, string> = {
      '白羊座': '火', '金牛座': '土', '双子座': '风', '巨蟹座': '水',
      '狮子座': '火', '处女座': '土', '天秤座': '风', '天蝎座': '水',
      '射手座': '火', '摩羯座': '土', '水瓶座': '风', '双鱼座': '水'
    };

    // 黄历宜忌分析
    const favorableItems = todayAlmanac.yi;
    const unfavorableItems = todayAlmanac.ji;

    // 判断黄历是否有利于用户
    const hasFavorableActivity = favorableItems.some((item: string) =>
      ['祭祀', '求财', '签约', '交易', '开市', '纳采', '入学', '求医'].includes(item)
    );

    // 找到最强的五行和最弱的五行
    let strongestElement: Element = 'mu';
    let strongestScore = 0;
    let weakestElement: Element = 'mu';
    let weakestScore = 100;

    Object.entries(wuxingScores).forEach(([key, value]) => {
      const element = key as Element;
      const score = value as number;
      if (score > strongestScore) {
        strongestScore = score;
        strongestElement = element;
      }
      if (score < weakestScore) {
        weakestScore = score;
        weakestElement = element;
      }
    });

    // 构建描述
    const parts: string[] = [];

    // 1. 基础状态
    parts.push(`今日你的"${elementNames[riElement]}"命格${strength.status}。`);

    // 2. 黄历结合
    if (hasFavorableActivity) {
      parts.push(`黄历宜"${favorableItems[0]}"，适宜${mbtiTraits[profile.mbti] || '发挥优势'}。`);
    } else {
      parts.push(`今日天时平平，需${strength.status === '偏弱' || strength.status === '极弱' ? '保守' : '稳健'}行事。`);
    }

    // 3. 五行分析
    if (strongestScore > 40) {
      parts.push(`${elementNames[strongestElement]}元素极旺，${strength.yongShen.includes(strongestElement) ? '此乃喜用神' : '需注意平衡'}。`);
    }

    if (weakestScore < 15) {
      parts.push(`${elementNames[weakestElement]}元素偏弱，可适当补充${elementNames[weakestElement]}能量。`);
    }

    // 4. 星座与MBTI结合
    const zodiacElement = zodiacElements[meta.zodiac] || '';
    if (zodiacElement && zodiacElement === elementNames[riElement].charAt(0)) {
      parts.push(`${meta.zodiac}的${zodiacElement}象与命格${elementNames[riElement]}相辅相成。`);
    }

    // 5. 行动建议
    if (strength.status === '偏旺' || strength.status === '极旺') {
      parts.push(`建议：克制冲动，${mbtiTraits[profile.mbti] ? '善用' + mbtiTraits[profile.mbti] : '理性决策'}。`);
    } else if (strength.status === '偏弱' || strength.status === '极弱') {
      parts.push(`建议：借助"${todayAlmanac.yi[0] || '静思'}"积累能量，${profile.mbti.includes('E') ? '寻求支持' : '专注内省'}。`);
    } else {
      parts.push(`建议：平衡发展，结合${mbtiTraits[profile.mbti] || '个人特质'}把握时机。`);
    }

    return parts.join(' ');
  };

  // 模拟待办目标
  const mockGoals = [
    { id: 1, name: "深度阅读 30min", progress: 45, type: 'study' },
    { id: 2, name: "冥想正念", progress: 10, type: 'health' }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans">
      {/* 4. 背景：动态能量粒子层 (实时响应 visualConfig) */}
      <FortuneCanvas config={visualConfig} />

      <div className="relative z-10 max-w-lg mx-auto px-6 pt-12 pb-32">
        {/* 顶部：天时信息 */}
        <header className="flex justify-between items-start mb-12">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#D4AF37]" />
              XUANJI <span className="text-[#D4AF37]">AI</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">Cyber Metaphysics Lab</p>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full inline-block">
              <span className="text-[10px] text-[#D4AF37] font-mono tracking-wider italic">
                {meta?.ganzhi.year} {meta?.ganzhi.month} {meta?.ganzhi.day}
              </span>
            </div>
          </div>
        </header>

        {/* 今日黄历卡片 */}
        {todayAlmanac && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/2 border border-white/10 backdrop-blur-3xl">
            <div className="flex items-center gap-2 mb-3 text-[#D4AF37]">
              <Calendar size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase">今日黄历</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-black tracking-tighter">{todayAlmanac.lunarDate}</h3>
                  <span className="text-xs text-zinc-400 font-mono">{todayAlmanac.ganzhi}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">宜</p>
                    <p className="text-sm text-emerald-300 leading-snug">
                      {todayAlmanac.yi.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">忌</p>
                    <p className="text-sm text-rose-300 leading-snug">
                      {todayAlmanac.ji.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 能量状态卡片 */}
        <section className="mb-6 p-8 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-3xl">
          <div className="flex justify-between items-center mb-6 text-[#D4AF37]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase">当前能量状态</span>
            </div>
            <div className="text-[10px] font-mono opacity-50">STRENGTH: {strength.score}</div>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <h2 className="text-5xl font-black italic tracking-tighter">{strength.status}</h2>
            <div className="mb-2 px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold rounded">
              {profile.mbti}
            </div>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {todayAlmanac ? generateEnergyDescription() : `今日你的"${meta?.bazi.split(' ')[2].substring(0,1)}"元素受天时影响。建议结合 ${profile.mbti} 的策略性，在下午完成核心决策。`}
          </p>

          {/* 五行分布可视化 */}
          <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
            <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${wuxingScores.mu}%` }} />
            <div className="bg-rose-500 transition-all duration-1000" style={{ width: `${wuxingScores.huo}%` }} />
            <div className="bg-amber-500 transition-all duration-1000" style={{ width: `${wuxingScores.tu}%` }} />
            <div className="bg-zinc-200 transition-all duration-1000" style={{ width: `${wuxingScores.jin}%` }} />
            <div className="bg-blue-500 transition-all duration-1000" style={{ width: `${wuxingScores.shui}%` }} />
          </div>
        </section>

        {/* 弱点克制提醒 (PRD 3.6) */}
         <div className="mb-6 flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
           <ShieldAlert className="text-red-500 w-5 h-5 flex-shrink-0" />
           <p className="text-xs text-red-200/80 leading-snug">
             检测到潜在风险：今日“枭神”活跃，INTJ 易陷入过度内耗。建议开启“书写不安清单”修行。
           </p>
         </div>

        {/* 目标卡片 */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-2 mb-2">修行进度</h3>
          {mockGoals.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              advice="结合今日天干之利，此项修行事半功倍。" 
            />
          ))}
        </div>
      </div>
    </main>
  );
}
