"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { navigation } from "@/lib/navigation";

type SidebarProps = {
  mobile?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-full flex-col border-r border-white/10 bg-black/45 backdrop-blur-xl ${
        mobile ? "w-[84vw] max-w-[340px]" : "w-[300px]"
      }`}
    >
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight text-white">
              Corsair Chat
            </div>
            <div className="text-sm text-white/55">
              Creative + productivity assistant
            </div>
          </div>
        </Link>

        {mobile && (
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${
                  active
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-lg font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/35">
            About Corsair Chat
          </div>
          <p className="text-sm leading-6 text-white/60">
            A standalone assistant app in the Corsair ecosystem for writing,
            research, and everyday productivity. No finance or trading access.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-sm text-white/45">
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
          OpenClaw orchestration layer · Chat only
        </div>
        <div className="flex items-center justify-between">
          <span>© 2026 Corsair</span>
          <div className="flex items-center gap-3 text-white/35">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </aside>
  );
}