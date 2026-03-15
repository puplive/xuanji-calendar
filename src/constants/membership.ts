/**
 * 根据 PRD 8.0 节，商业化逻辑分为 订阅制 (SaaS) 和 单次购买 (Pay-per-view)。由于 Next.js 具备强大的服务端能力，我们可以构建一套兼顾“支付安全”与“用户转化”的闭环系统。

为了保持产品的“科技感”，我们将支付过程设计为一次“能量交换”。

1. 订阅状态与权益定义 (constants/membership.ts)
在代码层面明确定义免费用户与会员的逻辑边界。


AI Coding 开发指令 (针对付费转化)
转化逻辑：“帮我写一个 PricingTable 组件，对比免费和会员权益。会员项要带一个缓慢闪烁的金色边框，并在鼠标悬停时触发‘粒子吸附’效果，增加视觉溢价感。”
支付安全：“在 /api/webhook 接口中，完善支付成功后的回调处理。确保使用签名校验，防止伪造支付成功通知，并自动更新 IndexedDB 中的用户档案状态。”
个性化定价：“根据用户的‘日主能量’。如果今日用户运势较低（身弱），显示‘能量守护套餐’；如果今日运势较高（身旺），显示‘事业巅峰报告’。”
 */
export const TIER_CONFIG = {
  FREE: {
    maxGoals: 1,
    maxWeaknesses: 1,
    hasAdvancedAI: false,
    hasAds: true,
    particleSkins: ['default'],
  },
  PREMIUM: {
    maxGoals: 5,
    maxWeaknesses: 3,
    hasAdvancedAI: true,
    hasAds: false,
    particleSkins: ['gold', 'cyan', 'nebula'],
    historyDepth: 'unlimited',
  }
};

export const PAID_SERVICES = {
  MATCH_REPORT_DEEP: { id: 'prod_match_99', price: 9.9, name: '深度姻缘报告' },
  YEARLY_FORTUNE: { id: 'prod_year_199', price: 19.9, name: '年度运势详解' },
};
