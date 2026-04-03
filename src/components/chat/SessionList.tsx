"use client";

import { useMemo } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import type { ChatSession } from "@/types/chat";
import {
  groupSessionsByTime,
  personalitySummary,
} from "@/hooks/useChatSessions";

type SessionListProps = {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
};

export function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
}: SessionListProps) {
  const grouped = useMemo(() => groupSessionsByTime(sessions), [sessions]);

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="px-3 pb-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/28">
            {group.label}
          </div>

          <div className="space-y-2">
            {group.sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 rounded-[14px] px-3 py-3 transition ${
                  session.id === activeSessionId
                    ? "border border-white/10 bg-white/[0.05] text-white/88"
                    : "text-white/58 hover:bg-white/[0.03] hover:text-white/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />

                  <div className="min-w-0">
                    <div className="truncate">{session.title}</div>
                    <div className="mt-1 truncate text-[0.74rem] text-white/38">
                      {personalitySummary(session.personality)}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  className="text-white/35 transition hover:text-white/80"
                  aria-label={`Delete ${session.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}