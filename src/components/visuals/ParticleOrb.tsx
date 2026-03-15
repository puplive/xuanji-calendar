/**2. 视觉巅峰：Canvas 灵动粒子系统 (The Visuals)

在 components/visuals/ParticleOrb.tsx 中，我们创建一个会根据“运势”改变状态的粒子球。 */
"use client";
import { useEffect, useRef } from 'react';

export const ParticleOrb = ({ luckScore = 80 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animationFrame: number;
    
    // 粒子属性随运势变化
    const particleCount = luckScore * 5; 
    const color = luckScore > 60 ? '#D4AF37' : '#708090'; // 金色或冷灰色

    class Particle {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      vx = (Math.random() - 0.5) * (luckScore / 20);
      vy = (Math.random() - 0.5) * (luckScore / 20);

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // 绘制连线，增加科技感
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1})`;
        ctx.lineTo(canvas.width / 2, canvas.height / 2);
      }
    }

    const particles = Array.from({ length: particleCount }, () => new Particle());

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [luckScore]);

  return <canvas ref={canvasRef} width={400} height={400} className="mix-blend-screen" />;
};
