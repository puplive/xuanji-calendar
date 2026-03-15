/**1. 核心架构：数据融合引擎 (The Logic Hub)

在 lib/engine.ts 中，我们要把“玄学”变成“数学”，这样 AI 才能更好地理解。 */
import { Solar, Lunar } from 'lunar-javascript';

export interface UserProfile {
  birthDate: string; // ISO
  mbti: string;
  name: string;
}

export const getCompositeData = (profile: UserProfile) => {
  const date = new Date(profile.birthDate);
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const today = Solar.fromDate(new Date()).getLunar();

  // 1. 获取八字与五行强度 (模拟简易权重)
  const bazi = lunar.getBaZi();
  const wuxing = {
    jin: Math.random() * 10, // 实际开发可根据天干地支计算得分
    mu: Math.random() * 10,
    shui: Math.random() * 10,
    huo: Math.random() * 10,
    tu: Math.random() * 10,
  };

  // 2. 融合今日黄历
  const daily = {
    yi: today.getDayYi(),
    ji: today.getDayJi(),
    energy: today.getWuXing(), // 今日五行属性
  };

  return {
    bazi,
    wuxing,
    mbti: profile.mbti,
    zodiac: solar.getZodiac(),
    daily,
    timestamp: new Date().toISOString()
  };
};
