/**
 * 为了实现 PRD 3.2 和 7.2 节要求的“动态响应”和“仪式感”，我们需要建立一套从玄学数据到物理参数的映射引擎。

这不再是简单的随机动画，而是将用户的**日主强弱（能量振幅）和五行得分（色彩频率）**实时转化为 Canvas 粒子的物理属性。

1. 核心映射引擎 (lib/visual-mapper.ts)
这个工具函数将复杂的命理数据转化为 Canvas 能够理解的 VisualConfig 对象。


4. AI Coding 粒子优化指令
当你在 Cursor 中微调视觉效果时，可以使用这些高质量 Prompt：

增强“八卦图”形态：“修改 Particle 的 update 逻辑，让粒子不仅在中心旋转，还要在运动中通过群聚效应隐约呈现出‘阴阳鱼’的轮廓。通过调整粒子的透明度来实现这种虚实结合。”
增加点击交互：“为 Canvas 添加鼠标移动监听。当鼠标划过粒子时，粒子应该产生一种‘被能量排斥’的推开效果，并留下短暂的拖尾（Trail Effect）。”
性能调优：“目前粒子连线的双重循环开销较大。请使用‘空间哈希网格（Spatial Hash Grid）’算法优化寻找邻近粒子的过程，确保在低端移动设备上也能维持 60FPS。”

 */
import { Element } from './bazi-engine';

export interface VisualConfig {
  color: string;           // 主色调
  speed: number;           // 粒子运动速度 (由日主强弱决定)
  density: number;         // 粒子密度 (由运势分数决定)
  size: number;            // 粒子大小
  connectionOpacity: number; // 连线透明度 (体现能量稳定性)
  vortexForce: number;     // 旋涡向心力 (身弱则聚，身旺则散)
}

export const mapFortuneToVisuals = (analysis: any): VisualConfig => {
  const { wuxing, strength } = analysis;
  
  // 1. 颜色映射：取五行得分最高的颜色
  const topElement = Object.entries(wuxing).sort((a: any, b: any) => b[1] - a[1])[0][0] as Element;
  const colorMap: Record<Element, string> = {
    mu: '#10b981',   // 翠绿
    huo: '#ef4444',  // 赤红
    tu: '#f59e0b',   // 琥珀金
    jin: '#f8fafc',  // 钛白
    shui: '#3b82f6'  // 深海蓝
  };

  // 2. 速度与力度：身旺(score高)则活跃，身弱则沉静
  const isStrong = strength.score > 50;
  
  return {
    color: colorMap[topElement],
    speed: 0.5 + (strength.score / 100) * 2.5,
    density: 200 + (strength.score * 2),
    size: isStrong ? 2.5 : 1.2,
    connectionOpacity: isStrong ? 0.15 : 0.05,
    vortexForce: isStrong ? -0.01 : 0.02, // 负值为排斥，正值为吸引
  };
};
