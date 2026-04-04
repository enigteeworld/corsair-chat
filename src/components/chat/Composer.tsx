"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import {
  FileImage,
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
  minHeight = 30,
  maxHeight = 160,
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
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.76rem] text-white/72">
      <Paperclip className="h-3.5 w-3.5 shrink-0 text-white/46" />
      <span className="max-w-[140px] truncate md:max-w-[240px]">{attachment.name}</span>
      <span className="shrink-0 text-white/34">{formatBytes(attachment.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-white/44 transition hover:text-white/88"
        aria-label={`Remove ${attachment.name}`}
      >
        <X className="h-3.5 w-3.5" />
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
    <div className="soft-pill rounded-[20px] px-3 py-2.5 md:rounded-[26px] md:px-5 md:py-4">
      {pendingAttachments.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {pendingAttachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={() => onRemoveAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-[16px] bg-white/[0.02] px-2 py-1.5 md:gap-3 md:rounded-[18px] md:px-3 md:py-2">
        <button
          type="button"
          onClick={onOpenFilePicker}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:bg-white/[0.04] hover:text-white/54 md:h-10 md:w-10"
          aria-label={`Attach files (max ${MAX_ATTACHMENTS}, up to ${MAX_ATTACHMENT_SIZE_MB}MB each)`}
          title={`Attach files (max ${MAX_ATTACHMENTS}, up to ${MAX_ATTACHMENT_SIZE_MB}MB each)`}
        >
          <FileImage className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>

        <AutoResizeTextarea
          value={query}
          onChange={onChangeQuery}
          onKeyDown={onKeyDown}
          placeholder="Ask Corsair anything..."
          minHeight={30}
          maxHeight={160}
          className="flex-1 resize-none overflow-y-auto border-none bg-transparent py-1 text-[0.98rem] leading-6 text-white/82 placeholder:text-white/30 outline-none md:text-[1.02rem] md:leading-7"
        />

        <button
          type="button"
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/24 transition hover:bg-white/[0.04] hover:text-white/42 sm:flex md:h-10 md:w-10"
          aria-label="Voice input"
        >
          <Mic className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.05] hover:bg-white/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-white/55 md:h-[48px] md:w-[48px]"
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