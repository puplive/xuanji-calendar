import { db, Goal, WeaknessPractice, DailyCache } from './db';
import { D1Client } from './d1';

export type SyncStatus = 'pending' | 'synced' | 'conflict';
export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncChange {
  tableName: 'goals' | 'weaknessPractices' | 'dailyCaches';
  recordId: string; // localId
  operation: SyncOperation;
  oldData?: any;
  newData?: any;
  syncVersion: number;
}

export interface SyncResult {
  success: boolean;
  changesPushed: number;
  changesPulled: number;
  conflicts: number;
  error?: string;
}

export class SyncService {
  private d1Client: D1Client | null = null;
  private isSyncing = false;
  private syncQueue: Array<() => Promise<void>> = [];

  constructor(d1Client?: D1Client) {
    if (d1Client) {
      this.d1Client = d1Client;
    }
  }

  setD1Client(client: D1Client) {
    this.d1Client = client;
  }

  // 生成本地唯一ID
  generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取需要同步的本地更改
  async getLocalChanges(userId: string): Promise<SyncChange[]> {
    const changes: SyncChange[] = [];

    // 检查目标
    const pendingGoals = await db.goals
      .where('userId')
      .equals(userId)
      .and(goal => goal.syncStatus === 'pending')
      .toArray();

    for (const goal of pendingGoals) {
      changes.push({
        tableName: 'goals',
        recordId: goal.localId || goal.id?.toString() || '',
        operation: goal.id ? 'update' : 'create',
        newData: goal,
        syncVersion: goal.syncVersion || 1,
      });
    }

    // 检查弱点实践
    const pendingPractices = await db.weaknessPractices
      .where('userId')
      .equals(userId)
      .and(practice => practice.syncStatus === 'pending')
      .toArray();

    for (const practice of pendingPractices) {
      changes.push({
        tableName: 'weaknessPractices',
        recordId: practice.localId || practice.id?.toString() || '',
        operation: practice.id ? 'update' : 'create',
        newData: practice,
        syncVersion: practice.syncVersion || 1,
      });
    }

    // 检查每日缓存
    const pendingCaches = await db.dailyCaches
      .where('userId')
      .equals(userId)
      .and(cache => cache.syncStatus === 'pending')
      .toArray();

    for (const cache of pendingCaches) {
      changes.push({
        tableName: 'dailyCaches',
        recordId: cache.localId || cache.date,
        operation: 'update',
        newData: cache,
        syncVersion: cache.syncVersion || 1,
      });
    }

    return changes;
  }

  // 推送本地更改到云端
  async pushChanges(userId: string, token?: string): Promise<number> {
    const changes = await this.getLocalChanges(userId);
    if (changes.length === 0) return 0;

    // 如果有 D1Client，使用它（服务器端）
    if (this.d1Client) {
      let pushedCount = 0;
      for (const change of changes) {
        try {
          switch (change.tableName) {
            case 'goals':
              await this.syncGoal(change, userId);
              break;
            case 'weaknessPractices':
              await this.syncPractice(change, userId);
              break;
            case 'dailyCaches':
              await this.syncDailyCache(change, userId);
              break;
          }
          pushedCount++;
        } catch (error) {
          console.error(`Failed to sync ${change.tableName} ${change.recordId}:`, error);
          await this.markConflict(change.tableName, change.recordId, userId);
        }
      }
      return pushedCount;
    }

    // 客户端：通过 API 路由推送
    try {
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, changes }),
      });

      if (!response.ok) {
        throw new Error(`Push failed with status ${response.status}`);
      }

      const result = await response.json() as any;
      if (result.success) {
        // 标记本地记录为已同步
        for (const change of changes) {
          await this.markSynced(change.tableName, change.recordId, userId);
        }
        return result.pushed || changes.length;
      } else {
        throw new Error(result.error || 'Push failed');
      }
    } catch (error) {
      console.error('Failed to push changes via API:', error);
      // 标记所有更改冲突
      for (const change of changes) {
        await this.markConflict(change.tableName, change.recordId, userId);
      }
      return 0;
    }
  }

  // 同步目标
  private async syncGoal(change: SyncChange, userId: string) {
    if (!this.d1Client) return;

    const goal = change.newData as Goal;
    const localId = goal.localId || this.generateLocalId();

    if (change.operation === 'create') {
      await this.d1Client.createGoal({
        localId,
        userId,
        name: goal.name,
        type: goal.type,
        totalDays: goal.totalDays,
        startDate: goal.startDate,
        progress: goal.progress,
        status: goal.status,
        checkins: JSON.stringify(goal.checkins || []),
      });
    } else {
      await this.d1Client.updateGoal(localId, {
        progress: goal.progress,
        status: goal.status,
        checkins: JSON.stringify(goal.checkins || []),
        syncVersion: (goal.syncVersion || 1) + 1,
      });
    }

    // 更新本地记录状态
    await db.goals.update(goal.id!, {
      syncStatus: 'synced',
      syncVersion: (goal.syncVersion || 1) + 1,
      lastSyncedAt: Date.now(),
      localId,
    });
  }

  // 同步弱点实践
  private async syncPractice(change: SyncChange, userId: string) {
    if (!this.d1Client) return;

    const practice = change.newData as WeaknessPractice;
    const localId = practice.localId || this.generateLocalId();

    if (change.operation === 'create') {
      await this.d1Client.createWeaknessPractice({
        localId,
        userId,
        weaknessId: practice.weaknessId,
        date: practice.date,
        content: practice.content,
        isCompleted: practice.isCompleted,
        streak: practice.streak,
      });
    } else {
      await this.d1Client.updatePractice(localId, {
        isCompleted: practice.isCompleted,
        streak: practice.streak,
        syncVersion: (practice.syncVersion || 1) + 1,
      });
    }

    // 更新本地记录状态
    await db.weaknessPractices.update(practice.id!, {
      syncStatus: 'synced',
      syncVersion: (practice.syncVersion || 1) + 1,
      lastSyncedAt: Date.now(),
      localId,
    });
  }

  // 同步每日缓存
  private async syncDailyCache(change: SyncChange, userId: string) {
    if (!this.d1Client) return;
    // 每日缓存同步逻辑待实现
    console.log('Daily cache sync not implemented yet');
  }

  // 从云端拉取更改
  async pullChanges(userId: string, token?: string): Promise<number> {
    // 如果有 D1Client，使用它（服务器端）
    if (this.d1Client) {
      try {
        // 获取云端目标
        const cloudGoals = await this.d1Client.getGoalsByUserId(userId);
        let pulledCount = 0;

        for (const cloudGoal of (cloudGoals.results as any[]) || []) {
          const existing = await db.goals
            .where('localId')
            .equals(cloudGoal.local_id)
            .first();

          if (existing) {
            // 检查冲突：云端版本更高则更新本地
            if ((cloudGoal.sync_version || 1) > (existing.syncVersion || 1)) {
              await db.goals.update(existing.id!, {
                name: cloudGoal.name,
                type: cloudGoal.type,
                totalDays: cloudGoal.total_days,
                startDate: cloudGoal.start_date,
                progress: cloudGoal.progress,
                status: cloudGoal.status,
                checkins: JSON.parse(cloudGoal.checkins || '[]'),
                syncStatus: 'synced',
                syncVersion: cloudGoal.sync_version,
                lastSyncedAt: Date.now(),
              });
              pulledCount++;
            }
          } else {
            // 新记录
            await db.goals.add({
              userId,
              name: cloudGoal.name,
              type: cloudGoal.type,
              totalDays: cloudGoal.total_days,
              startDate: cloudGoal.start_date,
              progress: cloudGoal.progress,
              status: cloudGoal.status,
              checkins: JSON.parse(cloudGoal.checkins || '[]'),
              isCompleted: cloudGoal.is_completed === 1,
              localId: cloudGoal.local_id,
              syncStatus: 'synced',
              syncVersion: cloudGoal.sync_version,
              lastSyncedAt: Date.now(),
              createdAt: cloudGoal.created_at,
            });
            pulledCount++;
          }
        }

        // 获取云端弱点实践
        const cloudPractices = await this.d1Client.getPracticesByUserId(userId);
        for (const cloudPractice of (cloudPractices.results as any[]) || []) {
          const existing = await db.weaknessPractices
            .where('localId')
            .equals(cloudPractice.local_id)
            .first();

          if (existing) {
            if ((cloudPractice.sync_version || 1) > (existing.syncVersion || 1)) {
              await db.weaknessPractices.update(existing.id!, {
                weaknessId: cloudPractice.weakness_id,
                date: cloudPractice.date,
                content: cloudPractice.content,
                isCompleted: cloudPractice.is_completed === 1,
                streak: cloudPractice.streak,
                syncStatus: 'synced',
                syncVersion: cloudPractice.sync_version,
                lastSyncedAt: Date.now(),
              });
              pulledCount++;
            }
          } else {
            await db.weaknessPractices.add({
              userId,
              weaknessId: cloudPractice.weakness_id,
              date: cloudPractice.date,
              content: cloudPractice.content,
              isCompleted: cloudPractice.is_completed === 1,
              streak: cloudPractice.streak,
              localId: cloudPractice.local_id,
              syncStatus: 'synced',
              syncVersion: cloudPractice.sync_version,
              lastSyncedAt: Date.now(),
            });
            pulledCount++;
          }
        }

        return pulledCount;
      } catch (error) {
        console.error('Failed to pull changes:', error);
        throw error;
      }
    }

    // 客户端：通过 API 路由拉取
    try {
      const response = await fetch('/api/sync/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId, since: 0 }),
      });

      if (!response.ok) {
        throw new Error(`Pull failed with status ${response.status}`);
      }

      const result = await response.json() as any;
      if (!result.success) {
        throw new Error(result.error || 'Pull failed');
      }

      const { goals, practices } = result.data;
      let pulledCount = 0;

      // 处理目标
      for (const cloudGoal of goals || []) {
        const existing = await db.goals
          .where('localId')
          .equals(cloudGoal.local_id)
          .first();

        if (existing) {
          if ((cloudGoal.sync_version || 1) > (existing.syncVersion || 1)) {
            await db.goals.update(existing.id!, {
              name: cloudGoal.name,
              type: cloudGoal.type,
              totalDays: cloudGoal.total_days,
              startDate: cloudGoal.start_date,
              progress: cloudGoal.progress,
              status: cloudGoal.status,
              checkins: JSON.parse(cloudGoal.checkins || '[]'),
              syncStatus: 'synced',
              syncVersion: cloudGoal.sync_version,
              lastSyncedAt: Date.now(),
            });
            pulledCount++;
          }
        } else {
          await db.goals.add({
            userId,
            name: cloudGoal.name,
            type: cloudGoal.type,
            totalDays: cloudGoal.total_days,
            startDate: cloudGoal.start_date,
            progress: cloudGoal.progress,
            status: cloudGoal.status,
            checkins: JSON.parse(cloudGoal.checkins || '[]'),
            isCompleted: cloudGoal.is_completed === 1,
            localId: cloudGoal.local_id,
            syncStatus: 'synced',
            syncVersion: cloudGoal.sync_version,
            lastSyncedAt: Date.now(),
            createdAt: cloudGoal.created_at,
          });
          pulledCount++;
        }
      }

      // 处理弱点实践
      for (const cloudPractice of practices || []) {
        const existing = await db.weaknessPractices
          .where('localId')
          .equals(cloudPractice.local_id)
          .first();

        if (existing) {
          if ((cloudPractice.sync_version || 1) > (existing.syncVersion || 1)) {
            await db.weaknessPractices.update(existing.id!, {
              weaknessId: cloudPractice.weakness_id,
              date: cloudPractice.date,
              content: cloudPractice.content,
              isCompleted: cloudPractice.is_completed === 1,
              streak: cloudPractice.streak,
              syncStatus: 'synced',
              syncVersion: cloudPractice.sync_version,
              lastSyncedAt: Date.now(),
            });
            pulledCount++;
          }
        } else {
          await db.weaknessPractices.add({
            userId,
            weaknessId: cloudPractice.weakness_id,
            date: cloudPractice.date,
            content: cloudPractice.content,
            isCompleted: cloudPractice.is_completed === 1,
            streak: cloudPractice.streak,
            localId: cloudPractice.local_id,
            syncStatus: 'synced',
            syncVersion: cloudPractice.sync_version,
            lastSyncedAt: Date.now(),
          });
          pulledCount++;
        }
      }

      return pulledCount;
    } catch (error) {
      console.error('Failed to pull changes via API:', error);
      throw error;
    }
  }

  // 标记冲突
  private async markConflict(tableName: string, recordId: string, userId: string) {
    try {
      switch (tableName) {
        case 'goals':
          await db.goals
            .where('localId')
            .equals(recordId)
            .modify({ syncStatus: 'conflict' });
          break;
        case 'weaknessPractices':
          await db.weaknessPractices
            .where('localId')
            .equals(recordId)
            .modify({ syncStatus: 'conflict' });
          break;
        case 'dailyCaches':
          await db.dailyCaches
            .where('localId')
            .equals(recordId)
            .modify({ syncStatus: 'conflict' });
          break;
      }
    } catch (error) {
      console.error('Failed to mark conflict:', error);
    }
  }

  // 解决冲突（采用云端版本）
  async resolveConflictWithCloud(
    tableName: string,
    recordId: string,
    userId: string
  ): Promise<boolean> {
    if (!this.d1Client) return false;

    try {
      // 获取云端最新数据
      let cloudData;
      if (tableName === 'goals') {
        // 注意：D1Client 没有 getGoalByLocalId 方法，需要扩展
        // 暂时跳过
        return false;
      }
      // 标记为已同步
      await this.markSynced(tableName, recordId, userId);
      return true;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      return false;
    }
  }

  // 标记为已同步
  private async markSynced(tableName: string, recordId: string, userId: string) {
    try {
      switch (tableName) {
        case 'goals':
          await db.goals
            .where('localId')
            .equals(recordId)
            .modify((goal) => {
              goal.syncStatus = 'synced';
              goal.syncVersion = (goal.syncVersion || 1) + 1;
              goal.lastSyncedAt = Date.now();
            });
          break;
        case 'weaknessPractices':
          await db.weaknessPractices
            .where('localId')
            .equals(recordId)
            .modify((goal) => {
              goal.syncStatus = 'synced';
              goal.syncVersion = (goal.syncVersion || 1) + 1;
              goal.lastSyncedAt = Date.now();
            });
          break;
        case 'dailyCaches':
          await db.dailyCaches
            .where('localId')
            .equals(recordId)
            .modify((goal) => {
              goal.syncStatus = 'synced';
              goal.syncVersion = (goal.syncVersion || 1) + 1;
              goal.lastSyncedAt = Date.now();
            });
          break;
      }
    } catch (error) {
      console.error('Failed to mark synced:', error);
    }
  }

  // 执行完整同步
  async syncAll(userId: string, token?: string): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        changesPushed: 0,
        changesPulled: 0,
        conflicts: 0,
        error: 'Sync already in progress',
      };
    }

    this.isSyncing = true;
    try {
      const pushed = await this.pushChanges(userId, token);
      const pulled = await this.pullChanges(userId, token);

      return {
        success: true,
        changesPushed: pushed,
        changesPulled: pulled,
        conflicts: 0,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        changesPushed: 0,
        changesPulled: 0,
        conflicts: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.isSyncing = false;
    }
  }

  // 队列同步操作（用于离线支持）
  async queueSyncOperation(operation: () => Promise<void>) {
    this.syncQueue.push(operation);
    if (this.syncQueue.length === 1) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue[0];
      try {
        await operation();
      } catch (error) {
        console.error('Sync operation failed:', error);
      }
      this.syncQueue.shift();
    }
  }
}

// 默认导出单例
export const syncService = new SyncService();