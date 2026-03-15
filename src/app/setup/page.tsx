/**
 * 5. 页面集成示例 (app/setup/page.tsx)
用户录入信息并持久化的流程。
 */
"use client";
import { useState } from 'react';
import { useFortuneData } from '@/hooks/useFortuneData';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const { saveProfile } = useFortuneData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    // 模拟表单数据
    const success = await saveProfile({
      year: 1995, month: 8, day: 23, hour: 14,
      mbti: 'INTJ'
    });

    if (success) router.push('/home');
    else alert('计算失败');
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen text-white p-10">
      <h1 className="text-2xl font-bold mb-6">初始化你的命盘</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* 输入框组件... */}
        <button 
          disabled={loading}
          className="w-full bg-gold-600 py-3 rounded-xl font-bold"
        >
          {loading ? '正在计算天机...' : '开启玄机之旅'}
        </button>
      </form>
    </div>
  );
}
