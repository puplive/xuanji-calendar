/**
 * 在 Next.js 的 App Router 架构中，layout.tsx 默认是服务端组件，它负责生成页面的 HTML 骨架和 SEO 元数据（Metadata）。而 useEffect 和 document 只能在浏览器运行。

为了保留你的 Metadata（SEO 优化） 同时实现 安全防御（客户端逻辑），最优雅的解法是：创建一个专门处理安全逻辑的客户端组件，然后在 Layout 中引用它。

第一步：创建安全处理组件
在 src/components/SecurityHandler.tsx 中创建以下内容（如果文件夹不存在请先创建）：
 */
"use client"; // 声明为客户端组件

import { useEffect } from 'react';

export default function SecurityHandler() {
  useEffect(() => {
    // 仅在生产环境生效
    if (process.env.NODE_ENV === 'production') {
      // 1. 禁用右键菜单
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener('contextmenu', handleContextMenu);

      // 2. 禁用 F12 和开发者工具快捷键
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'U') // 禁用查看源代码
        ) {
          e.preventDefault();
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      // 清理监听器
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return null; // 此组件不渲染任何 UI
}
