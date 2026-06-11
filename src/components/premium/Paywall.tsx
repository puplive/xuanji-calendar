"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PaywallProps {
  onUnlock: (productId: string) => void;
}

export const DeepReportPaywall = ({ onUnlock }: PaywallProps) => {
  const t = useTranslations('Paywall');

  useEffect(() => {
    console.log("付费墙已曝光: MATCH_REPORT_DEEP");
  }, []);

  return (
    <div className="relative mt-10 p-1 rounded-3xl bg-gradient-to-b from-[#D4AF37]/50 to-transparent">
      <div className="bg-zinc-950 rounded-[22px] p-8 text-center backdrop-blur-3xl">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="inline-block p-4 bg-[#D4AF37]/20 rounded-full mb-6"
        >
          <Lock className="text-[#D4AF37] w-8 h-8" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter italic">{t('title')}</h3>

        <p className="text-zinc-400 text-xs mb-8 leading-relaxed px-4">
          {t('feature1')}<br/>
          {t('feature2')}<br/>
          {t('feature3')}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onUnlock('MATCH_REPORT_DEEP')}
            className="w-full bg-[#D4AF37] hover:bg-[#FFD700] text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition-all"
          >
            {t('ctaButton')}
          </button>
          <p className="text-[10px] text-zinc-600">{t('terms')}</p>
        </div>
      </div>
    </div>
  );
};
