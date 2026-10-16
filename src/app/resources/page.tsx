import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Layers,
  MessagesSquare,
  Sparkles,
  Wallet,
} from "lucide-react";

const guides = [
  {
    icon: Sparkles,
    title: "Getting the most out of the six features",
    description:
      "How CV, Research, Email, Post Generator, Rewrite Studio, and Idea Partner detect intent, and how to phrase requests so the right one fires.",
    href: "/docs",
    linkLabel: "Read the docs",
  },
  {
    icon: Layers,
    title: "Prompt packs",
    description:
      "Copy-and-edit starting prompts for every feature, ready to open straight into Agent.",
    href: "/collections",
    linkLabel: "Browse collections",
  },
  {
    icon: Wallet,
    title: "Wallet model explained",
    description:
      "The difference between your connected wallet and the Corsair treasury wallet, and which commands touch which one.",
    href: "/docs",
    linkLabel: "Read the docs",
  },
  {
    icon: MessagesSquare,
    title: "Try it hands-on",
    description:
      "One-tap example prompts for every feature, plus wallet and CARV-1 readout commands.",
    href: "/playground",
    linkLabel: "Open playground",
  },
];

const faqs = [
  {
    q: "Do I need to phrase things exactly right?",
    a: "For the six productivity features, no — natural language triggers them (\"write my resume\", \"draft an email to my landlord\"). For wallet and CARV-1 actions, closer-to-exact phrasing is currently more reliable, by design, to avoid ambiguous financial actions.",
  },
  {
    q: "Does Corsair have live web access for research?",
    a: "Not currently. Research Brief mode works from the model's own knowledge and will flag anything time-sensitive or uncertain rather than guessing at current figures.",
  },
  {
    q: "Can I use the connected-wallet flow without funds?",
    a: "Yes — \"read my wallet\" gives a readout with no transaction involved. Sends always require explicit in-wallet approval.",
  },
  {
    q: "Is CARV-1 deposit/withdraw fully live?",
    a: "The policy and runtime framing are exposed correctly in chat, but full end-to-end execution isn't wired yet — see the Roadmap for status.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-5xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Resources
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          Guides, examples, and support
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Everything you need to get productive in Corsair Chat fast —
          starting prompts, feature explanations, and answers to the
          questions that come up most.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:gap-6">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link
                key={guide.title}
                href={guide.href}
                className="card-hover glass-panel group flex flex-col rounded-[24px] p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h2 className="mt-4 text-[1.1rem] font-semibold tracking-[-0.02em] text-white/90">
                  {guide.title}
                </h2>
                <p className="mt-2 flex-1 text-[0.88rem] leading-6 text-white/48">
                  {guide.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-cyan-300/75 transition group-hover:text-cyan-200">
                  {guide.linkLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-14">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-[1.3rem] font-semibold tracking-[-0.02em] text-white/92">
              Frequently asked
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="glass-panel rounded-[20px] p-5 md:p-6"
              >
                <div className="text-[0.96rem] font-medium text-white/85">
                  {faq.q}
                </div>
                <p className="mt-2 text-[0.88rem] leading-6 text-white/50">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
