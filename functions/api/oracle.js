/**
 * POST /api/oracle
 * AI oracle endpoint. Returns daily guidance, goal advice, or practice insight.
 * Currently returns structured mock responses.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const body = await context.request.json();
    const { type = 'daily' } = body;

    let result;
    switch (type) {
      case 'goal':
        result = {
          type: 'goal',
          advice: '目标建议：循序渐进，保持每日精进。当前运势适合稳步推进，不宜冒进。',
        };
        break;
      case 'practice':
        result = {
          type: 'practice',
          insight: '今日修行的关键在于觉察自己的情绪模式。',
          instruction: '当感到压力时，暂停片刻，做三次深呼吸。',
          themeColor: '#D4AF37',
        };
        break;
      default:
        result = {
          type: 'daily',
          text: '今日能量流动趋于平稳。宜静思，不宜妄动。',
        };
    }

    return json(result);
  } catch (err) {
    console.error('Oracle error:', err);
    return json({ error: 'Server error' }, 500);
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
