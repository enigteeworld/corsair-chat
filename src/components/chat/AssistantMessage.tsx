"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Copy } from "lucide-react";
import { parseAssistantBlocks } from "@/lib/chat/markdownParser";
import { renderInlineRichText } from "@/lib/chat/renderInlineRichText";

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-[#0a0f18] shadow-[0_16px_34px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-3 py-2">
        <div className="text-[0.78rem] uppercase tracking-[0.14em] text-white/42">
          {language || "code"}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.78rem] text-white/68 transition hover:bg-white/[0.06] hover:text-white/88"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto px-4 py-4 text-[0.84rem] leading-6 text-white/86 md:text-[0.9rem]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.025] shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-[0.88rem] text-white/78 md:text-[0.94rem]">
          <thead className="bg-white/[0.04]">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`${header}-${index}`}
                  className="border-b border-white/8 px-4 py-3 font-semibold text-white/88"
                >
                  {renderInlineRichText(header)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-top">
                {headers.map((_, cellIndex) => (
                  <td
                    key={`${rowIndex}-${cellIndex}`}
                    className="border-b border-white/6 px-4 py-3 leading-7 text-white/72 last:border-b-0"
                  >
                    {renderInlineRichText(row[cellIndex] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RichCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[20px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(34,211,238,0.06)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-4 shadow-[0_12px_32px_rgba(34,211,238,0.05)] md:px-5 md:py-5">
      <div className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-cyan-200/66">
        {title}
      </div>

      <ul
        className="mt-3 space-y-2.5 pl-5 text-[0.95rem] leading-7 text-white/84 marker:text-cyan-200/50 md:text-[1rem] md:leading-8"
        style={{ listStyleType: "disc" }}
      >
        {items.map((item, index) => (
          <li key={index}>{renderInlineRichText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function TimelineCard({
  day,
  title,
  items,
}: {
  day: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-[20px] border border-cyan-400/14 bg-[linear-gradient(180deg,rgba(34,211,238,0.04)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)] md:px-5 md:py-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-cyan-400/[0.07] text-cyan-200">
          <CalendarDays className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-cyan-200/70">
            {day}
          </div>
          <h4 className="mt-1 text-[1rem] font-semibold tracking-[-0.02em] text-white/94 md:text-[1.08rem]">
            {renderInlineRichText(title)}
          </h4>
        </div>
      </div>

      <ul
        className="mt-4 space-y-2.5 pl-5 text-[0.98rem] leading-[1.7] text-white/82 marker:text-cyan-200/55 md:text-[1rem] md:leading-8"
        style={{ listStyleType: "disc" }}
      >
        {items.map((item, index) => (
          <li key={index}>{renderInlineRichText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "secondary",
}: {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  const variantClass =
    variant === "primary"
      ? "border-cyan-400/30 bg-cyan-400/[0.12] text-cyan-100 hover:bg-cyan-400/[0.18]"
      : variant === "danger"
        ? "border-red-400/20 bg-red-400/[0.08] text-red-100 hover:bg-red-400/[0.14]"
        : "border-white/10 bg-white/[0.04] text-white/76 hover:bg-white/[0.08] hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-[0.88rem] font-medium transition ${variantClass}`}
    >
      {label}
    </button>
  );
}

function AssistantActions({
  content,
  onAction,
}: {
  content: string;
  onAction?: (prompt: string, content: string) => void;
}) {
  const normalized = content.toLowerCase();

  const actions = useMemo(() => {
    if (!onAction) return [];

    const nextActions: Array<{
      label: string;
      prompt: string;
      variant?: "primary" | "secondary" | "danger";
    }> = [];

    if (normalized.includes("## pending treasury send confirmation")) {
      nextActions.push(
        {
          label: "Confirm send",
          prompt: "confirm send",
          variant: "primary",
        },
        {
          label: "Cancel",
          prompt: "cancel",
          variant: "danger",
        }
      );
      return nextActions;
    }

    if (normalized.includes("## pending user wallet send confirmation")) {
      nextActions.push(
        {
          label: "Confirm wallet send",
          prompt: "__wallet_send_confirm__",
          variant: "primary",
        },
        {
          label: "Cancel",
          prompt: "__wallet_send_cancel__",
          variant: "danger",
        }
      );
      return nextActions;
    }

    if (normalized.includes("## switch wallet network")) {
      nextActions.push({
        label: "Switch to Arbitrum Sepolia",
        prompt: "__wallet_switch_arbitrum_sepolia__",
        variant: "primary",
      });
      return nextActions;
    }

    if (
      normalized.includes("## connected user wallet readout") ||
      normalized.includes("## wallet network switched")
    ) {
      nextActions.push({
        label: "Refresh my wallet",
        prompt: "__wallet_read__",
        variant: "secondary",
      });
      return nextActions;
    }

    if (
      normalized.includes("## corsair treasury readout") ||
      normalized.includes("## arbitrum readout")
    ) {
      nextActions.push({
        label: "Refresh treasury readout",
        prompt: "read arbitrum wallet",
        variant: "secondary",
      });
      return nextActions;
    }

    if (normalized.includes("## carv strategy registry")) {
      nextActions.push(
        {
          label: "Show CARV-1",
          prompt: "show CARV-1",
          variant: "primary",
        },
        {
          label: "Refresh strategies",
          prompt: "show strategies",
          variant: "secondary",
        }
      );
      return nextActions;
    }

    if (normalized.includes("## carv-1 (carv-1)")) {
      nextActions.push(
        {
          label: "Deposit into CARV-1",
          prompt: "deposit into CARV-1",
          variant: "primary",
        },
        {
          label: "Withdraw from CARV-1",
          prompt: "withdraw from CARV-1",
          variant: "secondary",
        }
      );
      return nextActions;
    }

    if (
      normalized.includes("## treasury send executed") ||
      normalized.includes("## user wallet send submitted") ||
      normalized.includes("## user wallet send executed")
    ) {
      nextActions.push(
        {
          label: "Read treasury wallet",
          prompt: "read arbitrum wallet",
          variant: "secondary",
        },
        {
          label: "Refresh my wallet",
          prompt: "__wallet_read__",
          variant: "secondary",
        }
      );
      return nextActions;
    }

    return nextActions;
  }, [normalized, onAction]);

  if (!onAction || actions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {actions.map((action) => (
        <ActionButton
          key={`${action.label}-${action.prompt}`}
          label={action.label}
          variant={action.variant}
          onClick={() => onAction(action.prompt, content)}
        />
      ))}
    </div>
  );
}

export function AssistantMessage({
  content,
  onAction,
}: {
  content: string;
  onAction?: (prompt: string, content: string) => void;
}) {
  const blocks = parseAssistantBlocks(content);

  return (
    <div className="flex justify-start gap-3 min-w-0 w-full">
      <div className="mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[0.72rem] font-semibold text-white/78 md:flex">
        C
      </div>

      <div className="w-full max-w-[94%] sm:max-w-[90%] md:max-w-[88%] lg:max-w-[85%] min-w-0">
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4 text-white/84 shadow-[0_18px_44px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)] md:rounded-[28px] md:px-6 md:py-5 min-w-0">
          <div className="w-full min-w-0 space-y-4 md:space-y-5">
            {blocks.map((block, index) => {
              if (block.type === "heading") {
                const headingClass =
                  block.level === 1
                    ? "mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-white md:text-[1.6rem]"
                    : block.level === 2
                      ? "mt-2 text-[1.15rem] font-semibold tracking-[-0.02em] text-white/98 md:text-[1.25rem]"
                      : block.level === 3
                        ? "text-[1.03rem] font-semibold tracking-[-0.025em] text-white/94 md:text-[1.12rem]"
                        : "text-[0.96rem] font-semibold tracking-[-0.02em] text-white/88 md:text-[1rem]";

                return (
                  <h3 key={index} className={`${headingClass} min-w-0 break-words overflow-hidden`}>
                    {renderInlineRichText(block.text)}
                  </h3>
                );
              }

              if (block.type === "unordered-list") {
                return (
                  <ul
                    key={index}
                    className="min-w-0 space-y-2.5 pl-5 text-[0.98rem] leading-[1.7] text-white/82 marker:text-white/42 md:text-[1rem] md:leading-8"
                    style={{ listStyleType: "disc" }}
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="min-w-0 break-words overflow-hidden">
                        {renderInlineRichText(item)}
                      </li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "ordered-list") {
                return (
                  <ol
                    key={index}
                    className="min-w-0 space-y-2.5 pl-5 text-[0.98rem] leading-[1.7] text-white/82 marker:text-white/42 md:text-[1rem] md:leading-8"
                    style={{ listStyleType: "decimal" }}
                  >
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="min-w-0 break-words overflow-hidden">
                        {renderInlineRichText(item)}
                      </li>
                    ))}
                  </ol>
                );
              }

              if (block.type === "blockquote") {
                return (
                  <blockquote
                    key={index}
                    className="min-w-0 rounded-r-[16px] border-l-2 border-cyan-300/20 bg-white/[0.02] pl-4 pr-2 text-[0.95rem] italic leading-7 text-white/68 md:text-[0.98rem] md:leading-8"
                  >
                    <div className="min-w-0 break-words overflow-hidden">
                      {renderInlineRichText(block.text)}
                    </div>
                  </blockquote>
                );
              }

              if (block.type === "code") {
                return (
                  <CodeBlock
                    key={index}
                    language={block.language}
                    code={block.code}
                  />
                );
              }

              if (block.type === "table") {
                return (
                  <MarkdownTable
                    key={index}
                    headers={block.headers}
                    rows={block.rows}
                  />
                );
              }

              if (block.type === "rich-card") {
                return (
                  <RichCard
                    key={index}
                    title={block.title}
                    items={block.items}
                  />
                );
              }

              if (block.type === "timeline") {
                return (
                  <TimelineCard
                    key={index}
                    day={block.day}
                    title={block.title}
                    items={block.items}
                  />
                );
              }

              if (block.type === "divider") {
                return (
                  <div
                    key={index}
                    className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                );
              }

              if (block.type === "actions") {
                return null;
              }

              return (
                <p
                  key={index}
                  className="min-w-0 whitespace-pre-wrap break-words overflow-hidden text-[0.98rem] leading-[1.7] text-white/82 md:text-[1rem] md:leading-[1.95]"
                >
                  {renderInlineRichText(block.text)}
                </p>
              );
            })}

            <AssistantActions content={content} onAction={onAction} />
          </div>
        </div>
      </div>
    </div>
  );
}