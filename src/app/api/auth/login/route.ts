import { D1Client, getEnv } from '@/lib/d1';
import { AuthService, setCorsHeaders, handleOptionsRequest } from '@/lib/auth';

interface LoginRequestBody {
  email: string;
  password: string;
}

export const runtime = 'edge';

export async function POST(request: Request) {
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const env = getEnv(request);
    const authService = new AuthService(env);
    const d1Client = new D1Client(env.DB);

    const body = await request.json() as LoginRequestBody;
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '邮箱和密码是必填项' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 查找用户
    const user = await d1Client.getUserByEmail(email);
    if (!user) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '邮箱或密码不正确' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 验证密码
    const isValidPassword = await authService.verifyPassword(
      password,
      user.password_hash as string
    );

    if (!isValidPassword) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '邮箱或密码不正确' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 生成JWT令牌
    const token = authService.generateToken({
      id: user.id as string,
      email: user.email as string,
      username: user.username as string,
      membershipType: (user.membership_type as string) || 'FREE',
    });

    return setCorsHeaders(new Response(
      JSON.stringify({
        success: true,
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
        },
        token,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));
  } catch (error) {
    console.error('登录失败:', error);
    return setCorsHeaders(new Response(
      JSON.stringify({ error: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

export async function OPTIONS() {
  return handleOptionsRequest();
}