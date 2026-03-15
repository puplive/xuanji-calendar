/**
 * 5. 粒子联动逻辑 (components/visuals/BaguaParticles.tsx 增强)
在首页粒子组件中，监听打卡事件。
 */
useEffect(() => {
  const handleCheckinEffect = (e: any) => {
    // 逻辑：打卡后，粒子向外扩散，颜色暂时变为亮金色
    // 修改粒子系统中所有粒子的速度 vx, vy 和颜色
    particles.forEach(p => {
      p.speed *= 5; // 瞬间爆发
      p.color = '#FFFFFF'; // 变成亮白金色
    });
    
    setTimeout(() => {
      // 3秒后恢复正常速度和颜色
      particles.forEach(p => {
        p.speed /= 5;
        p.color = '#D4AF37';
      });
    }, 3000);
  };

  window.addEventListener('goal-checkin', handleCheckinEffect);
  return () => window.removeEventListener('goal-checkin', handleCheckinEffect);
}, [particles]);
