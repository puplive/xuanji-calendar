"use server";
/**第四步：AI 接口设计 (Server Action) */
export async function generateDailyGuidance(userData: any, fortuneData: any) {
  const prompt = `
    你是一位融合东西方智慧的成长教练。
    用户性格: ${userData.mbti}, 星座: ${fortuneData.zodiac}
    今日干支: ${fortuneData.ganzhi}, 宜: ${fortuneData.yi.join(',')}, 忌: ${fortuneData.ji.join(',')}
    请生成一段100字以内的今日成长指引。
  `;

  // 这里调用你的 AI API (如 DeepSeek)
  // const response = await fetch('https://api.deepseek.com/chat/completions', { ... })
  
  // 模拟返回
  return "今日‘癸水’能量充沛，结合你INTJ的深度思考力，适合复盘长线目标。忌远行，建议静心阅读。";
}
