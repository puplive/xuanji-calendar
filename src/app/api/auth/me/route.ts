import { D1Client, getEnv } from '@/lib/d1';
import { AuthService, setCorsHeaders, handleOptionsRequest, requireAuth } from '@/lib/auth';

export const runtime = 'edge'; // Cloudflare Pages 必需

export async function GET(request: Request) {
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const env = getEnv(request);
    const authService = new AuthService(env);
    const d1Client = new D1Client(env.DB);

    // 尝试认证，但允许匿名访问（返回游客状态）
    const token = authService.extractTokenFromHeader(request);
    if (!token) {
      // 游客模式
      return setCorsHeaders(new Response(
        JSON.stringify({
          isGuest: true,
          user: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 验证令牌
    const userPayload = await authService.verifyToken(token);
    if (!userPayload) {
      return setCorsHeaders(new Response(
        JSON.stringify({
          isGuest: true,
          user: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 获取完整用户信息
    const user = await d1Client.getUserById(userPayload.id);
    if (!user) {
      return setCorsHeaders(new Response(
        JSON.stringify({
          isGuest: true,
          user: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    return setCorsHeaders(new Response(
      JSON.stringify({
        isGuest: false,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          birthDate: user.birth_date,
          mbti: user.mbti,
          zodiac: user.zodiac,
          membershipType: user.membership_type || 'FREE',
          points: user.points || 0,
          badges: user.badges ? JSON.parse(user.badges as string) : [],
          createdAt: user.created_at,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return setCorsHeaders(new Response(
      JSON.stringify({ error: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

export async function OPTIONS() {
  return handleOptionsRequest();
}