/**
 * 2. 核心业务逻辑 Hook (hooks/useGoals.ts)
这个 Hook 处理目标的创建、打卡以及基于五行的进度反馈。
支持多设备同步：游客模式使用本地存储，登录用户同步到云端。

AI Coding 进阶建议
当你在 Cursor 中开发这个模块时，可以尝试以下 Prompt：

逻辑补全：“帮我写一个 GoalStats 组件，计算本周目标的整体完成率，并生成一个简单的 SVG 雷达图，展示我在木、火、土、金、水五个维度上的‘成长进度’。”
视觉增强：“在打卡成功时，使用 canvas-confetti 库喷洒出符合用户今日‘喜用神’颜色的五彩碎纸。”
异常处理：“如果用户在黄历标注‘忌开市/祭祀’的日子强行开启重磅新目标，让 AI 在指引中给出一个幽默的风险提示。”

 */
import { useState, useEffect, useCallback } from 'react';
import { db, Goal } from '@/lib/db';
import { trackEvent } from '@/lib/analytics'; // 1. 关键导入
import { useAuth } from '@/contexts/AuthContext';
import { syncService } from '@/lib/sync';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isGuest, token } = useAuth();

  // 加载数据函数
  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || 'guest';
      let data: Goal[];

      if (isGuest) {
        // 游客模式：仅加载本地数据
        data = await db.goals.where('userId').equals(userId).toArray();
      } else {
        // 登录用户：先尝试从云端同步，然后加载本地数据
        try {
          await syncService.pullChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to pull changes from cloud, using local data:', error);
        }
        data = await db.goals.where('userId').equals(userId).toArray();
      }

      setGoals(data);
    } catch (error) {
      console.error('加载目标数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, token]);

  // 初始加载和定期刷新
  useEffect(() => {
    loadGoals();
    const interval = setInterval(loadGoals, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, [loadGoals]);

  // 创建新目标
  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'progress' | 'status' | 'checkins' | 'createdAt' | 'userId' | 'isCompleted' | 'localId' | 'syncStatus' | 'syncVersion' | 'lastSyncedAt'>) => {
    const userId = user?.id || 'guest';
    const localId = syncService.generateLocalId();

    const newGoal: Goal = {
      ...goalData,
      userId,
      isCompleted: false,
      progress: 0,
      status: 'active',
      checkins: [],
      createdAt: Date.now(),
      localId,
      syncStatus: 'pending',
      syncVersion: 1,
      lastSyncedAt: undefined,
    };

    await db.goals.add(newGoal);

    // 如果是登录用户，尝试同步到云端
    if (!isGuest) {
      syncService.queueSyncOperation(async () => {
        try {
          await syncService.pushChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to sync new goal:', error);
        }
      });
    }

    // 刷新数据
    await loadGoals();
  }, [user, isGuest, token, loadGoals]);

  // 每日打卡逻辑
  const checkin = useCallback(async (goalId: number) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const today = new Date().toISOString().split('T')[0];
    const isAlreadyChecked = goal.checkins.some(c => c.date === today);
    if (isAlreadyChecked) return;

    const newCheckins = [...goal.checkins, { date: today, value: 100 }];
    const newProgress = Math.round((newCheckins.length / goal.totalDays) * 100);
    const newStatus = newProgress >= 100 ? 'completed' : 'active';

    await db.goals.update(goalId, {
      checkins: newCheckins,
      progress: newProgress,
      status: newStatus,
      syncStatus: 'pending',
      syncVersion: (goal.syncVersion || 1) + 1,
    });

    // 触发粒子波动（通过自定义事件通知首页 Canvas）
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('goal-checkin', { detail: { goalId } }));
    }

    /**3. 关键场景埋点实现
    A. 目标打卡埋点 (验证 PRD 3.5)
    在 hooks/useGoals.ts 的 checkin 函数中加入： */
    try {
      trackEvent('goal_checkin', {
          goalId,
          goalType: goal.type,
          currentProgress: newProgress,
          isFirstTime: goal.checkins.length === 1,
          timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }

    // 如果是登录用户，尝试同步到云端
    if (!isGuest) {
      const userId = user?.id || 'guest';
      syncService.queueSyncOperation(async () => {
        try {
          await syncService.pushChanges(userId, token || undefined);
        } catch (error) {
          console.warn('Failed to sync checkin:', error);
        }
      });
    }

    // 刷新数据
    await loadGoals();
  }, [user, isGuest, token, loadGoals]);

  // 手动同步
  const syncGoals = useCallback(async () => {
    if (isGuest) return { success: false, error: 'Guest mode cannot sync' };

    const userId = user?.id;
    if (!userId) return { success: false, error: 'No user ID' };

    try {
      const result = await syncService.syncAll(userId, token || undefined);
      await loadGoals(); // 刷新数据
      return result;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [user, isGuest, token, loadGoals]);

  return {
    goals,
    addGoal,
    checkin,
    syncGoals,
    isLoading,
    isGuest,
    userId: user?.id,
  };
};