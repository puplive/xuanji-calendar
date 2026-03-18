/**
 * 3. “我的”页面 (src/app/profile/page.tsx)
用于展示用户档案和设置。
 */
// "use client";

// import { UserCircle, Settings, Share2, CreditCard } from 'lucide-react';

// export default function ProfilePage() {
//   return (
//     <main className="min-h-screen bg-black text-white p-6 pb-32">
//       <header className="flex justify-between items-start mb-12 pt-8">
//         <div className="w-20 h-20 rounded-full border-2 border-gold-500/50 p-1">
//           <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center">
//             <UserCircle size={40} className="text-zinc-600" />
//           </div>
//         </div>
//         <button className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800">
//           <Settings size={20} />
//         </button>
//       </header>

//       <div className="mb-10">
//         <h1 className="text-2xl font-bold italic">Cyber Traveler</h1>
//         <p className="text-xs text-zinc-500 mt-1">UID: 0x2026玄机先行者</p>
//       </div>

//       <nav className="space-y-3">
//         {[
//           { icon: Share2, label: '分享我的命盘海报', color: 'text-blue-400' },
//           { icon: CreditCard, label: '订阅会员 (PREMIUM)', color: 'text-gold-500' },
//         ].map((item, idx) => (
//           <div key={idx} className="flex items-center justify-between p-5 bg-zinc-900/40 rounded-3xl border border-white/5 cursor-pointer hover:bg-zinc-800 transition">
//             <div className="flex items-center gap-4">
//               <item.icon className={item.icon === CreditCard ? 'text-gold-500' : 'text-zinc-400'} size={20} />
//               <span className="text-sm font-medium">{item.label}</span>
//             </div>
//           </div>
//         ))}
//       </nav>
//     </main>
//   );
// }

"use client";
export const runtime = 'edge'; // 强制使用边缘运行时

import { useProfile } from '@/hooks/useProfile';
import { calculateProfile } from '@/lib/profile-utils';
import { Calendar, Brain, Cpu, Hash, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  console.log(profile)
  const { logout } = useAuth();
  const setLogin = ()=>{
    if(profile.isGuest){
      logout()
    }else{
      router.push('/login'); // 登录成功后跳转到首页
    }
  }
  
  // 1. 尝试计算
  const meta = calculateProfile(new Date(profile.birthDate));

  // 2. 如果日期无效，给出一套占位数据，防止报错
  const displayData = meta || {
    lunarDate: '等待输入...',
    zodiac: '等待输入...',
    bazi: '---- ---- ---- ----'
  };
  
  const mbtiTypes = ["INTJ", "INFP", "ENTP", "ENFJ", "ISTJ", "ISFP", "ESTP", "ESFJ"]; // 简化版

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32">
      <header className="mb-10 pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-black italic tracking-tighter">ARCHIVE</h1>
        <div className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-[10px] text-gold-500 font-mono">
          V0.2.0
        </div>
      </header>

      {/* 1. 生日设置区 (阳历/阴历/八字) */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <Calendar size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">时空定位 · 生日</span>
        </div>

        <div className="p-6 bg-zinc-900/50 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
          <input 
            type="datetime-local" 
            // 增加容错：如果 profile.birthDate 为空，显示空字符串
            value={profile.birthDate || ""} 
            onChange={(e) => {
                console.log(e.target.value)
              // 只有当输入完整时才更新状态
              if (e.target.value) {
                updateProfile({ birthDate: e.target.value });
              }
            }}
            className="w-full bg-transparent text-xl font-bold text-[#D4AF37] outline-none mb-6 cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 mb-1">阴历 (Lunar)</p>
              <p className="text-sm font-medium">{displayData.lunarDate}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
              <p className="text-[10px] text-zinc-500 mb-1">星座 (Zodiac)</p>
              <p className="text-sm font-medium">{displayData.zodiac}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/10">
            <div className="flex items-center gap-2 mb-2 text-[#D4AF37]">
              <span className="text-[10px] font-bold">先天八字 (BaZi)</span>
            </div>
            <p className="text-lg font-mono tracking-widest text-[#D4AF37]/80 italic">
              {displayData.bazi}
            </p>
          </div>
        </div>
      </section>

      {/* 2. MBTI 设置区 */}
      <section className="mb-8 space-y-4">
        <div className="flex items-center gap-2 px-2 text-zinc-500">
          <Brain size={14} />
          <span className="text-[10px] font-bold tracking-widest uppercase">认知模型 · 性格</span>
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
        
                    {/* 选中时的光束微动效：在按钮底部增加一根极细的金线 */}
                    {isSelected && (
                    <motion.div 
                        layoutId="active-mbti-glow"
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
               <span className="text-xs text-blue-200">AI 对话式测评 (未开启)</span>
             </div>
             <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* 登录 退出 */}
      <button
          onClick={() => setLogin()}
          className={`
          ${!profile.isGuest 
              ? 'w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-[#D4AF37] text-black font-bold py-4 rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed' 
              : 'w-full bg-zinc-900/50 border border-white/10 hover:border-[#D4AF37]/30 text-white font-medium py-4 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3'
          }
          `}
      >
          {profile.isGuest? '退出': '登录'}
      </button>

      {/* 3. 数据重置 (隐私保护) */}
      <button 
        onClick={() => { localStorage.clear(); window.location.reload(); }}
        className="w-full py-4 text-xs text-zinc-700 hover:text-red-500 transition-colors italic underline"
      >
        重置所有本地时空数据
      </button>
    </main>
  );
}

