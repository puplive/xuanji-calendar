export const runtime = 'edge'; // 强制使用边缘运行时
/**3. AI 提示词工程：跨时空对话 (The Brain)

在 app/api/oracle/route.ts 中，这是让你的产品产生“灵魂”的地方。


 */
export async function POST(req: Request) {
  const { compositeData } = await req.json();
  /**2. 传输层：AI 请求匿名化 (app/api/oracle/route.ts)
根据 PRD 4.2 节，发送给大模型（DeepSeek/OpenAI）的数据严禁包含真实姓名、精确经纬度等。 */
  const { rawProfile } = await req.json();

  // --- 隐私脱敏处理 ---
  const anonymousData = {
    // 仅发送抽象的命理指标，不发送原始出生日期
    mbti: rawProfile.mbti,
    strength: rawProfile.strengthStatus,
    topElements: rawProfile.wuxingScores,
    isLuckyDay: rawProfile.isLucky, 
    // 将具体目标名称模糊化（可选，防止AI获取敏感业务计划）
    goalCategory: rawProfile.goalType 
  };

  // 发送给 AI 
  const aiPrompt = `分析以下匿名命理画像：${JSON.stringify(anonymousData)}...`;
  // ...调用逻辑

  const systemPrompt = `
    你是一位精通东方命理（八字、紫微斗数）、西方占星术以及现代心理学（MBTI）的“科技玄学大师”。
    你的任务是为用户提供极具穿透力、科技感且温暖的每日成长建议。
    
    用户数据快照：
    - 八字：${compositeData.bazi.join(' ')}
    - MBTI：${compositeData.mbti}
    - 今日黄历：宜 ${compositeData.daily.yi.join(',')}
    
    输出要求：
    1. 风格：赛博朋克 + 禅意。
    2. 结构：
       - [今日脉冲]：一句话概括今日能量波动（如：逻辑电流涌动，宜深耕）。
       - [多维解析]：融合MBTI的认知功能与八字五行。
       - [修行指令]：2条具体的行动建议。
    3. 严禁使用陈词滥调，要像《银翼杀手》里的先知在说话。
  `;

  // 调用 DeepSeek 或 OpenAI
  // const res = await chatModel.generate(systemPrompt);

  
  return Response.json({ text: "今日你的Ni功能受‘癸水’润泽，直觉敏锐。建议：1. 完成那个拖延已久的架构设计；2. 晚上20点后切断数字连接。" });
}
