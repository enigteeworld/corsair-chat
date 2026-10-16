"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  FileText,
  Lightbulb,
  Mail,
  PenLine,
  Search,
  Send,
  Wallet,
} from "lucide-react";

const featureTiles = [
  {
    icon: FileText,
    title: "Professional CV",
    example: "Write my CV for a product design role, 4 years experience.",
  },
  {
    icon: Search,
    title: "Research Brief",
    example: "Give me a research brief on Arbitrum's rollup architecture.",
  },
  {
    icon: Mail,
    title: "Email Drafting",
    example: "Draft a follow-up email — no reply in a week.",
  },
  {
    icon: Send,
    title: "Post Generator",
    example: "Write a post announcing a small product launch.",
  },
  {
    icon: PenLine,
    title: "Rewrite Studio",
    example: "Make this shorter and more direct: [paste text]",
  },
  {
    icon: Lightbulb,
    title: "Idea Partner",
    example: "Give me name ideas for a solo dev newsletter.",
  },
];

const walletCommands = [
  "read my wallet",
  "read arbitrum wallet",
  "show carv-1",
  "is carv safe",
];

export default function PlaygroundPage() {
  const router = useRouter();
  const [customPrompt, setCustomPrompt] = useState("");

  function openInAgent(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) {
      router.push("/agent?new=1");
      return;
    }
    router.push(`/agent?new=1&q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Playground
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          Try a feature in one tap
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Every card below opens Agent with a real example already typed in
          — edit it or just hit send. This is the fastest way to see how
          each v1.0 handler formats its output.
        </p>

        <div className="glass-panel mt-8 rounded-[24px] p-5 md:p-6">
          <div className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-white/40">
            Or write your own
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={customPrompt}
              onChange={(event) => setCustomPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  openInAgent(customPrompt);
                }
              }}
              placeholder="Type anything and open it in Agent..."
              className="soft-pill h-12 flex-1 rounded-2xl border-none bg-transparent px-4 text-[0.95rem] text-white/78 outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => openInAgent(customPrompt)}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[0.92rem] font-medium text-black transition hover:bg-white/90"
            >
              Open in Agent
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {featureTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.title}
                type="button"
                onClick={() => openInAgent(tile.example)}
                className="card-hover glass-panel group flex flex-col rounded-[24px] p-6 text-left"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.02em] text-white/90">
                  {tile.title}
                </h3>
                <p className="mt-2 flex-1 text-[0.88rem] leading-6 text-white/48">
                  {tile.example}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-white/40 transition group-hover:text-cyan-300/80">
                  Try it
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="glass-panel mt-10 rounded-[24px] p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-semibold tracking-[-0.02em] text-white/90">
                Wallet &amp; CARV-1 readouts
              </h2>
              <p className="text-[0.85rem] text-white/45">
                Beta — no funds move from these commands.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {walletCommands.map((command) => (
              <button
                key={command}
                type="button"
                onClick={() => openInAgent(command)}
                className="soft-pill rounded-full px-4 py-2 text-[0.85rem] text-white/68 transition hover:text-white"
              >
                {command}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
