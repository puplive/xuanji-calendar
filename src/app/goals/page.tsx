/**
 * 1. 目标管理页面 (src/app/goals/page.tsx)
这个页面承载了 PRD 3.5 的功能：展示所有进行中的修行目标。
 */

"use client";
export const runtime = 'edge'; // 强制使用边缘运行时

import { motion } from 'framer-motion';
import { Sparkles, Plus, Trophy } from 'lucide-react';
import { GoalCard } from '@/components/goals/GoalCard';

export default function GoalsPage() {
  // 模拟数据（未来对接 IndexedDB）
  const activeGoals = [
    { id: 1, name: "每日冥想 15min", progress: 60, type: 'health' },
    { id: 2, name: "完成 2 个番茄钟", progress: 20, type: 'work' },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="flex justify-between items-end mb-10 pt-8">
        <div>
          <h1 className="text-3xl font-black italic text-gold-500">GOALS</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">目标管理 · 能量定见</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-gold-500"
        >
          <Plus size={20} />
        </motion.button>
      </header>

      {/* 统计概览 */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
          <p className="text-[10px] text-zinc-500 mb-1">本周达成</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic">12</span>
            <span className="text-[10px] text-zinc-600">次</span>
          </div>
        </div>
        <div className="p-4 bg-zinc-900/50 rounded-3xl border border-white/5">
          <p className="text-[10px] text-zinc-500 mb-1">修行点数</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-gold-600">850</span>
            <Trophy size={10} className="text-gold-600" />
          </div>
        </div>
      </section>

      {/* 目标列表 */}
      <div className="space-y-4">
        {activeGoals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
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
    </main>
  );
}
