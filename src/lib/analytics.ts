/**2. 集成埋点工具类 (lib/analytics.ts)
在 Next.js 中封装一个简单的埋点函数，兼容服务端和客户端。


 */
type EventName = 'profile_created' | 'goal_checkin' | 'match_requested' | 'paywall_view' | 'purchase_success';

export const trackEvent = (event: EventName, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics] ${event}:`, properties);
    return;
  }

  // 示例：发送给 PostHog 或 自建采集 API
  try {
    window.posthog?.capture(event, properties);
  } catch (e) {
    console.error("埋点失败", e);
  }
};
