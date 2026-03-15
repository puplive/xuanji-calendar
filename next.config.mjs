/**
 * 部署到 Vercel 是检验这个项目的“科技感”和“粒子流畅度”的最佳方式。Next.js 与 Vercel 的原生集成能让你的 Server Actions（处理 AI 指引）和边缘计算（处理玄学逻辑）达到极速。

以下是上线前的最后冲刺清单和部署步骤。

1. 生产环境配置检查 (Final Check)

在部署前，确保你的 next.config.mjs 或 next.config.js 已经优化，特别是针对 Canvas 这种重绘逻辑。

 * 2. 环境变量设置 (Environment Variables)

在 Vercel 控制面板中，你需要配置以下变量以激活 AI 和加密逻辑：

DEEPSEEK_API_KEY: 你的 AI 大模型密钥。
NEXT_PUBLIC_CRYPTO_KEY: 用于本地 IndexedDB 加密的随机长字符串。
NODE_ENV: 设置为 production。
3. 粒子效果的性能兜底 (Performance Fallback)

由于 Vercel 部署后用户会通过各种设备访问，我们需要在 FortuneCanvas.tsx 中加入一个简单的帧率检测器。如果检测到设备运行卡顿，自动减少粒子数量。

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
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Cloudflare Pages 建议开启
  experimental: {
    runtime: 'edge',
  },
  // 开启生产环境压缩
  compress: true,
  // 确保 React 严格模式开启，帮助发现粒子系统中的内存泄漏
  reactStrictMode: true,
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
};

export default nextConfig;
