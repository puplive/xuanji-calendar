"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Calendar, MoonStar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// MBTI类型选项
const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// 星座选项
const ZODIAC_SIGNS = [
  '白羊座', '金牛座', '双子座', '巨蟹座',
  '狮子座', '处女座', '天秤座', '天蝎座',
  '射手座', '摩羯座', '水瓶座', '双鱼座'
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthDate: '',
    mbti: '',
    zodiac: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        username: formData.username || undefined,
        birthDate: formData.birthDate || undefined,
        mbti: formData.mbti || undefined,
        zodiac: formData.zodiac || undefined,
      });
      router.push('/'); // 注册成功后跳转到首页
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-purple-900/10 to-[#050505]"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-md mx-auto px-6 pt-20 pb-32">
        {/* 头部 */}
        <header className="text-center mb-12">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              XUANJI <span className="text-[#D4AF37]">AI</span>
            </h1>
          </Link>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Cyber Metaphysics Lab</p>
          <h2 className="text-2xl font-bold mt-8 mb-2">创建账户</h2>
          <p className="text-sm text-zinc-400">完善个人信息以获得个性化玄学指导</p>
        </header>

        {/* 注册表单 */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* 邮箱输入 */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              邮箱地址 *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* 用户名输入 */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              用户名（可选）
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder="选择你的用户名"
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              密码 *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder="至少6位字符"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              确认密码 *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder="再次输入密码"
                required
              />
            </div>
          </div>

          {/* 个人信息部分 */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">个性化信息（可选）</h3>

            {/* 出生日期 */}
            <div className="mb-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                出生日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* MBTI类型 */}
            <div className="mb-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                MBTI人格类型
              </label>
              <select
                name="mbti"
                value={formData.mbti}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all appearance-none"
              >
                <option value="">选择你的MBTI类型</option>
                {MBTI_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 星座 */}
            <div className="mb-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                星座
              </label>
              <div className="relative">
                <MoonStar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select
                  name="zodiac"
                  value={formData.zodiac}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">选择你的星座</option>
                  {ZODIAC_SIGNS.map(sign => (
                    <option key={sign} value={sign}>{sign}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '注册中...' : '创建账户'}
          </button>

          {/* 登录链接 */}
          <div className="text-center">
            <p className="text-sm text-zinc-500">
              已有账户？{' '}
              <Link href="/login" className="text-[#D4AF37] hover:text-amber-400 font-medium transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </motion.form>

        {/* 隐私声明 */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs text-zinc-500 text-center">
            注册即表示你同意我们的{' '}
            <Link href="/legal/privacy" className="text-[#D4AF37] hover:text-amber-400">
              隐私政策
            </Link>
            。所有数据将加密存储，确保你的隐私安全。
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 mt-4">
            <Sparkles size={12} />
            <span>玄机日历 · 科技玄学个人成长工具</span>
          </div>
        </div>
      </div>
    </main>
  );
}