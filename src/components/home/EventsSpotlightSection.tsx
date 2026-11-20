import { ArrowUpRight, CalendarDays, Clock3, MapPin, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useEventsContent } from "../../lib/contentStore";
import Eyebrow from "../common/Eyebrow";

function getRegistrationUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function EventsSpotlightSection() {
  const events = useEventsContent();
  const upcomingEvents = events.filter((event) => event.category === "Upcoming").slice(0, 2);

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
              Dates, flyers and details shared by the HOREMOW events team.
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
          {upcomingEvents.map((event) => {
            const registrationUrl = getRegistrationUrl(event.registrationUrl);
            return (
            <article
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-[#fafaf7] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              key={event.id}
            >
              {event.flyerUrl ? (
                <div className="relative aspect-[16/8] overflow-hidden bg-slate-200">
                  <img
                    alt={`${event.title} event flyer`}
                    className="size-full object-cover"
                    loading="lazy"
                    src={event.flyerUrl}
                  />
                </div>
              ) : (
                <div
                  aria-hidden="true"
                  className="grid aspect-[16/8] place-items-center bg-gradient-to-br from-[#0b2037] to-[#1a4b8c] text-white/80"
                >
                  <CalendarDays size={40} />
                </div>
              )}
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-brand-blue">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={15} /> {event.date}
                  </span>
                  {event.time && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={15} /> {event.time}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                  {event.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600">
                  {event.description}
                </p>

                <div className="mt-5 space-y-3 border-t border-slate-200/60 pt-4 text-xs text-slate-600">
                  {event.location && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 shrink-0 text-brand-blue" size={15} />
                      <span>{event.location}</span>
                    </p>
                  )}
                  {event.themeVerse && (
                    <p className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 shrink-0 text-brand-green" size={15} />
                      <span>{event.themeVerse}</span>
                    </p>
                  )}
                </div>

                {registrationUrl && (
                  <a
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-[#143a6d]"
                    href={registrationUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Register for this event <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
