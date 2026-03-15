/**
 * 4. 交互组件：修行卡片 (components/weakness/PracticeCard.tsx)
采用 PRD 7.2 节要求的“卡片翻转”和“成就反馈”动效。*/
"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Trophy } from 'lucide-react';

export const PracticeCard = ({ practice, onComplete }: any) => {
  return (
    <motion.div 
      layout
      className="relative w-full min-h-[200px] rounded-3xl p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800"
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-red-500 w-5 h-5" />
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">每日修行 · 弱点克制</span>
      </div>

      <h3 className="text-xl font-bold mb-2">对抗{practice.name}</h3>
      <p className="text-sm text-zinc-400 mb-6 italic">“{practice.insight}”</p>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
        <p className="text-gold-400 font-medium">{practice.instruction}</p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onComplete}
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            practice.isCompleted ? 'bg-green-500' : 'bg-gold-600'
          }`}
        >
          {practice.isCompleted ? <Trophy className="text-black w-5 h-5" /> : <Zap className="text-black w-5 h-5" />}
        </motion.button>
      </div>

      {/* 连续天数勋章 */}
      {practice.streak > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
          STREAK {practice.streak}
        </div>
      )}
    </motion.div>
  );
};
