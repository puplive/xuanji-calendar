/**3. 前端交互：付费墙组件 (components/premium/Paywall.tsx)
根据 PRD 8.3，深度报告需要付费解锁。我们用 Framer Motion 做一个极具诱惑力的遮罩效果。 */




"use client";
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

/**B. 付费墙转化埋点 (验证 PRD 8.3)
在 components/premium/Paywall.tsx 中加入：

 */
useEffect(() => {
  trackEvent('paywall_view', { 
    productId: 'MATCH_REPORT_DEEP',
    from: 'match_page_bottom' 
  });
}, []);

const handlePay = () => {
  trackEvent('purchase_attempt', { productId: 'MATCH_REPORT_DEEP' });
  // ...支付逻辑
};
export const DeepReportPaywall = ({ onUnlock }: any) => {
  return (
    <div className="relative mt-10 p-1 rounded-3xl bg-gradient-to-b from-gold-500/50 to-transparent">
      <div className="bg-zinc-950 rounded-[22px] p-8 text-center backdrop-blur-3xl">
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="inline-block p-4 bg-gold-500/20 rounded-full mb-6"
        >
          <Lock className="text-gold-500 w-8 h-8" />
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2">解锁深度因缘羁绊</h3>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          包含：未来三年的感情运势波动曲线、<br/>
          基于八字合婚的“宿命避雷针”、<br/>
          以及 AI 生成的 3000 字相处秘籍。
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => onUnlock('MATCH_REPORT_DEEP')}
            className="w-full bg-gold-600 hover:bg-gold-500 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition"
          >
            立即开启 · ¥9.9
          </button>
          <p className="text-[10px] text-zinc-600">点击即代表同意《用户增值服务协议》</p>
        </div>
      </div>

      {/* 模糊的内容预览图 */}
      <div className="absolute inset-x-0 -bottom-20 h-40 bg-gradient-to-t from-zinc-950 to-transparent z-[-1] blur-sm opacity-30">
        <div className="w-full h-full border border-gold-500/20 rounded-3xl" />
      </div>
    </div>
  );
};


