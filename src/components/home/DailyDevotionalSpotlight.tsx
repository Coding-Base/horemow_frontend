import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, CalendarDays, Share2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchTodayDevotional, type DevotionalEntry } from "../../lib/devotionalApi";
import { shareDevotional } from "../../lib/share";
import Eyebrow from "../common/Eyebrow";

export default function DailyDevotionalSpotlight() {
  const [devotional, setDevotional] = useState<Partial<DevotionalEntry>>({
    title: "A heart grounded in truth.",
    author_attribution: "Pastor Paul Rika",
    text_reference: "Psalm 119:105",
    key_verse_reference: "Psalm 119:105",
    key_verse_text: "Thy word is a lamp unto my feet, and a light unto my path.",
    reflection_body:
      "Take a quiet moment to reflect on the guidance and wisdom found in scripture. Let truth shape the choices you make and the way you care for those around you today.",
    thought_for_day: "Meditate on Psalm 119 today and ensure all your dealings with colleagues reflect godly integrity.",
  });

  useEffect(() => {
    let isMounted = true;
    fetchTodayDevotional()
      .then((data) => {
        if (data && isMounted) {
          setDevotional(data);
        }
      })
      .catch((err) => console.warn("Devotional spotlight offline fallback:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleShare = async () => {
    try {
      await shareDevotional(
        `${window.location.origin}/devotional`,
        `${devotional.title} - HOREMOW Daily Devotional`
      );
    } catch {
      // ignore
    }
  };

  const todayDate = new Date();

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
              Scripture reflection and morning meditation to anchor your thoughts in God's will.
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
              {todayDate.toLocaleDateString("en", { weekday: "long" })}
            </span>
            <div className="z-10 my-2">
              <strong className="block font-serif text-6xl font-normal tracking-tight text-white">
                {todayDate.getDate()}
              </strong>
              <span className="text-xs uppercase tracking-widest text-slate-300">
                {todayDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
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
                  {devotional.text_reference || devotional.key_verse_reference || "Scripture Meditation"}
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
                {devotional.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">By {devotional.author_attribution || "Pastor Paul Rika"}</p>

              {(devotional.key_verse_text) && (
                <blockquote className="my-5 rounded-r-xl border-l-4 border-brand-green bg-[#f3f5f0] p-4 font-serif text-base leading-relaxed italic text-slate-700">
                  "{devotional.key_verse_text}"
                </blockquote>
              )}

              <p className="text-xs leading-6 text-slate-600 sm:text-sm line-clamp-4">
                {devotional.reflection_body}
              </p>

              {devotional.thought_for_day && (
                <div className="mt-4 rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-950 flex items-start gap-2">
                  <Sparkles className="shrink-0 text-amber-600 mt-0.5" size={15} />
                  <div>
                    <strong className="font-bold">Thought for the day:</strong> {devotional.thought_for_day}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="flex items-center gap-2 text-[11px] text-slate-500">
                <CalendarDays size={14} /> Updated daily at 5:00 AM WAT
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
