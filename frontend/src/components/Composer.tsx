/**
 * 聊天输入区组件
 * 处理问题输入、发送和停止当前流式请求
 */
import { ArrowUp, Square, Terminal } from "lucide-react";
import { FormEvent, KeyboardEvent, useRef } from "react";
import { cn } from "../lib/format";

type ComposerProps = {
    value: string;
    disabled: boolean;
    isStreaming: boolean;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onStop: () => void;
};

export function Composer({
    value,
    disabled,
    isStreaming,
    onChange,
    onSubmit,
    onStop,
}: ComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!disabled) onSubmit();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (!disabled) onSubmit();
        }
    };

    return (
        <form
            onSubmit={submit}
            className="border-t border-neon/15 bg-panel/80 px-4 py-4 backdrop-blur"
        >
            <div className="mx-auto flex max-w-5xl items-end gap-3 border border-neon/25 bg-surface/80 p-2 shadow-panel">
                <div className="hidden h-11 w-11 shrink-0 place-items-center border border-neon/20 bg-neon/5 text-neon sm:grid">
                    <Terminal className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex min-h-11 flex-1 items-start gap-2 px-2 py-3">
                    <span className="shrink-0 font-mono text-sm text-matrix select-none">$</span>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        onKeyDown={onKeyDown}
                        rows={1}
                        placeholder="query --help"
                        className="max-h-36 min-h-5 flex-1 resize-none bg-transparent font-mono text-[14px] leading-6 text-ink outline-none placeholder:text-muted/60"
                    />
                </div>
                <button
                    type={isStreaming ? "button" : "submit"}
                    onClick={isStreaming ? onStop : undefined}
                    disabled={!isStreaming && disabled}
                    className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center border font-mono text-xs transition focus:outline-none focus:ring-1 focus:ring-neon/50",
                        isStreaming
                            ? "border-alert/50 bg-alert/15 text-alert hover:bg-alert/25 hover:shadow-[0_0_10px_rgba(255,56,96,0.3)]"
                            : "border-neon/50 bg-neon/10 text-neon hover:bg-neon/20 hover:shadow-glow disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-muted",
                    )}
                    title={isStreaming ? "停止" : "发送"}
                    aria-label={isStreaming ? "停止" : "发送"}
                >
                    {isStreaming ? (
                        <Square
                            className="h-4 w-4 fill-current"
                            aria-hidden="true"
                        />
                    ) : (
                        <ArrowUp className="h-5 w-5" aria-hidden="true" />
                    )}
                </button>
            </div>
        </form>
    );
}
