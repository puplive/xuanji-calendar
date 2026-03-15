/**
 * 第一步：创建二维码组件文件 创建 src/components/share/QRCanvas.tsx：
 */
// src/components/share/QRCanvas.tsx
"use client";

import React from 'react';

export const QRCanvas = ({ url }: { url: string }) => {
  return (
    <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center">
      {/* 
          在生产环境中，你可以使用 qrcode.react 库生成真实二维码。
          现在我们使用一个极简的 SVG 占位图，确保海报生成不报错。
      */}
      <svg viewBox="0 0 100 100" className="w-full h-full text-black">
        <path d="M0 0h30v30H0zM70 0h30v30H70zM0 70h30v30H0zM40 40h20v20H40z" fill="currentColor" />
        <rect x="10" y="10" width="10" height="10" fill="white" />
        <rect x="80" y="10" width="10" height="10" fill="white" />
        <rect x="10" y="80" width="10" height="10" fill="white" />
      </svg>
    </div>
  );
};
