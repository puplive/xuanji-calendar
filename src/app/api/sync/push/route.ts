import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/d1';
import { D1Client } from '@/lib/d1';

export const runtime = 'edge';

interface SyncPushRequestBody {
  userId: string;
  changes: any[];
}

export async function POST(request: NextRequest) {
  try {
    const env = getEnv(request);
    const d1Client = new D1Client(env.DB);
    const { userId, changes } = await request.json() as SyncPushRequestBody;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    let pushed = 0;
    for (const change of changes || []) {
      try {
        switch (change.tableName) {
          case 'goals': {
            const goal = change.newData;
            if (change.operation === 'create') {
              await d1Client.createGoal({
                localId: goal.localId,
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
              await d1Client.updateGoal(goal.localId, {
                progress: goal.progress,
                status: goal.status,
                checkins: JSON.stringify(goal.checkins || []),
                syncVersion: (goal.syncVersion || 1) + 1,
              });
            }
            pushed++;
            break;
          }
          case 'weaknessPractices': {
            const practice = change.newData;
            if (change.operation === 'create') {
              await d1Client.createWeaknessPractice({
                localId: practice.localId,
                userId,
                weaknessId: practice.weaknessId,
                date: practice.date,
                content: practice.content,
                isCompleted: practice.isCompleted,
                streak: practice.streak,
              });
            } else {
              await d1Client.updatePractice(practice.localId, {
                isCompleted: practice.isCompleted,
                streak: practice.streak,
                syncVersion: (practice.syncVersion || 1) + 1,
              });
            }
            pushed++;
            break;
          }
          // dailyCaches 暂不处理
        }
      } catch (error) {
        console.error(`Failed to process change ${change.tableName} ${change.recordId}:`, error);
        // 继续处理其他更改
      }
    }

    return NextResponse.json({
      success: true,
      pushed,
    });
  } catch (error) {
    console.error('Sync push error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}