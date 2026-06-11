"use client";

import { ReactNode, useEffect } from 'react';
import SecurityHandler from '@/components/SecurityHandler';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ClientLayout({
  children,
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    const title = locale === 'en'
      ? 'Xuanji Calendar - Cyber Metaphysics Personal Growth Tool'
      : '玄机日历 - 科技玄学个人成长助手';
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const description = locale === 'en'
      ? 'A personal growth tool fusing BaZi, MBTI, constellations and AI'
      : '融合八字、MBTI 与 AI 的全栈成长工具';
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [locale]);

  return (
    <>
      <SecurityHandler />
      <AuthProvider locale={locale}>
        {children}
        <BottomNav />
      </AuthProvider>
    </>
  );
}
