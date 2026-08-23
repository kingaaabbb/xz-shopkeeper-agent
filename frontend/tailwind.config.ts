/**
 * Tailwind CSS 主题配置
 * 定义前端项目的字体、颜色和阴影扩展
 */
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"JetBrains Mono"',
          '"Noto Sans SC"',
          '"SFMono-Regular"',
          "Consolas",
          "monospace",
        ],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
      },
      colors: {
        terminal: "#0a0e14",
        panel: "#0f1419",
        surface: "#151b23",
        border: "#1e2a3a",
        neon: "#00f0ff",
        matrix: "#00ff88",
        amber: "#ffb000",
        alert: "#ff3860",
        violet: "#b026ff",
        ink: "#e6edf3",
        muted: "#6e7681",
        dim: "#484f58",
      },
      boxShadow: {
        line: "0 1px 0 rgba(0, 240, 255, 0.12)",
        panel: "0 0 0 1px rgba(0, 240, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.6)",
        glow: "0 0 12px rgba(0, 240, 255, 0.35)",
        "glow-sm": "0 0 6px rgba(0, 240, 255, 0.25)",
        "glow-matrix": "0 0 10px rgba(0, 255, 136, 0.3)",
      },
      animation: {
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        blink: "blink 1.2s step-end infinite",
      },
      keyframes: {
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
