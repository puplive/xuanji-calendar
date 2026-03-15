/**3. 前端交互：付费墙组件 (components/premium/Paywall.tsx)
根据 PRD 8.3，深度报告需要付费解锁。我们用 Framer Motion 做一个极具诱惑力的遮罩效果。 */




"use client"; // 必须声明为客户端组件

import React, { useEffect } from 'react'; // 1. 导入 useEffect
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
// import { trackEvent } from '@/lib/analytics'; // 确保你已经创建并导出了埋点函数

interface PaywallProps {
  onUnlock: (productId: string) => void;
}

export const DeepReportPaywall = ({ onUnlock }: PaywallProps) => {
  
  // 2. 将 useEffect 移动到组件函数内部
  useEffect(() => {
    // 埋点统计：用户看到了付费墙
    // trackEvent('paywall_view', { 
    //   productId: 'MATCH_REPORT_DEEP',
    //   from: 'match_page_bottom' 
    // });
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

        <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter italic">解锁深度因缘羁绊</h3>
        
        <p className="text-zinc-400 text-xs mb-8 leading-relaxed px-4">
          包含未来三年的感情运势波动曲线、<br/>
          基于八字合婚的“宿命避雷针”、<br/>
          以及 AI 生成的 3000 字相处秘籍。
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onUnlock('MATCH_REPORT_DEEP')}
            className="w-full bg-[#D4AF37] hover:bg-[#FFD700] text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition-all"
          >
            立即开启 · ¥9.9
          </button>
          <p className="text-[10px] text-zinc-600">点击即代表同意《用户增值服务协议》</p>
        </div>
      </div>
    </div>
  );
};


