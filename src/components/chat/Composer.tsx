"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
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
  minHeight = 32,
  maxHeight = 220,
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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.78rem] text-white/72">
      <Paperclip className="h-3.5 w-3.5 shrink-0 text-white/46" />
      <span className="max-w-[170px] truncate md:max-w-[240px]">{attachment.name}</span>
      <span className="text-white/34">{formatBytes(attachment.size)}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-white/44 transition hover:text-white/88"
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
  return (
    <div className="soft-pill rounded-[22px] px-4 py-3 md:rounded-[26px] md:px-5 md:py-4">
      {pendingAttachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingAttachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={() => onRemoveAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-3 rounded-[18px] bg-white/[0.02] px-2 py-1">
        <button
          type="button"
          onClick={onOpenFilePicker}
          className="pb-2 text-white/30 transition hover:text-white/54"
          aria-label="Attach files"
        >
          <FileImage className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>

        <AutoResizeTextarea
          value={query}
          onChange={onChangeQuery}
          onKeyDown={onKeyDown}
          placeholder="Ask Corsair anything..."
          minHeight={32}
          maxHeight={220}
          className="min-h-[32px] flex-1 resize-none overflow-y-auto border-none bg-transparent text-[1rem] leading-7 text-white/82 placeholder:text-white/30 outline-none md:text-[1.02rem]"
        />

        <button
          type="button"
          className="hidden pb-2 text-white/24 transition hover:text-white/42 sm:block"
        >
          <Mic className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || (!query.trim() && pendingAttachments.length === 0)}
          className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-[1.05] hover:bg-white/90 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-white/55 md:h-[50px] md:w-[50px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-[0.74rem] text-white/24">
        <span>Enter to send · Shift+Enter for newline</span>
        <span>
          Up to {MAX_ATTACHMENTS} files · {MAX_ATTACHMENT_SIZE_MB} MB each
        </span>
      </div>
    </div>
  );
}