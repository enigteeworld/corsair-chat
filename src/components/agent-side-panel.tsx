"use client";

import { Plus } from "lucide-react";

type AgentSidePanelProps = {
  mobile?: boolean;
};

export default function AgentSidePanel({
  mobile = false,
}: AgentSidePanelProps) {
  return (
    <aside className={mobile ? "block" : "hidden xl:block"}>
      <div
        className={
          mobile
            ? "w-full"
            : "glass-panel w-[274px] rounded-[22px]"
        }
      >
        <div className={mobile ? "px-1 pb-5 pt-1" : "px-5 pb-5 pt-5"}>
          <div
            className={
              mobile
                ? "text-[1.85rem] font-semibold leading-none tracking-[-0.04em] text-white/92"
                : "text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-white/92"
            }
          >
            Agent
          </div>

          <div
            className={
              mobile
                ? "mt-2 text-[0.96rem] font-medium text-white/50"
                : "mt-2 text-[0.92rem] font-medium text-white/50"
            }
          >
            Creative AI Assistant
          </div>
        </div>

        <div
          className={
            mobile
              ? "border-t border-white/8 px-0 py-4"
              : "border-t border-white/8 px-4 py-4"
          }
        >
          <button className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-white text-[0.98rem] font-medium text-black shadow-[0_10px_24px_rgba(255,255,255,0.06)] transition hover:bg-white/90">
            <Plus className="h-4.5 w-4.5" />
            New Chat
          </button>
        </div>

        <div className={mobile ? "h-[420px]" : "h-[560px]"} />
      </div>
    </aside>
  );
}