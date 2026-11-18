import { ArrowUpRight, BookOpen, CalendarDays, Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDevotionalsContent } from "../../lib/contentStore";
import { shareDevotional } from "../../lib/share";
import Eyebrow from "../common/Eyebrow";

export default function DailyDevotionalSpotlight() {
  const devotionals = useDevotionalsContent();
  const todayEntry = devotionals[0] ?? {
    title: "A heart grounded in truth.",
    author: "Pastor Paul Rika",
    scriptureReference: "Psalm 119:105",
    scriptureVerse: "“Thy word is a lamp unto my feet, and a light unto my path.”",
    reflection:
      "Take a quiet moment to reflect on the guidance and wisdom found in scripture. Let truth shape the choices you make and the way you care for those around you today.",
    prayer:
      "Lord, guide my thoughts and actions. Help me to walk in truth, show kindness and remain faithful in the day ahead.",
  };

  const handleShare = async () => {
    try {
      await shareDevotional(
        `${window.location.origin}/devotional`,
        `${todayEntry.title} - HOREMOW Daily Devotional`,
      );
    } catch {
      // ignore
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#f7f7f3]/95 to-[#edf2f6]/95 py-16 backdrop-blur-sm sm:py-24" data-scroll-reveal>
      <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Daily spiritual bread</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Today’s Holiness Devotional.
            </h2>
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">
              Scripture reflection and morning prayer to anchor your thoughts in God's will.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
            to="/devotional"
          >
            Visit Devotional Portal <ArrowUpRight size={15} />
          </Link>
        </div>

        <article className="grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl md:grid-cols-[.75fr_1.25fr]">
          {/* Left Decorative Date & Bible Seal */}
          <div className="relative flex min-h-64 flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-br from-[#183d5f] to-[#102438] p-8 text-center text-white">
            <div className="absolute inset-4 rounded-2xl border border-white/15" />
            <span className="z-10 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e5be64] backdrop-blur-sm">
              {new Date().toLocaleDateString("en", { weekday: "long" })}
            </span>
            <div className="z-10 my-2">
              <strong className="block font-serif text-6xl font-normal tracking-tight text-white">
                {new Date().getDate()}
              </strong>
              <span className="text-xs uppercase tracking-widest text-slate-300">
                {new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}
              </span>
            </div>
            <BookOpen className="z-10 text-[#e5be64]" size={36} strokeWidth={1.4} />
            <span className="z-10 text-[9px] font-extrabold tracking-[.18em] text-slate-300">
              A DAILY MOMENT WITH GOD
            </span>
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-between p-6 sm:p-10">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
                  {todayEntry.scriptureReference}
                </span>
                <button
                  aria-label="Share today's devotional"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-blue transition hover:bg-slate-50"
                  onClick={handleShare}
                  type="button"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>

              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
                {todayEntry.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">By {todayEntry.author}</p>

              <blockquote className="my-5 rounded-r-xl border-l-4 border-brand-green bg-[#f3f5f0] p-4 font-serif text-base leading-relaxed italic text-slate-700">
                {todayEntry.scriptureVerse}
              </blockquote>

              <p className="text-xs leading-6 text-slate-600 sm:text-sm">
                {todayEntry.reflection}
              </p>

              <div className="mt-5 rounded-xl bg-soft-blue p-4">
                <span className="flex items-center gap-2 text-xs font-bold text-brand-blue">
                  <Heart size={15} /> Prayer for today
                </span>
                <p className="mt-1.5 font-serif text-xs leading-5 text-slate-700">
                  {todayEntry.prayer}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="flex items-center gap-2 text-[11px] text-slate-500">
                <CalendarDays size={14} /> Updated daily at midnight
              </span>
              <Link
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-[#123b70]"
                to="/devotional"
              >
                Read full devotional <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
