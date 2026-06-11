"use client";
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const PracticeCard = ({ practice, onComplete }: any) => {
  const t = useTranslations('PracticeCard');

  return (
    <motion.div
      layout
      className="relative w-full min-h-[200px] rounded-3xl p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800"
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="text-red-500 w-5 h-5" />
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">{t('header')}</span>
      </div>

      <h3 className="text-xl font-bold mb-2">{t('against', { name: practice.name })}</h3>
      <p className="text-sm text-zinc-400 mb-6 italic">&ldquo;{practice.insight}&rdquo;</p>

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
          {t('streakBadge', { count: practice.streak })}
        </div>
      )}
    </motion.div>
  );
};
