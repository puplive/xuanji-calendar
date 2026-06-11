/**
 * POST /api/auth/register
 * Create a new user account.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const { email, password, username, birthDate, mbti, zodiac } = await context.request.json();
    if (!email || !password) {
      return json({ success: false, error: 'Email and password are required' }, 400);
    }

    const db = context.env.DB;

    // Check for existing user
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return json({ success: false, error: 'Email already registered' }, 409);
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const passwordHash = await sha256(password);
    const displayName = username || email.split('@')[0];
    const now = Date.now();

    await db.prepare(
      `INSERT INTO users (id, email, password_hash, username, birth_date, mbti, zodiac, created_at, updated_at, membership_type, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'FREE', 0)`
    ).bind(id, email, passwordHash, displayName, birthDate || null, mbti || null, zodiac || null, now, now).run();

    const token = createToken(
      { id, email, username: displayName, membershipType: 'FREE' },
      context.env.JWT_SECRET
    );

    return json({
      success: true,
      user: {
        id,
        email,
        username: displayName,
        birthDate: birthDate || null,
        mbti: mbti || null,
        zodiac: zodiac || null,
        membershipType: 'FREE',
      },
      token,
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
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
