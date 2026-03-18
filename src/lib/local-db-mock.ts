/**
 * 本地开发数据库模拟实现
 * 用于在本地开发环境中模拟 D1 数据库行为
 */

// 在模块作用域内创建一个内存存储 Map
const mockStorage = new Map<string, string>();

// 辅助函数：模拟 localStorage 的 getItem
function getItem(key: string): string | null {
  return mockStorage.get(key) || null;
}

// 辅助函数：模拟 localStorage 的 setItem
function setItem(key: string, value: string): void {
  mockStorage.set(key, value);
}

// 模拟 D1 数据库接口
export interface MockD1Database {
  prepare(query: string): MockD1PreparedStatement;
}

// 模拟 D1 预处理语句
export class MockD1PreparedStatement {
  private query: string;
  private boundValues: any[] = [];

  constructor(query: string) {
    this.query = query;
  }

  bind(...values: any[]) {
    this.boundValues = [...values];
    return this;
  }

  async run() {
    // 解析 SQL 查询并执行相应操作
    if (this.query.includes('INSERT INTO users')) {
      return this.insertUser();
    } else if (this.query.includes('SELECT * FROM users WHERE email = ?')) {
      return this.selectUserByEmail();
    } else if (this.query.includes('SELECT * FROM users WHERE id = ?')) {
      return this.selectUserById();
    } else {
      console.warn(`未实现的查询: ${this.query}`);
      return { success: true, results: [] };
    }
  }

  async first<T = any>() {
    const results = await this.all<T>();
    return results.length > 0 ? results[0] : null;
  }

  async all<T = any>() {
    if (this.query.includes('SELECT * FROM users WHERE email = ?')) {
      return this.selectUsersByEmail();
    } else if (this.query.includes('SELECT * FROM users WHERE id = ?')) {
      return this.selectUsersById();
    } else {
      console.warn(`未实现的查询: ${this.query}`);
      return [] as T[];
    }
  }

  private insertUser() {
    // 模拟插入用户
    const userData = {
      id: this.boundValues[0],
      email: this.boundValues[1],
      password_hash: this.boundValues[2],
      username: this.boundValues[3],
      birth_date: this.boundValues[4],
      mbti: this.boundValues[5],
      zodiac: this.boundValues[6],
      membership_type: this.boundValues[7],
      points: this.boundValues[8],
      created_at: this.boundValues[9],
      updated_at: this.boundValues[10],
    };

    // 使用内存 Map 存储用户数据
    let users = JSON.parse(getItem('mock_users') || '{}');
    users[userData.id] = userData;
    setItem('mock_users', JSON.stringify(users));

    return {
      success: true,
      meta: {
        duration: 0,
        last_row_id: userData.id,
        changes: 1
      }
    };
  }

  private async selectUserByEmail() {
    const email = this.boundValues[0];
    const users = JSON.parse(getItem('mock_users') || '{}');

    // 查找匹配邮箱的用户
    for (const userId in users) {
      if (users[userId].email === email) {
        return users[userId];
      }
    }

    return null;
  }

  private async selectUserById() {
    const id = this.boundValues[0];
    const users = JSON.parse(getItem('mock_users') || '{}');

    return users[id] || null;
  }

  private async selectUsersByEmail() {
    const email = this.boundValues[0];
    const users = JSON.parse(getItem('mock_users') || '{}');
    const result = [];

    // 查找匹配邮箱的用户
    for (const userId in users) {
      if (users[userId].email === email) {
        result.push(users[userId]);
      }
    }

    return result;
  }

  private async selectUsersById() {
    const id = this.boundValues[0];
    const users = JSON.parse(getItem('mock_users') || '{}');

    if (users[id]) {
      return [users[id]];
    }

    return [];
  }
}

// 创建本地数据库模拟实例
export class LocalDBMock implements MockD1Database {
  prepare(query: string) {
    return new MockD1PreparedStatement(query);
  }
}

// 用于创建本地数据库实例的工厂函数
export function createLocalDBInstance(): MockD1Database {
  // 无论运行环境是浏览器还是 Node.js，都使用内存 Map，因此无需区分
  return new LocalDBMock();
}