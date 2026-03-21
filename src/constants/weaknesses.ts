/**
 * 根据 PRD 3.6 节，弱点克服模块（Weakness Overcoming）是本产品的“深度修行”区。它不只是列出缺点，而是通过**八字（命理缺陷）、MBTI（性格短板）和星座（情绪盲点）**的三方交叉分析，为用户提供“对症下药”的每日微练习。

我们将构建一个多维分析引擎和动态练习生成器。

1. 弱点库定义与映射 (constants/weaknesses.ts)
首先定义一套底层逻辑，将“表面弱点”关联到“底层成因”。


AI Coding 开发指令 (针对 Cursor)
你可以通过以下 Prompt 让 AI 帮你生成更具深度的内容：

扩展库：“参考《易经》的六十四卦象，为 WEAKNESS_LIBRARY 中的每个弱点增加一个对应的卦象解释。例如‘拖延症’对应‘山水蒙’卦，象征启蒙阶段的混沌，需要果敢切入。”
视觉动效：“当点击完成按钮时，使用 framer-motion 实现一个卡片向内收缩并迸发出金色火花的动画，代表‘弱点被能量击碎’。”
智能提醒：“写一个后台任务逻辑，如果用户连续 3 天没有进行弱点修行，在首页显示一个‘因果警告’卡片，语气要像严肃的修行导师。”
 */
export interface WeaknessTemplate {
  id: string;
  name: string;
  category: 'execution' | 'emotion' | 'social' | 'cognition';
  baziCause: string;
  mbtiCause: string;
  basePractice: string[];
  hexagram: {
    name: string;      // 卦名，如 "山水蒙"
    interpretation: string; // 卦象解读，与弱点的关联
  };
}

export const WEAKNESS_LIBRARY: WeaknessTemplate[] = [
  {
    id: 'procrastination',
    name: '拖延症',
    category: 'execution',
    baziCause: '食伤过重而无财转化，空想多于行动',
    mbtiCause: '典型P型人格（感知型）特征，追求可能性而忽视结项',
    basePractice: ['番茄工作法25分钟', '列出今日最讨厌的3件事并先做一件'],
    hexagram: {
      name: '山水蒙',
      interpretation: '蒙卦象征启蒙阶段的混沌与蒙昧，需以果敢行动破开迷雾。拖延正是困于蒙昧，唯有主动切入方能拨云见日。'
    }
  },
  {
    id: 'anxiety',
    name: '焦虑内耗',
    category: 'emotion',
    baziCause: '枭神夺食或官杀克身，自我施压过大',
    mbtiCause: '非健康状态下的Ni-Ti循环（内倾直觉-内倾逻辑）',
    basePractice: ['5分钟正念呼吸', '书写不安清单并物理销毁'],
    hexagram: {
      name: '地火明夷',
      interpretation: '明夷卦为光明受创，君子以莅众，用晦而明。焦虑时心如暗夜，当以静制动，收敛心神，待光复明。'
    }
  },
  {
    id: 'perfectionism',
    name: '完美主义',
    category: 'execution',
    baziCause: '印旺身强，过于追求规划完美',
    mbtiCause: 'J型（判断型）加上理想主义，苛求细节',
    basePractice: ['设定“不完美”初稿', '刻意留一个不完美细节'],
    hexagram: {
      name: '乾为天',
      interpretation: '乾卦九五“飞龙在天”，然初九“潜龙勿用”告诫须待时机。完美主义常求一步登天，却忽略循序渐进之德。'
    }
  },
  {
    id: 'socialAvoidance',
    name: '社交回避',
    category: 'social',
    baziCause: '比劫弱，或官杀克身而无食伤流通',
    mbtiCause: '内倾(I)过强，不擅处理人际能量交换',
    basePractice: ['主动与一位熟人打招呼', '参加一场小范围社交并记录感受'],
    hexagram: {
      name: '山泽损',
      interpretation: '损卦损下益上，其道上行。社交回避是因自我封闭，需主动“损”去防备心，方得人际滋养。'
    }
  },
  {
    id: 'moodSwings',
    name: '情绪波动',
    category: 'emotion',
    baziCause: '日主弱而官杀混杂，或食伤无制',
    mbtiCause: 'F型（情感型）过度敏感，情绪易受外界牵引',
    basePractice: ['情绪日记记录触发点', '5分钟正念觉察情绪'],
    hexagram: {
      name: '风雷益',
      interpretation: '益卦风雷相激，君子以见善则迁，有过则改。情绪如风雷，当借其势向上，而非为其所覆。'
    }
  },
  {
    id: 'indecision',
    name: '优柔寡断',
    category: 'cognition',
    baziCause: '财星不透，或印旺身弱',
    mbtiCause: 'P型（感知型）且决策功能发展不足',
    basePractice: ['设定10分钟决策时限', '先选一个方向试行'],
    hexagram: {
      name: '水雷屯',
      interpretation: '屯卦始生之难，君子以经纶。初生之艰需果断开创，犹豫只会困于屯难。'
    }
  }
];

