-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT NOT NULL,
    birth_date TEXT,
    mbti TEXT,
    zodiac TEXT,
    membership_type TEXT DEFAULT 'FREE',
    badges TEXT, -- JSON数组
    points INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_sync_at INTEGER
);

-- 用户档案表（扩展数据）
CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bazi_data TEXT, -- JSON
    wuxing_scores TEXT, -- JSON
    strength_status TEXT,
    custom_settings TEXT, -- JSON
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 目标表
CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('study', 'health', 'work', 'emotion', 'other')),
    total_days INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
    checkins TEXT NOT NULL DEFAULT '[]', -- JSON数组
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    local_id TEXT UNIQUE, -- 本地IndexedDB的ID，用于同步
    sync_version INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_synced_at INTEGER
);

-- 弱点实践表
CREATE TABLE IF NOT EXISTS weakness_practices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weakness_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    content TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    streak INTEGER NOT NULL DEFAULT 0,
    local_id TEXT UNIQUE, -- 本地IndexedDB的ID
    sync_version INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_synced_at INTEGER,
    UNIQUE(user_id, weakness_id, date)
);

-- 每日缓存表
CREATE TABLE IF NOT EXISTS daily_caches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD
    content TEXT NOT NULL,
    huangli_data TEXT, -- JSON
    local_id TEXT UNIQUE,
    sync_version INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_synced_at INTEGER,
    UNIQUE(user_id, date)
);

-- 同步日志表（用于多设备同步冲突解决）
CREATE TABLE IF NOT EXISTS sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    old_data TEXT, -- JSON
    new_data TEXT, -- JSON
    sync_version INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_weakness_practices_user_id ON weakness_practices(user_id);
CREATE INDEX idx_weakness_practices_date ON weakness_practices(date);
CREATE INDEX idx_daily_caches_user_date ON daily_caches(user_id, date);
CREATE INDEX idx_sync_logs_user ON sync_logs(user_id);