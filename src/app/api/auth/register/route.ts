import { D1Client, getEnv } from '@/lib/d1';
import { AuthService, setCorsHeaders, handleOptionsRequest } from '@/lib/auth';

interface RegisterRequestBody {
  email: string;
  password: string;
  username?: string;
  birthDate?: string;
  mbti?: string;
  zodiac?: string;
}

export const runtime = 'edge'; // Cloudflare Pages 必需

export async function POST(request: Request) {
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    const env = getEnv(request);
    const authService = new AuthService(env);
    const d1Client = new D1Client(env.DB);

    const body = await request.json() as RegisterRequestBody;
    const { email, password, username, birthDate, mbti, zodiac } = body;

    // 验证输入
    if (!email || !password) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '邮箱和密码是必填项' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 检查邮箱是否已注册
    const existingUser = await d1Client.getUserByEmail(email);
    if (existingUser) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '该邮箱已被注册' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 创建用户
    const userId = authService.generateUserId();
    const passwordHash = await authService.hashPassword(password);

    await d1Client.createUser({
      id: userId,
      email,
      passwordHash,
      birthDate,
      mbti,
      zodiac,
    });

    // 生成JWT令牌
    const token = authService.generateToken({
      id: userId,
      email,
      username,
      membershipType: 'FREE',
    });

    return setCorsHeaders(new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          username,
          birthDate,
          mbti,
          zodiac,
          membershipType: 'FREE',
        },
        token,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    ));
  } catch (error) {
    console.error('注册失败:', error);
    return setCorsHeaders(new Response(
      JSON.stringify({ error: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

export async function OPTIONS() {
  return handleOptionsRequest();
}