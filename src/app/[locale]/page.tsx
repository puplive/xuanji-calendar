"use client";
export const runtime = 'edge';

import { useProfile } from '@/hooks/useProfile';
import { FortuneCanvas } from '@/components/visuals/FortuneCanvas';
import { GoalCard } from '@/components/goals/GoalCard';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ShieldAlert, Sparkles, Compass, Loader2, Calendar, Lightbulb } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

import { Element, ELEMENT_NAMES, MBTI_TRAITS, ZODIAC_ELEMENTS, ZODIAC_WUXING_KEYS, ELEMENT_NAME_KEYS, MBTI_TRAIT_KEYS } from '@/constants/mappings';
// 定义计算模块的类型
type CalculationModules = {
  calculateProfile: any;
  BaziEngine: any;
  StrengthEngine: any;
  mapFortuneToVisuals: any;
  getUserMetaphysics: any;
  Lunar: any;
};

// 延迟加载计算逻辑以优化初始包大小
const loadCalculationModules = async () => {
  const { calculateProfile } = await import('@/lib/profile-utils');
  const { BaziEngine } = await import('@/lib/bazi-engine');
  const { StrengthEngine } = await import('@/lib/strength-engine');
  const { mapFortuneToVisuals } = await import('@/lib/visual-mapper');
  const { getUserMetaphysics } = await import('@/lib/fortune');
  const { Lunar } = await import('lunar-javascript');

  return {
    calculateProfile,
    BaziEngine,
    StrengthEngine,
    mapFortuneToVisuals,
    getUserMetaphysics,
    Lunar
  };
};

export default function HomePage() {
  const t = useTranslations('Home');
  const tc = useTranslations();
  const locale = useLocale();
  const { profile } = useProfile();
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [calculationModules, setCalculationModules] = useState<CalculationModules | null>(null);

  // 异步加载计算模块
  useEffect(() => {
    let isCancelled = false;

    const loadModules = async () => {
      try {
        const modules = await loadCalculationModules();
        if (!isCancelled) {
          setCalculationModules(modules);
          setModulesLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load calculation modules:', error);
      }
    };

    loadModules();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 核心计算逻辑：使用 useMemo 优化性能
  const fortuneData = useMemo(() => {
    if (!modulesLoaded || !calculationModules || !profile.birthDate) return null;

    const { Lunar, BaziEngine, StrengthEngine, calculateProfile, mapFortuneToVisuals } = calculationModules;

    const date = new Date(profile.birthDate);
    if (isNaN(date.getTime())) return null;

    try {
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
    } catch (error) {
      console.error('计算命理数据出错:', error);
      return null;
    }
  }, [profile.birthDate, modulesLoaded, calculationModules]);

  // 获取今日黄历信息
  const todayAlmanac = useMemo(() => {
    if (!modulesLoaded || !calculationModules) return null;

    const { getUserMetaphysics } = calculationModules;

    try {
      const today = new Date();
      return getUserMetaphysics(today, locale);
    } catch (error) {
      console.error('获取今日黄历失败:', error);
      return null;
    }
  }, [modulesLoaded, calculationModules, locale]);

  // 加载中状态处理（防止 Hydration 错误）
  if (!modulesLoaded || !fortuneData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-gold-500" />
      </div>
    );
  }

  const { wuxingScores, strength, meta, visualConfig } = fortuneData;

  // 生成动态能量状态描述
  const generateEnergyDescription = () => {
    if (!todayAlmanac || !meta) return '';

    // 获取日主元素
    const baziParts = meta.bazi.split(' ');
    if (baziParts.length < 3) return t('loading');
    const riGanElement = baziParts[2].substring(0, 1);

    // 需要从 BaziEngine 获取 ELEMENT_MAP
    let riElement: Element = 'mu';
    if (modulesLoaded && calculationModules) {
      const { BaziEngine } = calculationModules;
      riElement = BaziEngine.ELEMENT_MAP[riGanElement];
    }
    if (!riElement) return t('loading');

    // 黄历宜忌分析
    const favorableItems = todayAlmanac.yi;

    // 判断黄历是否有利于用户
    const favorableKeywords = ['祭祀', '求财', '签约', '交易', '开市', '纳采', '入学', '求医'];
    const hasFavorableActivity = favorableItems.some((item: string) =>
      favorableKeywords.includes(item)
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
    parts.push(t('energyStatus', {
      element: tc(ELEMENT_NAME_KEYS[riElement]),
      status: tc('Constants.STRENGTH_STATUS.' + strength.status)
    }));

    // 2. 黄历结合
    if (hasFavorableActivity) {
      parts.push(t('favorableAdvice', {
        item: favorableItems[0],
        traits: profile.mbti ? tc(MBTI_TRAIT_KEYS[profile.mbti]) : tc('Constants.MBTI_TRAITS.INTJ')
      }));
    } else {
      const isRuo = strength.status === '偏弱' || strength.status === '极弱';
      parts.push(t('neutralAdvice', { style: isRuo ? tc('Constants.STRENGTH_STATUS.偏弱') : tc('Constants.STRENGTH_STATUS.偏旺') }));
    }

    // 3. 五行分析
    if (strongestScore > 40) {
      const yongShen = (strength as any).yongShen?.includes(strongestElement)
        ? t('yongShenPositive')
        : t('yongShenNegative');
      parts.push(t('elementStrong', {
        element: tc(ELEMENT_NAME_KEYS[strongestElement]),
        yongShen
      }));
    }

    if (weakestScore < 15) {
      parts.push(t('elementWeak', {
        element: tc(ELEMENT_NAME_KEYS[weakestElement]),
        energy: tc(ELEMENT_NAME_KEYS[weakestElement])
      }));
    }

    // 4. 星座与五行结合
    const zodiacWuxingKey = ZODIAC_WUXING_KEYS[meta.zodiac];
    if (zodiacWuxingKey && zodiacWuxingKey === riElement) {
      parts.push(t('zodiacSynergy', {
        zodiac: meta.zodiac,
        zodiacElement: tc(ELEMENT_NAME_KEYS[zodiacWuxingKey]),
        element: tc(ELEMENT_NAME_KEYS[riElement])
      }));
    }

    // 5. 行动建议
    if (strength.status === '偏旺' || strength.status === '极旺') {
      parts.push(t('actionAdviceWang', {
        traits: profile.mbti ? tc(MBTI_TRAIT_KEYS[profile.mbti]) : tc('Constants.MBTI_TRAITS.INTJ')
      }));
    } else if (strength.status === '偏弱' || strength.status === '极弱') {
      const isExtrovert = profile.mbti?.includes('E');
      const action = isExtrovert ? t('seekSupport') : t('focusIntrospection');
      parts.push(t('actionAdviceRuo', {
        item: todayAlmanac.yi[0] || t('defaultItem'),
        action
      }));
    } else {
      parts.push(t('actionAdviceBalance', {
        traits: profile.mbti ? tc(MBTI_TRAIT_KEYS[profile.mbti]) : tc('Constants.MBTI_TRAITS.INTJ')
      }));
    }

    return parts.join(' ');
  };

  // 宜忌 建议
  // const { primaryCategory, suggestion } = classifyHuangli(todayAlmanac.yi, todayAlmanac.ji)
  // 模拟待办目标
  // const mockGoals = [
  //   { id: 1, name: "深度阅读 30min", progress: 45, type: 'study' },
  //   { id: 2, name: "冥想正念", progress: 10, type: 'health' }
  // ];

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
          <div className="text-right flex items-center gap-2">
            
            {/* <div className="px-0 py-1 bg-white/5 border border-white/10 rounded-full inline-block"> */}
              <span className="text-[10px] text-[#D4AF37] font-mono tracking-wider italic">
                {meta?.ganzhi.year} {meta?.ganzhi.month} {meta?.ganzhi.day}
              </span>
            {/* </div> */}
            <LanguageSwitcher />
          </div>
        </header>

        {/* 今日黄历卡片 */}
        {todayAlmanac && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/2 border border-white/10 backdrop-blur-3xl">
            <div className="flex justify-between mb-3 text-[#D4AF37]">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span className="text-[10px] font-bold tracking-widest uppercase">{t('almanacTitle')}</span>
              </div>
              <div className='flex items-baseline tracking-tighter'>
                <span className="text-xl ">{todayAlmanac.solarDate}</span>
                <span className="text-sm ">&ensp;{todayAlmanac.week}</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-black tracking-tighter">{todayAlmanac.lunarDate}</h3>
                  <span className="text-xs text-zinc-400 font-mono">{todayAlmanac.ganzhi}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{t('yi')}</p>
                    <p className="text-sm text-emerald-300 leading-snug">
                      {todayAlmanac.yi.slice(0, 3).join(' · ')}
                    </p>
                    {/* <p className="text-xs ">{classifyHuangli(todayAlmanac.yi, todayAlmanac.ji).suggestion}</p> */}
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{t('ji')}</p>
                    <p className="text-sm text-rose-300 leading-snug">
                      {todayAlmanac.ji.slice(0, 3).join(' · ')}
                    </p>
                    {/* <p className="text-xs ">{classifyHuangli(todayAlmanac.yi, todayAlmanac.ji).suggestion}</p> */}
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
              <span className="text-[10px] font-bold tracking-widest uppercase">{t('energyTitle')}</span>
            </div>
            <div className="text-[10px] font-mono opacity-50">{t('strengthLabel')}: {strength.score}</div>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <h2 className="text-5xl font-black italic tracking-tighter">{strength.status}</h2>
            <div className="mb-2 px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold rounded">
              {profile.mbti}
            </div>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {todayAlmanac ? generateEnergyDescription() : t('noAlmanac', { element: meta?.bazi.split(' ')[2]?.substring(0,1) || '', mbti: profile.mbti })}
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

        {/* 彭祖百忌 */}
         <div className="mb-6 flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
           <ShieldAlert className="text-red-500 w-5 h-5 shrink-0" />
           <div className="text-xs leading-snug">
              <p className='text-[15px] text-red-400/60'>{todayAlmanac.pengZuGan.keyword} {todayAlmanac.pengZuZhi.keyword}</p>
             <p className='text-xs text-red-200/80'>{todayAlmanac.pengZuGan.advice+todayAlmanac.pengZuZhi.advice}</p>
           </div>
         </div>
        {/* 弱点克制提醒 (PRD 3.6) */}

        {/* 目标卡片 */}
        {/* <div className="space-y-4">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-2 mb-2">修行进度</h3>
          {mockGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              advice="结合今日天干之利，此项修行事半功倍。"
            />
          ))}
        </div> */}
      </div>
    </main>
  );
}