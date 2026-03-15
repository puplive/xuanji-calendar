export const runtime = 'edge'; // 强制使用边缘运行时
/**
 * 3. AI 练习生成引擎 (app/api/practice-oracle/route.ts)
 * 这是本模块的灵魂：根据用户今日的黄历宜忌和身旺身弱状态，动态调整练习难度。 */
export async function POST(req: Request) {
  const { weakness, profile, huangli } = await req.json();

  const prompt = `
    你是一位心理咨询师兼玄学导师。
    用户弱点：${weakness.name}（成因：${weakness.baziCause}）。
    用户状态：日主${profile.strengthStatus}，MBTI为${profile.mbti}。
    今日天时：宜${huangli.yi.join('/')}，忌${huangli.ji.join('/')}。
    
    任务：
    1. 用一句话从玄学+心理学角度解释这个弱点今日的表现。
    2. 提供一个极简的“今日修行指令”（不超过20字）。
    3. 如果今日黄历为“忌出行/开市”，练习应偏向“静心”；若“宜动土/祭祀”，练习应偏向“爆发”。
  `;

  // 模拟AI返回
  return Response.json({
    insight: "今日枭神能量活跃，你的INTJ直觉容易变成无端的猜忌。",
    instruction: "在笔记本上写下3个客观事实，对抗主观焦虑。",
    themeColor: profile.strengthStatus.includes('旺') ? '#ef4444' : '#3b82f6'
  });
}
