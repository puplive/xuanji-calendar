/**
 * 2. AI 深度报告生成 (Server Action)
在 app/actions/matchReport.ts 中，我们利用上述硬数据驱动 AI 生成高感知度的文本。
 */
"use server";

export async function generateMatchReport(dataA: any, dataB: any, matchResult: any) {
  const prompt = `
    你是一位跨越时空的姻缘引路人。请根据以下硬核数据，为两位用户撰写一份“赛博命理”配对报告。
    
    【用户A】MBTI: ${dataA.mbti}, 日主能量: ${dataA.strengthStatus}
    【用户B】MBTI: ${dataB.mbti}, 日主能量: ${dataB.strengthStatus}
    【系统测算】匹配度: ${matchResult.score}%, 标签: ${matchResult.tags.join(', ')}
    
    请按以下格式输出：
    1. [磁场共振]：用诗意的语言描述两人的能量交织（如“INTJ的深邃冰川遇上ENFP的炽热阳光”）。
    2. [潜在锚点]：基于八字五行指出两人的互补点。
    3. [相处代码]：给出一句两人的专属相处咒语（建议）。
  `;

  // 调用 AI API (如 DeepSeek)
  // const response = await fetchAI(prompt);
  return { 
    reportText: "你们的相遇是一场预设的程序触发。A的严谨逻辑（INTJ）为B的跳跃能量提供了结构，而B的感性磁场滋润了A干燥的五行平衡...",
    score: matchResult.score 
  };
}

