"use client";
import { motion } from 'framer-motion';
import { Target, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const GoalItem = ({ goal, onCheckin, advice }: any) => {
  const t = useTranslations('GoalItem');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/80 border border-white/10 p-5 rounded-3xl backdrop-blur-xl mb-4 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex gap-3">
          <div className="p-3 bg-gold-500/20 rounded-2xl">
            <Target className="text-gold-500 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{goal.name}</h3>
            <p className="text-xs text-zinc-500">{t('progressLabel', { days: goal.checkins.length, totalDays: goal.totalDays })}</p>
          </div>
        </div>

        <button
          onClick={() => onCheckin(goal.id)}
          className="bg-gold-600 hover:bg-gold-500 p-2 rounded-full transition-transform active:scale-90"
        >
          <CheckCircle className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* AI 动态指引 */}
      <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5">
        <p className="text-xs text-gold-400 italic">&ldquo;{advice}&rdquo;</p>
      </div>

      {/* 进度条 */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${goal.progress}%` }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gold-600 to-yellow-400"
      />
    </motion.div>
  );
};
