"use client";

import { useState } from 'react';
import { useFortuneData } from '@/hooks/useFortuneData';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SetupPage() {
  const t = useTranslations('Setup');
  const { saveProfile } = useFortuneData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const success = await saveProfile({
      year: 1995, month: 8, day: 23, hour: 14,
      mbti: 'INTJ'
    });

    if (success) router.push('/');
    else alert('计算失败');
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen text-white p-10">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <button
          disabled={loading}
          className="w-full bg-gold-600 py-3 rounded-xl font-bold"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>
    </div>
  );
}
