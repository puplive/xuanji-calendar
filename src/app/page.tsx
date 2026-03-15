"use client"; // 关键：首页现在需要监听本地存储状态
export const runtime = 'edge'; // 强制使用边缘运行时

import { useProfile } from '@/hooks/useProfile';
import { calculateProfile } from '@/lib/profile-utils';
import { BaziEngine } from '@/lib/bazi-engine';
import { StrengthEngine } from '@/lib/strength-engine';
import { mapFortuneToVisuals } from '@/lib/visual-mapper';
import { FortuneCanvas } from '@/components/visuals/FortuneCanvas';
import { GoalCard } from '@/components/goals/GoalCard';
import { Lunar } from 'lunar-javascript';
import { ShieldAlert, Sparkles, Compass, Loader2 } from 'lucide-react';
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

  // 3. 加载中状态处理（防止 Hydration 错误）
  if (!fortuneData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-500" />
      </div>
    );
  }

  const { wuxingScores, strength, meta, visualConfig } = fortuneData;

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
            今日你的“{meta?.bazi.split(' ')[2].substring(0,1)}”元素受天时影响。建议结合 {profile.mbti} 的策略性，在下午完成核心决策。
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
