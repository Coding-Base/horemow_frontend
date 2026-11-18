import Eyebrow from "./Eyebrow";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
};

export default function PageIntro({
  eyebrow,
  title,
  description,
  compact = false,
}: Props) {
  return (
    <section
      className={`relative isolate flex min-h-[350px] items-center overflow-hidden bg-[#071523] py-14 text-white sm:min-h-[420px] sm:py-20 ${compact ? "sm:pb-12" : ""}`}
    >
      <video
        aria-hidden="true"
        autoPlay
        className="absolute inset-0 size-full object-cover"
        data-testid="page-intro-video"
        loop
        muted
        playsInline
        preload="metadata"
        src="/video.mp4"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#061321]/65" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,16,29,.9)_0%,rgba(5,16,29,.68)_55%,rgba(5,16,29,.35)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#071523]/60 via-transparent to-[#071523]/20"
      />
      <div className="relative mx-auto w-[min(1200px,calc(100%-2.25rem))]">
        <Eyebrow>
          <span className="h-0.5 w-6 bg-[#e5be64]" /> {eyebrow}
        </Eyebrow>
        <h1 className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.08em] text-white sm:text-7xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
