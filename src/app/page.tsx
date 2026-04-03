"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  FileText,
  Send,
  Sparkles,
  ExternalLink,
} from "lucide-react";

function OrbitalBackground() {
  return (
    <div className="orbital-bg">
      <div className="orbital-ring left-1/2 top-[84px] h-[760px] w-[760px] -translate-x-1/2 max-md:top-[120px] max-md:h-[520px] max-md:w-[520px]" />
      <div className="orbital-ring left-1/2 top-[170px] h-[590px] w-[590px] -translate-x-1/2 max-md:top-[180px] max-md:h-[410px] max-md:w-[410px]" />
      <div className="orbital-ring left-1/2 top-[255px] h-[420px] w-[420px] -translate-x-1/2 max-md:top-[235px] max-md:h-[290px] max-md:w-[290px]" />
      <div className="orbital-ring left-1/2 top-[322px] h-[286px] w-[286px] -translate-x-1/2 max-md:hidden" />

      <div className="orbital-dot left-[3.2%] top-[188px] max-md:left-[4%] max-md:top-[280px]" />
      <div className="orbital-dot right-[7.6%] top-[264px] max-md:right-[6%] max-md:top-[360px]" />
      <div className="orbital-dot right-[32%] top-[356px] max-md:right-[33%] max-md:top-[470px]" />

      <div className="floating-diamond left-[8%] top-[560px] max-md:left-[4%] max-md:top-[820px]" />
      <div className="floating-diamond right-[9%] top-[245px] max-md:right-[6%] max-md:top-[260px]" />
    </div>
  );
}

function MetricCard({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="glass-panel metric-card flex flex-col items-center justify-center rounded-[24px] px-6 py-7 text-center md:px-7 md:py-8">
      <div className="text-[2.35rem] font-semibold tracking-[-0.04em] text-white/90 md:text-[2.85rem]">
        {value}
      </div>
      <div className="mt-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/38 md:text-[0.78rem]">
        {label}
      </div>
    </div>
  );
}

function ProductCard({
  title,
  price,
  description,
}: {
  title: string;
  price: string;
  description: string;
}) {
  return (
    <div className="glass-panel card-hover rounded-[24px] p-6 md:p-7">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-white/62">
          <Sparkles className="h-4.5 w-4.5" />
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.78rem] font-medium text-white/38">
          {price}
        </div>
      </div>

      <h3 className="text-[1.26rem] font-semibold tracking-[-0.03em] text-white/90 md:text-[1.42rem]">
        {title}
      </h3>

      <p className="mt-3 text-[0.94rem] leading-7 text-white/50 md:text-[0.98rem]">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit() {
    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/agent?new=1");
      return;
    }

    router.push(`/agent?new=1&q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <OrbitalBackground />

      <section className="relative mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="soft-pill mx-auto inline-flex max-w-full items-center gap-2.5 rounded-full px-4 py-2 text-[0.78rem] font-medium text-white/54 md:h-[42px] md:px-4.5 md:text-[0.82rem]">
            <span className="text-balance">
              Creative + productivity assistant powered by the Corsair ecosystem
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </div>

          <h1 className="hero-title mx-auto mt-7 max-w-[860px] text-balance text-white/92 md:mt-8">
            Discover and create with{" "}
            <span className="text-cyan-300/80">Corsair Chat</span>
          </h1>

          <p className="hero-subtitle mx-auto mt-5 max-w-[650px] px-1 md:mt-6">
            Access a premium chat assistant for writing, research, planning,
            summarization, and everyday productivity. Built as a standalone
            product with OpenClaw for chat only.
          </p>

          <div className="glass-panel mx-auto mt-8 max-w-[820px] rounded-[30px] p-2.5 md:mt-9 md:rounded-[32px] md:p-3">
            <div className="soft-pill flex items-center gap-3 rounded-[22px] px-4 py-3 md:h-[68px] md:gap-3.5 md:rounded-[26px] md:px-5">
              <div className="text-white/26">
                <FileText className="h-4 w-4 md:h-[18px] md:w-[18px]" />
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Ask Corsair Chat anything..."
                className="h-full min-w-0 flex-1 border-none bg-transparent text-[0.95rem] font-medium text-white/68 placeholder:text-white/28 outline-none md:text-[0.98rem]"
              />

              <button
                type="button"
                onClick={handleSubmit}
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 md:h-[50px] md:w-[50px]"
                aria-label="Open agent chat"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-[0.84rem] font-medium text-white/38 md:gap-3 md:text-[0.9rem]">
              <Link href="/resources" className="transition hover:text-white/66">
                Resources
              </Link>
              <span className="text-white/20">›</span>
              <Link href="/roadmap" className="transition hover:text-white/66">
                Roadmap
              </Link>
              <span className="text-white/20">›</span>
              <Link href="/docs" className="transition hover:text-white/66">
                API Docs
              </Link>
            </div>

            <div className="mt-4 flex justify-center">
              <button className="soft-pill inline-flex h-[40px] items-center gap-2 rounded-full px-4 text-[0.8rem] font-medium text-white/60 md:h-[42px] md:text-[0.84rem]">
                <FileText className="h-3.5 w-3.5" />
                SKILL.md
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-7">
              <div className="section-kicker text-center">Integrated With</div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-5">
                <div className="text-[1rem] font-semibold text-white/58">
                  Scout
                </div>
                <div className="text-[1rem] font-semibold text-blue-400/75">
                  PayAI
                </div>
                <div className="text-[1rem] font-semibold text-fuchsia-400/75">
                  OpenClaw
                </div>
                <div className="text-[1rem] font-semibold text-white/58">Z</div>
                <div className="text-[1rem] font-semibold text-lime-400/75">
                  x402
                </div>
                <div className="text-[1rem] font-semibold text-white/58">
                  Shield
                </div>
                <div className="text-[1rem] font-semibold text-blue-500/75">
                  X
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-[1080px] border-t border-white/8 pt-12 md:mt-24 md:pt-14">
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            <MetricCard value="3,720" label="Users" />
            <MetricCard value="585" label="Images Created" />
            <MetricCard value="707" label="x402 Settlements" />
          </div>

          <div className="mt-7 flex justify-center md:mt-8">
            <Link
              href="/agent?new=1"
              className="soft-pill inline-flex h-[44px] items-center gap-2 rounded-full px-5 text-[0.9rem] font-medium text-white/58 transition hover:text-white"
            >
              Agent&apos;s Identity
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-[1120px] md:mt-24">
          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            <div className="text-center">
              <div className="text-[3rem] font-semibold tracking-[-0.04em] text-white/12 md:text-[3.5rem]">
                01
              </div>
              <div className="mt-1.5 text-[1.32rem] font-semibold tracking-[-0.03em] text-white/90 md:text-[1.5rem]">
                Ask
              </div>
              <p className="mx-auto mt-3 max-w-[280px] text-[0.95rem] leading-7 text-white/45 md:text-[0.98rem]">
                Describe what you need. Corsair Chat understands context and
                responds clearly.
              </p>
            </div>

            <div className="text-center">
              <div className="text-[3rem] font-semibold tracking-[-0.04em] text-white/12 md:text-[3.5rem]">
                02
              </div>
              <div className="mt-1.5 text-[1.32rem] font-semibold tracking-[-0.03em] text-white/90 md:text-[1.5rem]">
                Refine
              </div>
              <p className="mx-auto mt-3 max-w-[280px] text-[0.95rem] leading-7 text-white/45 md:text-[0.98rem]">
                Improve drafts, tighten structure, rewrite tone, or expand into
                better output.
              </p>
            </div>

            <div className="text-center">
              <div className="text-[3rem] font-semibold tracking-[-0.04em] text-white/12 md:text-[3.5rem]">
                03
              </div>
              <div className="mt-1.5 text-[1.32rem] font-semibold tracking-[-0.03em] text-white/90 md:text-[1.5rem]">
                Create
              </div>
              <p className="mx-auto mt-3 max-w-[280px] text-[0.95rem] leading-7 text-white/45 md:text-[0.98rem]">
                Get polished results quickly for work, research, content, and
                planning.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center md:mt-16">
            <div className="section-kicker">What Corsair Chat Creates</div>
            <p className="mx-auto mt-4 max-w-[680px] text-[0.96rem] leading-7 text-white/48 md:text-[1rem]">
              Practical outputs with clean structure and no clutter. Use it for
              writing, research, summaries, CVs, and everyday productivity.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
            <ProductCard
              title="Professional CV"
              price="from free"
              description="One-page CVs, resume rewrites, clean formatting, and stronger personal positioning."
            />
            <ProductCard
              title="Research Brief"
              price="fast"
              description="Clear topic breakdowns, structured summaries, and quick learning support."
            />
            <ProductCard
              title="Email Drafting"
              price="instant"
              description="Professional emails, outreach drafts, and polished communication for work and school."
            />
            <ProductCard
              title="Post Generator"
              price="quick"
              description="Draft sharper X posts, hooks, short threads, and clearer public messaging."
            />
            <ProductCard
              title="Rewrite Studio"
              price="clean"
              description="Rewrite text for tone, clarity, brevity, or stronger structure without overcomplication."
            />
            <ProductCard
              title="Idea Partner"
              price="creative"
              description="Brainstorm names, concepts, outlines, plans, and working directions when you are stuck."
            />
          </div>
        </div>
      </section>
    </div>
  );
}