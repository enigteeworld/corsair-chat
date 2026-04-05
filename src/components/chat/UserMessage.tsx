"use client";

import { User } from "lucide-react";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[85%] gap-3 md:max-w-[75%] lg:max-w-[65%]">
        <div className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
          <User className="h-4 w-4 text-white/60" />
        </div>
        
        <div className="rounded-2xl bg-[#1a7f64] px-4 py-3 text-[0.95rem] leading-relaxed text-white md:rounded-[20px] md:px-5 md:py-3.5 md:text-[1rem]">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}