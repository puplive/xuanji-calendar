/**
 * 2. 状态管理：持久化档案 (hooks/useProfile.ts)
使用浏览器存储，确保刷新页面后生日和 MBTI 依然存在。
支持游客模式（本地存储）和登录用户（云端同步）
 */
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  birthDate: string;
  mbti: string;
}

export const useProfile = () => {
  const { user, isGuest, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    birthDate: '1995-08-23T14:30',
    mbti: 'INTJ'
  });
  const [isLoading, setIsLoading] = useState(true);

  // 从AuthContext的用户数据初始化profile
  useEffect(() => {
    const initializeProfile = () => {
      setIsLoading(true);
      try {
        let profileData: ProfileData;

        if (isGuest) {
          // 游客模式：从localStorage读取
          const saved = localStorage.getItem('xuanji_profile');
          profileData = saved ? JSON.parse(saved) : { birthDate: '1995-08-23T14:30', mbti: 'INTJ' };
        } else {
          // 登录用户：从用户数据提取
          profileData = {
            birthDate: user?.birthDate || '1995-08-23T14:30',
            mbti: user?.mbti || 'INTJ',
          };
        }

        setProfile(profileData);
      } catch (error) {
        console.error('Failed to initialize profile:', error);
        setProfile({ birthDate: '1995-08-23T14:30', mbti: 'INTJ' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [user, isGuest]);

  // 更新profile
  const updateProfile = useCallback(async (newData: Partial<ProfileData>) => {
    try {
      const updatedProfile = { ...profile, ...newData };
      setProfile(updatedProfile);

      if (isGuest) {
        // 游客模式：保存到localStorage
        localStorage.setItem('xuanji_profile', JSON.stringify(updatedProfile));
      } else {
        // 登录用户：更新用户信息并同步到云端
        updateUser({
          birthDate: updatedProfile.birthDate,
          mbti: updatedProfile.mbti,
        });

        // 调用API更新用户档案
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              // 注意：这里需要token，但updateUser已经更新了AuthContext
              // API路由的实现将在后面添加
            },
            body: JSON.stringify({
              birthDate: updatedProfile.birthDate,
              mbti: updatedProfile.mbti,
            }),
          });

          if (!response.ok) {
            console.warn('Failed to sync profile to cloud:', await response.text());
          }
        } catch (error) {
          console.warn('Profile sync failed, will retry later:', error);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [profile, isGuest, updateUser]);

  // 同步云端数据到本地（用于登录后同步）
  const syncFromCloud = useCallback(async () => {
    if (isGuest) return;

    try {
      // 这里可以调用API获取最新的用户档案
      // 暂时使用AuthContext中的用户数据
      if (user?.birthDate || user?.mbti) {
        const cloudProfile: ProfileData = {
          birthDate: user.birthDate || profile.birthDate,
          mbti: user.mbti || profile.mbti,
        };
        setProfile(cloudProfile);
      }
    } catch (error) {
      console.error('Failed to sync profile from cloud:', error);
    }
  }, [isGuest, user, profile.birthDate, profile.mbti]);

  // 当用户登录状态变化时同步数据
  useEffect(() => {
    if (!isGuest) {
      syncFromCloud();
    }
  }, [isGuest, syncFromCloud]);

  return {
    profile,
    updateProfile,
    isLoading,
    isGuest,
    userId: user?.id,
  };
};