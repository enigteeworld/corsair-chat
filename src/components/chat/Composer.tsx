"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  Loader2,
  Mic,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import type { PendingAttachment } from "@/types/chat";
import {
  formatBytes,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE_MB,
} from "@/hooks/useComposer";

function AutoResizeTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  minHeight = 20,
  maxHeight = 100,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.style.height = "0px";
    const nextHeight = Math.min(Math.max(element.scrollHeight, minHeight), maxHeight);
    element.style.height = `${nextHeight}px`;
  }, [value, minHeight, maxHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      rows={1}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={className}
      style={{ minHeight: `${minHeight}px`, maxHeight: `${maxHeight}px` }}
    />
  );
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: PendingAttachment;
  onRemove: () => void;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/[0.08] px-2 py-1 text-[0.7rem] text-white/70">
      <span className="max-w-[100px] truncate md:max-w-[160px]">{attachment.name}</span>
      <span className="shrink-0 text-white/40">{formatBytes(attachment.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 text-white/40 transition hover:bg-white/10 hover:text-white/80"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

type ComposerProps = {
  query: string;
  onChangeQuery: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onOpenFilePicker: () => void;
  pendingAttachments: PendingAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
};

export function Composer({
  query,
  onChangeQuery,
  onKeyDown,
  onSubmit,
  isLoading,
  onOpenFilePicker,
  pendingAttachments,
  onRemoveAttachment,
}: ComposerProps) {
  const canSubmit = !isLoading && (query.trim() || pendingAttachments.length > 0);

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] shadow-lg">
      {pendingAttachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 px-2.5 py-1.5">
          {pendingAttachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={() => onRemoveAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-1 p-1.5">
        <button
          type="button"
          onClick={onOpenFilePicker}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white/60"
          aria-label={`Attach files (max ${MAX_ATTACHMENTS}, up to ${MAX_ATTACHMENT_SIZE_MB}MB each)`}
        >
          <Paperclip className="h-[18px] w-[18px]" />
        </button>

        <AutoResizeTextarea
          value={query}
          onChange={onChangeQuery}
          onKeyDown={onKeyDown}
          placeholder="Message Corsair..."
          minHeight={20}
          maxHeight={100}
          className="flex-1 resize-none overflow-y-auto border-none bg-transparent py-2 px-1 text-[0.95rem] leading-5 text-white/90 placeholder:text-white/35 outline-none"
        />

        <button
          type="button"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.08] hover:text-white/50 sm:flex"
          aria-label="Voice input"
        >
          <Mic className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black transition hover:scale-105 hover:bg-white/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/40"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}