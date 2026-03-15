/**
 * 2. 核心业务逻辑 Hook (hooks/useGoals.ts)
这个 Hook 处理目标的创建、打卡以及基于五行的进度反馈。


AI Coding 进阶建议
当你在 Cursor 中开发这个模块时，可以尝试以下 Prompt：

逻辑补全：“帮我写一个 GoalStats 组件，计算本周目标的整体完成率，并生成一个简单的 SVG 雷达图，展示我在木、火、土、金、水五个维度上的‘成长进度’。”
视觉增强：“在打卡成功时，使用 canvas-confetti 库喷洒出符合用户今日‘喜用神’颜色的五彩碎纸。”
异常处理：“如果用户在黄历标注‘忌开市/祭祀’的日子强行开启重磅新目标，让 AI 在指引中给出一个幽默的风险提示。”

 */
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Goal } from '@/lib/db';
import { trackEvent } from '@/lib/analytics'; // 1. 关键导入

export const useGoals = () => {
  const goals = useLiveQuery(() => db.goals.where('status').equals('active').toArray());

  // 创建新目标
  const addGoal = async (goalData: Omit<Goal, 'id' | 'progress' | 'status' | 'checkins' | 'createdAt'>) => {
    await db.goals.add({
      ...goalData,
      progress: 0,
      status: 'active',
      checkins: [],
      createdAt: Date.now()
    });
  };

  // 每日打卡逻辑
  const checkin = async (goalId: number) => {
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const today = new Date().toISOString().split('T')[0];
    const isAlreadyChecked = goal.checkins.some(c => c.date === today);
    if (isAlreadyChecked) return;

    const newCheckins = [...goal.checkins, { date: today, value: 100 }];
    const newProgress = Math.round((newCheckins.length / goal.totalDays) * 100);

    await db.goals.update(goalId, {
      checkins: newCheckins,
      progress: newProgress,
      status: newProgress >= 100 ? 'completed' : 'active'
    });

    // 触发粒子波动（通过自定义事件通知首页 Canvas）
    window.dispatchEvent(new CustomEvent('goal-checkin', { detail: { goalId } }));
    /**3. 关键场景埋点实现
A. 目标打卡埋点 (验证 PRD 3.5)
在 hooks/useGoals.ts 的 checkin 函数中加入： */
    trackEvent('goal_checkin', {
        goalId,
        goalType: goal.type,
        currentProgress: newProgress,
        isFirstTime: goal.checkins.length === 1,
        timestamp: Date.now()
    });
  };

  return { goals, addGoal, checkin };
};
