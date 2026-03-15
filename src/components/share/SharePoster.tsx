/**2. 海报组件设计 (components/share/SharePoster.tsx)
海报的视觉逻辑：深黑底色 + 金色边框 + 几何雷达图 + 科技感排版。 */
"use client";
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { QRCanvas } from './QRCanvas'; // 假设已有的二维码组件

/**
 * 3. 微调逻辑：如何让海报更具“转发性”？
为了让用户更愿意发朋友圈，我们在代码中加入以下微调：

A. 冲突感文案 (PRD 3.3)

逻辑：如果用户的 MBTI 与 八字 存在冲突（如：INTJ 这种理性的性格，八字却是感性极强的“食伤旺”）。
代码实现：AI 在生成海报文案时，优先强调这种矛盾性。
文案示例：“你拥有最冷静的大脑，却跳动着一颗最不安分的心。这种撕裂，正是你创造力的源泉。”
B. 稀有度勋章

逻辑：根据算法，如果用户的五行得分非常极端（如某项超过 60%）。
代码实现：在海报右上角自动盖上一枚金色电子钢印，写着：“ 特质：纯正木气” 或 “ 稀有：五行平衡者”。
C. 动态配色 (PRD 7.1)

逻辑：海报边框和文字颜色根据 wuxingScores 动态改变。
 */
const posterTheme = {
  mu: 'border-emerald-500 text-emerald-500',
  huo: 'border-rose-500 text-rose-500',
  // ...
}[topElement];

export const SharePoster = ({ profile, guidance, wuxing }: any) => {
  const posterRef = useRef<HTMLDivElement>(null);

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
      {/* 隐藏的待生成区域 */}
      <div 
        ref={posterRef}
        className="w-[375px] bg-black p-8 relative overflow-hidden border-[1px] border-gold-900/30"
        style={{ fontFamily: 'var(--font-geist-sans)' }}
      >
        {/* 背景装饰：淡化的八卦底纹 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] border-[20px] border-white rounded-full rotate-45" />
        </div>

        {/* 头部：日期与星象 */}
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

        {/* 核心：五行雷达图 (简易版) */}
        <div className="relative z-10 h-48 w-full flex items-center justify-center mb-8">
           {/* 这里可以使用简单的 SVG 实现五行多边形 */}
           <svg viewBox="0 0 100 100" className="w-40 h-40">
             <polygon 
               points="50,10 90,40 75,90 25,90 10,40" 
               fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.5"
             />
             {/* 实际动态顶点根据 wuxing 权重计算 */}
             <polygon 
               points="50,20 80,45 70,80 30,75 15,35" 
               fill="rgba(212,175,55,0.4)" stroke="#D4AF37" strokeWidth="1.5"
             />
             <text x="45" y="8" fill="#D4AF37" fontSize="5">木</text>
             <text x="92" y="42" fill="#D4AF37" fontSize="5">火</text>
             {/* ...其他点省略 */}
           </svg>
        </div>

        {/* 用户画像标签 */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['INTJ', '身旺', '喜水木', '战略家'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* AI 箴言 */}
        <div className="relative z-10 mb-10">
          <div className="text-gold-500 text-4xl font-serif absolute -top-4 -left-2 opacity-20">“</div>
          <p className="text-zinc-200 text-lg leading-relaxed font-light px-4 italic">
            {guidance || "逻辑是你的骨骼，直觉是你的眼睛。今日宜静心深耕，忌盲目扩张。"}
          </p>
        </div>

        {/* 底部：二维码与版权 */}
        <div className="flex justify-between items-center border-t border-zinc-800 pt-6">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 bg-white p-1 rounded-lg">
               <div className="w-full h-full bg-black flex items-center justify-center text-[6px] text-white">QR CODE</div>
            </div>
            <div>
              <p className="text-xs text-white font-bold tracking-tight">扫码开启你的玄机命盘</p>
              <p className="text-[8px] text-zinc-500 italic mt-1 underline">https://xuanji.ai/invite/{profile.userId}</p>
            </div>
          </div>
          <div className="text-[8px] text-zinc-700 vertical-rl rotate-180">
            © 2026 XUANJI LAB ALL RIGHTS RESERVED
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <button 
        onClick={handleDownload}
        className="px-8 py-4 bg-white text-black font-black rounded-full shadow-2xl hover:scale-105 transition active:scale-95"
      >
        保存海报至相册
      </button>
    </div>
  );
};
