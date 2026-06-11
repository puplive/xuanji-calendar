"use client";

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Target, Zap, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WeaknessChartProps {
  practices: Array<{
    id?: number;
    weaknessId: string;
    date: string;
    content: string;
    isCompleted: boolean;
    streak: number;
  }>;
  timeRange?: 'week' | 'month' | 'year';
}

export const WeaknessChart = ({ practices, timeRange = 'week' }: WeaknessChartProps) => {
  const t = useTranslations('WeaknessChart');

  if (!practices || practices.length === 0) {
    return (
      <div className="p-8 text-center">
        <Shield className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
        <p className="text-sm text-zinc-500">{t('empty')}</p>
      </div>
    );
  }

  const processDailyCompletion = () => {
    const dailyMap: Record<string, { completed: number; total: number }> = {};
    practices.forEach(practice => {
      const date = practice.date;
      if (!dailyMap[date]) dailyMap[date] = { completed: 0, total: 0 };
      dailyMap[date].total += 1;
      if (practice.isCompleted) dailyMap[date].completed += 1;
    });
    return Object.entries(dailyMap)
      .map(([date, data]) => ({ date, completed: data.completed, completionRate: Math.round((data.completed / data.total) * 100) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  };

  const processStreakData = () => {
    const streakMap: Record<number, number> = {};
    practices.forEach(practice => {
      const streak = practice.streak;
      streakMap[streak] = (streakMap[streak] || 0) + 1;
    });
    return Object.entries(streakMap).map(([streak, count]) => ({ streak: parseInt(streak), count })).sort((a, b) => a.streak - b.streak);
  };

  const processWeaknessTypeData = () => {
    const types = [
      t('weaknessTypeNames.procrastination'),
      t('weaknessTypeNames.overthinking'),
      t('weaknessTypeNames.moodSwings'),
      t('weaknessTypeNames.distraction'),
      t('weaknessTypeNames.perfectionism'),
    ];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    return types.map((type, index) => ({
      name: type,
      value: Math.floor(Math.random() * 30) + 20,
      color: colors[index]
    }));
  };

  const processCompletionTrend = () => {
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayPractices = practices.filter(p => p.date === dateStr);
      const completionRate = dayPractices.length > 0
        ? Math.round((dayPractices.filter(p => p.isCompleted).length / dayPractices.length) * 100)
        : 0;
      trendData.push({ date: dateStr.substring(5), rate: completionRate, target: 80 });
    }
    return trendData;
  };

  const dailyData = processDailyCompletion();
  const streakData = processStreakData();
  const weaknessTypeData = processWeaknessTypeData();
  const completionTrendData = processCompletionTrend();

  const totalPractices = practices.length;
  const completedPractices = practices.filter(p => p.isCompleted).length;
  const completionRate = totalPractices > 0 ? Math.round((completedPractices / totalPractices) * 100) : 0;
  const maxStreak = practices.length > 0 ? Math.max(...practices.map(p => p.streak)) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">{t('completionRateLabel')}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-white">{completionRate}</span>
            <span className="text-[10px] text-red-400">%</span>
          </div>
        </div>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">{t('maxStreakLabel')}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold italic text-white">{maxStreak}</span>
            <span className="text-[10px] text-amber-400">{t('streakUnit')}</span>
          </div>
        </div>
      </div>

      {/* Completion Trend */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-red-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{t('completionTrend')}</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={completionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} formatter={(value) => [`${value}%`, t('completionRateLabel')]} />
              <Area type="monotone" dataKey="rate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} name={t('actualRate')} />
              <Area type="monotone" dataKey="target" stroke="#10b981" fill="transparent" strokeWidth={1} strokeDasharray="5 5" name={t('targetLine')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weakness Type Distribution */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-red-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{t('weaknessDistribution')}</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={weaknessTypeData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value">
                {weaknessTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} formatter={(value) => [`${value}%`, t('ratio')]} />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak Distribution */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-red-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{t('streakDistribution')}</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={streakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="streak" stroke="#666" fontSize={10} label={{ value: t('streakAxisLabel'), position: 'insideBottom', offset: -5, fill: '#666', fontSize: 10 }} />
              <YAxis stroke="#666" fontSize={10} allowDecimals={false} label={{ value: t('countAxisLabel'), angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} formatter={(value) => [value, t('occurrence')]} />
              <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} name={t('occurrence')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
