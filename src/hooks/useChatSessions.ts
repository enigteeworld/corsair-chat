"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatSession, PersonalityConfig } from "@/types/chat";

export const STORAGE_KEY = "corsair-chat-sessions";
export const ACTIVE_SESSION_KEY = "corsair-chat-active-session";

export const DEFAULT_PERSONALITY: PersonalityConfig = {
  tone: "sharp",
  style: "balanced",
  symbol: "",
  isConfigured: false,
};

export function createEmptySession(): ChatSession {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [],
    personality: { ...DEFAULT_PERSONALITY },
    createdAt: now,
    updatedAt: now,
  };
}

export function personalitySummary(personality: PersonalityConfig) {
  const symbol = personality.symbol?.trim();
  return `${symbol ? `${symbol} ` : ""}${personality.tone} · ${personality.style}`;
}

export function formatSessionBucketLabel(dateIso: string) {
  const today = new Date();
  const target = new Date(dateIso);

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  if (targetStart.getTime() === todayStart.getTime()) return "Today";
  if (targetStart.getTime() === yesterdayStart.getTime()) return "Yesterday";
  return "Older";
}

export function groupSessionsByTime(sessions: ChatSession[]) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const buckets: Record<"Today" | "Yesterday" | "Older", ChatSession[]> = {
    Today: [],
    Yesterday: [],
    Older: [],
  };

  for (const session of sorted) {
    const label = formatSessionBucketLabel(session.updatedAt) as
      | "Today"
      | "Yesterday"
      | "Older";

    buckets[label].push(session);
  }

  return [
    { label: "Today", sessions: buckets.Today },
    { label: "Yesterday", sessions: buckets.Yesterday },
    { label: "Older", sessions: buckets.Older },
  ].filter((bucket) => bucket.sessions.length > 0);
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");

  useEffect(() => {
    const storedSessions = localStorage.getItem(STORAGE_KEY);
    const storedActiveSessionId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions) as ChatSession[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          const upgraded = parsed.map((session) => ({
            ...session,
            personality: {
              ...DEFAULT_PERSONALITY,
              ...(session.personality ?? {}),
            },
          }));

          setSessions(upgraded);

          const hasStoredActive = upgraded.some(
            (session) => session.id === storedActiveSessionId
          );

          setActiveSessionId(
            hasStoredActive ? storedActiveSessionId ?? upgraded[0].id : upgraded[0].id
          );
          return;
        }
      } catch {
        // ignore broken localStorage payloads
      }
    }

    const freshSession = createEmptySession();
    setSessions([freshSession]);
    setActiveSessionId(freshSession.id);
  }, []);

  useEffect(() => {
    if (!sessions.length) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
  }, [activeSessionId]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  );

  function updateActiveSession(updater: (session: ChatSession) => ChatSession) {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId ? updater(session) : session
      )
    );
  }

  function setActivePersonality(
    partial: Partial<PersonalityConfig>,
    configure = false
  ) {
    updateActiveSession((session) => ({
      ...session,
      personality: {
        ...session.personality,
        ...partial,
        isConfigured: configure ? true : session.personality.isConfigured,
      },
      updatedAt: new Date().toISOString(),
    }));
  }

  function createNewChat(options?: { closeUi?: () => void; resetUi?: () => void }) {
    const freshSession = createEmptySession();

    setSessions((prev) => [freshSession, ...prev]);
    setActiveSessionId(freshSession.id);

    options?.resetUi?.();
    options?.closeUi?.();
  }

  function selectSession(
    sessionId: string,
    options?: { closeUi?: () => void; resetUi?: () => void }
  ) {
    setActiveSessionId(sessionId);
    options?.resetUi?.();
    options?.closeUi?.();
  }

  function deleteSession(
    sessionId: string,
    options?: { isLoading?: boolean; closeUi?: () => void; resetUi?: () => void }
  ) {
    if (options?.isLoading && sessionId === activeSessionId) return;

    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== sessionId);

      if (next.length === 0) {
        const freshSession = createEmptySession();
        setActiveSessionId(freshSession.id);
        return [freshSession];
      }

      if (sessionId === activeSessionId) {
        setActiveSessionId(next[0].id);
      }

      return next;
    });

    options?.resetUi?.();
    options?.closeUi?.();
  }

  return {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    activeSession,
    updateActiveSession,
    setActivePersonality,
    createNewChat,
    selectSession,
    deleteSession,
  };
}