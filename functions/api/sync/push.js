/**
 * POST /api/sync/push
 * Push local changes (goals, weakness practices) to D1.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const { userId, changes } = await context.request.json();
    if (!userId || !changes) {
      return json({ success: false, error: 'userId and changes are required' }, 400);
    }

    const db = context.env.DB;
    let pushed = 0;

    for (const change of changes) {
      try {
        const now = Date.now();

        if (change.tableName === 'goals') {
          const d = change.newData;
          if (change.operation === 'create') {
            const checkins = JSON.stringify(d.checkins || []);
            await db.prepare(
              `INSERT INTO goals (local_id, user_id, name, type, total_days, start_date, progress, status, checkins, created_at, updated_at, sync_version)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
            ).bind(d.localId, userId, d.name, d.type, d.totalDays, d.startDate,
                   d.progress || 0, d.status || 'active', checkins, now, now).run();
          } else if (change.operation === 'update') {
            const checkins = JSON.stringify(d.checkins || []);
            await db.prepare(
              `UPDATE goals SET progress = ?, status = ?, checkins = ?, sync_version = ?, last_synced_at = ?, updated_at = ? WHERE local_id = ?`
            ).bind(d.progress, d.status, checkins, (d.syncVersion || 1) + 1, now, now, d.localId).run();
          }
        } else if (change.tableName === 'weaknessPractices') {
          const d = change.newData;
          if (change.operation === 'create') {
            await db.prepare(
              `INSERT INTO weakness_practices (local_id, user_id, weakness_id, date, content, is_completed, streak, created_at, updated_at, sync_version)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
            ).bind(d.localId, userId, d.weaknessId, d.date, d.content,
                   d.isCompleted ? 1 : 0, d.streak || 0, now, now).run();
          } else if (change.operation === 'update') {
            await db.prepare(
              `UPDATE weakness_practices SET is_completed = ?, streak = ?, sync_version = ?, last_synced_at = ?, updated_at = ? WHERE local_id = ?`
            ).bind(d.isCompleted ? 1 : 0, d.streak || 0, (d.syncVersion || 1) + 1, now, now, d.localId).run();
          }
        }
        pushed++;
      } catch (err) {
        console.error('Sync push item error:', err);
        // Continue with remaining items
      }
    }

    return json({ success: true, pushed });
  } catch (err) {
    console.error('Sync push error:', err);
    return json({ success: false, error: 'Server error' }, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
