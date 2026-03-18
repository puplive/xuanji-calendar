/**
 * 1. 目标管理页面 (src/app/goals/page.tsx)
这个页面承载了 PRD 3.5 的功能：展示所有进行中的修行目标。
 */

"use client";
export const runtime = 'edge'; // 强制使用边缘运行时

import { motion } from 'framer-motion';
import { Sparkles, Plus, Trophy, Calendar, TrendingUp, Target } from 'lucide-react';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalChart } from '@/components/goals/GoalChart';
import { useGoals } from '@/hooks/useGoals';
import { useState } from 'react';

export default function GoalsPage() {
  const { goals, addGoal, checkin } = useGoals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalType, setNewGoalType] = useState<'study' | 'health' | 'work' | 'emotion' | 'other'>('health');
  const [newGoalDays, setNewGoalDays] = useState(7);

  const activeGoals = goals?.filter(goal => goal.status === 'active') || [];
  const completedGoals = goals?.filter(goal => goal.status === 'completed') || [];

  // 计算本周打卡次数
  const calculateWeeklyCheckins = () => {
    if (!goals) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let total = 0;
    goals.forEach(goal => {
      goal.checkins.forEach(checkin => {
        const checkinDate = new Date(checkin.date);
        if (checkinDate >= oneWeekAgo) {
          total += 1;
        }
      });
    });
    return total;
  };

  // 计算修行点数（基于完成的目标数量和打卡次数）
  const calculatePoints = () => {
    if (!goals) return 0;
    const completedCount = completedGoals.length;
    const totalCheckins = goals.reduce((sum, goal) => sum + goal.checkins.length, 0);
    return completedCount * 100 + totalCheckins * 10;
  };

  const handleAddGoal = async () => {
    if (!newGoalName.trim()) return;

    await addGoal({
      name: newGoalName,
      type: newGoalType,
      totalDays: newGoalDays,
      startDate: new Date().toISOString().split('T')[0],
    });

    setNewGoalName('');
    setNewGoalType('health');
    setNewGoalDays(7);
    setShowAddForm(false);
  };

  const handleCheckin = async (goalId: number) => {
    await checkin(goalId);
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="flex justify-between items-end mb-10 pt-8">
        <div>
          <h1 className="text-3xl font-black italic text-gold-500">GOALS</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">目标管理 · 能量定见</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-gold-500"
        >
          <Plus size={20} />
        </motion.button>
      </header>

      {/* 添加目标表单 */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-zinc-900/80 border border-white/10 rounded-3xl backdrop-blur-3xl"
        >
          <h3 className="text-sm font-bold text-gold-500 mb-4">新增修行目标</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">目标名称</label>
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                placeholder="例如：每日冥想15分钟"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">目标类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(['study', 'health', 'work', 'emotion', 'other'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewGoalType(type)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      newGoalType === type
                        ? 'bg-gold-600 text-black'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                    }`}
                  >
                    {type === 'study' ? '学习' :
                     type === 'health' ? '健康' :
                     type === 'work' ? '工作' :
                     type === 'emotion' ? '情绪' : '其他'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">修行周期（天）</label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 21, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setNewGoalDays(days)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      newGoalDays === days
                        ? 'bg-gold-600 text-black'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                    }`}
                  >
                    {days}天
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-gold-600 hover:bg-gold-500 text-black font-bold py-3 rounded-2xl transition-all active:scale-95"
              >
                创建目标
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-2xl transition-all active:scale-95"
              >
                取消
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 统计概览 */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
          <p className="text-[10px] text-zinc-500 mb-1">本周达成</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic">{calculateWeeklyCheckins()}</span>
            <span className="text-[10px] text-zinc-600">次</span>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
          <p className="text-[10px] text-zinc-500 mb-1">修行点数</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-gold-600">{calculatePoints()}</span>
            <Trophy size={10} className="text-gold-600" />
          </div>
        </div>
      </section>

      {/* 统计图表 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">数据统计</h3>
        </div>
        <GoalChart goals={goals || []} />
      </section>

      {/* 目标列表 */}
      <div className="space-y-4">
        {activeGoals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onComplete={() => handleCheckin(goal.id!)}
            advice="今日日值‘成’日，适合突破关键瓶颈。"
          />
        ))}
      </div>

      {/* 暂无目标占位 */}
      {activeGoals.length === 0 && (
        <div className="mt-20 text-center opacity-20">
          <Sparkles className="mx-auto mb-4" size={48} />
          <p className="text-sm">暂无修行目标，点击上方 + 开启</p>
        </div>
      )}

      {/* 已完成目标（可折叠） */}
      {completedGoals.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={14} className="text-gold-500" />
            <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">已完成目标</h3>
          </div>
          <div className="space-y-3 opacity-70">
            {completedGoals.slice(0, 3).map(goal => (
              <div
                key={goal.id}
                className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm text-zinc-300">{goal.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      完成于 {goal.startDate}
                    </p>
                  </div>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    已完成
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
