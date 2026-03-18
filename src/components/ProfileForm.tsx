/**
 * 我们将遵循 PRD 5.1/5.4 节的数据模型要求，将之前实现的 BaziEngine 和 StrengthEngine 逻辑封装进 Next.js 的 Route Handlers (App Router 架构)。

该 API 将接收用户的出生年月日时，返回完整的五行得分、日主强弱、喜用神以及基础黄历数据，为前端 Canvas 粒子和 AI 指引提供全量数据。

1. 路径结构
在 Next.js 项目中创建文件：app/api/metaphysics/calculate/route.ts
 * @param formData 
 * 3. 如何在前端调用此接口？
在你的注册页面或设置页面（components/ProfileForm.tsx），你可以这样调用：
 */

const handleCalculate = async (formData: any) => {
  const response = await fetch('/api/metaphysics/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      year: 1995,
      month: 8,
      day: 23,
      hour: 14,
      userId: 'user_123'
    })
  });

  const result = await response.json() as any;
  
  if (result.success) {
    // 1. 将数据存入本地状态或 Zustand/Pinia
    // 2. 根据 result.data.analysis.wuxing 更新 Canvas 粒子颜色
    // 3. 将 result.data 传给 AI 生成每日指引
  }
};
