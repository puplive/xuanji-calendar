/**
 * 订阅权益检测 Hook
 * 用于全站功能拦截
 */

/**
 * 订阅权益检测 Hook
 * 用于全站功能拦截
 */

import { useProfile } from '@/hooks/useProfile';
import { TIER_CONFIG } from '@/constants/membership';

export const useAuthStatus = () => {
  const { profile, isGuest } = useProfile();

  const isPremium = false; // TODO: 从用户数据获取

  const checkAccess = (feature: keyof typeof TIER_CONFIG.FREE) => {
    if (isPremium) return true;
    return TIER_CONFIG.FREE[feature];
  };

  return { isPremium, checkAccess, profile, isGuest };
};
