export const runtime = 'edge'; // 强制使用边缘运行时
/**
 * 我们将遵循 PRD 5.1/5.4 节的数据模型要求，将之前实现的 BaziEngine 和 StrengthEngine 逻辑封装进 Next.js 的 Route Handlers (App Router 架构)。

该 API 将接收用户的出生年月日时，返回完整的五行得分、日主强弱、喜用神以及基础黄历数据，为前端 Canvas 粒子和 AI 指引提供全量数据。

3. 如何在前端调用此接口？
在你的注册页面或设置页面（components/ProfileForm.tsx），你可以这样调用：
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

  const result = await response.json();
  
  if (result.success) {
    // 1. 将数据存入本地状态或 Zustand/Pinia
    // 2. 根据 result.data.analysis.wuxing 更新 Canvas 粒子颜色
    // 3. 将 result.data 传给 AI 生成每日指引
  }
};


4. 针对 AI Coding 的优化建议
如果你使用 Cursor 或 Copilot 进行开发，这个 API Route 提供了极好的上下文隔离：

逻辑解耦：所有玄学算法（BaziEngine, StrengthEngine）都在 /lib 下，API 只负责调度。AI 在修改接口时不会破坏底层的计算逻辑。
类型安全：建议在项目根目录创建一个 types/metaphysics.d.ts，定义上述响应对象的 Interface。这样 AI 在写前端代码时能准确预测 result.data.analysis.strength.status 这样的深层属性。
错误降级：我们在 API 中加入了 try-catch。如果 lunar-javascript 库报错，API 会返回 500 错误，前端可以据此显示“输入日期有误”的提示。

 */
import { NextRequest, NextResponse } from 'next/server';
import { Lunar, Solar } from 'lunar-javascript';
import { BaziEngine } from '@/lib/bazi-engine'; // 确保之前定义的类在此路径
import { StrengthEngine } from '@/lib/strength-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, minute = 0 } = body;

    // 1. 参数校验
    if (!year || !month || !day || hour === undefined) {
      return NextResponse.json({ error: '缺少必要的出生时间参数' }, { status: 400 });
    }

    // 2. 初始化农历/八字对象
    // 注意：Lunar.fromYmdHms 参数为公历
    const lunar = Lunar.fromYmdHms(year, month, day, hour, minute, 0);
    const solar = Solar.fromDate(new Date(year, month - 1, day, hour, minute));

    // 3. 调用核心计算引擎
    const wuxingScores = BaziEngine.calculateEnergy(lunar);
    const strength = StrengthEngine.calculate(lunar);

    // 4. 获取基础黄历信息 (PRD 3.3/5.4)
    const dailyHuangli = {
      lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      ganzhi: `${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()} ${lunar.getTimeInGanZhi()}`,
      zodiac: solar.getZodiac(),
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
      elements: lunar.getBaZiNaYin().join(' '),
    };

    // 5. 组装符合 PRD 5.1 规范的响应数据
    const responseData = {
      success: true,
      data: {
        userId: body.userId || 'guest',
        profile: {
          birthDate: `${year}-${month}-${day} ${hour}:${minute}`,
          zodiac: dailyHuangli.zodiac,
          bazi: {
            ganzhi: dailyHuangli.ganzhi,
            riGan: lunar.getDayGan(),
            riZhi: lunar.getDayZhi(),
          }
        },
        analysis: {
          wuxing: wuxingScores, // { jin: 20, mu: 30, ... }
          strength: {
            score: strength.score,
            status: strength.status, // "偏弱", "极旺" 等
            yongShen: strength.yongShen, // 喜用五行
          }
        },
        huangli: dailyHuangli
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Metaphysics API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: '计算失败，请检查输入参数格式' 
    }, { status: 500 });
  }
}
