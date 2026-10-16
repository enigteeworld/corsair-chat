import Link from "next/link";
import {
  BookOpen,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

function DocSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-panel rounded-[24px] p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <h2 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-white/92">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 text-[0.94rem] leading-7 text-white/60">
        {children}
      </div>
    </section>
  );
}

function Command({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 text-[0.84rem] text-cyan-200/85">
      {children}
    </code>
  );
}

export default function DocsPage() {
  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-5xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Docs
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          What Corsair Chat does, and how to use it
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Corsair is a conversational operator interface: one chat surface
          that handles everyday writing and research work, and — separately —
          gives visibility and controlled execution into a connected wallet
          and the CARV-1 managed strategy runtime. This page documents both
          halves plainly, including what Corsair will not do.
        </p>

        <div className="mt-10 grid gap-5 md:gap-6">
          <DocSection icon={Sparkles} title="Productivity features (v1.0)">
            <p>
              Six writing and thinking tools live directly inside chat as
              internal handlers — no separate tab or mode switch required.
              Just describe what you need and Corsair routes the request to
              the right template automatically.
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              <li>
                <strong className="text-white/80">Professional CV</strong> —
                “write my cv”, “rewrite my resume”
              </li>
              <li>
                <strong className="text-white/80">Research Brief</strong> —
                “give me a research brief on…”, “explain this topic”
              </li>
              <li>
                <strong className="text-white/80">Email Drafting</strong> —
                “draft an email to…”, “write a follow-up email”
              </li>
              <li>
                <strong className="text-white/80">Post Generator</strong> —
                “write a tweet about…”, “draft a thread on…”
              </li>
              <li>
                <strong className="text-white/80">Rewrite Studio</strong> —
                “rewrite this”, “make this more concise”
              </li>
              <li>
                <strong className="text-white/80">Idea Partner</strong> —
                “brainstorm names for…”, “I’m stuck on…”
              </li>
            </ul>
            <p>
              Each one has its own intent detection, prompt template, and
              output formatting — see{" "}
              <Link
                href="/collections"
                className="text-cyan-300/85 underline underline-offset-4 hover:text-cyan-200"
              >
                Collections
              </Link>{" "}
              for ready-to-use starting prompts.
            </p>
          </DocSection>

          <DocSection icon={Wallet} title="Wallet model">
            <p>
              Corsair enforces a strict separation between two wallets, and
              will never imply they are the same:
            </p>
            <ul className="space-y-1.5">
              <li>
                <strong className="text-white/80">
                  Connected user wallet
                </strong>{" "}
                — yours, controlled by MetaMask or another injected wallet.
                Used for deposits and user-triggered transactions. Every
                send requires your explicit approval in-wallet.
              </li>
              <li>
                <strong className="text-white/80">Corsair Treasury</strong> —
                controlled by the backend service. Executes managed strategy
                actions and treasury-side transfers. Never directly exposed
                to user control.
              </li>
            </ul>
            <p className="text-white/50">Chat commands:</p>
            <ul className="space-y-1.5">
              <li>
                <Command>read my wallet</Command> — connected wallet readout
              </li>
              <li>
                <Command>read arbitrum wallet</Command> — treasury readout
              </li>
              <li>
                <Command>switch to arbitrum sepolia</Command> — network
                switch prompt
              </li>
              <li>
                <Command>send 0.001 ETH to 0x…</Command> — treasury execution
              </li>
              <li>
                <Command>send 0.001 ETH from my wallet to 0x…</Command> —
                connected-wallet execution
              </li>
            </ul>
            <p>
              Corsair currently operates on{" "}
              <strong className="text-white/80">Arbitrum Sepolia</strong> for
              testing.
            </p>
          </DocSection>

          <DocSection icon={Layers} title="CARV-1 managed strategy runtime">
            <p>
              CARV-1 is a backend-controlled strategy runtime and vault-style
              accounting system — it is{" "}
              <strong className="text-white/80">not</strong> a direct
              trading wallet or a user-controlled execution account. It
              maintains vault accounting, tracks deposits and shares,
              enforces risk policy, and gates execution based on capital,
              signal quality, and risk thresholds.
            </p>
            <ul className="space-y-1.5">
              <li>
                <Command>show strategies</Command> — the strategy registry
              </li>
              <li>
                <Command>show carv-1</Command> — full runtime detail
              </li>
              <li>
                <Command>is carv safe</Command> — risk and policy framing
              </li>
              <li>
                <Command>deposit into carv</Command> /{" "}
                <Command>withdraw from carv</Command> — deposit/withdrawal
                flow and policy context
              </li>
            </ul>
            <p>
              Deposit and withdrawal execution are not fully wired
              end-to-end in chat yet — the model, policy framing, and
              runtime context are exposed correctly, but the transaction
              path is still in progress. See{" "}
              <Link
                href="/roadmap"
                className="text-cyan-300/85 underline underline-offset-4 hover:text-cyan-200"
              >
                Roadmap
              </Link>
              .
            </p>
          </DocSection>

          <DocSection icon={ShieldCheck} title="Safety and honesty framing">
            <p>
              Corsair does not describe CARV-1 as risk-free, does not
              fabricate performance history it doesn&apos;t have, and does
              not imply live execution is guaranteed. Where runtime state is
              <Command>blocked</Command> or <Command>paper</Command>, Corsair
              says so directly rather than smoothing it over.
            </p>
            <p>
              Productivity features (CV, research, email, posts, rewrites,
              ideas) run through the model directly — Corsair will flag
              assumptions it made and ask before inventing specific facts,
              numbers, or citations it isn&apos;t confident in.
            </p>
          </DocSection>

          <DocSection icon={MessageSquare} title="Getting started">
            <p>
              Open{" "}
              <Link
                href="/agent?new=1"
                className="text-cyan-300/85 underline underline-offset-4 hover:text-cyan-200"
              >
                the Agent
              </Link>{" "}
              and just type. There is no command syntax to memorize for the
              productivity features — natural language triggers each one.
              For wallet and CARV-1 actions, the exact phrasing above is the
              most reliable path while intent parsing is still narrow by
              design (a deliberate choice, to avoid accidental financial
              actions from ambiguous phrasing).
            </p>
          </DocSection>
        </div>
      </section>
    </div>
  );
}
