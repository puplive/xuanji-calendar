/**
 * 2. 编写导航组件 (components/layout/BottomNav.tsx)
这个组件采用了 Glassmorphism（毛玻璃） 风格，并带有当前激活项的背景光晕。
 */
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/constants/navigation';

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
      <nav className="relative h-16 bg-zinc-900/80 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-center w-12 h-12 transition-colors group"
            >
              {/* 激活状态的背景光晕 */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className="absolute inset-0 bg-gold-500/10 rounded-full blur-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* 图标 */}
              <motion.div
                animate={{ 
                  scale: isActive ? 1.2 : 1,
                  color: isActive ? '#D4AF37' : '#71717a' 
                }}
                className="relative z-10"
              >
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* 底部的小点（激活时显示） */}
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -bottom-1 w-1 h-1 bg-gold-500 rounded-full"
                />
              )}

              {/* 悬停时的提示（可选） */}
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-zinc-800 text-[10px] px-2 py-1 rounded text-zinc-400">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
