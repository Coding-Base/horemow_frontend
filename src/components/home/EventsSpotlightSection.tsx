import { ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { CONFERENCE_GALLERY_IMAGES } from "../../data/mediaAssets";
import { useEventsContent, useGalleryContent } from "../../lib/contentStore";
import Eyebrow from "../common/Eyebrow";

export default function EventsSpotlightSection() {
  const events = useEventsContent();
  const galleryImages = useGalleryContent();
  const upcomingEvents = events.filter((e) => e.category === "Upcoming").slice(0, 2);

  if (upcomingEvents.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-24" data-scroll-reveal>
      <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Conferences & convocations</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Upcoming Gatherings.
            </h2>
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">
              Prepare your heart to attend upcoming national camps and ministers' conferences.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
            to="/events"
          >
            All Events & Schedule <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {upcomingEvents.map((ev, index) => {
            const image =
              galleryImages[index] ??
              CONFERENCE_GALLERY_IMAGES[index % CONFERENCE_GALLERY_IMAGES.length];

            return (
              <article
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#fafaf7] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                key={ev.id}
              >
                <div className="relative aspect-[16/8] overflow-hidden bg-slate-200">
                  <img
                    alt={`HOREMOW gathering: ${image.title}`}
                    className="size-full object-cover"
                    loading="lazy"
                    src={image.url}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e2133]/70 via-transparent to-black/10" />
                  <span className="absolute bottom-4 left-5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue">
                    Upcoming gathering
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-brand-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-green">
                        Confirmed Gathering
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-brand-blue">
                        <CalendarDays size={15} /> {ev.date}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {ev.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-slate-600">
                      {ev.description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-200/60 pt-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock3 className="text-brand-blue" size={15} /> {ev.time}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 shrink-0 text-brand-blue" size={15} /> {ev.location}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/60 pt-4">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Admission is free · Registration open
                    </span>
                    <Link
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                      to="/events"
                    >
                      Event guidance →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
