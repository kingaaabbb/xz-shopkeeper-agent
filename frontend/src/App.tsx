/**
 * 前端应用主组件
 * 负责聊天会话状态、SSE 事件消费和整体页面布局
 */
import {
  Activity,
  BarChart3,
  Eraser,
  History,
  MessageSquarePlus,
  Server,
  Terminal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Composer } from "./components/Composer";
import { EmptyState } from "./components/EmptyState";
import { MessageBubble } from "./components/MessageBubble";
import { streamQuery } from "./lib/agentApi";
import { cn, summarizeResult } from "./lib/format";
import type { AgentEvent, ChatMessage, StepState } from "./types/agent";

const examples = [
  "统计 2025 年第一季度各大区的 GMV，并按 GMV 从高到低排序",
  "统计 2025 年 3 月各商品品类的销量和销售额",
  "查询华东地区 2025 年第一季度销售额最高的前 5 个商品",
  "按会员等级统计 2025 年第一季度的订单数和销售额",
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "Vite /api proxy";

function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function upsertStep(steps: StepState[] = [], event: Extract<AgentEvent, { type: "progress" }>) {
  const next = steps.filter((item) => item.step !== event.step);
  next.push({
    step: event.step,
    status: event.status,
    updatedAt: Date.now(),
  });
  return next;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [activeController, setActiveController] = useState<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isStreaming = Boolean(activeController);
  const canSubmit = draft.trim().length > 0 && !isStreaming;

  const completedCount = useMemo(
    () => messages.filter((message) => message.role === "assistant" && message.status === "done").length,
    [messages],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const startQuery = async (rawQuery = draft) => {
    const query = rawQuery.trim();
    if (!query || isStreaming) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: query,
      createdAt: Date.now(),
    };

    const assistantId = makeId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "正在连接问数智能体...",
      createdAt: Date.now(),
      status: "streaming",
      steps: [],
    };

    const controller = new AbortController();
    setActiveController(controller);
    setDraft("");
    setMessages((current) => [...current, userMessage, assistantMessage]);

    const onEvent = (event: AgentEvent) => {
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== assistantId) return message;

          if (event.type === "progress") {
            return {
              ...message,
              content: event.status === "running" ? `正在执行：${event.step}` : message.content,
              steps: upsertStep(message.steps, event),
            };
          }

          if (event.type === "result") {
            return {
              ...message,
              status: "done",
              content: summarizeResult(event.data),
              result: event.data,
            };
          }

          return {
            ...message,
            status: "error",
            content: "这次查询没有成功。",
            error: event.message,
          };
        }),
      );
    };

    try {
      await streamQuery(query, { signal: controller.signal, onEvent });
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId && message.status === "streaming"
            ? { ...message, status: "done", content: "流程已结束，后端未返回查询结果。" }
            : message,
        ),
      );
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
              ...message,
              status: isAbort ? "done" : "error",
              content: isAbort ? "已停止本次查询。" : "无法连接问数接口。",
              error: isAbort ? undefined : error instanceof Error ? error.message : String(error),
            }
            : message,
        ),
      );
    } finally {
      setActiveController(null);
    }
  };

  const stopQuery = () => {
    activeController?.abort();
  };

  const clearConversation = () => {
    if (isStreaming) return;
    setMessages([]);
    setDraft("");
  };

  return (
    <div className="h-dvh overflow-hidden bg-terminal text-ink">
      <div className="pointer-events-none fixed inset-0 grid-bg" />
      <div className="pointer-events-none fixed inset-0 scanlines" />

      <div className="relative grid h-full min-h-0 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden min-h-0 border-r border-neon/15 bg-panel/90 backdrop-blur lg:flex lg:flex-col">
          <div className="border-b border-neon/15 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center border border-neon/40 bg-surface text-neon shadow-glow-sm">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base font-semibold tracking-wider text-neon">电商查库</div>
                <div className="font-mono text-xs text-muted">// XiZi shopkeeper-agent</div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <button
              type="button"
              onClick={clearConversation}
              disabled={isStreaming}
              className="flex h-11 w-full items-center justify-center gap-2 border border-neon/50 bg-neon/10 text-sm font-semibold text-neon transition hover:bg-neon/20 hover:shadow-glow disabled:cursor-not-allowed disabled:border-neon/15 disabled:bg-transparent disabled:text-muted"
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
              [ 新会话 ]
            </button>

            <section>
              <div className="mb-2 flex items-center gap-2 px-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                <History className="h-3.5 w-3.5 text-neon/60" aria-hidden="true" />
                ./examples
              </div>
              <div className="space-y-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => startQuery(example)}
                    className="w-full border border-border bg-surface/60 px-3 py-3 text-left font-mono text-sm leading-5 text-ink/80 transition hover:border-neon/40 hover:bg-surface hover:text-neon hover:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="text-matrix">&gt; </span>
                    {example}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="border-t border-neon/15 p-4">
            <div className="grid gap-2 font-mono text-xs text-muted">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-neon/70">
                  <Server className="h-3.5 w-3.5" aria-hidden="true" />
                  API
                </span>
                <span className="truncate text-matrix/80">{API_BASE_URL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-neon/70">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  DONE
                </span>
                <span className="text-amber">{completedCount}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-neon/15 bg-panel/80 px-4 backdrop-blur lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center border border-neon/40 bg-surface text-neon shadow-glow-sm lg:hidden">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-wide text-ink">
                  <span className="text-neon">$</span> 智能数据分析 Agent
                </div>
                <div className="truncate font-mono text-xs text-muted">
                  FastAPI SSE / LangGraph
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearConversation}
              disabled={messages.length === 0 || isStreaming}
              className={cn(
                "grid h-9 w-9 place-items-center border border-transparent text-muted transition hover:border-neon/30 hover:bg-neon/5 hover:text-neon disabled:cursor-not-allowed disabled:opacity-35",
              )}
              title="清空"
              aria-label="清空"
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {messages.length === 0 ? (
              <EmptyState examples={examples} onUseExample={(example) => setDraft(example)} />
            ) : (
              <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:px-8">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-neon/15 bg-panel/60 px-4 py-2 text-center font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-neon/70" aria-hidden="true" />
              {isStreaming ? (
                <>
                  <span className="text-amber animate-pulse-neon">[ RUNNING ]</span>
                  <span className="text-neon animate-blink">_</span>
                </>
              ) : (
                <span className="text-matrix">[ READY ]</span>
              )}
            </span>
          </div>
          <Composer
            value={draft}
            disabled={!canSubmit}
            isStreaming={isStreaming}
            onChange={setDraft}
            onSubmit={() => startQuery()}
            onStop={stopQuery}
          />
        </main>
      </div>
    </div>
  );
}
