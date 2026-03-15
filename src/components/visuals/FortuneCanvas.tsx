

/**
 * 高级 Canvas 粒子组件 (components/visuals/FortuneCanvas.tsx)
采用 RequestAnimationFrame 结合 离屏渲染 优化，确保 60FPS 的流畅度（PRD 4.1）。

3. 运势波动：打卡瞬间的“能量爆发”
当用户点击打卡时，我们通过 React State 瞬间改变 config，产生 PRD 描述的“光波扩散”效果。

// 在 HomePage.tsx 中
const [luckBoost, setLuckBoost] = useState(1); // 能量系数

const handleCheckin = () => {
  setLuckBoost(5); // 瞬间提升速度和亮度
  setTimeout(() => setLuckBoost(1), 2000); // 2秒后恢复平稳
};

const visualConfig = useMemo(() => {
  const base = mapFortuneToVisuals(analysis);
  return {
    ...base,
    speed: base.speed * luckBoost,
    size: base.size * (luckBoost > 1 ? 2 : 1),
    connectionOpacity: luckBoost > 1 ? 0.5 : base.connectionOpacity
  };
}, [analysis, luckBoost]);

 */

/**
 * // src/components/visuals/FortuneCanvas.tsx



 */
"use client";
import React, { useRef, useEffect } from 'react';
import { VisualConfig } from '@/lib/visual-mapper';

export const FortuneCanvas = ({ config }: { config: VisualConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationFrameId: number;
    let particles: Particle[] = [];

    /**3. 粒子效果的性能兜底 (Performance Fallback)
    由于 Vercel 部署后用户会通过各种设备访问，我们需要在 FortuneCanvas.tsx 中加入一个简单的帧率检测器。如果检测到设备运行卡顿，自动减少粒子数量。
    在 FortuneCanvas 的 useEffect 中加入
    */
    let frameCount = 0;
    let lastTime = performance.now();

    const checkPerformance = () => {
        const now = performance.now();
        frameCount++;
        if (now - lastTime >= 1000) {
            const fps = frameCount;
            if (fps < 40) {
            // 如果 FPS 低于 40，将粒子数量减半
            console.warn("性能较低，正在优化粒子密度...");
            config.density = Math.floor(config.density / 2);
            }
            frameCount = 0;
            lastTime = now;
        }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      // 关键修改：在变量名后加上 ! 符号
      x!: number; 
      y!: number; 
      vx!: number; 
      vy!: number;

      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
      }
      update() {
        // 向心力/离心力逻辑
        const dx = this.x - canvas.width / 2;
        const dy = this.y - canvas.height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        this.vx += (dx / dist) * config.vortexForce;
        this.vy += (dy / dist) * config.vortexForce;

        this.x += this.vx;
        this.y += this.vy;

        // 边界处理
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, config.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: config.density }, () => new Particle());
    };

    const drawConnections = () => {
  ctx.strokeStyle = config.color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = config.connectionOpacity;
    
  // 这里的 i < particles.length 没问题，但要确保 j 也不越界
  // 只对前 100 个粒子进行连线尝试，避免全量计算
    const limit = Math.min(particles.length, 100);
  for (let i = 0; i < limit; i += 5) {
    // 关键修改：增加 j < particles.length 判定
    for (let j = i + 1; j < i + 5 && j < particles.length; j++) {
      // 安全起见，再加一层 if 判定
      if (!particles[i] || !particles[j]) continue;

      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
};
    // const drawConnections = () => {
    //   ctx.strokeStyle = config.color;
    //   ctx.lineWidth = 0.5;
    //   ctx.globalAlpha = config.connectionOpacity;
    //   // 仅对靠近中心的粒子进行连线，形成“玄学星图”感
    //   for (let i = 0; i < particles.length; i += 5) {
    //     for (let j = i + 1; j < i + 5; j++) {
    //       const dx = particles[i].x - particles[j].x;
    //       const dy = particles[i].y - particles[j].y;
    //       const dist = Math.sqrt(dx * dx + dy * dy);
    //       if (dist < 100) {
    //         ctx.beginPath();
    //         ctx.moveTo(particles[i].x, particles[i].y);
    //         ctx.lineTo(particles[j].x, particles[j].y);
    //         ctx.stroke();
    //       }
    //     }
    //   }
    // };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'screen'; // 发光合成模式
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(render);
    };

    init();
    render();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [config]); // 当配置改变时（如打卡成功），粒子系统会自动平滑过渡

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};
