/**
 * 根据 PRD 3.1 节（用户档案） 和 5.1 节（数据模型），我们需要在“我的”页面构建一个核心的档案管理逻辑。这不仅是一个表单，它是整个 App 能量计算的源头。

我们将使用 lunar-javascript 处理复杂的历法转换，并使用 Zustand 或 LocalStorage 实现数据的即时同步。

1. 逻辑准备：档案计算工具类 (lib/profile-utils.ts)
我们需要一个函数，输入阳历生日，自动吐出所有玄学维度数据。
 */
// import { Solar, Lunar } from 'lunar-javascript';

// export const calculateProfile = (date: Date) => {
//   const solar = Solar.fromDate(date);
//   const lunar = solar.getLunar();

//   return {
//     solarDate: solar.toFullString(), // 阳历：2026-03-11
//     lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`, // 阴历
//     zodiac: solar.getXingZuo(), // 星座
//     animal: lunar.getYearShengXiao(), // 生肖
//     bazi: lunar.getBaZi().join(' '), // 八字：丙午 辛卯...
//     ganzhi: {
//       year: lunar.getYearInGanZhi(),
//       month: lunar.getMonthInGanZhi(),
//       day: lunar.getDayInGanZhi(),
//       time: lunar.getTimeInGanZhi(),
//     }
//   };
// };

// src/lib/profile-utils.ts
import { Solar, Lunar } from 'lunar-javascript';

export const calculateProfile = (input: string | Date) => {
    if (!input) return null;
  // 核心修复：检查日期是否合法
//   if (!date || isNaN(date.getTime())) {
//     return null; // 如果日期无效，直接返回 null
//   }

  try {
    // 统一转换为 Date 对象进行校验
    const date = typeof input === 'string' ? new Date(input) : input;
    // 核心修复：检查日期是否合法
    if (isNaN(date.getTime())) return null;
    
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    return {
      solarDate: solar.toFullString(),
      lunarDate: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      zodiac: solar.getXingZuo(),
      animal: lunar.getYearShengXiao(),
      bazi: lunar.getBaZi().join(' '),
      ganzhi: {
        year: lunar.getYearInGanZhi(),
        month: lunar.getMonthInGanZhi(),
        day: lunar.getDayInGanZhi(),
        time: lunar.getTimeInGanZhi(),
      }
    };
  } catch (e) {
    console.error("玄学计算失败:", e);
    return null;
  }
};

