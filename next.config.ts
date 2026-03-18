/**
 * 部署到  是检验这个项目的“科技感”和“粒子流畅度”的最佳方式。Next.js 与  的原生集成能让你的 Server Actions（处理 AI 指引）和边缘计算（处理玄学逻辑）达到极速。

以下是上线前的最后冲刺清单和部署步骤。

1. 生产环境配置检查 (Final Check)

在部署前，确保你的 next.config.mjs 或 next.config.js 已经优化，特别是针对 Canvas 这种重绘逻辑。

 * 2. 环境变量设置 (Environment Variables)

在  控制面板中，你需要配置以下变量以激活 AI 和加密逻辑：

DEEPSEEK_API_KEY: 你的 AI 大模型密钥。
NEXT_PUBLIC_CRYPTO_KEY: 用于本地 IndexedDB 加密的随机长字符串。
NODE_ENV: 设置为 production。
3. 粒子效果的性能兜底 (Performance Fallback)

由于  部署后用户会通过各种设备访问，我们需要在 FortuneCanvas.tsx 中加入一个简单的帧率检测器。如果检测到设备运行卡顿，自动减少粒子数量。

// 在 FortuneCanvas 的 useEffect 中加入
let frameCount = 0;
let lastTime = performance.now();

const checkPerformance = () => {
  const now = performance.now();
  frameCount++;
  if (now - lastTime >= 1000) {
    const fps = frameCount;
    if (fps < 40) {
      // 如果 FPS 低于 40，将粒子数量减半
      console.warn("性能较低，正在优化粒子密度...");
      config.density = Math.floor(config.density / 2);
    }
    frameCount = 0;
    lastTime = now;
  }
};



 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 压缩（默认已开启，可省略）
  compress: true,

  // 严格模式（帮助检测粒子效果的内存泄漏）
  reactStrictMode: true,

  // 实验性功能：React Compiler（需要 Next.js 15+ 或特定版本）
  // 注意：该功能可能还不稳定，如果不需要可以移除
  reactCompiler: true,

  // 允许跨域（如果你的 AI 接口在不同域名）
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
  // 安全跨域配置（建议生产环境限定域名）
  // async headers() {
  //   const allowedOrigin = process.env.VERCEL_ENV === 'production'
  //     ? 'https://starrysay.com' // 替换为你的真实域名
  //     : '*';

  //   return [
  //     {
  //       source: '/api/:path*',
  //       headers: [
  //         { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
  //         { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
  //         { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
  //       ],
  //     },
  //   ];
  // },

  // 如果你需要优化图片加载
  images: {
    remotePatterns: [
      // 示例：允许来自特定域名的图片
      // { protocol: 'https', hostname: 'example.com' },
    ],
  },
};

export default nextConfig;