"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export const Disclaimer = () => {
  const t = useTranslations('Disclaimer');
  const [agreed, setAgreed] = useState(true);

  useEffect(() => {
    const hasAgreed = localStorage.getItem('xuanji_legal_agreed');
    if (!hasAgreed) setAgreed(false);
  }, []);

  const handleAgree = () => {
    localStorage.setItem('xuanji_legal_agreed', 'true');
    setAgreed(true);
  };

  return (
    <AnimatePresence>
      {!agreed && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-gold-500 mb-4">{t('title')}</h2>
            <div className="text-sm text-zinc-400 space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2">
              <p>{t('point1')}</p>
              <p>{t('point2')}</p>
              <p>{t('point3')}</p>
            </div>
            <button
              onClick={handleAgree}
              className="w-full mt-8 bg-gold-600 py-3 rounded-2xl text-black font-bold active:scale-95 transition"
            >
              {t('agreeButton')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
