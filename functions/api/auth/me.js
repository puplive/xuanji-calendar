/**
 * GET /api/auth/me
 * Return current user info from JWT token. Returns isGuest:true if no valid token.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const token = extractToken(context.request);
    if (!token) return json({ isGuest: true, user: null });

    const payload = verifyToken(token, context.env.JWT_SECRET);
    if (!payload) return json({ isGuest: true, user: null });

    const db = context.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first();
    if (!user) return json({ isGuest: true, user: null });

    return json({
      isGuest: false,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        birthDate: user.birth_date,
        mbti: user.mbti,
        zodiac: user.zodiac,
        membershipType: user.membership_type,
        points: user.points,
        badges: parseBadges(user.badges),
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return json({ isGuest: true, user: null }, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function extractToken(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

function verifyToken(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseBadges(val) {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
