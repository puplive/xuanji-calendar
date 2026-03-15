/**核心逻辑：五行强度计算模型
我们将得分逻辑分为三个维度：

基础分（地盘）：八个字自带的五行属性。
月令加权（天时）：出生月份对不同五行的增益（最关键）。
藏干得分（深层能量）：地支中隐藏的天干能量。
 */
/**如何使用此算法？
在你的 API 或组件中调用：
const lunar = Lunar.fromYmdHms(1995, 8, 23, 14, 30);
const scores = BaziEngine.calculateEnergy(lunar);

console.log(scores); 
// 输出示例: { jin: 12, mu: 45, shui: 10, huo: 23, tu: 10 } (代表百分比)



此算法在“玄机日历”中的三个应用场景
1. 视觉联动：Canvas 粒子颜色 你可以根据得分最高的五行来改变首页粒子的主色调。

mu (木): 翠绿色 #10b981
huo (火): 赤红色 #ef4444
tu (土): 琥珀金 #f59e0b
jin (金): 钛白色 #f8fafc
shui (水): 深海蓝 #3b82f6
2. AI 指引的底层逻辑 将此分数直接喂给 AI 提示词：

"用户今日五行得分：木(45) 极旺，金(12) 极弱。建议今日减少竞争（金克木），增加表达与创作。"

3. 姻缘配对的“互补”逻辑 在配对模块中，算法可以计算两人的五行互补性：

逻辑： 如果 A 缺水，B 水旺，则配对报告中 AI 会生成：“对方的出现能够滋润你干涸的意志，是一种能量上的天然吸引。”


AI Coding 提示词建议
如果你在 Cursor 中想扩展这个算法，可以尝试这样问：

“基于目前的 BaziEngine 类，请增加地支‘三合局’（如申子辰合水局）和‘六合’的逻辑判断。如果触发合局，将对应五行的基础权重提升 50%。”

这个算法让你的 App 从“随机生成运势”变成了“基于严谨逻辑的计算生成”，这也是 PRD 中强调的“科技感”核心。
*/

import { Lunar, ArrayUtil } from 'lunar-javascript';

// 五行定义
export type Element = 'jin' | 'mu' | 'shui' | 'huo' | 'tu';

interface EnergyScore {
  jin: number;
  mu: number;
  shui: number;
  huo: number;
  tu: number;
}

export class BaziEngine {
  // 1. 定义地支藏干及其权重 (标准余气、中气、本气)
  private static HIDDEN_GAN_WEIGHTS: Record<string, Record<string, number>> = {
    '子': { '癸': 100 },
    '丑': { '己': 60, '癸': 30, '辛': 10 },
    '寅': { '甲': 60, '丙': 30, '戊': 10 },
    '卯': { '乙': 100 },
    '辰': { '戊': 60, '乙': 30, '癸': 10 },
    '巳': { '丙': 60, '庚': 30, '戊': 10 },
    '午': { '丁': 70, '己': 30 },
    '未': { '己': 60, '丁': 30, '乙': 10 },
    '申': { '庚': 60, '壬': 30, '戊': 10 },
    '酉': { '辛': 100 },
    '戌': { '戊': 60, '辛': 30, '丁': 10 },
    '亥': { '壬': 70, '甲': 30 },
  };

  // 2. 定义天干/地支的原始五行映射
  private static ELEMENT_MAP: Record<string, Element> = {
    '甲': 'mu', '乙': 'mu', '丙': 'huo', '丁': 'huo', '戊': 'tu', '己': 'tu', '庚': 'jin', '辛': 'jin', '壬': 'shui', '癸': 'shui',
    '寅': 'mu', '卯': 'mu', '巳': 'huo', '午': 'huo', '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu', '申': 'jin', '酉': 'jin', '亥': 'shui', '子': 'shui'
  };

  // 3. 计算得分核心方法
  static calculateEnergy(lunar: Lunar): EnergyScore {
    const scores: EnergyScore = { jin: 0, mu: 0, shui: 0, huo: 0, tu: 0 };
    const bazi = lunar.getBaZi(); // [年柱, 月柱, 日柱, 时柱]
    const monthZhi = bazi[1].substring(1); // 月令（月支）

    // A. 基础天干得分 (每个天干计 100 分)
    bazi.forEach(pillar => {
      const gan = pillar.substring(0, 1);
      scores[this.ELEMENT_MAP[gan]] += 100;
    });

    // B. 地支藏干得分 (按比例分配 100 分)
    bazi.forEach(pillar => {
      const zhi = pillar.substring(1);
      const hidden = this.HIDDEN_GAN_WEIGHTS[zhi];
      for (const gan in hidden) {
        const weight = hidden[gan];
        scores[this.ELEMENT_MAP[gan]] += weight;
      }
    });

    // C. 月令加权 (天时影响)
    // 根据月令地支，对五行进行“旺相休囚死”修正
    // 简化逻辑：月令所属五行 x 2.0，月令所生五行 x 1.5
    const monthElement = this.ELEMENT_MAP[monthZhi];
    const multiplier: Record<Element, number> = {
      jin: 1.0, mu: 1.0, shui: 1.0, huo: 1.0, tu: 1.0
    };

    if (monthElement === 'mu') { multiplier.mu = 2.0; multiplier.huo = 1.5; }
    if (monthElement === 'huo') { multiplier.huo = 2.0; multiplier.tu = 1.5; }
    if (monthElement === 'tu') { multiplier.tu = 2.0; multiplier.jin = 1.5; }
    if (monthElement === 'jin') { multiplier.jin = 2.0; multiplier.shui = 1.5; }
    if (monthElement === 'shui') { multiplier.shui = 2.0; multiplier.mu = 1.5; }

    // D. 应用加权并归一化 (百分比)
    const finalScores: any = {};
    let total = 0;
    for (const key in scores) {
      const k = key as Element;
      scores[k] *= multiplier[k];
      total += scores[k];
    }

    for (const key in scores) {
      const k = key as Element;
      finalScores[k] = Math.round((scores[k] / total) * 100);
    }

    return finalScores as EnergyScore;
  }
}