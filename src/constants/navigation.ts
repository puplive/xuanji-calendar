/**
 * 根据 PRD 3.2 节 的导航定义，我们需要将首页底部的静态占位符替换为具备状态切换、视觉反馈和路由跳转功能的交互组件。

为了保持全站一致的“科技感”，我们将使用 Framer Motion 实现悬浮导航栏的呼吸感特效。

1. 定义导航配置 (constants/navigation.ts)
首先定义导航项的结构，方便统一维护图标和路径。
 */
import { Compass, Sparkles, ShieldAlert, UserCircle } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'home', label: '首页', path: '/', icon: Compass },
  { id: 'goal', label: '目标', path: '/goals', icon: Sparkles },
  { id: 'grow', label: '成长', path: '/grow', icon: ShieldAlert },
  { id: 'user', label: '我的', path: '/profile', icon: UserCircle },
];
