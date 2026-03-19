"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Calendar, Target } from 'lucide-react';

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
  if (!goals || goals.length === 0) {
    return (
      <div className="p-8 text-center">
        <Target className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
        <p className="text-sm text-zinc-500">暂无数据，开始设定目标以查看统计</p>
      </div>
    );
  }
  // 获取类型标签
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'study': '学习',
      'health': '健康',
      'work': '工作',
      'emotion': '情绪',
      'other': '其他'
    };
    return labels[type] || type;
  };

  // 处理数据：计算每日打卡总数
  const processDailyCheckins = () => {
    const dailyMap: Record<string, number> = {};

    goals.forEach(goal => {
      goal.checkins.forEach(checkin => {
        const date = checkin.date;
        dailyMap[date] = (dailyMap[date] || 0) + 1;
      });
    });

    // 转换为数组并排序
    return Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // 最近7天
  };

  // 处理数据：按目标类型统计进度
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

  // 处理数据：五行维度进度（模拟）
  const processWuxingData = () => {
    const wuxingTypes = ['mu', 'huo', 'tu', 'jin', 'shui'];
    const typeLabels = ['木', '火', '土', '金', '水'];

    return wuxingTypes.map((type, index) => ({
      element: typeLabels[index],
      score: Math.floor(Math.random() * 60) + 40, // 模拟数据
      fullMark: 100
    }));
  };

  const dailyData = processDailyCheckins();
  const typeData = processGoalTypeData();
  const wuxingData = processWuxingData();

  

  return (
    <div className="space-y-6">
      {/* 每日打卡趋势 */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">每日打卡趋势</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                stroke="#666"
                fontSize={10}
                tickFormatter={(value) => value.substring(5)} // 显示月-日
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}
                labelStyle={{ color: '#fff', fontSize: '10px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={{ r: 3, fill: '#D4AF37' }}
                activeDot={{ r: 5 }}
                name="打卡次数"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 目标类型分布 */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">目标类型分布</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="type"
                stroke="#666"
                fontSize={10}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}
                formatter={(value) => [`${value}%`, '平均进度']}
              />
              <Bar
                dataKey="avgProgress"
                fill="#D4AF37"
                radius={[4, 4, 0, 0]}
                name="平均进度"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 五行成长雷达图 */}
      {/* <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-gold-500" />
          <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">五行成长维度</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={wuxingData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis
                dataKey="element"
                stroke="#666"
                fontSize={10}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                stroke="#666"
              />
              <Radar
                name="五行成长"
                dataKey="score"
                stroke="#D4AF37"
                fill="#D4AF37"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
};