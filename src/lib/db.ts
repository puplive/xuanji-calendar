/**
 * 根据 PRD 4.2 节 的要求，本产品采用“隐私优先、本地存储”的逻辑。为了处理复杂的对象（如目标、弱点、每日指引缓存），我们不建议仅使用简单的 localStorage（容量小且仅支持字符串），而是使用 IndexedDB。

我们将使用 Dexie.js（IndexedDB 的高性能封装库）来构建持久化层，并配合 React Hook 实现 UI 的实时响应。

定义符合 PRD 5.1-5.4 规范的数据库表结构。
 */
import Dexie, { type Table } from 'dexie';

// 定义数据库表接口
export interface UserProfile {
  id?: number;
  userId: string;
  birthDate: string;
  mbti: string;
  zodiac: string;
  bazi: any;
  wuxingScores: any;
  strengthStatus: string;
  updatedAt: number;
}

/**
 * 根据 PRD 3.5 节，目标管理模块不仅是一个简单的 Todo List，它的核心灵魂在于**“玄学驱动”——即根据用户的八字五行得分和每日黄历宜忌**，动态生成个性化的激励指引和粒子反馈。

我们将构建一个包含数据库操作、AI 引导逻辑、以及前端交互的完整模块。

1. 数据库扩展 (lib/db.ts)
首先，在之前的 XuanjiDB 类中增加打卡记录表，用于追踪进度。
 */
export interface Goal {
  isCompleted: boolean;
  id?: number;
  userId: string;
  name: string;        // 目标名称，如“每日冥想”
  type: 'study' | 'health' | 'work' | 'emotion' | 'other';
  totalDays: number;   // 周期：7/21/30天
  startDate: string;   // YYYY-MM-DD
  progress: number;    // 0-100
  status: 'active' | 'completed' | 'failed';
  checkins: { date: string; value: number }[]; // 打卡记录
  createdAt: number;
}
// 确保 XuanjiDB 构造函数包含：
// this.version(2).stores({ goals: '++id, userId, type, status' });

export interface DailyCache {
  date: string; // 主键: YYYY-MM-DD
  content: string;
  huangli: any;
}

/**在 IndexedDB 中增加 weaknessPractices 表，记录每日修行的完成情况。 */
export interface WeaknessPractice {
  id?: number;
  weaknessId: string;
  date: string;       // YYYY-MM-DD
  content: string;    // AI生成的每日具体练习
  isCompleted: boolean;
  streak: number;     // 连续天数
}

// db.version(3).stores({ weaknessPractices: '++id, weaknessId, date, isCompleted' });


// 初始化数据库
export class XuanjiDB extends Dexie {
  profiles!: Table<UserProfile>;
  goals!: Table<Goal>;
  dailyCaches!: Table<DailyCache>;

  constructor() {
    super('XuanjiDB');
    this.version(1).stores({
      profiles: '++id, userId, mbti',
      goals: '++id, name, type',
      dailyCaches: 'date' // 以日期为唯一索引，方便缓存查询
    });
  }
}



export const db = new XuanjiDB();
