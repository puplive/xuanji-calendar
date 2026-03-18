import { D1Database } from '@cloudflare/workers-types';

// 定义环境变量类型
export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

// 数据库查询包装器
export class D1Client {
  constructor(private db: D1Database) {}

  // 用户相关操作
  async createUser(userData: {
    id: string;
    email: string;
    passwordHash: string;
    birthDate?: string;
    mbti?: string;
    zodiac?: string;
  }) {
    const now = Date.now();
    return this.db.prepare(`
      INSERT INTO users (
        id, email, password_hash, birth_date, mbti, zodiac,
        created_at, updated_at, membership_type, points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FREE', 0)
    `).bind(
      userData.id,
      userData.email,
      userData.passwordHash,
      userData.birthDate || null,
      userData.mbti || null,
      userData.zodiac || null,
      now,
      now
    ).run();
  }

  async getUserByEmail(email: string) {
    return this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first();
  }

  async getUserById(id: string) {
    return this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first();
  }

  async updateUserProfile(id: string, updates: {
    birthDate?: string;
    mbti?: string;
    zodiac?: string;
    membershipType?: string;
    points?: number;
  }) {
    const fields = [];
    const values = [];

    if (updates.birthDate !== undefined) {
      fields.push('birth_date = ?');
      values.push(updates.birthDate);
    }
    if (updates.mbti !== undefined) {
      fields.push('mbti = ?');
      values.push(updates.mbti);
    }
    if (updates.zodiac !== undefined) {
      fields.push('zodiac = ?');
      values.push(updates.zodiac);
    }
    if (updates.membershipType !== undefined) {
      fields.push('membership_type = ?');
      values.push(updates.membershipType);
    }
    if (updates.points !== undefined) {
      fields.push('points = ?');
      values.push(updates.points);
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    return this.db.prepare(`
      UPDATE users SET ${fields.join(', ')} WHERE id = ?
    `).bind(...values).run();
  }

  // 目标相关操作
  async createGoal(goalData: {
    localId: string;
    userId: string;
    name: string;
    type: 'study' | 'health' | 'work' | 'emotion' | 'other';
    totalDays: number;
    startDate: string;
    progress: number;
    status: 'active' | 'completed' | 'failed';
    checkins: string; // JSON字符串
  }) {
    const now = Date.now();
    return this.db.prepare(`
      INSERT INTO goals (
        local_id, user_id, name, type, total_days, start_date,
        progress, status, checkins, created_at, updated_at, sync_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      goalData.localId,
      goalData.userId,
      goalData.name,
      goalData.type,
      goalData.totalDays,
      goalData.startDate,
      goalData.progress,
      goalData.status,
      goalData.checkins,
      now,
      now
    ).run();
  }

  async getGoalsByUserId(userId: string) {
    return this.db.prepare(`
      SELECT * FROM goals
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();
  }

  async updateGoal(localId: string, updates: {
    progress?: number;
    status?: string;
    checkins?: string;
    syncVersion?: number;
  }) {
    const fields = [];
    const values = [];

    if (updates.progress !== undefined) {
      fields.push('progress = ?');
      values.push(updates.progress);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.checkins !== undefined) {
      fields.push('checkins = ?');
      values.push(updates.checkins);
    }
    if (updates.syncVersion !== undefined) {
      fields.push('sync_version = ?, last_synced_at = ?');
      values.push(updates.syncVersion, Date.now());
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(localId);

    return this.db.prepare(`
      UPDATE goals SET ${fields.join(', ')} WHERE local_id = ?
    `).bind(...values).run();
  }

  // 弱点实践相关操作
  async createWeaknessPractice(practiceData: {
    localId: string;
    userId: string;
    weaknessId: string;
    date: string;
    content: string;
    isCompleted: boolean;
    streak: number;
  }) {
    const now = Date.now();
    return this.db.prepare(`
      INSERT INTO weakness_practices (
        local_id, user_id, weakness_id, date, content,
        is_completed, streak, created_at, updated_at, sync_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      practiceData.localId,
      practiceData.userId,
      practiceData.weaknessId,
      practiceData.date,
      practiceData.content,
      practiceData.isCompleted ? 1 : 0,
      practiceData.streak,
      now,
      now
    ).run();
  }

  async getPracticesByUserId(userId: string) {
    return this.db.prepare(`
      SELECT * FROM weakness_practices
      WHERE user_id = ?
      ORDER BY date DESC
    `).bind(userId).all();
  }

  async updatePractice(localId: string, updates: {
    isCompleted?: boolean;
    streak?: number;
    syncVersion?: number;
  }) {
    const fields = [];
    const values = [];

    if (updates.isCompleted !== undefined) {
      fields.push('is_completed = ?');
      values.push(updates.isCompleted ? 1 : 0);
    }
    if (updates.streak !== undefined) {
      fields.push('streak = ?');
      values.push(updates.streak);
    }
    if (updates.syncVersion !== undefined) {
      fields.push('sync_version = ?, last_synced_at = ?');
      values.push(updates.syncVersion, Date.now());
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(localId);

    return this.db.prepare(`
      UPDATE weakness_practices SET ${fields.join(', ')} WHERE local_id = ?
    `).bind(...values).run();
  }

  // 同步相关操作
  async getSyncChanges(userId: string, since: number) {
    return this.db.prepare(`
      SELECT * FROM sync_logs
      WHERE user_id = ? AND created_at > ?
      ORDER BY created_at ASC
    `).bind(userId, since).all();
  }

  async logSyncChange(changeData: {
    userId: string;
    tableName: string;
    recordId: string;
    operation: 'create' | 'update' | 'delete';
    oldData?: string;
    newData?: string;
    syncVersion: number;
  }) {
    return this.db.prepare(`
      INSERT INTO sync_logs (
        user_id, table_name, record_id, operation,
        old_data, new_data, sync_version, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      changeData.userId,
      changeData.tableName,
      changeData.recordId,
      changeData.operation,
      changeData.oldData || null,
      changeData.newData || null,
      changeData.syncVersion,
      Date.now()
    ).run();
  }
}

// 工具函数：从请求中获取环境变量
export function getEnv(request: Request): Env {
  // 在实际部署中，这些环境变量由Cloudflare Workers提供
  // 在本地开发时，可能需要模拟
  return (request as any).env as Env;
}