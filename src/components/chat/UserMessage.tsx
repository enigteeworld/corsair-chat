"use client";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[88%] rounded-[22px] border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-[0.94rem] leading-7 text-white/92 shadow-[0_14px_30px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.025)] md:max-w-[70%] md:rounded-[24px] md:px-5 md:py-3.5 md:text-[0.97rem]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}