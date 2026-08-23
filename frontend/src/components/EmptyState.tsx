/**
 * 首页空状态组件
 * 展示产品入口信息和可点击的示例问数问题
 */
import { Cpu, Database, Search, Terminal } from "lucide-react";

type EmptyStateProps = {
  examples: string[];
  onUseExample: (example: string) => void;
};

const highlights = [
  { label: "混合检索", icon: Search, code: "RAG.hybrid()" },
  { label: "SQL 闭环", icon: Database, code: "SQL.pipeline()" },
  { label: "电商数仓", icon: Cpu, code: "DW.ecommerce" },
];

export function EmptyState({ examples, onUseExample }: EmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-center px-4 py-12">
      <div className="mb-10 max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 border border-neon/30 bg-neon/5 px-3 py-1.5 font-mono text-sm font-semibold text-neon shadow-glow-sm">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          XiZi Shopkeeper Agent v1.0
        </div>
        <h1 className="text-balance font-mono text-4xl font-bold leading-tight text-ink sm:text-6xl">
          <span className="text-neon">&gt;</span> 电商查库
          <span className="ml-1 inline-block h-[1em] w-[0.5em] animate-blink bg-neon align-middle" />
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">
          // Natural language → SQL → Data warehouse
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="border border-border bg-surface/60 px-4 py-4 transition hover:border-neon/30 hover:shadow-glow-sm"
            >
              <Icon className="mb-3 h-5 w-5 text-neon" aria-hidden="true" />
              <div className="text-sm font-semibold text-ink">{item.label}</div>
              <div className="mt-1 font-mono text-xs text-matrix/70">{item.code}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        ./quick_start --examples
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {examples.map((example, index) => (
          <button
            key={example}
            type="button"
            onClick={() => onUseExample(example)}
            className="min-h-20 border border-border bg-surface/40 px-4 py-4 text-left font-mono text-[14px] leading-6 text-ink/85 transition hover:border-neon/40 hover:bg-surface hover:text-neon hover:shadow-glow-sm focus:outline-none focus:ring-1 focus:ring-neon/40"
          >
            <span className="text-amber/80">[{String(index + 1).padStart(2, "0")}]</span>
            <span className="text-matrix"> $ </span>
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
