export interface WeaknessTemplate {
  id: string;
  name: string;
  nameKey: string;
  category: 'execution' | 'emotion' | 'social' | 'cognition';
  baziCause: string;
  baziCauseKey: string;
  mbtiCause: string;
  mbtiCauseKey: string;
  basePractice: string[];
  basePracticeKeys: string[];
  hexagram: {
    name: string;
    nameKey: string;
    interpretation: string;
    interpretationKey: string;
  };
}

export const WEAKNESS_LIBRARY: WeaknessTemplate[] = [
  {
    id: 'procrastination',
    name: '拖延症',
    nameKey: 'Constants.WEAKNESS_NAMES.procrastination',
    category: 'execution',
    baziCause: '食伤过重而无财转化，空想多于行动',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.procrastination',
    mbtiCause: '典型P型人格（感知型）特征，追求可能性而忽视结项',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.procrastination',
    basePractice: ['番茄工作法25分钟', '列出今日最讨厌的3件事并先做一件'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.procrastination_0', 'Constants.WEAKNESS_PRACTICES.procrastination_1'],
    hexagram: {
      name: '山水蒙',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.procrastination',
      interpretation: '蒙卦象征启蒙阶段的混沌与蒙昧，需以果敢行动破开迷雾。拖延正是困于蒙昧，唯有主动切入方能拨云见日。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.procrastination'
    }
  },
  {
    id: 'anxiety',
    name: '焦虑内耗',
    nameKey: 'Constants.WEAKNESS_NAMES.anxiety',
    category: 'emotion',
    baziCause: '枭神夺食或官杀克身，自我施压过大',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.anxiety',
    mbtiCause: '非健康状态下的Ni-Ti循环（内倾直觉-内倾逻辑）',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.anxiety',
    basePractice: ['5分钟正念呼吸', '书写不安清单并物理销毁'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.anxiety_0', 'Constants.WEAKNESS_PRACTICES.anxiety_1'],
    hexagram: {
      name: '地火明夷',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.anxiety',
      interpretation: '明夷卦为光明受创，君子以莅众，用晦而明。焦虑时心如暗夜，当以静制动，收敛心神，待光复明。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.anxiety'
    }
  },
  {
    id: 'perfectionism',
    name: '完美主义',
    nameKey: 'Constants.WEAKNESS_NAMES.perfectionism',
    category: 'execution',
    baziCause: '印旺身强，过于追求规划完美',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.perfectionism',
    mbtiCause: 'J型（判断型）加上理想主义，苛求细节',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.perfectionism',
    basePractice: ['设定"不完美"初稿', '刻意留一个不完美细节'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.perfectionism_0', 'Constants.WEAKNESS_PRACTICES.perfectionism_1'],
    hexagram: {
      name: '乾为天',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.perfectionism',
      interpretation: '乾卦九五"飞龙在天"，然初九"潜龙勿用"告诫须待时机。完美主义常求一步登天，却忽略循序渐进之德。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.perfectionism'
    }
  },
  {
    id: 'socialAvoidance',
    name: '社交回避',
    nameKey: 'Constants.WEAKNESS_NAMES.socialAvoidance',
    category: 'social',
    baziCause: '比劫弱，或官杀克身而无食伤流通',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.socialAvoidance',
    mbtiCause: '内倾(I)过强，不擅处理人际能量交换',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.socialAvoidance',
    basePractice: ['主动与一位熟人打招呼', '参加一场小范围社交并记录感受'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.socialAvoidance_0', 'Constants.WEAKNESS_PRACTICES.socialAvoidance_1'],
    hexagram: {
      name: '山泽损',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.socialAvoidance',
      interpretation: '损卦损下益上，其道上行。社交回避是因自我封闭，需主动"损"去防备心，方得人际滋养。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.socialAvoidance'
    }
  },
  {
    id: 'moodSwings',
    name: '情绪波动',
    nameKey: 'Constants.WEAKNESS_NAMES.moodSwings',
    category: 'emotion',
    baziCause: '日主弱而官杀混杂，或食伤无制',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.moodSwings',
    mbtiCause: 'F型（情感型）过度敏感，情绪易受外界牵引',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.moodSwings',
    basePractice: ['情绪日记记录触发点', '5分钟正念觉察情绪'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.moodSwings_0', 'Constants.WEAKNESS_PRACTICES.moodSwings_1'],
    hexagram: {
      name: '风雷益',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.moodSwings',
      interpretation: '益卦风雷相激，君子以见善则迁，有过则改。情绪如风雷，当借其势向上，而非为其所覆。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.moodSwings'
    }
  },
  {
    id: 'indecision',
    name: '优柔寡断',
    nameKey: 'Constants.WEAKNESS_NAMES.indecision',
    category: 'cognition',
    baziCause: '财星不透，或印旺身弱',
    baziCauseKey: 'Constants.WEAKNESS_BAZI_CAUSES.indecision',
    mbtiCause: 'P型（感知型）且决策功能发展不足',
    mbtiCauseKey: 'Constants.WEAKNESS_MBTI_CAUSES.indecision',
    basePractice: ['设定10分钟决策时限', '先选一个方向试行'],
    basePracticeKeys: ['Constants.WEAKNESS_PRACTICES.indecision_0', 'Constants.WEAKNESS_PRACTICES.indecision_1'],
    hexagram: {
      name: '水雷屯',
      nameKey: 'Constants.WEAKNESS_HEXAGRAM_NAMES.indecision',
      interpretation: '屯卦始生之难，君子以经纶。初生之艰需果断开创，犹豫只会困于屯难。',
      interpretationKey: 'Constants.WEAKNESS_HEXAGRAM_INTERPRETATIONS.indecision'
    }
  }
];
