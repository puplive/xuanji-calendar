/**
 * // src/app/layout.tsx

 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 引入刚刚创建的安全组件
import SecurityHandler from "@/components/SecurityHandler"; 
import { BottomNav } from '@/components/layout/BottomNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 这里保留 Metadata，对 SEO 非常重要
export const metadata: Metadata = {
  title: "玄机日历 - 科技玄学个人成长助手",
  description: "融合八字、MBTI 与 AI 的全栈成长工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      {/* <body className="antialiased bg-black min-h-screen"></body> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 在这里插入安全组件 */}
        <SecurityHandler />
        {children}
        {/* 全局底部导航 */}
        <BottomNav />
      </body>
    </html>
  );
}

