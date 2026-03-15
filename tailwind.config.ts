// tailwind.config.ts (示例)
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 这里的 fontFamily 可以设为系统默认
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif"],
      },
      colors: {
        // 之前定义的金色
        gold: {
          400: "#E6C15A",
          500: "#D4AF37",
          600: "#B8962E",
        }
      }
    },
  },
  plugins: [],
};
export default config;
