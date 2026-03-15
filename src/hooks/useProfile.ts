/**
 * 2. 状态管理：持久化档案 (hooks/useProfile.ts)
使用浏览器存储，确保刷新页面后生日和 MBTI 依然存在。
 */
"use client";
import { useState, useEffect } from 'react';

export const useProfile = () => {
  const [profile, setProfile] = useState<{
    birthDate: string;
    mbti: string;
  }>({ birthDate: '1995-08-23T14:30', mbti: 'INTJ' });

  useEffect(() => {
    const saved = localStorage.getItem('xuanji_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const updateProfile = (newData: any) => {
    const updated = { ...profile, ...newData };
    setProfile(updated);
    localStorage.setItem('xuanji_profile', JSON.stringify(updated));
  };

  return { profile, updateProfile };
};
