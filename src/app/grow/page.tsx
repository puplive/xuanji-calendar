/**
 * 2. 成长/弱点克服页面 (src/app/grow/page.tsx)
这个页面承载了 PRD 3.6 的功能：深度的自我修正与内耗对抗。
 */

"use client";
// 移除 edge runtime - 页面在客户端渲染

import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Lock, TrendingUp, Target, Plus } from 'lucide-react';
import { WeaknessChart } from '@/components/weakness/WeaknessChart';
import { useWeakness } from '@/hooks/useWeakness';
import { useState } from 'react';
import { Element, ELEMENT_NAMES, MBTI_TRAITS, ZODIAC_ELEMENTS } from '@/constants/mappings';

export default function GrowPage() {
  const { practices, addPractice, completePractice, getWeaknessStats } = useWeakness();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeaknessName, setNewWeaknessName] = useState('');
  const [newWeaknessDesc, setNewWeaknessDesc] = useState('');

  // 弱点类型数据
  const weaknessTypes = [
    { id: 'procrastination', name: '拖延症', description: '总是推迟重要任务', color: '#ef4444' },
    { id: 'overthinking', name: '内耗', description: '过度思考导致决策困难', color: '#f59e0b' },
    { id: 'mood_swing', name: '情绪波动', description: '情绪管理能力不足', color: '#10b981' },
    { id: 'distraction', name: '注意力分散', description: '难以保持专注', color: '#3b82f6' },
    { id: 'perfectionism', name: '完美主义', description: '追求完美阻碍进度', color: '#8b5cf6' }
  ];

  // 模拟今日修行内容（实际中应该从AI生成）
  const todaysPractice = {
    title: "对抗'空想主义'",
    description: "今日你的'食伤'能量过重，容易陷入完美的蓝图而迟迟不动手。修行指令：立刻去做那件你最想逃避的 5 分钟小事。",
    analysis: "从八字财官印看你的职业盲点，需加强执行与落地能力。结合今日黄历宜'安床'，建议从环境整顿开始。"
  };

  // 处理添加弱点
  const handleAddWeakness = async (weaknessId: string, name: string) => {
    await addPractice({
      weaknessId,
      content: name
    });
  };

  // 处理完成今日对抗
  const handleCompletePractice = async () => {
    // 查找今日未完成的实践
    const today = new Date().toISOString().split('T')[0];
    const todayPractices = practices?.filter(p => p.date === today && !p.isCompleted) || [];

    if (todayPractices.length > 0) {
      await completePractice(todayPractices[0].id!);
    }
  };

  // 计算总体统计
  const totalPractices = practices?.length || 0;
  const completedPractices = practices?.filter(p => p.isCompleted).length || 0;
  const completionRate = totalPractices > 0 ? Math.round((completedPractices / totalPractices) * 100) : 0;
  const currentStreak = practices && practices.length > 0
    ? Math.max(...practices.map(p => p.streak))
    : 0;

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="mb-10 pt-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black italic text-red-500 uppercase">Weakness</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">弱点克服 · 逆风修行</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-red-500"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </header>

      {/* 添加弱点表单 */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-zinc-900/80 border border-white/10 rounded-3xl backdrop-blur-3xl"
        >
          <h3 className="text-sm font-bold text-red-500 mb-4">识别新弱点</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">弱点名称</label>
              <input
                type="text"
                value={newWeaknessName}
                onChange={(e) => setNewWeaknessName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                placeholder="例如：过度内耗"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">弱点描述</label>
              <textarea
                value={newWeaknessDesc}
                onChange={(e) => setNewWeaknessDesc(e.target.value)}
                className="w-full bg-zinc-800/50 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 h-24 resize-none"
                placeholder="详细描述这个弱点如何影响你的生活..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  // 这里实际应该保存到数据库
                  setShowAddForm(false);
                  setNewWeaknessName('');
                  setNewWeaknessDesc('');
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-black font-bold py-3 rounded-2xl transition-all active:scale-95"
              >
                确认添加
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
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl">
          <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">整体完成率</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-white">{completionRate}</span>
            <span className="text-[10px] text-red-400">%</span>
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
          <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">连续坚持</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-white">{currentStreak}</span>
            <span className="text-[10px] text-amber-400">天</span>
          </div>
        </div>
      </section>

      {/* 今日修行卡片 */}
      <section className="mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-[2.5rem] bg-linear-to-br from-red-500/20 to-zinc-900 border border-red-500/30 backdrop-blur-3xl"
        >
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <ShieldAlert size={16} />
            <span className="text-[10px] font-bold tracking-widest uppercase">今日修行</span>
          </div>

          <h2 className="text-2xl font-bold mb-4 italic">{todaysPractice.title}</h2>

          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 mb-6">
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "{todaysPractice.description}"
            </p>
          </div>

          <button
            onClick={handleCompletePractice}
            className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95"
          >
            <Zap size={18} fill="currentColor" />
            完成今日对抗
          </button>
        </motion.div>
      </section>

      {/* 统计图表 */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={14} className="text-red-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">修行统计</h3>
        </div>
        <WeaknessChart practices={practices || []} />
      </section>

      {/* 弱点类型选择 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-red-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">常见弱点类型</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {weaknessTypes.map((weakness) => (
            <motion.button
              key={weakness.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAddWeakness(weakness.id, weakness.name)}
              className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl text-left transition-all hover:border-red-500/30"
              style={{ borderLeftColor: weakness.color, borderLeftWidth: '4px' }}
            >
              <h4 className="text-sm font-medium text-white mb-1">{weakness.name}</h4>
              <p className="text-[10px] text-zinc-500 leading-snug">{weakness.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 深度分析报告 */}
      <section className="space-y-4 mt-12">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">深度分析报告</h3>
          <Lock size={12} className="text-zinc-600" />
        </div>
        <div className="p-5 bg-zinc-900/50 rounded-3xl border border-white/5">
          <p className="text-xs text-zinc-300 leading-relaxed italic">
            {todaysPractice.analysis}
          </p>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[10px] text-zinc-500">
              基于你的八字命理（{new Date().getFullYear()}年）与MBTI（INTJ）特质分析得出
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
