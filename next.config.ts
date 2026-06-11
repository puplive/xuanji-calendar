/**
 * Next.js 配置 for Cloudflare Pages 部署
 */
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'export',
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
};

export default withNextIntl(nextConfig);