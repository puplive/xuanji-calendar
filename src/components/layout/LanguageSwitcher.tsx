"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = newLocale;
    }
    router.push(segments.join('/') || '/');
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
    >
      <Globe size={12} />
      <span className="font-medium tracking-wider">{locale === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
}
