"use client";
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { QRCanvas } from './QRCanvas';
import { useTranslations } from 'next-intl';

type ElementKey = 'mu' | 'huo' | 'tu' | 'jin' | 'shui';

const posterTheme: Record<ElementKey, string> = {
  mu: 'border-emerald-500/30 text-emerald-500',
  huo: 'border-rose-500/30 text-rose-500',
  tu: 'border-amber-500/30 text-amber-500',
  jin: 'border-zinc-300/30 text-zinc-300',
  shui: 'border-blue-500/30 text-blue-500',
};

export const SharePoster = ({ profile, guidance, wuxing }: any) => {
  const t = useTranslations('Share');
  const posterRef = useRef<HTMLDivElement>(null);

  const topElement = Object.entries(wuxing || {})
    .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] as ElementKey || 'mu';

  const themeClass = posterTheme[topElement];

  const handleDownload = async () => {
    if (posterRef.current === null) return;
    const dataUrl = await toPng(posterRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = `xuanji-report-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={posterRef}
        className={`w-[375px] bg-black p-8 relative overflow-hidden border-[1px] border-gold-900/30 ${themeClass}`}
        style={{ fontFamily: 'var(--font-geist-sans)' }}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] border-[20px] border-white rounded-full rotate-45" />
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-gold-500/20 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-gold-500 text-2xl font-black tracking-tighter italic">XUANJI AI</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Cyber Metaphysics Lab</p>
          </div>
          <div className="text-right">
            <p className="text-white text-lg font-mono leading-none">{new Date().toLocaleDateString()}</p>
            <p className="text-gold-600 text-[10px] mt-1 italic">{profile.bazi.ganzhi}</p>
          </div>
        </div>

        {/* Wuxing Radar */}
        <div className="relative z-10 h-48 w-full flex items-center justify-center mb-8">
           <svg viewBox="0 0 100 100" className="w-40 h-40">
             <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5" />
             <polygon points="50,20 80,45 70,80 30,75 15,35" fill="rgba(212,175,55,0.4)" stroke="#D4AF37" strokeWidth="1.5" />
             <text x="45" y="8" fill="#D4AF37" fontSize="5">木</text>
             <text x="92" y="42" fill="#D4AF37" fontSize="5">火</text>
           </svg>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['INTJ', '身旺', '喜水木', '战略家'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* AI Wisdom */}
        <div className="relative z-10 mb-10">
          <div className="text-gold-500 text-4xl font-serif absolute -top-4 -left-2 opacity-20">&ldquo;</div>
          <p className="text-zinc-200 text-lg leading-relaxed font-light px-4 italic">
            {guidance || t('defaultGuidance')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-zinc-800 pt-6">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-white p-1 rounded-lg">
                <QRCanvas url={`https://xuanji.ai/invite/${profile?.userId}`} />
               <div className="w-full h-full bg-black flex items-center justify-center text-[6px] text-white">QR CODE</div>
            </div>
            <div>
              <p className="text-xs text-white font-bold tracking-tight">{t('scanLabel')}</p>
              <p className="text-[8px] text-zinc-500 italic mt-1 underline">https://xuanji.ai/invite/{profile.userId}</p>
            </div>
          </div>
          <div className="text-[8px] text-zinc-700 vertical-rl rotate-180">
            &copy; 2026 XUANJI LAB ALL RIGHTS RESERVED
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="px-8 py-4 bg-white text-black font-black rounded-full shadow-2xl hover:scale-105 transition active:scale-95"
      >
        {t('saveButton')}
      </button>
    </div>
  );
};
