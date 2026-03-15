/**
 * 5. 粒子联动逻辑 (components/visuals/BaguaParticles.tsx 增强)
在首页粒子组件中，监听打卡事件。
 */
// useEffect(() => {
//   const handleCheckinEffect = (e: any) => {
//     // 逻辑：打卡后，粒子向外扩散，颜色暂时变为亮金色
//     // 修改粒子系统中所有粒子的速度 vx, vy 和颜色
//     particles.forEach(p => {
//       p.speed *= 5; // 瞬间爆发
//       p.color = '#FFFFFF'; // 变成亮白金色
//     });
    
//     setTimeout(() => {
//       // 3秒后恢复正常速度和颜色
//       particles.forEach(p => {
//         p.speed /= 5;
//         p.color = '#D4AF37';
//       });
//     }, 3000);
//   };

//   window.addEventListener('goal-checkin', handleCheckinEffect);
//   return () => window.removeEventListener('goal-checkin', handleCheckinEffect);
// }, [particles]);

"use client"; // 必须声明为客户端组件

import React, { useEffect, useRef } from 'react';

export const BaguaParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const particleCount = 300;

    // --- 1. 粒子系统初始化与动画逻辑 ---
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; vx: number; vy: number; color: string; size: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.color = '#D4AF37'; // 初始金色
        this.size = Math.random() * 1.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(render);
    };

    // --- 2. 核心：监听打卡事件 (PRD要求的视觉反馈) ---
    const handleCheckinEffect = (e: any) => {
      console.log("收到打卡信号，触发粒子爆发！", e.detail);
      
      particles.forEach(p => {
        // 瞬间爆发：速度提升 10 倍，颜色变白金
        p.vx *= 10;
        p.vy *= 10;
        p.color = '#FFFFFF'; 
      });

      // 1.5 秒后能量平复
      setTimeout(() => {
        particles.forEach(p => {
          p.vx /= 10;
          p.vy /= 10;
          p.color = '#D4AF37';
        });
      }, 1500);
    };

    // 启动
    init();
    render();
    window.addEventListener('resize', resize);
    window.addEventListener('goal-checkin', handleCheckinEffect);

    // 清理逻辑
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('goal-checkin', handleCheckinEffect);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ background: 'transparent' }}
    />
  );
};
