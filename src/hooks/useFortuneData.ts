/**
 * 数据持久化逻辑 Hook
 * 封装”计算 -> 写入本地”的闭环逻辑（客户端直接计算，无需 API 调用）
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '@/lib/db';
import { useState, useEffect } from 'react';

// 定义计算模块的类型
type CalculationModules = {
  Lunar: any;
  BaziEngine: any;
  StrengthEngine: any;
  calculateProfile: any;
};

// 延迟加载计算模块
const loadCalculationModules = async () => {
  const { Lunar } = await import('lunar-javascript');
  const { BaziEngine } = await import('@/lib/bazi-engine');
  const { StrengthEngine } = await import('@/lib/strength-engine');
  const { calculateProfile } = await import('@/lib/profile-utils');

  return {
    Lunar,
    BaziEngine,
    StrengthEngine,
    calculateProfile
  };
};

export const useFortuneData = () => {
  // 使用 useLiveQuery 实现数据的响应式监听
  const profile = useLiveQuery(() => db.profiles.toCollection().last());

  // 动态加载计算模块
  const [modulesLoaded, setModulesLoaded] = useState(false);
  const [calculationModules, setCalculationModules] = useState<CalculationModules | null>(null);

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
        console.error('加载计算模块失败:', error);
      }
    };

    loadModules();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 保存/更新档案逻辑（客户端直接计算）
  const saveProfile = async (rawData: { year: number, month: number, day: number, hour: number, mbti: string }) => {
    if (!modulesLoaded || !calculationModules) {
      console.error('计算模块尚未加载');
      return false;
    }

    const { Lunar, BaziEngine, StrengthEngine } = calculationModules;

    try {
      // 1. 客户端直接计算（无需 API 调用）
      const lunar = Lunar.fromYmdHms(rawData.year, rawData.month, rawData.day, rawData.hour, 0, 0);
      const wuxingScores = BaziEngine.calculateEnergy(lunar);
      const strength = StrengthEngine.calculate(lunar);

      const bazi = lunar.getBaZi();
      const newProfile: UserProfile = {
        userId: 'guest',
        birthDate: `${rawData.year}-${rawData.month}-${rawData.day} ${rawData.hour}:00`,
        mbti: rawData.mbti,
        zodiac: '',
        bazi: {
          ganzhi: bazi.join(' '),
          riGan: bazi[2]?.substring(0, 1) || '',
          riZhi: bazi[2]?.substring(1) || '',
        },
        wuxingScores,
        strengthStatus: strength.status,
        updatedAt: Date.now()
      };

      // 2. 写入 IndexedDB
      await db.profiles.clear(); // 仅保留一个主档案
      await db.profiles.add(newProfile);
      return true;
    } catch (error) {
      console.error('saveProfile failed:', error);
      return false;
    }
  };

  return {
    profile,
    saveProfile,
    isLoading: profile === undefined || !modulesLoaded
  };
};