"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username?: string;
  birthDate?: string;
  mbti?: string;
  zodiac?: string;
  membershipType: string;
  points: number;
  badges: string[];
  createdAt?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
  birthDate?: string;
  mbti?: string;
  zodiac?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  updateUser: (updates: Partial<User>) => void;
  syncUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'xuanji_auth';
const GUEST_USER_ID = 'guest_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isGuest: true,
    isLoading: true,
  });

  // 初始化：从localStorage恢复认证状态
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAuthState({
            user: parsed.user,
            token: parsed.token,
            isGuest: parsed.isGuest || false,
            isLoading: false,
          });

          // 验证token是否有效
          if (parsed.token) {
            validateToken(parsed.token);
          }
        } else {
          // 无存储记录，默认游客模式
          setAuthState({
            user: createGuestUser(),
            token: null,
            isGuest: true,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState({
          user: createGuestUser(),
          token: null,
          isGuest: true,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // 创建游客用户
  const createGuestUser = (): User => ({
    id: GUEST_USER_ID,
    email: 'guest@xuanji.com',
    username: '游客',
    membershipType: 'FREE',
    points: 0,
    badges: [],
  });

  // 验证token有效性
  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json() as any;
      if (!data.isGuest && data.user) {
        setAuthState(prev => ({
          ...prev,
          user: data.user,
          isGuest: false,
        }));
        saveToStorage(data.user, token, false);
      }
    } catch (error) {
      console.warn('Token validation failed, switching to guest mode');
      logout();
    }
  };

  // 保存到localStorage
  const saveToStorage = (user: User | null, token: string | null, isGuest: boolean) => {
    const data = { user, token, isGuest };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.error || '登录失败');
      }

      const data = await response.json() as any;
      if (!data.success) {
        throw new Error('登录失败');
      }

      setAuthState({
        user: data.user,
        token: data.token,
        isGuest: false,
        isLoading: false,
      });

      saveToStorage(data.user, data.token, false);

      // 登录成功后触发数据同步
      await syncUserData();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // 注册
  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.error || '注册失败');
      }

      const result = await response.json() as any;
      if (!result.success) {
        throw new Error('注册失败');
      }

      setAuthState({
        user: result.user,
        token: result.token,
        isGuest: false,
        isLoading: false,
      });

      saveToStorage(result.user, result.token, false);

      // 注册成功后触发数据同步
      await syncUserData();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // 注销
  const logout = () => {
    setAuthState({
      user: createGuestUser(),
      token: null,
      isGuest: true,
      isLoading: false,
    });

    saveToStorage(createGuestUser(), null, true);
  };

  // 游客模式继续
  const continueAsGuest = () => {
    const guestUser = createGuestUser();
    setAuthState({
      user: guestUser,
      token: null,
      isGuest: true,
      isLoading: false,
    });

    saveToStorage(guestUser, null, true);
  };

  // 更新用户信息
  const updateUser = (updates: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      saveToStorage(updatedUser, prev.token, prev.isGuest);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  };

  // 同步用户数据（从云端获取最新数据）
  const syncUserData = async () => {
    if (authState.isGuest || !authState.token) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authState.token}` },
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (!data.isGuest && data.user) {
          setAuthState(prev => ({
            ...prev,
            user: data.user,
          }));
          saveToStorage(data.user, authState.token, false);
        }
      }
    } catch (error) {
      console.warn('User data sync failed:', error);
    }
  };

  // 定期同步用户数据
  useEffect(() => {
    if (!authState.isGuest && authState.token) {
      const interval = setInterval(syncUserData, 5 * 60 * 1000); // 每5分钟同步一次
      return () => clearInterval(interval);
    }
  }, [authState.isGuest, authState.token]);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    continueAsGuest,
    updateUser,
    syncUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}