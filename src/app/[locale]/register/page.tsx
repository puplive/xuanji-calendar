"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MBTI_TRAITS } from '@/constants/mappings';
import { useTranslations } from 'next-intl';

const MBTI_TYPES = Object.keys(MBTI_TRAITS);

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('Register');
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

    if (formData.password !== formData.confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('errorPasswordLength'));
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
      router.push('/');
    } catch (err: any) {
      setError(err.message || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-purple-900/10 to-[#050505]"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-md mx-auto px-6 pt-20 pb-32">
        <header className="text-center mb-12">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-black tracking-tighter text-white flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              XUANJI <span className="text-[#D4AF37]">AI</span>
            </h1>
          </Link>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Cyber Metaphysics Lab</p>
          <h2 className="text-2xl font-bold mt-8 mb-2">{t('pageTitle')}</h2>
          <p className="text-sm text-zinc-400">{t('pageSubtitle')}</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('usernameLabel')}</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder={t('usernamePlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder={t('passwordPlaceholder')}
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

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('confirmLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder={t('confirmPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">{t('personalInfo')}</h3>

            <div className="mb-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('birthLabel')}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="datetime-local"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('mbtiLabel')}</label>
              <select
                name="mbti"
                value={formData.mbti}
                onChange={handleChange}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all appearance-none"
              >
                <option value="">{t('mbtiPlaceholder')}</option>
                {MBTI_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loadingButton') : t('registerButton')}
          </button>

          <div className="text-center">
            <p className="text-sm text-zinc-500">
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-[#D4AF37] hover:text-amber-400 font-medium transition-colors">
                {t('loginLink')}
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-xs text-zinc-500 text-center">
            {t('privacyNotice', { link: '' })}{' '}
            <Link href="/legal/privacy" className="text-[#D4AF37] hover:text-amber-400">
              {t('privacyLink')}
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 mt-4">
            <Sparkles size={12} />
            <span>{t('footer')}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
