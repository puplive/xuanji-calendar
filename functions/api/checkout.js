/**
 * POST /api/checkout
 * Payment processing stub.
 */
export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') return handleOptions();

  try {
    const { userId, productId } = await context.request.json();

    // Stub: currently returns a temp order without real payment processing
    return json({
      orderId: `temp_${Date.now()}`,
      payParams: {},
    });
  } catch (err) {
    console.error('Checkout error:', err);
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
