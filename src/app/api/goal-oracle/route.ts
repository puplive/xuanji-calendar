export const runtime = 'edge'; // 强制使用边缘运行时
/**
 * 3. AI 驱动的目标指引 (app/api/goal-oracle/route.ts)
根据 PRD 3.5，每个目标每日会生成一条融合了黄历的个性化建议。
 */
export async function POST(req: Request) {
  const { goalName, wuxing, huangli, mbti } = await req.json();

  // 提示词工程：融合目标与玄学数据
  const prompt = `
    你是一位成长教练。用户目标是：${goalName}。
    用户性格：${mbti}。
    今日五行最旺：${Object.entries(wuxing).sort((a:any,b:any)=>b[1]-a[1])[0][0]}。
    今日黄历：宜 ${huangli.yi.join(', ')}。
    请生成一句话建议，告知用户今日如何结合天时地利去推进这个目标。
  `;

  // 模拟 AI 输出
  const advice = `今日‘木’气旺盛，宜求财与行动，配合你 ${mbti} 的计划性，下午3点是推进‘${goalName}’的最佳能量窗口。`;
  
  return Response.json({ advice });
}
