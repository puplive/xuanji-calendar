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
  baziCause: string; // 八字成因，如“官杀过旺”
  mbtiCause: string; // MBTI成因，如“缺乏Te”
  basePractice: string[]; // 基础练习库
}

export const WEAKNESS_LIBRARY: WeaknessTemplate[] = [
  {
    id: 'procrastination',
    name: '拖延症',
    category: 'execution',
    baziCause: '食伤过重而无财转化，空想多于行动',
    mbtiCause: '典型P型人格（感知型）特征，追求可能性而忽视结项',
    basePractice: ['番茄工作法25分钟', '列出今日最讨厌的3件事并先做一件']
  },
  {
    id: 'anxiety',
    name: '焦虑内耗',
    category: 'emotion',
    baziCause: '枭神夺食或官杀克身，自我施压过大',
    mbtiCause: '非健康状态下的Ni-Ti循环（内倾直觉-内倾逻辑）',
    basePractice: ['5分钟正念呼吸', '书写不安清单并物理销毁']
  }
];
