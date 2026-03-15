/**第三步：视觉核心 - Canvas 粒子八卦图
创建一个组件 components/BaguaParticles.tsx。这里实现一个简单的粒子环绕逻辑。 */
"use client";
import React, { useRef, useEffect } from 'react';

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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 400; // 首页高度
    };

    class Particle {
      x: number; y: number; angle: number; radius: number; speed: number; size: number;
      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 100 + 50;
        this.x = canvas!.width / 2 + Math.cos(this.angle) * this.radius;
        this.y = canvas!.height / 2 + Math.sin(this.angle) * this.radius;
        this.speed = 0.005 + Math.random() * 0.01;
        this.size = Math.random() * 2;
      }
      update() {
        this.angle += this.speed;
        this.x = canvas!.width / 2 + Math.cos(this.angle) * this.radius;
        this.y = canvas!.height / 2 + Math.sin(this.angle) * this.radius;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(212, 175, 55, 0.8)'; // 金色
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 绘制简单的太极轮廓（可选）
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};
