/**
 * 聊天消息气泡组件
 * 组合展示用户问题、智能体回复、执行流程和结果表格
 */
import { Bot, Copy, UserRound } from "lucide-react";
import { ResultTable } from "./ResultTable";
import { StepRail } from "./StepRail";
import { cn, formatTime, toClipboardText } from "../lib/format";
import type { ChatMessage } from "../types/agent";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  const copy = async () => {
    const text = message.result ? toClipboardText(message.result) : message.content;
    await navigator.clipboard.writeText(text);
  };

  return (
    <article className={cn("group flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center border border-neon/40 bg-surface text-neon shadow-glow-sm">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </div>
      )}

      <div className={cn("max-w-[920px] flex-1", isUser && "flex max-w-[760px] justify-end")}>
        <div
          className={cn(
            "relative border px-5 py-4",
            isUser
              ? "border-matrix/40 bg-matrix/10 text-ink shadow-glow-matrix"
              : "neon-panel text-ink",
          )}
        >
          {!isUser && (
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neon/50">
              agent.stdout
            </div>
          )}
          {isUser && (
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-matrix/50">
              user.input
            </div>
          )}

          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-wrap font-mono text-[14px] leading-7">{message.content}</p>
            {!isUser && message.status !== "streaming" && (
              <button
                type="button"
                onClick={copy}
                className="shrink-0 border border-transparent p-1.5 text-muted opacity-0 outline-none transition hover:border-neon/30 hover:bg-neon/5 hover:text-neon focus:opacity-100 focus:ring-1 focus:ring-neon/40 group-hover:opacity-100"
                title="复制"
                aria-label="复制"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {message.error && (
            <div className="mt-3 border border-alert/40 bg-alert/10 px-3 py-2 font-mono text-sm text-alert">
              <span className="text-alert/60">[ERR] </span>
              {message.error}
            </div>
          )}

          {!isUser && <StepRail steps={message.steps} />}
          {!isUser && message.result !== undefined && <ResultTable data={message.result} />}

          <div
            className={cn(
              "mt-3 font-mono text-xs",
              isUser ? "text-matrix/50" : "text-muted",
            )}
          >
            // {formatTime(message.createdAt)}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center border border-matrix/40 bg-matrix/10 text-matrix shadow-glow-matrix">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </article>
  );
}
