/**2. 集成埋点工具类 (lib/analytics.ts)
在 Next.js 中封装一个简单的埋点函数，兼容服务端和客户端。


 */
type EventName = 'profile_created' | 'goal_checkin' | 'match_requested' | 'paywall_view' | 'purchase_success';

export const trackEvent = (event: EventName, properties?: Record<string, any>) => {
    // 1. 确保只在浏览器端执行
  if (typeof window === 'undefined') return;
  // 开发环境下仅打印日志，不发送真实数据
    if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] ${event}:`, properties);
    return;
  }

  // 生产环境下，这里可以对接你的统计 SDK
  // window.umami?.track(event, properties);
  console.log(`[Production Analytics] ${event} recorded`);
  // 示例：发送给 PostHog 或 自建采集 API
  try {
    // 2. 使用类型断言或直接访问（有了上面的声明就不报错了）
    (window as any).posthog?.capture(event, properties);
  } catch (e) {
    console.error("埋点失败", e);
  }
};
