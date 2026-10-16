"use client";

import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  Lightbulb,
  Mail,
  PenLine,
  Search,
  Send,
} from "lucide-react";

type Prompt = {
  label: string;
  prompt: string;
};

type Collection = {
  icon: typeof FileText;
  title: string;
  description: string;
  prompts: Prompt[];
};

const collections: Collection[] = [
  {
    icon: FileText,
    title: "Professional CV",
    description:
      "One-page CV builds, resume rewrites, and clean formatting for a specific role.",
    prompts: [
      {
        label: "Build from scratch",
        prompt:
          "Write my CV. I'm targeting [role] roles, I have [X years] of experience, and my strongest wins are [achievement 1], [achievement 2].",
      },
      {
        label: "Tighten an existing CV",
        prompt:
          "Rewrite my resume to be one page and more outcome-driven. Here's my current draft: [paste resume text]",
      },
      {
        label: "Retarget for a role",
        prompt:
          "Rework my CV to target a [target role] position instead of my current field. Here's my background: [paste details]",
      },
    ],
  },
  {
    icon: Search,
    title: "Research Brief",
    description:
      "Fast, structured breakdowns of a topic — overview, key points, caveats.",
    prompts: [
      {
        label: "Topic breakdown",
        prompt: "Give me a research brief on [topic].",
      },
      {
        label: "Compare two things",
        prompt:
          "Give me a research brief comparing [option A] and [option B] for [use case].",
      },
      {
        label: "Quick learning support",
        prompt: "Help me understand [concept] — assume I know the basics of [related area].",
      },
    ],
  },
  {
    icon: Mail,
    title: "Email Drafting",
    description:
      "Outreach, follow-ups, and replies drafted in the right register instantly.",
    prompts: [
      {
        label: "Cold outreach",
        prompt:
          "Draft a cold outreach email to [recipient/role] about [what you want]. Keep it short and direct.",
      },
      {
        label: "Follow-up",
        prompt:
          "Write a follow-up email — I emailed [recipient] about [topic] [timeframe] ago and haven't heard back.",
      },
      {
        label: "Reply to an email",
        prompt: "Help me reply to this email: [paste email]. I want to convey [your point].",
      },
    ],
  },
  {
    icon: Send,
    title: "Post Generator",
    description:
      "Sharper hooks, threads, and short-form posts for X or LinkedIn.",
    prompts: [
      {
        label: "Single post, a few angles",
        prompt: "Write a post about [topic/opinion]. Give me a few different angles.",
      },
      {
        label: "Short thread",
        prompt: "Write a thread breaking down [topic] for people who don't know much about it.",
      },
      {
        label: "Launch announcement",
        prompt: "Write a post announcing [thing you're launching]. Make the hook do the work.",
      },
    ],
  },
  {
    icon: PenLine,
    title: "Rewrite Studio",
    description:
      "Tone, clarity, and brevity passes on text you already wrote.",
    prompts: [
      {
        label: "Make it more concise",
        prompt: "Make this more concise and direct: [paste text]",
      },
      {
        label: "Change the tone",
        prompt: "Rewrite this to sound more [formal / casual / confident]: [paste text]",
      },
      {
        label: "Clarity pass",
        prompt: "Clean this up for clarity without changing what it says: [paste text]",
      },
    ],
  },
  {
    icon: Lightbulb,
    title: "Idea Partner",
    description:
      "Brainstorming for names, concepts, and directions when you're stuck.",
    prompts: [
      {
        label: "Name ideas",
        prompt: "Give me name ideas for [project/product] — it's about [one-line description].",
      },
      {
        label: "Stuck on a direction",
        prompt: "I'm stuck on [problem]. Help me think through a few different directions.",
      },
      {
        label: "Outline a plan",
        prompt: "Help me plan out [project]. Give me a few structural directions to choose from.",
      },
    ],
  },
];

export default function CollectionsPage() {
  const router = useRouter();

  function openInAgent(prompt: string) {
    router.push(`/agent?new=1&q=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="page-grid relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          Collections
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white/92 md:text-5xl">
          Prompt packs for every v1.0 feature
        </h1>
        <p className="mt-4 max-w-2xl text-white/60">
          Ready-to-use starting prompts for CVs, research, email, posts,
          rewrites, and brainstorming. Fill in the brackets, tap a prompt to
          open it in Agent, and edit before sending.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          {collections.map((collection) => {
            const Icon = collection.icon;

            return (
              <div
                key={collection.title}
                className="glass-panel rounded-[24px] p-6 md:p-7"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-cyan-300/85">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-[1.15rem] font-semibold tracking-[-0.02em] text-white/90">
                      {collection.title}
                    </h2>
                    <p className="mt-1 text-[0.88rem] leading-6 text-white/50">
                      {collection.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {collection.prompts.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => openInAgent(item.prompt)}
                      className="card-hover group flex w-full items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-left transition"
                    >
                      <div>
                        <div className="text-[0.86rem] font-medium text-white/78">
                          {item.label}
                        </div>
                        <div className="mt-0.5 text-[0.8rem] leading-5 text-white/40">
                          {item.prompt}
                        </div>
                      </div>
                      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-white/30 transition group-hover:text-cyan-300/80" />
                    </button>
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
