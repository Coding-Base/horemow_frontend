import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/common/EmptyState";
import PageIntro from "../components/common/PageIntro";
import { shareDevotional } from "../lib/share";
import { useDevotionalsContent } from "../lib/contentStore";

export default function DevotionalPage() {
  const devotionals = useDevotionalsContent();
  const [date, setDate] = useState(() => new Date());
  const [shareMessage, setShareMessage] = useState("");

  const dateLabel = date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const activeDevotional = devotionals[0] ?? {
    title: "A heart grounded in truth.",
    author: "Pastor Paul Rika",
    scriptureReference: "Psalm 119:105",
    scriptureVerse: "“Thy word is a lamp unto my feet, and a light unto my path.”",
    reflection:
      "Take a quiet moment to reflect on the guidance and wisdom found in scripture. Let truth shape the choices you make and the way you care for those around you today.",
    prayer:
      "Lord, guide my thoughts and actions. Help me to walk in truth, show kindness and remain faithful in the day ahead.",
  };

  const isToday = date.toDateString() === new Date().toDateString();

  const moveDate = (offset: number) => {
    setDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + offset);
      return next;
    });
    setShareMessage("");
  };

  const handleShare = async () => {
    try {
      await shareDevotional(window.location.href, `${activeDevotional.title} - HOREMOW Daily Devotional`);
      setShareMessage("Share options opened.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Could not open sharing. Copy the page address to share.");
    }
  };

  return (
    <>
      <PageIntro
        compact
        description="A daily moment for scripture meditation, spiritual reflection and earnest prayer."
        eyebrow="Daily holiness walk"
        title="Today’s devotional."
      />
      <section className="py-8">
        <div className="mx-auto w-[min(1030px,calc(100%-2.25rem))]">
          <div className="mb-4 grid grid-cols-2 items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex sm:justify-between">
            <button
              className="flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-brand-blue"
              onClick={() => moveDate(-1)}
              type="button"
            >
              <ArrowLeft size={15} /> Previous day
            </button>
            <span className="col-span-2 row-start-1 flex items-center justify-center gap-2 text-xs font-bold text-brand-blue sm:col-span-1 sm:row-auto">
              <CalendarDays size={15} /> {dateLabel}
            </span>
            <button
              className="flex justify-end gap-2 text-[11px] font-bold text-slate-600 hover:text-brand-blue"
              onClick={() => moveDate(1)}
              type="button"
            >
              Next day <ArrowRight size={15} />
            </button>
          </div>

          {isToday ? (
            <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[.72fr_1.28fr]">
              <div className="relative flex min-h-64 flex-col items-center justify-center gap-6 overflow-hidden bg-gradient-to-br from-[#1b4569] to-[#12293e] text-white md:min-h-[500px]">
                <div className="absolute inset-8 rounded-full border border-white/20" />
                <div className="absolute inset-3 rounded-full border border-white/10" />
                <span className="z-10 flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-200">
                  {date.toLocaleDateString("en", { weekday: "long" })}
                  <strong className="font-serif text-6xl font-normal tracking-tight text-white">
                    {date.getDate()}
                  </strong>
                  {date.toLocaleDateString("en", { month: "long" })}
                </span>
                <BookOpen className="z-10 text-[#ecdfc8]" size={46} strokeWidth={1.3} />
                <span className="absolute bottom-5 z-10 text-[8px] font-bold tracking-[.15em] text-[#e5be64]">
                  A DAILY MOMENT IN THE WORD
                </span>
              </div>
              <div className="p-5 sm:p-9">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded bg-soft-blue px-2.5 py-1 text-[9px] font-bold text-[#234a6c]">
                    HOREMOW Daily Devotional · {activeDevotional.author}
                  </span>
                  <button
                    className="flex items-center gap-1.5 rounded border border-slate-200 px-2.5 py-2 text-[11px] font-bold text-brand-blue transition hover:bg-slate-50"
                    onClick={handleShare}
                    type="button"
                  >
                    <Share2 size={15} /> Share
                  </button>
                </div>
                <h2 className="mt-7 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {activeDevotional.title}
                </h2>
                <p className="mt-3 text-xs font-bold text-brand-blue">
                  Scripture reading · {activeDevotional.scriptureReference}
                </p>
                <blockquote className="my-5 rounded-r-lg border-l-4 border-brand-green bg-[#f4f5f1] p-4 font-serif text-lg leading-relaxed italic text-slate-700">
                  {activeDevotional.scriptureVerse}
                </blockquote>
                <p className="text-sm leading-7 text-slate-600">
                  {activeDevotional.reflection}
                </p>
                <div className="mt-5 rounded-xl bg-soft-blue p-5">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#234969]">
                    <Heart size={16} /> A prayer for today
                  </span>
                  <p className="mt-2 font-serif text-sm leading-6 text-slate-700">
                    {activeDevotional.prayer}
                  </p>
                </div>
              </div>
            </article>
          ) : (
            <EmptyState
              action={
                <button
                  className="text-xs font-bold text-brand-blue hover:underline"
                  onClick={() => setDate(new Date())}
                  type="button"
                >
                  Return to today
                </button>
              }
              description="Daily devotionals are published every day by HOREMOW. Select Today to read current meditation."
              icon={CalendarDays}
              title={`No archived devotional loaded for ${dateLabel}.`}
            />
          )}
          {shareMessage && (
            <p className="mt-3 text-xs text-brand-blue" role="status">
              {shareMessage}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
