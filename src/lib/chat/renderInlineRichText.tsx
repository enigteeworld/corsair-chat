import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { CopyableInlineValue } from "@/components/chat/CopyableInlineValue";

const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;
const TX_HASH_REGEX = /0x[a-fA-F0-9]{64}/g;

export function renderInlineRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];

  const pattern =
    /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s<]+|0x[a-fA-F0-9]{40,64})/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    const end = pattern.lastIndex;

    // normal text
    if (start > lastIndex) {
      nodes.push(
        <span key={`text-${key++}`}>
          {text.slice(lastIndex, start)}
        </span>
      );
    }

    const token = match[0];

    // =========================
    // BOLD
    // =========================
    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong
          key={`bold-${key++}`}
          className="font-semibold text-white/96"
        >
          {token.slice(2, -2)}
        </strong>
      );
    }

    // =========================
    // INLINE CODE
    // =========================
    else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`code-${key++}`}
          className="inline-block max-w-full break-all whitespace-normal rounded-md border border-white/10 bg-white/[0.055] px-1.5 py-0.5 align-middle font-mono text-[0.92em] text-white/92"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    // =========================
    // URL
    // =========================
    else if (token.startsWith("http://") || token.startsWith("https://")) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={token}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full break-all items-center gap-1 text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
        >
          <span className="break-all">{token}</span>
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      );
    }

    // =========================
    // TX HASH (64)
    // =========================
    else if (/^0x[a-fA-F0-9]{64}$/.test(token)) {
  nodes.push(
    <CopyableInlineValue
      key={`tx-${key++}`}
      value={token}
      explorerUrl={`https://arbiscan.io/tx/${token}`}
    />
  );
}

else if (/^0x[a-fA-F0-9]{40}$/.test(token)) {
  nodes.push(
    <CopyableInlineValue
      key={`addr-${key++}`}
      value={token}
      explorerUrl={`https://arbiscan.io/address/${token}`}
    />
  );
}

    lastIndex = end;
  }

  // remaining text
  if (lastIndex < text.length) {
    nodes.push(
      <span key={`text-${key++}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return nodes;
}