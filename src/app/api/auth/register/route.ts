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
    console.log('环境变量检查:', {
      hasDB: !!env.DB,
      hasJWT: !!env.JWT_SECRET,
      envType: typeof env
    });

    if (!env.DB) {
      console.error('数据库连接失败: DB 环境变量未设置');
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '数据库连接失败' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    if (!env.JWT_SECRET) {
      console.error('JWT密钥缺失: JWT_SECRET 环境变量未设置');
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '服务器配置错误: JWT密钥缺失' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    const authService = new AuthService(env);
    const d1Client = new D1Client(env.DB);

    const body = await request.json() as RegisterRequestBody;
    const { email, password, username, birthDate, mbti, zodiac } = body;

    console.log('注册请求数据:', { email, username, birthDate, mbti, zodiac });

    // 验证输入
    if (!email || !password) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '邮箱和密码是必填项' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 检查邮箱是否已注册
    const existingUser = await d1Client.getUserByEmail(email);
    console.log('检查已存在的用户:', existingUser);
    if (existingUser) {
      return setCorsHeaders(new Response(
        JSON.stringify({ error: '该邮箱已被注册' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // 创建用户
    const userId = authService.generateUserId();
    const passwordHash = await authService.hashPassword(password);

    // 确保用户名存在（如果没有提供则使用邮箱前缀）
    const finalUsername = username || email.split('@')[0];

    console.log('准备创建用户:', { userId, email, finalUsername });
    await d1Client.createUser({
      id: userId,
      email,
      passwordHash,
      username: finalUsername,
      birthDate,
      mbti,
      zodiac,
    });
    console.log('用户创建成功');

    // 生成JWT令牌
    const token = await authService.generateToken({
      id: userId,
      email,
      username: finalUsername,
      membershipType: 'FREE',
    });
    console.log('令牌生成成功');

    return setCorsHeaders(new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          username: finalUsername,
          birthDate,
          mbti,
          zodiac,
          membershipType: 'FREE',
        },
        token,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    ));
  } catch (error: any) {
    console.error('注册失败详细错误:', error);
    console.error('错误堆栈:', error.stack);
    return setCorsHeaders(new Response(
      JSON.stringify({ error: '服务器内部错误: ' + (error.message || '未知错误') }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

export async function OPTIONS() {
  return handleOptionsRequest();
}