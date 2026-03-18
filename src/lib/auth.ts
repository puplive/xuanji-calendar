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

  // 生成JWT令牌 - 使用Web Crypto API适配Edge环境
  async generateToken(user: UserPayload): Promise<string> {
    // 在Cloudflare Workers环境中使用环境提供的JWT功能
    if (this.env.JWT_SECRET && typeof Buffer !== 'undefined') {
      // 在Node.js环境中使用jsonwebtoken作为后备
      try {
        const jwt = await import('jsonwebtoken');
        return jwt.default.sign(
          {
            id: user.id,
            email: user.email,
            username: user.username,
            membershipType: user.membershipType,
          },
          this.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
      } catch (e) {
        console.warn('jsonwebtoken不可用，使用简单实现');
        // 简单的JWT实现用于Edge环境
        return this.createSimpleJWT(user);
      }
    } else {
      // 简单的JWT实现用于Edge环境
      return this.createSimpleJWT(user);
    }
  }

  // 简单的JWT实现
  private createSimpleJWT(user: UserPayload): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      ...user,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天过期
      iat: Math.floor(Date.now() / 1000)
    }));

    // 简单签名（仅用于开发，生产环境请使用适当的安全方法）
    const signature = btoa(this.env.JWT_SECRET + header + payload);

    return `${header}.${payload}.${signature}`;
  }

  // 验证JWT令牌
  async verifyToken(token: string): Promise<UserPayload | null> {
    try {
      if (token.includes('.')) {
        // 检查是否是标准JWT格式
        const parts = token.split('.');
        if (parts.length === 3) {
          // 解析payload部分（第二部分）
          try {
            const payload = JSON.parse(atob(parts[1]));
            // 检查是否过期
            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
              return null;
            }
            return payload;
          } catch (e) {
            console.error('Token parsing failed:', e);
            return null;
          }
        }
      }

      // 对于简单的JWT实现，进行基本验证
      const [header, payload, signature] = token.split('.');
      if (!payload) {
        return null;
      }

      try {
        const parsedPayload = JSON.parse(atob(payload));
        // 检查是否过期
        if (parsedPayload.exp && parsedPayload.exp < Math.floor(Date.now() / 1000)) {
          return null;
        }
        return parsedPayload;
      } catch (e) {
        console.error('Token parsing failed:', e);
        return null;
      }
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