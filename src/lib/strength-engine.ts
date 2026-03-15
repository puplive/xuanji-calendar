// src/lib/strength-engine.ts
import { Lunar } from 'lunar-javascript';
import { BaziEngine, Element } from './bazi-engine';

export interface StrengthResult {
  score: number;
  status: '极弱' | '偏弱' | '中和' | '偏旺' | '极旺';
  yongShen: Element[];
  jiShen: Element[];
}

export class StrengthEngine {
  // 定义五行生克关系：用于寻找喜用神
  private static RELATIONS: Record<Element, { sheng: Element, ke: Element, beisheng: Element, beike: Element }> = {
    'mu': { sheng: 'huo', ke: 'tu', beisheng: 'shui', beike: 'jin' },
    'huo': { sheng: 'tu', ke: 'jin', beisheng: 'mu', beike: 'shui' },
    'tu': { sheng: 'jin', ke: 'mu', beisheng: 'huo', beike: 'mu' },
    'jin': { sheng: 'shui', ke: 'huo', beisheng: 'tu', beike: 'huo' },
    'shui': { sheng: 'mu', ke: 'tu', beisheng: 'jin', beike: 'tu' },
  };

  // 定义地支对应的季节/月份五行强度
  private static ZHI_ELEMENT_POWER: Record<string, Element> = {
    '寅': 'mu', '卯': 'mu', // 春季：木旺
    '巳': 'huo', '午': 'huo', // 夏季：火旺
    '申': 'jin', '酉': 'jin', // 秋季：金旺
    '亥': 'shui', '子': 'shui', // 冬季：水旺
    '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu' // 四季末：土旺
  };

  static calculate(lunar: Lunar): StrengthResult {
    const bazi = lunar.getBaZi(); // 获取八字数组：[年柱, 月柱, 日柱, 时柱]
    const riGan = bazi[2].substring(0, 1); // 日干（日主）
    const riElement = BaziEngine.ELEMENT_MAP[riGan]; // 日主的五行
    const monthZhi = bazi[1].substring(1); // 月令（月支）
    const monthElement = this.ZHI_ELEMENT_POWER[monthZhi]; // 月令五行

    let power = 0;

    // --- 1. 判断“得令” (占 40分) ---
    // 逻辑：日主五行 得到 月令五行 的生扶
    if (riElement === monthElement) {
      power += 40; // 同类（旺），如木生寅月
    } else if (this.RELATIONS[monthElement].sheng === riElement) {
      power += 30; // 月令生我（相），如木生亥月
    } else if (this.RELATIONS[riElement].sheng === monthElement) {
      power += 15; // 我生月令（休）
    } else {
      power += 10; // 囚死
    }

    // --- 2. 判断“得地” (占 30分) ---
    // 检查年、月、日、时 四个地支中是否有日主的根
    bazi.forEach(pillar => {
      const zhi = pillar.substring(1);
      const zhiEl = this.ZHI_ELEMENT_POWER[zhi];
      if (zhiEl === riElement) power += 7.5; // 地支有同类
      if (this.RELATIONS[zhiEl].sheng === riElement) power += 5; // 地支有生我者
    });

    // --- 3. 判断“得势” (占 30分) ---
    // 检查年、月、时 三个天干是否有生助
    [bazi[0], bazi[1], bazi[3]].forEach(pillar => {
      const gan = pillar.substring(0, 1);
      const ganEl = BaziEngine.ELEMENT_MAP[gan];
      if (ganEl === riElement) power += 10; // 天干比肩
      if (this.RELATIONS[ganEl].sheng === riElement) power += 7; // 天干正偏印
    });

    // --- 4. 判定状态 ---
    let status: StrengthResult['status'] = '中和';
    if (power < 35) status = '极弱';
    else if (power < 48) status = '偏弱';
    else if (power < 62) status = '中和';
    else if (power < 85) status = '偏旺';
    else status = '极旺';

    // --- 5. 喜用神 ---
    const yongShen: Element[] = (power < 50) 
      ? [this.RELATIONS[riElement].beisheng, riElement] 
      : [this.RELATIONS[riElement].sheng, this.RELATIONS[riElement].ke];

    return { score: Math.round(power), status, yongShen, jiShen: [] };
  }
}
