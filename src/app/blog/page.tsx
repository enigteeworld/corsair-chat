import { Calendar, Clock } from "lucide-react";

type Post = {
  title: string;
  excerpt: string;
  body: string[];
  date: string;
  readTime: string;
};

const posts: Post[] = [
  {
    title: "Why Corsair keeps two wallets strictly separate",
    date: "Product notes",
    readTime: "3 min read",
    excerpt:
      "The connected wallet and the Corsair treasury wallet look similar in chat, but they're never allowed to blur together.",
    body: [
      "It would be easy to build a chat interface that quietly treats every wallet the same way — one 'send ETH' intent, one execution path. We didn't do that, and we won't.",
      "The connected wallet is yours. It requires your explicit approval for every transaction, through your own wallet extension, on your terms. The Corsair treasury wallet is backend-controlled and handles managed strategy execution — it is never directly exposed to user control, and Corsair never implies the two are interchangeable.",
      "This shows up in small but deliberate ways: separate intent parsers for 'send ETH to' versus 'send ETH from my wallet to', separate confirmation prompts, and a system prompt that explicitly instructs the model never to conflate the two. Ambiguity here isn't a UX nicety — it's a custody model.",
    ],
  },
  {
    title: "Building six features as handlers, not six apps",
    date: "Engineering notes",
    readTime: "4 min read",
    excerpt:
      "CV, research, email, posts, rewrites, and brainstorming all live inside one chat route — here's why that held up.",
    body: [
      "The wallet and CARV-1 handlers set a pattern early: an intent parser looks at the last user message, decides whether it owns the request, and either returns a fully-formed reply or steps aside for the next handler in line.",
      "The six v1.0 productivity features follow the exact same shape, with one difference — their output can't be templated the way a wallet readout can. A CV or a research brief has to actually be written. So instead of returning a canned reply, each handler returns a task-specific system prompt: a brief covering output structure, tone, and what not to invent. Route.ts layers that brief on top of Corsair's base identity and streams it through the same model call every other reply uses.",
      "The result is six distinct products that never needed six separate API routes, six separate frontends, or a mode switch. It's one chat, six ways of listening to it.",
    ],
  },
  {
    title: "CARV-1 is not a savings account",
    date: "Risk & framing",
    readTime: "3 min read",
    excerpt:
      "A managed strategy runtime with real execution risk deserves a straight answer, not a reassuring one.",
    body: [
      "Ask Corsair whether CARV-1 is safe to deposit into, and it won't say yes. It'll walk through the current runtime state, the live/paper/blocked distinction, the risk policy guardrails, and then give you the honest version: it's structured and risk-gated, but it's still a managed strategy product with real execution and market risk.",
      "That framing isn't a legal disclaimer bolted on afterward — it's baked into how carv.ts formats every safety-related response, pulling live values from the strategy API rather than describing a static, idealized version of the vault.",
    ],
  },
];

export default function BlogPage() {
  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Blog
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          Notes on building Corsair
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Short, honest write-ups on product decisions — what we built, and
          why it's shaped the way it is.
        </p>

        <div className="mt-10 space-y-6">
          {posts.map((post) => (
            <article key={post.title} className="glass-panel rounded-[24px] p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-4 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-white/35">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.03em] text-white/92">
                {post.title}
              </h2>
              <p className="mt-2 text-[0.96rem] leading-7 text-white/55">
                {post.excerpt}
              </p>

              <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                {post.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-[0.92rem] leading-7 text-white/50"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
