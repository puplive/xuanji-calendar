/**3. 法律合规：免责声明弹窗 (components/legal/Disclaimer.tsx)
根据 PRD 9.1 节，必须显著标注“非医疗/非决策建议”，以规避法律风险。 */
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Disclaimer = () => {
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
            <h2 className="text-xl font-bold text-gold-500 mb-4">知情告知与免责声明</h2>
            <div className="text-sm text-zinc-400 space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2">
              <p>1. 本产品定位为个人成长助手与娱乐工具，所有内容（包含但不限于每日指引、姻缘配对）均由 AI 生成，不代表医学、心理学或专业法律建议。</p>
              <p>2. 测算结果基于传统民俗逻辑与性格模型，仅供娱乐参考。请勿将其作为重大决策（如投资、婚姻、医疗）的唯一依据。</p>
              <p>3. 您的个人出生信息将优先加密存储于本地设备。开启云同步即代表您同意我们将加密后的脱敏数据进行存储。</p>
            </div>
            <button 
              onClick={handleAgree}
              className="w-full mt-8 bg-gold-600 py-3 rounded-2xl text-black font-bold active:scale-95 transition"
            >
              我已阅读并知晓
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
