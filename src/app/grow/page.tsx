/**
 * 2. 成长/弱点克服页面 (src/app/grow/page.tsx)
这个页面承载了 PRD 3.6 的功能：深度的自我修正与内耗对抗。
 */
"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Lock } from 'lucide-react';

export default function GrowPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="mb-10 pt-8">
        <h1 className="text-3xl font-black italic text-red-500 uppercase">Weakness</h1>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">弱点克服 · 逆风修行</p>
      </header>

      {/* 当前正在克服的弱点卡片 */}
      <section className="mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 rounded-[2.5rem] bg-gradient-to-br from-red-500/20 to-zinc-900 border border-red-500/30 backdrop-blur-3xl"
        >
          <div className="flex items-center gap-2 mb-4 text-red-400">
            <ShieldAlert size={16} />
            <span className="text-[10px] font-bold tracking-widest uppercase">核心内耗：执行力差</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 italic">对抗“空想主义”</h2>
          
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 mb-6">
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              “今日你的‘食伤’能量过重，容易陷入完美的蓝图而迟迟不动手。修行指令：立刻去做那件你最想逃避的 5 分钟小事。”
            </p>
          </div>

          <button className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95">
            <Zap size={18} fill="currentColor" />
            完成今日对抗
          </button>
        </motion.div>
      </section>

      {/* 锁定区域：进阶分析 */}
      <section className="space-y-4 opacity-50">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">深度分析报告</h3>
          <Lock size={12} />
        </div>
        <div className="p-5 bg-zinc-900/50 rounded-3xl border border-white/5 text-xs italic">
           从八字财官印看你的职业盲点...
        </div>
      </section>
    </main>
  );
}
