// components/goals/GoalCard.tsx
/**由于这个组件需要触发首页的 Canvas 粒子特效，我们需要使用 自定义事件 (Custom Event) 来跨组件通信。 */
/**下一步： 你需要在你的首页组件（如 app/home/page.tsx）中引入这个卡片，并确保你的 Canvas 组件已经写好了 window.addEventListener('goal-checkin', ...) 的监听逻辑。 */
"use client";

// import { motion } from 'framer-motion';
// import { CheckCircle2, Target, Trophy } from 'lucide-react';
// import { db } from '@/lib/db'; // 确保你的 Dexie 数据库实例路径正确

// interface GoalCardProps {
//   goal: {
//     id: number;
//     name: string;
//     progress: number;
//     type: string;
//   };
//   advice?: string; // AI 生成的每日微指引
// }

// export const GoalCard = ({ goal, advice }: GoalCardProps) => {
  
//   const handleCheckin = async () => {
//     // 1. 更新本地数据库进度
//     const newProgress = Math.min(goal.progress + 10, 100);
//     await db.goals.update(goal.id, { progress: newProgress });

//     // 2. 发送自定义事件给首页的 Canvas 粒子系统
//     // 事件名称: 'goal-checkin'
//     // 携带数据: 目标的类型，让粒子根据目标类型（如健康-绿色）改变爆发颜色
//     const event = new CustomEvent('goal-checkin', { 
//       detail: { 
//         type: goal.type,
//         isCompleted: newProgress === 100 
//       } 
//     });
//     window.dispatchEvent(event);
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0 }}
//       whileHover={{ scale: 1.01 }}
//       className="relative group bg-zinc-900/40 border border-white/5 backdrop-blur-xl p-5 rounded-3xl overflow-hidden mb-4"
//     >
//       {/* 顶部信息 */}
//       <div className="flex justify-between items-start relative z-10">
//         <div className="flex gap-4">
//           <div className="p-3 bg-gold-500/10 rounded-2xl border border-gold-500/20">
//             <Target className="w-5 h-5 text-gold-500" />
//           </div>
//           <div>
//             <h3 className="text-white font-bold text-lg leading-tight">{goal.name}</h3>
//             <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
//               当前进度: {goal.progress}%
//             </p>
//           </div>
//         </div>

//         {/* 打卡按钮 */}
//         <motion.button 
//           whileTap={{ scale: 0.85 }}
//           onClick={handleCheckin}
//           disabled={goal.progress >= 100}
//           className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
//             goal.progress >= 100 
//             ? 'bg-green-500/20 border-green-500/40 text-green-500' 
//             : 'bg-gold-600 hover:bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
//           }`}
//         >
//           {goal.progress >= 100 ? <Trophy size={20} /> : <CheckCircle2 size={24} />}
//         </motion.button>
//       </div>

//       {/* AI 每日指引（PRD 3.5 核心逻辑） */}
//       {advice && (
//         <div className="mt-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
//           <p className="text-xs text-gold-400/80 italic leading-relaxed font-light">
//             “{advice}”
//           </p>
//         </div>
//       )}

//       {/* 底部进度条逻辑 */}
//       <div className="w-full bg-zinc-800/50 h-[2px] mt-6 rounded-full overflow-hidden">
//         <motion.div 
//           initial={{ width: 0 }}
//           animate={{ width: `${goal.progress}%` }}
//           transition={{ duration: 1, ease: "circOut" }}
//           className="h-full bg-gradient-to-r from-gold-600 to-yellow-300"
//         />
//       </div>

//       {/* 鼠标悬停时的微弱发光背景 */}
//       <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
//     </motion.div>
//   );
// };

// src/components/goals/GoalCard.tsx
"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, Trophy, Target } from 'lucide-react';

// 1. 完善接口定义，增加 advice 属性
interface GoalCardProps {
  goal: {
    id?: number;
    name: string;
    progress: number;
    type: string;
  };
  onComplete?: (id: number) => void; // 设为可选，防止报错
  advice?: string; // 增加这个属性，解决报错
}

export const GoalCard = ({ goal, onComplete, advice }: GoalCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="relative group bg-zinc-900/40 border border-white/5 backdrop-blur-xl p-5 rounded-3xl overflow-hidden mb-4"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex gap-4">
          <div className="p-3 bg-gold-500/10 rounded-2xl border border-gold-500/20">
            <Target className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">{goal.name}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              当前进度: {goal.progress}%
            </p>
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => goal.id && onComplete?.(goal.id)}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
            goal.progress >= 100 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-gold-600 text-black'
          }`}
        >
          {goal.progress >= 100 ? <Trophy size={18} /> : <CheckCircle2 size={20} />}
        </motion.button>
      </div>

      {/* 渲染传入的建议文本 */}
      {advice && (
        <div className="mt-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gold-400/80 italic leading-relaxed">
            “{advice}”
          </p>
        </div>
      )}

      {/* 进度条逻辑 */}
      <div className="w-full bg-zinc-800/50 h-[2px] mt-6 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          className="h-full bg-gold-500"
        />
      </div>
    </motion.div>
  );
};




// "use client";
// import { motion } from 'framer-motion';
// import { CheckCircle2 } from 'lucide-react';

// export const GoalCard = ({ goal, onComplete }) => {
//   return (
//     <motion.div 
//       whileHover={{ scale: 1.02 }}
//       className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl backdrop-blur-xl"
//     >
//       <div className="flex justify-between items-center">
//         <div>
//           <h3 className="text-gold-400 font-medium">{goal.name}</h3>
//           <p className="text-xs text-zinc-500 mt-1">当前进度: {goal.progress}%</p>
//         </div>
//         <button 
//           onClick={onComplete}
//           className="h-12 w-12 rounded-full border border-gold-500/30 flex items-center justify-center hover:bg-gold-500/10 transition-colors"
//         >
//           <CheckCircle2 className="text-gold-500" />
//         </button>
//       </div>
//       {/* 进度条 */}
//       <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden">
//         <motion.div 
//           initial={{ width: 0 }}
//           animate={{ width: `${goal.progress}%` }}
//           className="h-full bg-gold-500"
//         />
//       </div>
//     </motion.div>
//   );
// };
