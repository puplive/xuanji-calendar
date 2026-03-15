// src/lib/fortune.ts
import { Solar, Lunar } from 'lunar-javascript';

/**
 * 将公历日期转换为八字、黄历等玄学数据
 * @param birthDate 标准 Date 对象
 */
export const getUserMetaphysics = (birthDate: Date) => {
  // 1. 将 JS Date 转换为库所需的 Solar 对象
  const solar = Solar.fromDate(birthDate);
  
  // 2. 转为农历/八字对象
  const lunar = solar.getLunar();
  
  return {
    // 农历日期：如 二月初二
    lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    
    // 干支记年：如 丙午 辛卯 壬戌
    ganzhi: `${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()}`,
    
    // 八字数组：[年柱, 月柱, 日柱, 时柱]
    bazi: lunar.getBaZi(), 
    
    // 宜忌信息
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    
    // 星座
    zodiac: solar.getXingZuo(),
  };
};
