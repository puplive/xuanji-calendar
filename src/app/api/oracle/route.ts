export const runtime = 'edge'; // 强制使用边缘运行时
/**
 * AI 提示词工程：跨时空对话 (The Brain)
 * 支持三种类型：daily（每日指引）、goal（目标建议）、practice（弱点练习）
 */

interface OracleRequestBody {
  type?: 'daily' | 'goal' | 'practice';
  // Daily oracle
  compositeData?: any;
  rawProfile?: any;
  // Goal oracle
  goalName?: string;
  wuxing?: Record<string, number>;
  huangli?: { yi: string[] };
  mbti?: string;
  // Practice oracle
  weakness?: { name: string; baziCause: string };
  profile?: { strengthStatus: string; mbti: string };
}

export async function POST(req: Request) {
  const body = await req.json() as OracleRequestBody;
  const type = body.type || 'daily';

  if (type === 'goal') {
    return handleGoalOracle(body);
  }
  if (type === 'practice') {
    return handlePracticeOracle(body);
  }
  return handleDailyOracle(body);
}

function handleDailyOracle({ compositeData, rawProfile }: OracleRequestBody) {
  const anonymousData = {
    mbti: rawProfile?.mbti,
    strength: rawProfile?.strengthStatus,
    topElements: rawProfile?.wuxingScores,
    isLuckyDay: rawProfile?.isLucky,
    goalCategory: rawProfile?.goalType,
  };

  const systemPrompt = `
    你是一位精通东方命理（八字、紫微斗数）、西方占星术以及现代心理学（MBTI）的"科技玄学大师"。
    用户数据：MBTI=${anonymousData.mbti}, 身强身弱=${anonymousData.strength}
    输出要求：赛博朋克 + 禅意风格
  `;

  return Response.json({
    type: 'daily',
    text: "今日你的 Ni 功能受'癸水'润泽，直觉敏锐。建议：1. 完成拖延已久的架构设计；2. 晚上 20 点后切断数字连接。"
  });
}

function handleGoalOracle({ goalName, wuxing, huangli, mbti }: OracleRequestBody) {
  const topElement = Object.entries(wuxing || {}).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'unknown';

  return Response.json({
    type: 'goal',
    advice: `今日'${topElement}'气旺盛，配合你 ${mbti} 的特质，下午 3 点是推进"${goalName}"的最佳能量窗口。`
  });
}

function handlePracticeOracle({ weakness, profile, huangli }: OracleRequestBody) {
  const isWang = profile?.strengthStatus?.includes('旺');

  return Response.json({
    type: 'practice',
    insight: `今日能量活跃，你的${profile?.mbti}特质容易${weakness?.name}。`,
    instruction: "在笔记本上写下 3 个客观事实，对抗主观焦虑。",
    themeColor: isWang ? '#ef4444' : '#3b82f6'
  });
}
