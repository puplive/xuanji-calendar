
// 五行元素类型定义
export type Element = 'jin' | 'mu' | 'shui' | 'huo' | 'tu';

// 五行名称映射
export  const ELEMENT_NAMES: Record<Element, string> = {
  mu: '木', huo: '火', tu: '土', jin: '金', shui: '水'
};

// MBTI性格特征映射
export const MBTI_TRAITS: Record<string, string> = {
  INTJ: '战略规划', INTP: '逻辑分析', ENTJ: '领导决策', ENTP: '创新思维',
  INFJ: '深度洞察', INFP: '理想主义', ENFJ: '激励引导', ENFP: '热情探索',
  ISTJ: '严谨执行', ISFJ: '细致关怀', ESTJ: '高效管理', ESFJ: '社交协调',
  ISTP: '实践解决', ISFP: '艺术感知', ESTP: '冒险行动', ESFP: '活力表现'
};

// 星座元素映射
export const ZODIAC_ELEMENTS: Record<string, string> = {
  '白羊座': '火', '金牛座': '土', '双子座': '风', '巨蟹座': '水',
  '狮子座': '火', '处女座': '土', '天秤座': '风', '天蝎座': '水',
  '射手座': '火', '摩羯座': '土', '水瓶座': '风', '双鱼座': '水'
};


// src/constants/huangli.ts

export type HuangliCategory =
  | 'worship'     // 祭祀祈福
  | 'finance'     // 财务交易
  | 'travel'      // 出行迁移
  | 'social'      // 人事社交
  | 'study'       // 工作学习
  | 'construction'// 建设动土
  | 'health'      // 医疗健康
  | 'legal'       // 司法诉讼
  | 'other';      // 其他

export interface YiJiMapping {
  keywords: string[];           // 关键词列表
  category: HuangliCategory;    // 分类
  suggestion: string;           // 默认修行建议模板
  energy: 'positive' | 'negative' | 'neutral';
}

// 宜（Yi）映射表
export const YI_MAPPINGS: YiJiMapping[] = [
  {
    keywords: ['祭祀', '祈福', '求嗣', '斋醮', '酬神', '拜佛'],
    category: 'worship',
    suggestion: '宜静心祈福，可进行5分钟感恩冥想或书写祈愿。',
    energy: 'positive'
  },
  {
    keywords: ['求财', '交易', '纳财', '开市', '立券', '挂匾'],
    category: 'finance',
    suggestion: '财星显露，适合处理待办事项中的“金钱”类任务，哪怕只做5分钟。',
    energy: 'positive'
  },
  {
    keywords: ['出行', '移徙', '入宅', '安床', '安香'],
    category: 'travel',
    suggestion: '宜规划行程，整理环境，为下一阶段做准备。',
    energy: 'positive'
  },
  {
    keywords: ['嫁娶', '订婚', '会友', '赴任', '求嗣'],
    category: 'social',
    suggestion: '适合主动联系朋友或进行重要社交，练习表达。',
    energy: 'positive'
  },
  {
    keywords: ['入学', '开光', '求艺', '立碑', '谢土'],
    category: 'study',
    suggestion: '宜学习新知识，攻克一直拖延的难题。',
    energy: 'positive'
  },
  {
    keywords: ['动土', '修造', '安门', '起基', '上梁'],
    category: 'construction',
    suggestion: '适合启动新项目，哪怕只是迈出最小一步。',
    energy: 'positive'
  },
  {
    keywords: ['求医', '疗病', '针刺', '服药'],
    category: 'health',
    suggestion: '关注身体，今日适合运动或健康饮食计划。',
    energy: 'positive'
  }
];

// 忌（Ji）映射表
export const JI_MAPPINGS: YiJiMapping[] = [
  {
    keywords: ['嫁娶', '订婚', '会友', '赴任'],
    category: 'social',
    suggestion: '今日不宜重大社交决策，保持低调，避免冲突。',
    energy: 'negative'
  },
  {
    keywords: ['开市', '交易', '纳财', '求财'],
    category: 'finance',
    suggestion: '财务事务宜暂缓，避免冲动投资或大额支出。',
    energy: 'negative'
  },
  {
    keywords: ['出行', '移徙', '入宅'],
    category: 'travel',
    suggestion: '出行易遇阻滞，建议推迟非必要行程，或提前规划备选方案。',
    energy: 'negative'
  },
  {
    keywords: ['动土', '修造', '安门'],
    category: 'construction',
    suggestion: '不宜启动新项目，宜先完善计划。',
    energy: 'negative'
  },
  {
    keywords: ['诉讼', '打官司', '词讼'],
    category: 'legal',
    suggestion: '避免争执，今日不宜签署重要法律文件。',
    energy: 'negative'
  }
];

/**
 * 根据宜忌关键词数组，获取分类和对应的建议
 * @param yiList 宜数组
 * @param jiList 忌数组
 * @returns 包含主分类、建议文本的对象
 */
export function classifyHuangli(yiList: string[], jiList: string[]) {
  let primaryCategory: HuangliCategory = 'other';
  let suggestion = '今日无特别宜忌，可自由安排。';

  // 优先匹配“宜”（positive）
  for (const yi of yiList) {
    const mapping = YI_MAPPINGS.find(m => m.keywords.includes(yi));
    if (mapping) {
      primaryCategory = mapping.category;
      suggestion = mapping.suggestion;
      break;
    }
  }

  // 如果没有匹配到宜，再匹配忌（negative）
  if (primaryCategory === 'other') {
    for (const ji of jiList) {
      const mapping = JI_MAPPINGS.find(m => m.keywords.includes(ji));
      if (mapping) {
        primaryCategory = mapping.category;
        suggestion = mapping.suggestion;
        break;
      }
    }
  }

  // 如果完全没匹配到，使用默认建议
  return { primaryCategory, suggestion };
}


// src/constants/pengzu.ts

/**
 * 天干十忌映射
 */
export const PENGZU_TIANGAN: Record<string, { keyword: string; advice: string; action: string }> = {
  '甲': { keyword: '甲不开仓', advice: '建议今天先做财务盘点，而非冲动消费。', action: 'finance' },
  '乙': { keyword: '乙不栽植', advice: '建议今天先做小范围试验或优化细节，而非全面铺开。', action: 'plant' },
  '丙': { keyword: '丙不修灶', advice: '建议今天保持冷静，遇到矛盾先搁置，晚点再沟通。', action: 'fire' },
  '丁': { keyword: '丁不剃头', advice: '建议今天先保持原样，让想法“冷却”一下。', action: 'personal' },
  '戊': { keyword: '戊不受田', advice: '建议今天只做咨询或资料收集，不要拍板。', action: 'property' },
  '己': { keyword: '己不破券', advice: '建议今天先维持现状，避免冲动决裂。', action: 'contract' },
  '庚': { keyword: '庚不经络', advice: '建议今天做机械性、重复性工作，或先做框架，细节留到明天。', action: 'health' },
  '辛': { keyword: '辛不合酱', advice: '建议今天不要强行推进需要默契的合作，给彼此一点空间。', action: 'food' },
  '壬': { keyword: '壬不决水', advice: '建议今天对财务和情绪都保持谨慎，避免做出重大资金决策。', action: 'water' },
  '癸': { keyword: '癸不词讼', advice: '建议今天先整理证据和逻辑，择日再辩。', action: 'legal' },
};

/**
 * 地支十二忌映射
 */
export const PENGZU_DIZHI: Record<string, { keyword: string; advice: string; action: string }> = {
  '子': { keyword: '子不问卜', advice: '深夜不做人生决定，睡一觉再说。', action: 'divination' },
  '丑': { keyword: '丑不冠带', advice: '重要仪式前先调整好身心状态，选个精神饱满的日子。', action: 'travel' },
  '寅': { keyword: '寅不祭祀', advice: '怀揣感恩之心时，先让自己静下来，再行表达。', action: 'worship' },
  '卯': { keyword: '卯不穿井', advice: '保持适当边界，让关系自然流淌。', action: 'construction' },
  '辰': { keyword: '辰不哭泣', advice: '有情绪及时疏导，但不要独自反复咀嚼，找朋友聊聊或运动释放。', action: 'funeral' },
  '巳': { keyword: '巳不远行', advice: '出行前再检查一遍行李和计划，磨刀不误砍柴工。', action: 'travel' },
  '午': { keyword: '午不苫盖', advice: '想改变现状，先等火气降下来，用理性而非情绪推动。', action: 'construction' },
  '未': { keyword: '未不服药', advice: '身体不适先问专业医生，不要自行“对症下药”。', action: 'health' },
  '申': { keyword: '申不安床', advice: '搬家或换床前先“暖房”，用轻松的活动让新空间充满舒适感。', action: 'home' },
  '酉': { keyword: '酉不会客', advice: '如果今天心情不好，就推掉饭局，独自安静消化，改天再聚。', action: 'social' },
  '戌': { keyword: '戌不吃犬', advice: '晚餐清淡，给身体减负，睡眠质量更高。', action: 'food' },
  '亥': { keyword: '亥不嫁娶', advice: '结婚前确保彼此足够坦诚，别让“将就”成为日后的隐患。', action: 'marriage' },
};

/**
 * 建除十二神映射（可选）
 */
export const JIANCHU: Record<string, { good: string[]; bad: string[] }> = {
  '建': { good: ['出行'], bad: ['开仓'] },
  '除': { good: ['服药', '针灸'], bad: [] },
  '满': { good: ['肆市'], bad: ['服药'] },
  '平': { good: ['涂泥', '安机'], bad: [] },
  '定': { good: ['进畜', '入学'], bad: [] },
  '执': { good: ['捕捉'], bad: [] },
  '破': { good: ['治病'], bad: [] },
  '危': { good: ['捕鱼'], bad: ['行船'] },
  '成': { good: ['入学'], bad: ['争讼'] },
  '收': { good: ['纳财'], bad: ['安葬'] },
  '开': { good: ['求仕'], bad: ['安葬'] },
  '闭': { good: ['安床'], bad: ['竖造'] },
};

/**
 * 获取当日彭祖百忌警告（根据干支）
 * @param tianGan 日干，如 "甲"
 * @param diZhi 日支，如 "子"
 * @returns 警告文本数组
 */
export function getPengzuWarnings(tianGan: string, diZhi: string): string[] {
  const warnings: string[] = [];
  
  const tianGanRule = PENGZU_TIANGAN[tianGan];
  if (tianGanRule) {
    warnings.push(tianGanRule.advice);
  }
  
  const diZhiRule = PENGZU_DIZHI[diZhi];
  if (diZhiRule) {
    warnings.push(diZhiRule.advice);
  }
  
  return warnings;
}

/**
 * 检查某日是否违反彭祖百忌
 * @param tianGan 日干
 * @param diZhi 日支
 * @param action 要做的事情类型
 */
export function isPengzuViolation(tianGan: string, diZhi: string, action: string): boolean {
  const tianGanRule = PENGZU_TIANGAN[tianGan];
  const diZhiRule = PENGZU_DIZHI[diZhi];
  
  return tianGanRule?.action === action || diZhiRule?.action === action;
}