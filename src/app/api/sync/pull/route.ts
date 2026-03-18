import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/d1';
import { D1Client } from '@/lib/d1';

export const runtime = 'edge';

interface SyncPullRequestBody {
  userId: string;
  since?: number;
}

export async function POST(request: NextRequest) {
  try {
    const env = getEnv(request);
    const d1Client = new D1Client(env.DB);
    const { userId, since } = await request.json() as SyncPullRequestBody;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    // 获取云端目标
    const goalsResult = await d1Client.getGoalsByUserId(userId);
    const goals = goalsResult.results || [];

    // 获取云端弱点实践
    const practicesResult = await d1Client.getPracticesByUserId(userId);
    const practices = practicesResult.results || [];

    return NextResponse.json({
      success: true,
      data: {
        goals: goals.map(goal => ({
          local_id: goal.local_id,
          name: goal.name,
          type: goal.type,
          total_days: goal.total_days,
          start_date: goal.start_date,
          progress: goal.progress,
          status: goal.status,
          checkins: goal.checkins,
          is_completed: goal.is_completed,
          sync_version: goal.sync_version,
          created_at: goal.created_at,
        })),
        practices: practices.map(practice => ({
          local_id: practice.local_id,
          weakness_id: practice.weakness_id,
          date: practice.date,
          content: practice.content,
          is_completed: practice.is_completed,
          streak: practice.streak,
          sync_version: practice.sync_version,
        })),
        lastSynced: Date.now(),
      },
    });
  } catch (error) {
    console.error('Sync pull error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}