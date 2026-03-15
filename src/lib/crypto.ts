/**根据 PRD 9.0 节 和 4.2 节 的要求，由于本产品涉及用户的出生精确时间（隐私极高）和性格心理数据，安全加固是商业化上线前的最后一道防线。

我们将构建一套**“客户端强加密 + 传输脱敏 + 法律免责”**的防御体系。

1. 客户端：AES-256 数据加密存储 (lib/crypto.ts)
虽然数据存在本地 IndexedDB，但为了防止他人操作用户手机或恶意浏览器插件读取，我们需要对敏感字段（如 birthDate, bazi）进行加密。


AI Coding 落地建议 (针对安全性)
代码审计：“检查我的 BaziEngine 类，确保其中没有任何硬编码的 API 密钥或敏感逻辑。将所有计算规则封装在闭包中，防止外部非法调用。”
内容审核逻辑：“在显示 AI 指引前，增加一个敏感词过滤器逻辑。如果 AI 生成的内容包含‘自残’、‘暴力’或‘确定的灾难预测（如血光之灾）’，自动拦截并替换为温暖的鼓励话术。”
漏洞检测：“帮我写一个 SecurityMiddleware，防止 API 路由被爬虫恶意大规模调用消耗 AI 额度。限制每个 IP 每小时只能请求 5 次 generateGuidance 接口。”
*/
import CryptoJS from 'crypto-js';

// 建议从环境变量获取，或在用户首次打开时生成一个设备指纹作为 Key
const STORAGE_KEY = process.env.NEXT_PUBLIC_CRYPTO_KEY || 'xuanji_local_secret_2026';

export const encryptData = (data: any) => {
  const str = JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, STORAGE_KEY).toString();
};

export const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, STORAGE_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error("解密失败:", e);
    return null;
  }
};
