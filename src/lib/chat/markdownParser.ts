import type { RenderBlock } from "@/types/chat";

function parseMarkdownHeading(
  line: string
): { level: 1 | 2 | 3 | 4; text: string } | null {
  const trimmed = line.trim();
  const match = trimmed.match(/^(#{1,4})\s+(.*)$/);

  if (!match) return null;

  const level = match[1].length as 1 | 2 | 3 | 4;
  const text = match[2].trim();

  if (!text) return null;

  return { level, text };
}

function isDividerLine(line: string) {
  const trimmed = line.trim();
  return trimmed === "---" || trimmed === "***" || trimmed === "___";
}

function isRichCardHeading(line: string) {
  const trimmed = line.trim().toLowerCase();

  return [
    "quick take",
    "key points",
    "practical take",
    "recommendation",
    "best option",
    "summary",
    "next steps",
    "my honest take",
    "update",
    "rules",
    "examples",
  ].includes(trimmed.replace(/:$/, ""));
}

function isTimelineHeading(line: string) {
  const trimmed = line.trim();
  return /^#{0,4}\s*day\s+\d+\s*[-–—:]\s*.+$/i.test(trimmed);
}

function parseTimelineHeading(line: string) {
  const trimmed = line.trim().replace(/^#{1,4}\s*/, "");
  const match = trimmed.match(/^(day\s+\d+)\s*[-–—:]\s*(.+)$/i);

  if (!match) return null;

  return {
    day: match[1].replace(/^day/i, "Day"),
    title: match[2].trim(),
  };
}

function isHeadingLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
    return false;
  }
  if (/^\d+\.\s/.test(trimmed)) {
    return false;
  }
  if (trimmed.startsWith(">")) {
    return false;
  }
  if (trimmed.startsWith("|")) {
    return false;
  }
  if (trimmed.length > 72) return false;

  return /:$/.test(trimmed) || /^[A-Z][A-Za-z0-9\s'()/,&+:#-]+$/.test(trimmed);
}

function isTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
}

function isTableDivider(line: string) {
  const normalized = line.replace(/\s/g, "");
  return /^\|?[:\-|]+\|?$/.test(normalized);
}

function parseTableRow(line: string) {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function extractRichCard(
  lines: string[],
  startIndex: number
): { block: RenderBlock | null; nextIndex: number } {
  const heading = lines[startIndex]?.trim();

  if (!heading || !isRichCardHeading(heading)) {
    return { block: null, nextIndex: startIndex };
  }

  const items: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) break;

    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      items.push(line.replace(/^[-*•]\s*/, "").trim());
      index += 1;
      continue;
    }

    break;
  }

  if (items.length < 2) {
    return { block: null, nextIndex: startIndex };
  }

  return {
    block: {
      type: "rich-card",
      title: heading.replace(/:$/, ""),
      items,
    },
    nextIndex: index,
  };
}

function extractTimeline(
  lines: string[],
  startIndex: number
): { block: RenderBlock | null; nextIndex: number } {
  const heading = lines[startIndex]?.trim();

  if (!heading || !isTimelineHeading(heading)) {
    return { block: null, nextIndex: startIndex };
  }

  const parsed = parseTimelineHeading(heading);

  if (!parsed) {
    return { block: null, nextIndex: startIndex };
  }

  const items: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (
      isTimelineHeading(line) ||
      line.startsWith("```") ||
      isTableLine(line) ||
      isDividerLine(line)
    ) {
      break;
    }

    const markdownHeading = parseMarkdownHeading(line);
    if (markdownHeading) {
      if (markdownHeading.level <= 2) {
        break;
      }

      items.push(markdownHeading.text.replace(/:$/, "").trim());
      index += 1;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      items.push(line.replace(/^[-*•]\s*/, "").trim());
      index += 1;
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      items.push(line.replace(/^\d+\.\s*/, "").trim());
      index += 1;
      continue;
    }

    items.push(line);
    index += 1;
  }

  if (!items.length) {
    return { block: null, nextIndex: startIndex };
  }

  return {
    block: {
      type: "timeline",
      day: parsed.day,
      title: parsed.title,
      items,
    },
    nextIndex: index,
  };
}

function isActionsHeading(line: string) {
  const trimmed = line.trim().toLowerCase().replace(/:$/, "");

  if (trimmed === "actions") return true;
  if (trimmed === "quick actions") return true;

  const markdownHeading = parseMarkdownHeading(line);
  if (!markdownHeading) return false;

  const normalized = markdownHeading.text.trim().toLowerCase().replace(/:$/, "");
  return normalized === "actions" || normalized === "quick actions";
}

function parseActionItem(line: string): { label: string; action: string } | null {
  const trimmed = line.trim();

  const bracketMatch = trimmed.match(
    /^[-*•]\s*\[([^\]]+)\]\s*\(\s*action:\s*([^)]+)\s*\)\s*$/i
  );
  if (bracketMatch) {
    return {
      label: bracketMatch[1].trim(),
      action: bracketMatch[2].trim(),
    };
  }

  const arrowMatch = trimmed.match(/^[-*•]\s*(.+?)\s*=>\s*(.+)\s*$/);
  if (arrowMatch) {
    return {
      label: arrowMatch[1].trim(),
      action: arrowMatch[2].trim(),
    };
  }

  return null;
}

function extractActions(
  lines: string[],
  startIndex: number
): { block: RenderBlock | null; nextIndex: number } {
  const heading = lines[startIndex]?.trim();

  if (!heading || !isActionsHeading(heading)) {
    return { block: null, nextIndex: startIndex };
  }

  const buttons: Array<{ label: string; action: string }> = [];
  let index = startIndex + 1;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      if (buttons.length > 0) {
        break;
      }
      index += 1;
      continue;
    }

    if (
      line.startsWith("```") ||
      isTableLine(line) ||
      isDividerLine(line) ||
      isTimelineHeading(line) ||
      isRichCardHeading(line)
    ) {
      break;
    }

    const markdownHeading = parseMarkdownHeading(line);
    if (markdownHeading && markdownHeading.level <= 3) {
      break;
    }

    const parsedAction = parseActionItem(line);
    if (parsedAction) {
      buttons.push(parsedAction);
      index += 1;
      continue;
    }

    if (buttons.length > 0) {
      break;
    }

    return { block: null, nextIndex: startIndex };
  }

  if (!buttons.length) {
    return { block: null, nextIndex: startIndex };
  }

  return {
    block: {
      type: "actions",
      buttons,
    },
    nextIndex: index,
  };
}

export function parseAssistantBlocks(content: string): RenderBlock[] {
  const lines = content.split("\n").map((line) => line.replace(/\t/g, "  ").trimEnd());
  const blocks: RenderBlock[] = [];

  let paragraphBuffer: string[] = [];
  let unorderedListBuffer: string[] = [];
  let orderedListBuffer: string[] = [];
  let blockquoteBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "paragraph", text });
      paragraphBuffer = [];
    }
  }

  function flushUnorderedList() {
    if (unorderedListBuffer.length > 0) {
      blocks.push({ type: "unordered-list", items: [...unorderedListBuffer] });
      unorderedListBuffer = [];
    }
  }

  function flushOrderedList() {
    if (orderedListBuffer.length > 0) {
      blocks.push({ type: "ordered-list", items: [...orderedListBuffer] });
      orderedListBuffer = [];
    }
  }

  function flushBlockquote() {
    if (blockquoteBuffer.length > 0) {
      const text = blockquoteBuffer.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "blockquote", text });
      blockquoteBuffer = [];
    }
  }

  function flushAll() {
    flushParagraph();
    flushUnorderedList();
    flushOrderedList();
    flushBlockquote();
  }

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    const timeline = extractTimeline(lines, i);
    if (timeline.block) {
      flushAll();
      blocks.push(timeline.block);
      i = timeline.nextIndex - 1;
      continue;
    }

    const richCard = extractRichCard(lines, i);
    if (richCard.block) {
      flushAll();
      blocks.push(richCard.block);
      i = richCard.nextIndex - 1;
      continue;
    }

    const actions = extractActions(lines, i);
    if (actions.block) {
      flushAll();
      blocks.push(actions.block);
      i = actions.nextIndex - 1;
      continue;
    }

    if (line.startsWith("```")) {
      flushAll();

      const language = line.slice(3).trim();
      const codeLines: string[] = [];

      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    if (isTableLine(line)) {
      flushAll();

      const tableLines: string[] = [line];
      let j = i + 1;

      while (j < lines.length && isTableLine(lines[j].trim())) {
        tableLines.push(lines[j].trim());
        j += 1;
      }

      if (tableLines.length >= 2 && isTableDivider(tableLines[1])) {
        const headers = parseTableRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseTableRow);

        blocks.push({ type: "table", headers, rows });
        i = j - 1;
        continue;
      }
    }

    const markdownHeading = parseMarkdownHeading(line);
    if (markdownHeading) {
      flushAll();
      blocks.push({
        type: "heading",
        level: markdownHeading.level,
        text: markdownHeading.text.replace(/:$/, "").trim(),
      });
      continue;
    }

    if (isDividerLine(line)) {
      flushAll();
      blocks.push({ type: "divider" });
      continue;
    }

    if (isHeadingLine(line)) {
      flushAll();
      blocks.push({
        type: "heading",
        level: 3,
        text: line.replace(/:$/, "").trim(),
      });
      continue;
    }

    if (line.startsWith(">")) {
      flushParagraph();
      flushUnorderedList();
      flushOrderedList();
      blockquoteBuffer.push(line.replace(/^>\s?/, "").trim());
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
      flushParagraph();
      flushOrderedList();
      flushBlockquote();
      unorderedListBuffer.push(line.replace(/^[-*•]\s*/, "").trim());
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      flushUnorderedList();
      flushBlockquote();
      orderedListBuffer.push(line.replace(/^\d+\.\s*/, "").trim());
      continue;
    }

    flushUnorderedList();
    flushOrderedList();
    flushBlockquote();
    paragraphBuffer.push(line);
  }

  flushAll();
  return blocks;
}