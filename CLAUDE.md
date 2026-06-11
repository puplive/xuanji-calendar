# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

玄机日历 (Xuanji Calendar) 是一个融合东方命理（八字、黄历）与西方心理学（MBTI、星座）的 AI 驱动型个人成长助手。产品定位为"科技玄学个人成长工具"，通过 Canvas 粒子八卦图、AI 生成内容和本地优先的数据架构，为用户提供每日指引、姻缘配对、目标管理和弱点克服等服务。

**核心价值**：
- **个性化**：所有内容基于用户出生时间、MBTI 类型生成
- **融合性**：交叉分析八字、MBTI、星座、黄历等多个符号体系
- **行动导向**：提供可执行的每日建议，帮助用户改善生活
- **科技感体验**：动态粒子特效构建的交互式视觉体验

**技术栈**：
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4（无 Framer Motion，使用 CSS transition 替代）
- lunar-javascript (农历/八字计算)
- Dexie (IndexedDB) + crypto-js (本地加密)
- **静态导出 (`output: 'export'`)** + Cloudflare Pages Functions（APIs）
- Cloudflare D1（数据库）
- 上传 GitHub 自动在 Cloudflare Pages 部署，总大小 < 3MB

## 开发命令

```bash
# 开发服务器 (http://localhost:3000)
pnpm dev

# 生产构建（等同于 Cloudflare 的构建命令）
pnpm build

# Cloudflare Pages 构建（隐藏 API routes → next build → 复制 functions）
pnpm build:cf

# 代码检查
pnpm lint

# 启动生产服务器
pnpm start
```

## 架构概览

### 部署架构

```
静态页面 ← output: 'export' (out/)
  ├── /en/*.html, /zh/*.html   → Cloudflare Pages 静态托管
  ├── /_next/static/*           → 客户端 JS/CSS 资源
  └── functions/                → Cloudflare Pages Functions (API)
        ├── _middleware.js       → 根路径重定向 / → /en
        └── api/auth/*          → 认证 API
        └── api/oracle.js       → AI 神谕接口
        └── api/sync/*          → 数据同步 API
        └── api/checkout.js     → 支付 stub
```

**构建流程**（`scripts/deploy.mjs`）：
1. 临时隐藏 `src/app/api/` 和 `src/middleware.ts`（不兼容 static export）
2. 执行 `next build` 生成静态页面到 `out/`
3. 复制 `functions/` → `out/functions/`
4. 创建 `out/_redirects`（根路径重定向到 /en）
5. 恢复被隐藏的文件

**Cloudflare Pages 设置要求**：
- Build command: `pnpm build:cf`
- Build output directory: `out`
- D1 binding: `DB`
- 环境变量: `JWT_SECRET`

### 应用结构

```
src/
├── app/                    # Next.js App Router（静态生成）
│   ├── [locale]/          # 多语言路由（en, zh）
│   │   ├── page.tsx       # 首页（粒子八卦图 + 能量状态）
│   │   ├── goals/page.tsx # 目标管理
│   │   ├── grow/page.tsx  # 弱点克服
│   │   ├── profile/       # 个人档案
│   │   ├── setup/         # 初始设置
│   │   ├── login/         # 登录
│   │   ├── register/      # 注册
│   │   ├── layout.tsx     # 多语言布局（setRequestLocale）
│   │   └── ClientLayout.tsx # 客户端布局（AuthProvider, BottomNav, SecurityHandler）
│   ├── layout.tsx         # 根布局
│   ├── global-error.tsx   # 全局错误边界
│   └── globals.css        # Tailwind CSS
├── components/            # React 组件
│   ├── visuals/           # Canvas 可视化组件
│   ├── goals/             # 目标相关组件
│   ├── weakness/          # 弱点克服组件
│   ├── layout/            # 布局组件（BottomNav, LanguageSwitcher）
│   ├── share/             # 分享功能组件
│   ├── premium/           # 付费墙组件
│   └── legal/             # 法律声明组件
├── hooks/                 # 自定义 Hooks
│   ├── useProfile.ts      # 用户档案（birthDate + MBTI）
│   ├── useGoals.ts        # 目标管理（IndexedDB + 云同步）
│   ├── useWeakness.ts     # 弱点实践（IndexedDB + 云同步）
│   └── useDailyGuidance.ts # 每日指引缓存
├── lib/                   # 核心业务逻辑
│   ├── bazi-engine.ts     # 八字能量计算引擎
│   ├── strength-engine.ts # 命局强度分析
│   ├── profile-utils.ts   # 用户档案计算
│   ├── visual-mapper.ts   # 视觉参数映射
│   ├── fortune.ts         # 命理 + 黄历综合
│   ├── db.ts              # Dexie IndexedDB 定义
│   ├── sync.ts            # 数据同步服务
│   ├── d1.ts              # D1 客户端（仅供 server-side 使用）
│   └── crypto.ts          # 加密工具
├── constants/             # 常量定义
│   ├── mappings.ts        # 元素/MBTI/星座映射
│   └── navigation.ts      # 导航项配置
├── contexts/              # React Context
│   └── AuthContext.tsx     # 认证上下文（localStorage + API）
└── messages/              # next-intl 翻译
    ├── zh.json
    └── en.json
```

functions/                    # Cloudflare Pages Functions
├── _middleware.js             # 根路径重定向
└── api/
    ├── auth/
    │   ├── login.js           # POST 登录
    │   ├── register.js        # POST 注册
    │   └── me.js              # GET 用户信息
    ├── oracle.js              # POST AI 神谕
    ├── sync/
    │   ├── push.js            # POST 推送本地更改
    │   └── pull.js            # POST 拉取云端数据
    └── checkout.js            # POST 支付 stub

### 核心数据流

1. **用户档案存储** → `hooks/useProfile.ts`
   - 游客模式使用 `localStorage`
   - 登录用户通过 AuthContext 同步到云端

2. **命理计算** → `lib/` 目录
   - `bazi-engine.ts`: 八字五行能量计算（基于 lunar-javascript）
   - `strength-engine.ts`: 命局强度分析
   - `profile-utils.ts`: 用户档案计算（八字、干支、星座）
   - `visual-mapper.ts`: 将命理数据映射到 Canvas 视觉参数

3. **首页渲染** → `app/[locale]/page.tsx`
   - 使用 `useProfile` 获取用户数据
   - 动态加载 `lunar-javascript` 等重型计算模块
   - 使用 `useMemo` 缓存 `fortuneData`（包含五行分数、强度、视觉配置）
   - 静态导出，纯客户端渲染

4. **API 请求** → `functions/api/` Pages Functions
   - 认证 API 对接 Cloudflare D1
   - 同步 API 处理 IndexedDB ↔ D1 数据同步

### 本地存储策略

- **默认本地存储**：用户个人信息（出生时间、MBTI）仅存储在本地（localStorage/IndexedDB）
- **云同步可选**：用户可主动开启加密云同步（AES-256）
- **配对码机制**：姻缘配对时仅交换必要信息（星座、MBTI、简略五行），不暴露完整八字

## Key Rules

### 导航栏必须带 locale 前缀
BottomNav 跳转时必须包含当前 locale，如 `/en/goals` 而不是 `/goals`：
```tsx
const locale = pathSegments[0] || 'zh';
router.push('/' + locale + item.path);
```

### next-intl 静态导出要求
1. 服务端 layout 必须调用 `setRequestLocale(locale)`（位于 `[locale]/layout.tsx`）
2. 使用 `generateStaticParams()` 返回所有 locale
3. `NextIntlClientProvider` 需要传入 `messages`、`locale`、`timeZone`
4. 根布局 `html lang` 使用 `suppressHydrationWarning`

### API 路由在 Pages Functions 中
- API 逻辑写在 `functions/api/` 下，不是 `src/app/api/`
- Pages Functions 使用 ESM 语法，`export async function onRequest(context)`
- 通过 `context.env.DB` 访问 D1 数据库
- JWT 签名使用 Web Crypto API（`crypto.subtle.digest`），不使用 npm 包

### 不使用 Framer Motion
所有动画使用 CSS transition / Tailwind `active:` / `hover:` 替代。

## 关键文件说明

### 核心业务逻辑

- `src/lib/bazi-engine.ts` - **八字能量计算引擎**
  - `calculateEnergy(lunar)`：返回五行百分比分数 `{ jin, mu, shui, huo, tu }`
  - 用于视觉粒子颜色映射和 AI 提示词数据

- `src/lib/strength-engine.ts` - **命局强度分析**
  - 计算用户命理强弱状态，影响界面文案和视觉反馈

- `src/lib/visual-mapper.ts` - **视觉映射器**
  - 将五行分数转换为 Canvas 粒子参数（颜色、密度、速度）

### API (Pages Functions)

- `functions/api/auth/login.js` - POST 登录（SHA-256 + D1 查询）
- `functions/api/auth/register.js` - POST 注册（SHA-256 + D1 插入）
- `functions/api/auth/me.js` - GET 获取当前用户
- `functions/api/oracle.js` - POST AI 神谕（三种类型：daily/goal/practice）
- `functions/api/sync/push.js` - POST 推送本地变更到 D1
- `functions/api/sync/pull.js` - POST 从 D1 拉取变更

### 样式与设计规范

### 色彩体系

- **背景**：黑 (`#050505`, `bg-black`)
- **主色**：金 (`#D4AF37`, `text-[#D4AF37]`, Tailwind 扩展 `gold-500`)
- **金色渐变**：`gold-400` (`#E6C15A`), `gold-500` (`#D4AF37`), `gold-600` (`#B8962E`)
- **点缀**：青（光晕效果）
- **五行色**：
  - 木:翠绿 (`#10b981`, `bg-emerald-500`)
  - 火:赤红 (`#ef4444`, `bg-rose-500`)
  - 土:琥珀 (`#f59e0b`, `bg-amber-500`)
  - 金:钛白 (`#f8fafc`, `bg-zinc-200`)
  - 水:深蓝 (`#3b82f6`, `bg-blue-500`)

### 排版与间距

- **字体**：系统无衬线字体 (`font-sans`)
- **标题**：大字号 + 字重黑体 (`font-black`)
- **科技感细节**：小字号 (`text-[10px]`) + 字距 (`tracking-widest`) + 大写 (`uppercase`)
- **圆角**：大圆角设计 (`rounded-[2rem]`)
- **玻璃态效果**：`backdrop-blur-3xl` + `bg-white/10`

## 开发注意事项

### 性能优化

1. **粒子系统性能**：
   - 粒子数量建议 200-300，动态调整
   - 加入帧率检测，低性能设备自动减少粒子密度
   - 使用 `useMemo` 缓存计算密集型结果

2. **动态导入重型模块**：
   - `lunar-javascript` 等大包使用动态 `import()` 延迟加载
   - 图表组件（recharts）使用 `dynamic(() => import(...), { ssr: false })`

3. **构建体积控制**（Cloudflare Pages 3MB 限制）：
   - API 逻辑在 `functions/` 中，不占用静态导出体积
   - 避免大型 npm 包（已移除 framer-motion）

### 隐私与合规

1. **数据匿名化**：
   - AI 请求必须脱敏，不传输原始出生日期
   - 使用随机 ID 代替真实用户标识

2. **免责声明**：
   - 所有 AI 生成内容需标注"仅供娱乐参考"
   - 避免恐吓性词汇，引导积极正向

3. **本地优先**：
   - 默认所有数据存储在用户设备
   - 云同步需用户主动开启并同意加密

### AI 集成提示

1. **提示词工程**：
   - 风格要求："赛博朋克 + 禅意"
   - 结构：[今日脉冲] → [多维解析] → [修行指令]
   - 避免陈词滥调，要有科技感和穿透力

2. **降级方案**：
   - AI API 失败时，基于结构化规则生成简版内容
   - 缓存生成结果，避免重复请求

### 代码质量

1. **类型安全**：
   - 使用 TypeScript 严格模式
   - 为 lunar-javascript 扩展类型定义 (`src/types/lunar.d.ts`)

2. **模块化设计**：
   - 引擎逻辑与 UI 组件分离
   - Hook 封装业务状态，组件专注渲染
