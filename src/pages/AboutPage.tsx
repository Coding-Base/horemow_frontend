import { Cross, MapPin } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import { useState } from "react";
import Eyebrow from "../components/common/Eyebrow";
import PageIntro from "../components/common/PageIntro";
import SectionHeading from "../components/common/SectionHeading";
import { useAboutContent, useHomepageContent } from "../lib/contentStore";

export default function AboutPage() {
  const about = useAboutContent();
  const homepage = useHomepageContent();
  const [activeTopic, setActiveTopic] = useState(0);

  return (
    <>
      <PageIntro
        description={about.description}
        eyebrow={about.eyebrow}
        title={about.title}
      />
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid w-[min(1200px,calc(100%-2.25rem))] gap-10 md:grid-cols-2 md:gap-20">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-[-.065em] text-ink sm:text-5xl">
              {about.storyHeading}
            </h2>
          </div>
          <div className="text-sm leading-7 text-slate-600">
            <p className="mt-0 text-lg leading-7 text-slate-800">
              {about.storyParagraph1}
            </p>
            <p className="mt-4">
              {about.storyParagraph2}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-brand-blue">
              <MapPin size={17} /> Established in {about.establishedCity}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eeefeb] py-16 sm:py-24">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <SectionHeading
            description={about.doctrineIntro}
            eyebrow="What we teach"
            title="Our doctrinal commitments."
          />
          <div className="grid gap-5 md:grid-cols-[.8fr_1.2fr]">
            <div aria-label="Doctrinal topics" className="grid content-start gap-1" role="tablist">
              {about.doctrineTopics.map((topic, index) => (
                <button
                  aria-controls={`doctrine-panel-${index}`}
                  aria-selected={activeTopic === index}
                  className={`grid min-h-14 grid-cols-[32px_1fr_auto] items-center gap-2 rounded-lg px-3 text-left text-xs font-bold transition ${
                    activeTopic === index
                      ? "border border-slate-300 bg-white text-brand-blue shadow-sm"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                  id={`doctrine-tab-${index}`}
                  key={topic.title}
                  onClick={() => setActiveTopic(index)}
                  role="tab"
                  type="button"
                >
                  <span className="text-[10px] text-slate-500">0{index + 1}</span>
                  {topic.title}
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <div
              aria-labelledby={`doctrine-tab-${activeTopic}`}
              className="min-h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
              id={`doctrine-panel-${activeTopic}`}
              role="tabpanel"
            >
              <span className="grid size-11 place-items-center rounded-full bg-soft-blue text-brand-blue">
                <Cross size={22} />
              </span>
              <h3 className="mt-5 text-2xl font-bold tracking-tight text-ink">
                {about.doctrineTopics[activeTopic]?.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {about.doctrineTopics[activeTopic]?.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <MotionConfig reducedMotion="user">
        <section className="bg-[#f7f5ef] py-16 sm:py-24">
          <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
            <SectionHeading
              description="Meet the ministry leaders serving HOREMOW and its worldwide fellowship."
              eyebrow="Leadership · HOREMOW"
              title="Servants of the movement."
            />
            <div className="mt-10 grid gap-7">
              <LeaderCard
                image={homepage.leadership.pastorImage}
                quote={homepage.leadership.pastorQuote}
                role={homepage.leadership.pastorRole}
                title={homepage.leadership.pastorName}
              >
                {homepage.leadership.pastorBio}
              </LeaderCard>
              <LeaderCard
                image={homepage.leadership.mummyImage}
                role={homepage.leadership.mummyRole}
                title={homepage.leadership.mummyName}
              >
                {homepage.leadership.mummyBio}
              </LeaderCard>
            </div>
          </div>
        </section>
      </MotionConfig>
    </>
  );
}

function LeaderCard({
  role,
  title,
  image,
  quote,
  children,
}: {
  role: string;
  title: string;
  image: string;
  quote?: string;
  children: string;
}) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="grid overflow-hidden border border-slate-200 bg-white shadow-sm md:grid-cols-[minmax(280px,.78fr)_minmax(0,1.22fr)]"
      initial={{ opacity: 0, y: 22 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <figure className="relative flex items-center justify-center overflow-hidden bg-[#102b46] p-5 sm:p-8">
        <div aria-hidden="true" className="absolute inset-4 border border-white/15 sm:inset-6" />
        <div className="relative z-10 flex h-[340px] w-full items-center justify-center sm:h-[440px] lg:h-[520px]">
          <img
            alt={title}
            className="max-h-full max-w-full object-contain"
            decoding="async"
            loading="lazy"
            src={image}
          />
        </div>
        <figcaption className="absolute bottom-7 left-8 right-8 z-20 text-center text-[9px] font-bold uppercase tracking-[.2em] text-white/80">
          Holiness Revival Movement Worldwide
        </figcaption>
      </figure>

      <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
        <span className="text-[10px] font-bold uppercase tracking-[.2em] text-brand-blue">
          {role}
        </span>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-.045em] text-ink sm:text-4xl">
          {title}
        </h2>
        <div aria-hidden="true" className="my-5 h-px w-16 bg-[#c49b4a]" />
        <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          {children}
        </p>
        {quote && (
          <blockquote className="mt-7 border-l-2 border-[#c49b4a] bg-[#f7f5ef] px-5 py-4 font-serif text-base italic leading-7 text-slate-700 sm:text-lg">
            “{quote}”
          </blockquote>
        )}
        <div className="mt-7 flex items-center gap-2 border-t border-slate-200 pt-5 text-xs font-semibold text-slate-600">
          <MapPin aria-hidden="true" className="text-brand-blue" size={15} />
          HOREMOW International Ministry
        </div>
      </div>
    </motion.article>
  );
}
