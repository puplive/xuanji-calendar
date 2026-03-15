/**
 * 3. 数据持久化逻辑 Hook (hooks/useFortuneData.ts)
创建一个 Hook，封装“查询本地 -> 无数据则请求 API -> 写入本地”的闭环逻辑。


5. 页面集成示例 (app/setup/page.tsx)
用户录入信息并持久化的流程。
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '@/lib/db';

export const useFortuneData = () => {
  // 使用 useLiveQuery 实现数据的响应式监听
  const profile = useLiveQuery(() => db.profiles.toCollection().last());

  // 保存/更新档案逻辑
  const saveProfile = async (rawData: { year: number, month: number, day: number, hour: number, mbti: string }) => {
    // 1. 调用之前封装的 API Route
    const res = await fetch('/api/metaphysics/calculate', {
      method: 'POST',
      body: JSON.stringify(rawData)
    });
    const result = await res.json();

    if (result.success) {
      const newProfile: UserProfile = {
        userId: result.data.userId,
        birthDate: result.data.profile.birthDate,
        mbti: rawData.mbti,
        zodiac: result.data.profile.zodiac,
        bazi: result.data.profile.bazi,
        wuxingScores: result.data.analysis.wuxing,
        strengthStatus: result.data.analysis.strength.status,
        updatedAt: Date.now()
      };

      // 2. 写入 IndexedDB
      await db.profiles.clear(); // 仅保留一个主档案
      await db.profiles.add(newProfile);
      return true;
    }
    return false;
  };

  return {
    profile,
    saveProfile,
    isLoading: profile === undefined
  };
};
