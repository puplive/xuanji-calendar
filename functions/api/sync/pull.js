/**
 * POST /api/sync/pull
 * Pull user data (goals, weakness practices) from D1.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const { userId } = await context.request.json();
    if (!userId) {
      return json({ success: false, error: 'userId is required' }, 400);
    }

    const db = context.env.DB;

    const goals = await db.prepare(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    const practices = await db.prepare(
      'SELECT * FROM weakness_practices WHERE user_id = ? ORDER BY date DESC'
    ).bind(userId).all();

    return json({
      success: true,
      data: {
        goals: goals.results || [],
        practices: practices.results || [],
        lastSynced: Date.now(),
      },
    });
  } catch (err) {
    console.error('Sync pull error:', err);
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
