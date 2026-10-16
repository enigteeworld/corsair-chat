import { CheckCircle2, CircleDashed, CircleDot } from "lucide-react";

type RoadmapItem = {
  title: string;
  description: string;
};

type RoadmapColumn = {
  status: "shipped" | "in-progress" | "next";
  label: string;
  items: RoadmapItem[];
};

const columns: RoadmapColumn[] = [
  {
    status: "shipped",
    label: "Shipped",
    items: [
      {
        title: "Chat interface",
        description: "Session history, personality controls, streaming replies.",
      },
      {
        title: "Wallet connection + user-wallet execution",
        description: "MetaMask / wagmi connect, network switching, approval-gated sends.",
      },
      {
        title: "Treasury execution",
        description: "Backend-managed ETH transfers with confirm/cancel flow.",
      },
      {
        title: "CARV-1 strategy visibility",
        description: "Registry, runtime detail, safety framing, performance readout.",
      },
      {
        title: "Six v1.0 productivity features",
        description:
          "CV, Research Brief, Email Drafting, Post Generator, Rewrite Studio, Idea Partner — each as its own internal handler with a dedicated prompt template.",
      },
    ],
  },
  {
    status: "in-progress",
    label: "In progress",
    items: [
      {
        title: "Full CARV-1 deposit/withdraw execution",
        description:
          "Policy and runtime context are exposed correctly; the end-to-end transaction path from chat is still being wired.",
      },
      {
        title: "Strategy execution automation depth",
        description: "Deeper signal-to-execution visibility beyond the current gating summary.",
      },
      {
        title: "UI polish",
        description: "Continued refinement across mobile layouts and loading states.",
      },
    ],
  },
  {
    status: "next",
    label: "Next up",
    items: [
      {
        title: "Saved output collections",
        description: "Pin and revisit CVs, drafts, and briefs generated in Agent.",
      },
      {
        title: "Feature-level personality tuning",
        description: "Per-feature tone/style overrides (e.g. blunter Rewrite Studio, warmer Email mode).",
      },
      {
        title: "Additional strategy runtimes",
        description: "Expanding beyond CARV-1 as new managed strategies come online.",
      },
      {
        title: "Mainnet readiness review",
        description: "Moving Arbitrum integration beyond Sepolia testing once execution paths are hardened.",
      },
    ],
  },
];

const statusMeta = {
  shipped: {
    icon: CheckCircle2,
    color: "text-emerald-300/85",
    dot: "border-emerald-400/25 bg-emerald-400/[0.08]",
  },
  "in-progress": {
    icon: CircleDot,
    color: "text-cyan-300/85",
    dot: "border-cyan-400/25 bg-cyan-400/[0.08]",
  },
  next: {
    icon: CircleDashed,
    color: "text-white/50",
    dot: "border-white/12 bg-white/[0.03]",
  },
} as const;

export default function RoadmapPage() {
  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Roadmap
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          What we&apos;re building next
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Corsair ships in small, honest increments. Nothing here is marked
          done until it actually works end-to-end in chat.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {columns.map((column) => {
            const meta = statusMeta[column.status];
            const StatusIcon = meta.icon;

            return (
              <div key={column.status} className="glass-panel rounded-[24px] p-6">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${meta.dot} ${meta.color}`}
                  >
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em] text-white/90">
                    {column.label}
                  </h2>
                </div>

                <div className="mt-5 space-y-4">
                  {column.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="text-[0.9rem] font-medium text-white/82">
                        {item.title}
                      </div>
                      <p className="mt-1.5 text-[0.82rem] leading-5 text-white/48">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
