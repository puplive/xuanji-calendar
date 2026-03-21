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
- Tailwind CSS 4 + Framer Motion
- lunar-javascript (农历/八字计算)
- Dexie (IndexedDB) + crypto-js (本地加密)
- 边缘运行时 (Edge Runtime)
- 上传github 自动在 cloudflare pages 部署
- 数据库线上使用cloudflare D1

## 开发命令

```bash
# 开发服务器 (http://localhost:3000)
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# Cloudflare Pages 构建
pnpm build:cf
```

## 架构概览

### 应用结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页（粒子八卦图 + 能量状态）
│   ├── goals/page.tsx     # 目标管理
│   ├── grow/page.tsx      # 弱点克服
│   ├── profile/page.tsx   # 个人档案
│   ├── setup/page.tsx     # 初始设置
│   ├── layout.tsx         # 根布局（含 SecurityHandler + BottomNav）
│   ├── actions/           # Server Actions (AI 生成)
│   └── api/               # API 路由 (边缘运行时)
├── components/            # React 组件
│   ├── visuals/           # Canvas 可视化组件
│   ├── goals/             # 目标相关组件
│   ├── weakness/          # 弱点克服组件
│   ├── layout/            # 布局组件
│   ├── share/             # 分享功能组件
│   ├── premium/           # 付费墙组件
│   └── legal/             # 法律声明组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 核心业务逻辑库
└── constants/             # 常量定义
```

### 核心数据流

1. **用户档案存储** → `hooks/useProfile.ts`
   - 使用 `localStorage` 存储 `{ birthDate, mbti }`
   - 提供 `profile` 状态和 `updateProfile` 方法

2. **命理计算** → `lib/` 目录
   - `bazi-engine.ts`: 八字五行能量计算（基于 lunar-javascript）
   - `strength-engine.ts`: 命局强度分析
   - `profile-utils.ts`: 用户档案计算（八字、干支、星座）
   - `visual-mapper.ts`: 将命理数据映射到 Canvas 视觉参数

3. **首页渲染** → `app/page.tsx`
   - 使用 `useProfile` 获取用户数据
   - 通过 `useMemo` 计算 `fortuneData`（包含五行分数、强度、视觉配置）
   - 渲染 `FortuneCanvas`（动态粒子）和能量状态卡片

4. **AI 生成** → `app/api/` 和 `app/actions/`
   - API 路由使用边缘运行时 (`runtime: 'edge'`)
   - `generateGuidance.ts`: Server Action 生成每日指引
   - `oracle/route.ts`: AI 提示词工程，数据匿名化处理

### 本地存储策略

- **默认本地存储**：用户个人信息（出生时间、MBTI）仅存储在本地（localStorage/IndexedDB）
- **云同步可选**：用户可主动开启加密云同步（AES-256）
- **配对码机制**：姻缘配对时仅交换必要信息（星座、MBTI、简略五行），不暴露完整八字

## 关键文件说明

### 核心业务逻辑

- `src/lib/bazi-engine.ts` - **八字能量计算引擎**
  - `calculateEnergy(lunar)`：返回五行百分比分数 `{ jin, mu, shui, huo, tu }`
  - 用于视觉粒子颜色映射和 AI 提示词数据

- `src/lib/strength-engine.ts` - **命局强度分析**
  - 计算用户命理强弱状态，影响界面文案和视觉反馈

- `src/lib/visual-mapper.ts` - **视觉映射器**
  - 将五行分数转换为 Canvas 粒子参数（颜色、密度、速度）

### 可视化组件

- `src/components/visuals/FortuneCanvas.tsx` - **动态粒子八卦图**
  - 基于 `visualConfig` 实时渲染粒子效果
  - 五行分数影响粒子颜色（木:翠绿、火:赤红、土:琥珀、金:钛白、水:深蓝）

- `src/components/visuals/BaguaParticles.tsx` - **八卦粒子系统**
  - 备用粒子实现

### 状态管理

- `src/hooks/useProfile.ts` - **用户档案 Hook**
  - 管理出生日期和 MBTI 的持久化状态

- `src/hooks/useDailyGuidance.ts` - **每日指引 Hook**
  - 获取和缓存 AI 生成的每日指引

### 安全与隐私

- `src/components/SecurityHandler.tsx` - **安全处理器**
  - 注入全局安全策略和隐私保护

- `src/lib/crypto.ts` - **加密工具**
  - 本地数据加密/解密

### API 路由

- `src/app/api/oracle/route.ts` - **AI 神谕接口**（支持三种类型）
  - `type: 'daily'` - 接收匿名化命理数据，生成每日个性化解读
  - `type: 'goal'` - 为目标管理提供 AI 建议
  - `type: 'practice'` - 为弱点克服练习提供指导
  - 严格遵守隐私脱敏（不传输原始出生日期）

## 样式与设计规范

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

### 动画与交互

- **粒子动画**：基于五行分数的实时响应
- **卡片动效**：使用 Framer Motion 提供微交互
- **过渡效果**：`transition-all duration-1000` 用于平滑状态变化

## 开发注意事项

### 性能优化

1. **粒子系统性能**：
   - 粒子数量建议 200-300，动态调整
   - 加入帧率检测，低性能设备自动减少粒子密度
   - 使用 `useMemo` 缓存计算密集型结果

2. **边缘运行时**：
   - API 路由默认 `export const runtime = 'edge'`
   - Server Actions 也支持边缘运行时

3. **本地存储策略**：
   - MVP 阶段使用 `localStorage`
   - 进阶可迁移到 `IndexedDB` (Dexie) 处理大量历史数据

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

## 扩展开发指南

当添加新功能时，参考以下现有模式：

- **新计算引擎**：参照 `bazi-engine.ts` 设计类，输出标准化数据结构
- **新可视化组件**：继承 `FortuneCanvas` 的配置驱动模式
- **新 AI 功能**：在 `app/api/` 创建边缘路由，遵循匿名化原则
- **新用户数据**：通过 `useProfile` 扩展或创建专用 Hook

项目详细需求见 `prd.md`，包含完整的产品愿景、功能模块和商业化设计。