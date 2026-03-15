/**4. 数据擦除逻辑：彻底销毁档案 (hooks/usePrivacy.ts)
提供一键“彻底忘记我”的功能。 */
import { db } from '@/lib/db';

export const usePrivacy = () => {
  const clearAllData = async () => {
    // 1. 清除 IndexedDB 所有表
    await Promise.all([
      db.profiles.clear(),
      db.goals.clear(),
      db.dailyCaches.clear(),
      db.weaknessPractices.clear()
    ]);

    // 2. 清除 LocalStorage 和 SessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 3. 强制刷新页面回到初始化状态
    window.location.href = '/setup';
  };

  return { clearAllData };
};
