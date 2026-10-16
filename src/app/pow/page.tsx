import { GitCommit } from "lucide-react";

type LogEntry = {
  tag: string;
  title: string;
  notes: string[];
};

const log: LogEntry[] = [
  {
    tag: "v1.0",
    title: "Six productivity features shipped as internal handlers",
    notes: [
      "Added cv.ts, research.ts, email.ts, postGenerator.ts, rewriteStudio.ts, and ideaPartner.ts alongside wallet.ts and carv.ts in src/app/api/chat/.",
      "Each handler ships its own intent parser, task-specific system prompt, and output formatting spec, routed through route.ts in the same pattern as wallet and CARV-1 handling.",
      "Filled in real content across Collections, Resources, Roadmap, PoW, Blog, and Docs — no more placeholder pages.",
    ],
  },
  {
    tag: "v0.4",
    title: "CARV-1 strategy runtime visibility",
    notes: [
      "Wired /strategies and /strategies/carv-1 into chat via carv.ts.",
      "Added registry, deposit/withdraw framing, safety framing, and performance readout intents.",
      "Made explicit that CARV-1 is a managed strategy runtime, not a user-controlled trading wallet.",
    ],
  },
  {
    tag: "v0.3",
    title: "Treasury execution",
    notes: [
      "Backend-managed ETH transfers on Arbitrum Sepolia via the Arbitrum backend service.",
      "Added confirm / cancel confirmation flow before any treasury send executes.",
    ],
  },
  {
    tag: "v0.2",
    title: "Connected wallet + user-wallet execution",
    notes: [
      "wagmi + MetaMask connection flow, wallet modal, and network switching to Arbitrum Sepolia.",
      "Added the parallel 'send ... from my wallet' intent so user-wallet sends stay clearly separate from treasury sends.",
    ],
  },
  {
    tag: "v0.1",
    title: "Chat interface",
    notes: [
      "Initial Corsair chat surface: sessions, streaming replies, personality controls (tone / style / symbol).",
      "OpenRouter integration with model fallback list.",
    ],
  },
];

export default function PowPage() {
  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-4xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          PoW
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          Proof of work
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          A running build log of what actually shipped into Corsair Chat,
          in order. Newest first.
        </p>

        <div className="relative mt-10 space-y-6 border-l border-white/10 pl-8">
          {log.map((entry) => (
            <div key={entry.tag} className="relative">
              <div className="absolute -left-[41px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/25 bg-black text-cyan-300/85">
                <GitCommit className="h-3.5 w-3.5" />
              </div>

              <div className="glass-panel rounded-[20px] p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="soft-pill rounded-full px-3 py-1 text-[0.76rem] font-medium text-cyan-200/85">
                    {entry.tag}
                  </span>
                  <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-white/90">
                    {entry.title}
                  </h2>
                </div>

                <ul className="mt-3.5 space-y-2">
                  {entry.notes.map((note) => (
                    <li
                      key={note}
                      className="flex gap-2.5 text-[0.88rem] leading-6 text-white/52"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
