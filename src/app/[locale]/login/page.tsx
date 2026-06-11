"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('Login');
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || '');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    continueAsGuest();
    router.push('/');
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

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t('passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? t('loadingButton') : t('loginButton')}
          </button>

          <div className="text-center">
            <p className="text-sm text-zinc-500">
              {t('noAccount')}{' '}
              <Link href="/register" className="text-[#D4AF37] hover:text-amber-400 font-medium transition-colors">
                {t('registerLink')}
              </Link>
            </p>
          </div>
        </motion.form>

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-xs text-zinc-500 uppercase tracking-wider">{t('orDivider')}</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <h3 className="text-sm font-medium text-zinc-300 mb-4">{t('guestTitle')}</h3>
          <button
            onClick={handleGuestMode}
            className="w-full bg-zinc-900/50 border border-white/10 hover:border-[#D4AF37]/30 text-white font-medium py-4 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
          >
            <User size={18} className="text-[#D4AF37]" />
            {t('guestButton')}
          </button>
          <p className="text-xs text-zinc-500 mt-4 px-4">
            {t('guestNote')}
          </p>
        </motion.div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
            <Calendar size={12} />
            <span>{t('footer')}</span>
          </div>
          <p className="text-[10px] text-zinc-600 text-center mt-2">
            {t('footerNote')}
          </p>
        </div>
      </div>
    </main>
  );
}
