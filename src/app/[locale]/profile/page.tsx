"use client";
export const runtime = 'edge';

import { useProfile } from '@/hooks/useProfile';
import { Calendar, Brain, Cpu, ChevronRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MBTI_TRAITS } from '@/constants/mappings';
import { useTranslations } from 'next-intl';

type CalculationModule = {
  calculateProfile: any;
};

const loadCalculationModule = async () => {
  const { calculateProfile } = await import('@/lib/profile-utils');
  return { calculateProfile };
};

export default function ProfilePage() {
  const t = useTranslations('Profile');
  const router = useRouter();
  const { profile, isGuest, updateProfile } = useProfile();
  const { logout } = useAuth();
  const [calculationModule, setCalculationModule] = useState<CalculationModule | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const setLogin = ()=>{
    if(isGuest){
      router.push('/login');
    }else{
      logout()
    }
  }

  useEffect(() => {
    let isCancelled = false;

    const loadModule = async () => {
      try {
        const module = await loadCalculationModule();
        if (!isCancelled) {
          setCalculationModule(module);
          if (profile.birthDate) {
            try {
              const result = module.calculateProfile(new Date(profile.birthDate));
              setMeta(result);
            } catch (error) {
              console.error('计算命理数据失败:', error);
              setMeta(null);
            }
          }
        }
      } catch (error) {
        console.error('加载命理计算模块失败:', error);
      }
    };

    loadModule();
    return () => { isCancelled = true; };
  }, [profile.birthDate]);

  useEffect(() => {
    if (calculationModule && profile.birthDate) {
      try {
        const result = calculationModule.calculateProfile(new Date(profile.birthDate));
        setMeta(result);
      } catch (error) {
        console.error('计算命理数据失败:', error);
        setMeta(null);
      }
    } else if (!profile.birthDate) {
      setMeta(null);
    }
  }, [profile.birthDate, calculationModule]);

  const displayData = meta || {
    lunarDate: t('waitingInput'),
    zodiac: t('waitingInput'),
    ganzhi: { year: '--', month: '--', day: '--' },
    bazi: '---- ---- ---- ----'
  };

  const mbtiTypes = Object.keys(MBTI_TRAITS);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="mb-10 pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-black italic tracking-tighter">{t('pageTitle')}</h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[10px] text-gold-500 font-mono">
            {t('version', { version: '0.2.0' })}
          </div>
        </div>
      </header>

      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <Calendar size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('birthSection')}</span>
        </div>

        <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
          <input
            type="datetime-local"
            value={profile.birthDate || ""}
            onChange={(e) => {
              if (e.target.value) {
                updateProfile({ birthDate: e.target.value });
              }
            }}
            className="w-full bg-transparent text-xl font-bold text-[#D4AF37] outline-none mb-6 cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 mb-1">{t('lunarLabel')}</p>
              <p className="text-sm font-medium">{displayData.lunarDate}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 mb-1">{t('zodiacLabel')}</p>
              <p className="text-sm font-medium">{displayData.zodiac}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
            <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
              <span className="text-[10px] font-bold">{t('baziLabel')}</span>
            </div>
            <p className="text-lg font-mono tracking-widest text-[#D4AF37]/80 italic">
              {displayData.bazi}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <Brain size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{t('mbtiSection')}</span>
        </div>

        <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5">
          <div className="flex flex-wrap gap-2">
            {mbtiTypes.map(type => {
                const isSelected = profile.mbti === type;
                return (
                <button
                    key={type}
                    onClick={() => updateProfile({ mbti: type })}
                    className={`
                    relative px-5 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300
                    ${isSelected
                        ? 'bg-[#D4AF37] text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] z-10'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                    }
                    `}
                >
                    {type}

                    {isSelected && (
                    <div
                        className="absolute -bottom-1 left-1/4 right-1/4 h-[1px] bg-white/60 blur-[1px]"
                    />
                    )}
                </button>
                );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 cursor-pointer group">
             <div className="flex items-center gap-3">
               <Cpu size={18} className="text-blue-400" />
               <span className="text-xs text-blue-200">{t('aiAssessment')}</span>
             </div>
             <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      <button
          onClick={() => setLogin()}
          className={`
          ${isGuest
              ? 'w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
              : 'w-full bg-zinc-900/50 border border-white/10 hover:border-[#D4AF37]/30 text-white font-medium py-4 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3'
          }
          `}
      >
          {isGuest ? t('loginButton') : t('logoutButton')}
      </button>

      <button
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-4 text-xs text-zinc-700 hover:text-red-500 transition-colors italic underline"
      >
        {t('resetData')}
      </button>
    </main>
  );
}
