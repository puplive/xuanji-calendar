import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Env } from './d1';

export interface UserPayload {
  id: string;
  email: string;
  username?: string;
  membershipType: string;
}

export class AuthService {
  constructor(private env: Env) {}

  // 生成JWT令牌
  generateToken(user: UserPayload): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        membershipType: user.membershipType,
      },
      this.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  // 验证JWT令牌
  verifyToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, this.env.JWT_SECRET) as UserPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // 从请求头中提取令牌
  extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  // 验证请求并返回用户信息
  async authenticateRequest(request: Request): Promise<UserPayload | null> {
    const token = this.extractTokenFromHeader(request);
    if (!token) return null;
    return this.verifyToken(token);
  }

  // 密码哈希
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // 验证密码
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // 生成用户ID（使用UUID v4）
  generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 认证中间件（用于API路由）
export async function requireAuth(request: Request, env: Env): Promise<UserPayload> {
  const authService = new AuthService(env);
  const user = await authService.authenticateRequest(request);

  if (!user) {
    throw new Response(JSON.stringify({ error: '未授权的访问' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return user;
}

// CORS头设置（用于API响应）
export function setCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  newResponse.headers.set('Access-Control-Max-Age', '86400');
  return newResponse;
}

// 处理OPTIONS请求（预检请求）
export function handleOptionsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}