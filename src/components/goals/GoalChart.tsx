"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GoalChartProps {
  goals: Array<{
    id?: number;
    name: string;
    progress: number;
    type: string;
    checkins: { date: string; value: number }[];
    startDate: string;
  }>;
  timeRange?: 'week' | 'month' | 'year';
}

export const GoalChart = ({ goals, timeRange = 'week' }: GoalChartProps) => {
  const t = useTranslations('GoalChart');

  if (!goals || goals.length === 0) {
    return (
      <div className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
        <p className="text-sm text-zinc-500">{t('empty')}</p>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'study': t('typeLabels.study'),
      'health': t('typeLabels.health'),
      'work': t('typeLabels.work'),
      'emotion': t('typeLabels.emotion'),
      'other': t('typeLabels.other')
    };
    return labels[type] || type;
  };

  // Process data
  const processDailyCheckins = () => {
    const dailyMap: Record<string, number> = {};
    goals.forEach(goal => {
      goal.checkins.forEach(checkin => {
        const date = checkin.date;
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });
    });
    return Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  };

  const processGoalTypeData = () => {
    const typeMap: Record<string, { count: number; totalProgress: number }> = {};
    goals.forEach(goal => {
      if (!typeMap[goal.type]) {
        typeMap[goal.type] = { count: 0, totalProgress: 0 };
      }
      typeMap[goal.type].count += 1;
      typeMap[goal.type].totalProgress += goal.progress;
    });
    return Object.entries(typeMap).map(([type, data]) => ({
      type: getTypeLabel(type),
      count: data.count,
      avgProgress: Math.round(data.totalProgress / data.count)
    }));
  };

  const dailyData = processDailyCheckins();
  const typeData = processGoalTypeData();

  return (
    <div className="space-y-6">
      {/* Daily Check-in Trend */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{t('dailyTrend')}</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(value) => value.substring(5)} />
              <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontSize: '10px' }} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: '#D4AF37' }} activeDot={{ r: 5 }} name={t('checkinLegend')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal Type Distribution */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{t('typeDistribution')}</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="type" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }} formatter={(value) => [`${value}%`, t('avgProgress')]} />
              <Bar dataKey="avgProgress" fill="#D4AF37" radius={[4, 4, 0, 0]} name={t('avgProgress')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
