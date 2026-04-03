"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";

type Props = {
  value: string;
  explorerUrl?: string;
};

function shorten(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function CopyableInlineValue({ value, explorerUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.85em] text-white/85">
      <span className="break-all">{shorten(value)}</span>

      <button
        onClick={handleCopy}
        className="opacity-70 hover:opacity-100"
      >
        <Copy className="h-3 w-3" />
      </button>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="opacity-70 hover:opacity-100"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </span>
  );
}