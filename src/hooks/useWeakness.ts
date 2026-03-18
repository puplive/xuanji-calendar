import { useState, useEffect, useCallback } from 'react';
import { db, WeaknessPractice } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { syncService } from '@/lib/sync';

export const useWeakness = () => {
  const [practices, setPractices] = useState<WeaknessPractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isGuest, token } = useAuth();

  // 加载数据函数
  const loadPractices = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || 'guest';
      let data: WeaknessPractice[];

      if (isGuest) {
        // 游客模式：仅加载本地数据
        data = await db.weaknessPractices.where('userId').equals(userId).toArray();
      } else {
        // 登录用户：先尝试从云端同步，然后加载本地数据
        try {
          await syncService.pullChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to pull changes from cloud, using local data:', error);
        }
        data = await db.weaknessPractices.where('userId').equals(userId).toArray();
      }

      setPractices(data);
    } catch (error) {
      console.error('加载弱点实践记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, token]);

  // 初始加载和定期刷新
  useEffect(() => {
    loadPractices();
    const interval = setInterval(loadPractices, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, [loadPractices]);

  // 添加弱点实践记录
  const addPractice = useCallback(async (practiceData: Omit<WeaknessPractice, 'id' | 'isCompleted' | 'streak' | 'date' | 'localId' | 'syncStatus' | 'syncVersion' | 'lastSyncedAt' | 'userId'>) => {
    const userId = user?.id || 'guest';
    const today = new Date().toISOString().split('T')[0];
    const localId = syncService.generateLocalId();

    // 检查今天是否已有记录
    const existing = await db.weaknessPractices
      .where('weaknessId')
      .equals(practiceData.weaknessId)
      .and(p => p.date === today)
      .and(p => p.userId === userId)
      .first();

    if (existing) return;

    // 计算连续天数
    const previousPractices = await db.weaknessPractices
      .where('weaknessId')
      .equals(practiceData.weaknessId)
      .and(p => p.isCompleted)
      .and(p => p.userId === userId)
      .sortBy('date');

    let streak = 1;
    if (previousPractices.length > 0) {
      const lastDate = new Date(previousPractices[previousPractices.length - 1].date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      streak = diffDays === 1 ? previousPractices[previousPractices.length - 1].streak + 1 : 1;
    }

    const newPractice: WeaknessPractice = {
      ...practiceData,
      userId,
      isCompleted: false,
      streak,
      date: today,
      localId,
      syncStatus: 'pending',
      syncVersion: 1,
      lastSyncedAt: undefined,
    };

    await db.weaknessPractices.add(newPractice);

    // 如果是登录用户，尝试同步到云端
    if (!isGuest) {
      syncService.queueSyncOperation(async () => {
        try {
          await syncService.pushChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to sync new practice:', error);
        }
      });
    }

    // 刷新数据
    await loadPractices();
  }, [user, isGuest, token, loadPractices]);

  // 完成今日实践
  const completePractice = useCallback(async (practiceId: number) => {
    const practice = await db.weaknessPractices.get(practiceId);
    if (!practice) return;

    await db.weaknessPractices.update(practiceId, {
      isCompleted: true,
      syncStatus: 'pending',
      syncVersion: (practice.syncVersion || 1) + 1,
    });

    // 触发“成就粒子”：金色粒子汇聚成光束（PRD 3.6）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('special-effect', {
        detail: { type: 'ACHIEVEMENT_BEAM', color: '#FFD700' }
      }));
    }

    console.log(`修行打卡成功：ID ${practiceId}`);

    // 如果是登录用户，尝试同步到云端
    if (!isGuest) {
      const userId = user?.id || 'guest';
      syncService.queueSyncOperation(async () => {
        try {
          await syncService.pushChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to sync practice completion:', error);
        }
      });
    }

    // 刷新数据
    await loadPractices();
  }, [user, isGuest, token, loadPractices]);

  // 获取今日实践记录
  const getTodayPractice = useCallback(async (weaknessId: string) => {
    const userId = user?.id || 'guest';
    const today = new Date().toISOString().split('T')[0];
    return await db.weaknessPractices
      .where('weaknessId')
      .equals(weaknessId)
      .and(p => p.date === today)
      .and(p => p.userId === userId)
      .first();
  }, [user]);

  // 获取弱点连续天数
  const getStreak = useCallback(async (weaknessId: string) => {
    const userId = user?.id || 'guest';
    const practices = await db.weaknessPractices
      .where('weaknessId')
      .equals(weaknessId)
      .and(p => p.isCompleted)
      .and(p => p.userId === userId)
      .sortBy('date');

    if (practices.length === 0) return 0;

    // 检查是否连续
    const today = new Date().toISOString().split('T')[0];
    const lastPractice = practices[practices.length - 1];
    const lastDate = new Date(lastPractice.date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays === 1 ? lastPractice.streak : 0;
  }, [user]);

  // 获取弱点统计
  const getWeaknessStats = useCallback(async (weaknessId: string) => {
    const userId = user?.id || 'guest';
    const allPractices = await db.weaknessPractices
      .where('weaknessId')
      .equals(weaknessId)
      .and(p => p.userId === userId)
      .toArray();

    const total = allPractices.length;
    const completed = allPractices.filter(p => p.isCompleted).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      completionRate,
      currentStreak: allPractices.length > 0 ? allPractices[allPractices.length - 1].streak : 0
    };
  }, [user]);

  // 手动同步
  const syncPractices = useCallback(async () => {
    if (isGuest) return { success: false, error: 'Guest mode cannot sync' };

    const userId = user?.id;
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const result = await syncService.syncAll(userId, token || undefined);
      await loadPractices(); // 刷新数据
      return result;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [user, isGuest, token, loadPractices]);

  return {
    practices,
    addPractice,
    completePractice,
    getTodayPractice,
    getStreak,
    getWeaknessStats,
    syncPractices,
    isLoading,
    isGuest,
    userId: user?.id,
  };
};
