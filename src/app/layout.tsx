/**
 * // src/app/layout.tsx

 */

"use client";

import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 引入刚刚创建的安全组件
import SecurityHandler from "@/components/SecurityHandler";
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthProvider } from '@/contexts/AuthContext';


// 1. 移除 Geist 字体导入逻辑（这些会导致网络下载错误）

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// 由于布局现在是客户端组件，使用内联title
// export const metadata: Metadata = {
//   title: "玄机日历 - 科技玄学个人成长助手",
//   description: "融合八字、MBTI 与 AI 的全栈成长工具",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <title>玄机日历 - 科技玄学个人成长助手</title>
        <meta name="description" content="融合八字、MBTI 与 AI 的全栈成长工具" />
      </head>
      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > */}
      <body className="antialiased bg-black min-h-screen">
        {/* 在这里插入安全组件 */}
        <SecurityHandler />
        <AuthProvider>
          {children}
          {/* 全局底部导航 */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
