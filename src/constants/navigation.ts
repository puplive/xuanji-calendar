import { Compass, Sparkles, ShieldAlert, UserCircle } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'home', label: '首页', labelKey: 'Navigation.home', path: '/', icon: Compass },
  { id: 'goal', label: '目标', labelKey: 'Navigation.goal', path: '/goals', icon: Sparkles },
  { id: 'grow', label: '成长', labelKey: 'Navigation.grow', path: '/grow', icon: ShieldAlert },
  { id: 'user', label: '我的', labelKey: 'Navigation.user', path: '/profile', icon: UserCircle },
];
