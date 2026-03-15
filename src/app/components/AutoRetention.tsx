/**4. 自动化运营：基于数据的“能量挽回”策略
我们可以利用这些数据，在用户流失前通过代码逻辑自动“挽回”。

场景：用户连续 3 天未打卡。

代码逻辑：在 app/layout.tsx 中检测打卡记录。
策略：如果流失，下一次进入时，首页粒子颜色变为“深灰色（空灵感）”，AI 生成一段特殊的“唤醒指引”。 */
// app/components/AutoRetention.tsx
// const checkRetention = (lastCheckinDate: string) => {
//   const diff = daysBetween(new Date(), new Date(lastCheckinDate));
//   if (diff >= 3) {
//     trackEvent('user_retention_warning', { days_inactive: diff });
//     // 修改全局状态，让 AI 生成“能量流失”警告
//     setSystemMode('RETENTION_MODE');
//   }
// };

// src/app/components/AutoRetention.tsx

// 1. 添加计算天数差的工具函数
const daysBetween = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  // 将毫秒转换为天数 (1000ms * 60s * 60min * 24h)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// 2. 原有的 checkRetention 逻辑
const checkRetention = (lastCheckinDate: string) => {
  // 增加对空日期的判断，防止报错
  if (!lastCheckinDate) return 0;

  const diff = daysBetween(new Date(), new Date(lastCheckinDate));
  
  if (diff >= 3) {
    // 确保 trackEvent 已经正确导入
    // trackEvent('user_retention_warning', { days_inactive: diff });
    
    // 逻辑：修改全局状态，让 AI 生成“能量流失”警告
    // setSystemMode('RETENTION_MODE');
    console.log(`用户已流失 ${diff} 天，触发能量挽回逻辑`);
  }
  
  return diff;
};

// 如果这个文件是一个 React 组件，记得导出它
export default function AutoRetention() {
  // 组件逻辑...
  return null;
}
