/**
 * 好，我们现在进入 PRD 3.4 节的核心：姻缘配对深度报告逻辑。

为了体现“科技玄学”的定位，我们将配对逻辑拆解为三个维度：

八字合婚 (能量互补性)：基于两人的“日主强弱”和“五行余缺”进行匹配。
MBTI 契合度 (性格协同性)：基于经典的 16 型人格兼容性矩阵。
AI 综合洞察：将上述硬性指标喂给 AI，生成具有文学性和深度的“缘分报告”。
1. 核心逻辑：双人能量匹配引擎 (lib/match-engine.ts)
这个引擎会计算两人的“互补得分”。
 */

import { StrengthEngine, StrengthResult } from './strength-engine';
import { BaziEngine } from './bazi-engine';
import { Lunar } from 'lunar-javascript';

export interface MatchResult {
  score: number;       // 综合匹配度 0-100
  baziMatch: number;   // 八字互补分
  mbtiMatch: number;   // 性格契合分
  tags: string[];      // 匹配标签，如“天作之合”、“水火不容”
  advice: string;      // 简短建议
}

export class MatchEngine {
  // MBTI 契合度矩阵（部分示例：1为冲突，5为完美）
  private static MBTI_MATRIX: Record<string, Record<string, number>> = {
    'INTJ': { 'ENFP': 5, 'ENTP': 4, 'ISFP': 2, 'ESFJ': 1 },
    'ENFP': { 'INTJ': 5, 'INFJ': 5, 'ISTJ': 1 },
    // ... 实际开发中需补全 16x16 矩阵
  };

  static calculate(userA: { date: Date, mbti: string }, userB: { date: Date, mbti: string }): MatchResult {
    const lunarA = Lunar.fromDate(userA.date);
    const lunarB = Lunar.fromDate(userB.date);
    
    const strengthA = StrengthEngine.calculate(lunarA);
    const strengthB = StrengthEngine.calculate(lunarB);
    const energyA = BaziEngine.calculateEnergy(lunarA);
    const energyB = BaziEngine.calculateEnergy(lunarB);

    // --- 维度1：八字互补分 (Bazi Score) ---
    // 逻辑：如果A缺水(能量低)，B水旺(能量高)，则得分高
    let baziScore = 60; // 基础分
    const elements: (keyof typeof energyA)[] = ['jin', 'mu', 'shui', 'huo', 'tu'];
    
    elements.forEach(el => {
      const diff = Math.abs(energyA[el] - energyB[el]);
      if (diff > 20) baziScore += 8; // 差异大代表互补强
    });
    
    // 旺衰互补：一强一弱最稳
    if ((strengthA.score > 55 && strengthB.score < 45) || (strengthA.score < 45 && strengthB.score > 55)) {
      baziScore += 15;
    }

    // --- 维度2：MBTI 契合分 (MBTI Score) ---
    const mbtiVal = this.MBTI_MATRIX[userA.mbti]?.[userB.mbti] || 3;
    const mbtiScore = (mbtiVal / 5) * 100;

    // --- 维度3：综合评分与标签 ---
    const totalScore = Math.round((baziScore * 0.6) + (mbtiScore * 0.4));
    
    let tags = [];
    if (totalScore > 85) tags = ["灵魂契合", "宿命牵引"];
    else if (totalScore > 65) tags = ["互补共生", "细水长流"];
    else tags = ["磨合期长", "性格碰撞"];

    return {
      score: Math.min(totalScore, 100),
      baziMatch: Math.min(baziScore, 100),
      mbtiMatch: mbtiScore,
      tags,
      advice: totalScore > 75 ? "能量磁场高度契合，适合共同开启长期目标。" : "建议保持独立空间，以包容化解能量冲突。"
    };
  }
}
