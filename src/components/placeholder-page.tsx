type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-16 md:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-white shadow-none backdrop-blur-xl">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
          {eyebrow}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-2xl text-white/65">{description}</p>
      </div>
    </div>
  );
}