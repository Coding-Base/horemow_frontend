import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Globe2,
  Headphones,
  HeartHandshake,
  Quote,
} from "lucide-react";
import { useEffect, useRef } from "react";
import ArrowLink from "../components/common/ArrowLink";
import Eyebrow from "../components/common/Eyebrow";
import SectionHeading from "../components/common/SectionHeading";
import FeatureCard from "../components/home/FeatureCard";
import SermonPreviewCard from "../components/home/SermonPreviewCard";
import Gallery3DSection from "../components/home/Gallery3DSection";
import AmbientBackgroundVideo from "../components/home/AmbientBackgroundVideo";
import HomeStatsSection from "../components/home/HomeStatsSection";
import DailyDevotionalSpotlight from "../components/home/DailyDevotionalSpotlight";
import EventsSpotlightSection from "../components/home/EventsSpotlightSection";
import BlogSpotlightSection from "../components/home/BlogSpotlightSection";
import { useHomepageContent, useSermonsContent } from "../lib/contentStore";

export default function HomePage() {
  const content = useHomepageContent();
  const sermons = useSermonsContent();
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = homeRef.current;
    if (!root) return;

    const sections = root.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    if (!("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            activeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative isolate" ref={homeRef}>
      <AmbientBackgroundVideo />
      <div className="relative z-10">
        <section
          className="relative isolate flex min-h-[min(760px,calc(100svh-5rem))] flex-col justify-center overflow-hidden bg-transparent text-white"
          id="home-hero"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,16,29,.94)_0%,rgba(5,16,29,.82)_48%,rgba(5,16,29,.4)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071523]/85 via-transparent to-[#071523]/25"
          />
          <div className="relative mx-auto grid min-h-[min(760px,calc(100svh-5rem))] w-[min(1200px,calc(100%-2.25rem))] items-center py-16 sm:py-20">
            <div className="max-w-4xl">
              <Eyebrow>
                <span className="h-0.5 w-6 bg-[#e5be64]" /> {content.hero.eyebrow}
              </Eyebrow>
              <h1 className="mt-4 text-[clamp(3.5rem,9vw,7.5rem)] font-bold leading-[.9] tracking-[-.085em] text-white">
                {content.hero.headlineLine1}
                <br />
                <em className="not-italic text-[#e5be64]">{content.hero.headlineHighlight}</em>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-100 sm:text-lg sm:leading-8">
                {content.hero.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <ArrowLink light to="/about">{content.hero.discoverText}</ArrowLink>
                <a
                  className="flex min-h-12 items-center gap-2 text-sm font-bold text-white transition hover:text-[#e5be64]"
                  href="/devotional"
                >
                  {content.hero.devotionalText} <ArrowUpRight size={16} />
                </a>
              </div>
              <div className="mt-10 flex max-w-2xl gap-3 border-t border-white/25 pt-5">
                <span className="font-serif text-4xl leading-none text-[#e5be64]">“</span>
                <p className="font-serif text-sm leading-6 text-slate-100 sm:text-base">
                  {content.hero.scripturalVerse}
                  <strong className="mt-1 block font-sans text-[9px] uppercase tracking-widest text-white">
                    {content.hero.scripturalRef}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-12 w-[min(1200px,calc(100%-2.25rem))] items-center justify-between border-t border-white/20 text-[9px] text-slate-200 sm:text-[11px]">
            <span>Holiness Revival Movement Worldwide</span>
            <a className="flex items-center gap-2 font-semibold text-white" href="#discover">
              Explore the movement <ArrowDown size={14} />
            </a>
          </div>
        </section>

        <HomeStatsSection />

      {/* 4. Discover Pillars Section */}
      <section className="py-16 sm:py-24" data-scroll-reveal id="discover">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <SectionHeading
            action={<ArrowLink to="/about">Our story</ArrowLink>}
            description={content.welcome.description}
            eyebrow={content.welcome.eyebrow}
            title={content.welcome.title}
          />
          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              action="Explore sermons"
              description="Explore teachings on holiness, faith, family and Christian life."
              eyebrow="Listen & learn"
              icon={Headphones}
              index="01"
              title="Messages for a life of faith."
              to="/sermons"
              tone="blue"
            />
            <FeatureCard
              action="Read devotional"
              description="Pause with scripture, thoughtful reading and a daily prayer."
              eyebrow="Daily devotional"
              icon={BookOpen}
              index="02"
              title="Make room for reflection."
              to="/devotional"
              tone="beige"
            />
            <FeatureCard
              action="Find a location"
              description="Find HOREMOW’s headquarters and discover the fellowship network."
              eyebrow="Find fellowship"
              icon={Globe2}
              index="03"
              title="Faith grows in community."
              to="/locations"
              tone="dark"
            />
          </div>
        </div>
      </section>

      {/* 5. Today's Daily Devotional Feature Section */}
      <DailyDevotionalSpotlight />

      {/* 6. Leadership Section with Real Portrait of Pastor Paul Rika */}
      <section className="bg-[#112b44] py-16 text-white sm:py-24" data-scroll-reveal>
        <div className="mx-auto grid w-[min(1200px,calc(100%-2.25rem))] items-center gap-10 md:grid-cols-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-2xl border-2 border-[#e5be64]/40 bg-slate-900 shadow-2xl">
            <img
              alt={content.leadership.pastorName}
              className="size-full object-cover object-top"
              loading="lazy"
              src={content.leadership.pastorImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e2133] via-transparent to-black/20" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-[#0e2133]/90 p-3.5 backdrop-blur-md">
              <span className="block text-[9px] font-bold uppercase tracking-[.17em] text-[#e5be64]">
                {content.leadership.pastorRole}
              </span>
              <span className="block text-base font-bold text-white">
                {content.leadership.pastorName}
              </span>
            </div>
          </div>
          <div>
            <Eyebrow>{content.leadership.eyebrow}</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-.07em] sm:text-5xl">
              {content.leadership.pastorName}
            </h2>
            <p className="mt-2 text-xs font-semibold text-[#e5be64]">
              {content.leadership.pastorRole}
            </p>
            <blockquote className="relative my-6 rounded-r-xl border-l-4 border-[#e5be64] bg-white/5 p-5 font-serif text-xl leading-relaxed italic text-slate-100 sm:text-2xl">
              <Quote className="mb-2 text-[#e5be64]/50" size={24} />
              “{content.leadership.pastorQuote}”
            </blockquote>
            <p className="mb-6 max-w-xl text-sm leading-7 text-slate-300">
              {content.leadership.pastorBio}
            </p>
            <ArrowLink to="/about">Meet the leadership</ArrowLink>
          </div>
        </div>
      </section>

      {/* 7. Upcoming Conferences & Gatherings Spotlight */}
      <EventsSpotlightSection />

      {/* 8. Latest Sermons Archive Preview */}
      <section className="bg-[#fafaf7]/95 py-16 backdrop-blur-sm sm:py-24" data-scroll-reveal>
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <SectionHeading
            action={<ArrowLink to="/sermons">Explore sermons</ArrowLink>}
            description="Explore teachings from the HOREMOW message archive."
            eyebrow="The Word works"
            title="Listen. Reflect. Grow."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {sermons.slice(0, 3).map((sermon, index) => (
              <SermonPreviewCard index={index} key={sermon.id} sermon={sermon} />
            ))}
          </div>
        </div>
      </section>

      <BlogSpotlightSection />

      <Gallery3DSection />

      {/* 10. Giving Call to Action */}
      <section className="overflow-hidden bg-brand-blue py-14 text-white" data-scroll-reveal>
        <div className="relative mx-auto flex w-[min(1200px,calc(100%-2.25rem))] flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <Eyebrow>{content.givingBanner.eyebrow}</Eyebrow>
            <h2 className="text-4xl font-bold tracking-[-.06em]">
              {content.givingBanner.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              {content.givingBanner.description}
            </p>
          </div>
          <ArrowLink light to="/give">
            {content.givingBanner.actionText}
          </ArrowLink>
          <HeartHandshake
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 top-0 opacity-10"
            size={130}
          />
        </div>
      </section>
      </div>
    </div>
  );
}
