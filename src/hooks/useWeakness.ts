/**
 * 5. 联动逻辑：粒子成就系统 (PRD 3.6)
当用户完成弱点练习时，不仅要改变本地数据库，还要解锁特殊的粒子效果。
 */
import { db } from '@/lib/db'; // 1. 关键导入：确保路径正确
// 2. 完善 Hook 结构（确保它是一个符合 React 规范的 Hook）
export const useWeakness = () => {
  
  const completePractice = async (id: number) => {
    // 3. 现在这里的 db 就能被识别了
    await db.weaknessPractices.update(id, { isCompleted: true });
    
    // 触发“成就粒子”：金色粒子汇聚成光束（PRD 3.6）
    window.dispatchEvent(new CustomEvent('special-effect', { 
      detail: { type: 'ACHIEVEMENT_BEAM', color: '#FFD700' } 
    }));
    
    console.log(`修行打卡成功：ID ${id}`);
  };

  return { completePractice };
};
