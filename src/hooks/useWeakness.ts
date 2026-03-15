/**
 * 5. 联动逻辑：粒子成就系统 (PRD 3.6)
当用户完成弱点练习时，不仅要改变本地数据库，还要解锁特殊的粒子效果。
 */
const completePractice = async (id: number) => {
  await db.weaknessPractices.update(id, { isCompleted: true });
  
  // 触发“成就粒子”：金色粒子汇聚成光束
  window.dispatchEvent(new CustomEvent('special-effect', { 
    detail: { type: 'ACHIEVEMENT_BEAM', color: '#FFD700' } 
  }));
};
