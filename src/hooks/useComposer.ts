"use client";

import { useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { PendingAttachment } from "@/types/chat";

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE_MB = 10;
export const BYTES_IN_MB = 1024 * 1024;

export function formatBytes(bytes: number) {
  if (bytes < BYTES_IN_MB) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / BYTES_IN_MB).toFixed(1)} MB`;
}

export function useComposer() {
  const [query, setQuery] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function resetComposer() {
    setQuery("");
    setPendingAttachments([]);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const availableSlots = MAX_ATTACHMENTS - pendingAttachments.length;

    if (availableSlots <= 0) {
      window.alert(`You can attach up to ${MAX_ATTACHMENTS} files at a time.`);
      event.target.value = "";
      return;
    }

    const acceptedFiles: PendingAttachment[] = [];
    const oversizedFiles: string[] = [];

    for (const file of selectedFiles.slice(0, availableSlots)) {
      if (file.size > MAX_ATTACHMENT_SIZE_MB * BYTES_IN_MB) {
        oversizedFiles.push(file.name);
        continue;
      }

      acceptedFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    if (oversizedFiles.length > 0) {
      window.alert(
        `These files exceed the ${MAX_ATTACHMENT_SIZE_MB} MB limit:\n${oversizedFiles.join(
          "\n"
        )}`
      );
    }

    if (selectedFiles.length > availableSlots) {
      window.alert(`Only the first ${availableSlots} file(s) were added.`);
    }

    if (acceptedFiles.length > 0) {
      setPendingAttachments((prev) => [...prev, ...acceptedFiles]);
    }

    event.target.value = "";
  }

  function removeAttachment(attachmentId: string) {
    setPendingAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId)
    );
  }

  function createComposerKeyDownHandler(
    onSubmit: () => void
  ) {
    return (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (query.trim() || pendingAttachments.length > 0) {
          onSubmit();
        }
      }
    };
  }

  return {
    query,
    setQuery,
    pendingAttachments,
    setPendingAttachments,
    fileInputRef,
    resetComposer,
    openFilePicker,
    handleFilesSelected,
    removeAttachment,
    createComposerKeyDownHandler,
  };
}