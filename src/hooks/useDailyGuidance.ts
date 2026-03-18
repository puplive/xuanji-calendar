/**
 * 4. 每日指引缓存逻辑 (hooks/useDailyGuidance.ts)
根据 PRD 6.3 节，避免每日重复请求 AI 接口。



 */
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export const useDailyGuidance = (profile: any) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 监听今日缓存
  const cachedData = useLiveQuery(() => db.dailyCaches.get(todayStr));

  const getGuidance = async () => {
    if (cachedData) return cachedData;

    // 如果没缓存，调用 AI
    const res = await fetch('/api/oracle', {
      method: 'POST',
      body: JSON.stringify({ compositeData: profile })
    });
    const aiResult = await res.json() as any;

    // 写入缓存
    await db.dailyCaches.put({
      date: todayStr,
      content: aiResult.text,
      huangli: profile.huangli // 假设 profile 已包含黄历数据
    });

    return aiResult;
  };

  return { cachedData, getGuidance };
};
