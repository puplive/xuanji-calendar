/**
 * POST /api/auth/login
 * Authenticate user with email + password, return JWT + user profile.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const { email, password } = await context.request.json();
    if (!email || !password) {
      return json({ success: false, error: 'Email and password are required' }, 400);
    }

    const db = context.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) {
      return json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const hash = await sha256(password);
    if (user.password_hash !== hash) {
      return json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const token = createToken(
      { id: user.id, email: user.email, username: user.username, membershipType: user.membership_type },
      context.env.JWT_SECRET
    );

    return json({
      success: true,
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
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return json({ success: false, error: 'Server error' }, 500);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function createToken(user, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: user.id,
    email: user.email,
    username: user.username,
    membershipType: user.membershipType,
    exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    iat: Math.floor(Date.now() / 1000),
  }));
  const signature = btoa(secret + header + payload);
  return `${header}.${payload}.${signature}`;
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
