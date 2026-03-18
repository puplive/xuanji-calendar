/**
 * Next.js 配置 for Cloudflare Pages 部署
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // 优化：Tree shaking
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    remotePatterns: [],
  },

  // 优化打包体积 - 针对 Next.js 16 的配置
  serverExternalPackages: ['lunar-javascript'],
};

export default nextConfig;