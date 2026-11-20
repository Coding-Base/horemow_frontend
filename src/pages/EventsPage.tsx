import { BookOpen, CalendarDays, Clock3, MapPin } from "lucide-react";
import { useState } from "react";
import ArrowLink from "../components/common/ArrowLink";
import PageIntro from "../components/common/PageIntro";
import { useEventsContent } from "../lib/contentStore";

type EventFilter = "Upcoming" | "Past";

function getRegistrationUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function EventsPage() {
  const events = useEventsContent();
  const [filter, setFilter] = useState<EventFilter>("Upcoming");
  const filteredEvents = events.filter((event) => event.category === filter);

  return (
    <>
      <PageIntro
        description="Gatherings and conferences from the HOREMOW ministry calendar."
        eyebrow="Gather together"
        title="Events & conferences."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2">
              {(["Upcoming", "Past"] as const).map((item) => (
                <button
                  aria-pressed={filter === item}
                  className={`min-h-9 border px-3 text-[11px] font-bold ${
                    filter === item
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-slate-300 text-slate-600"
                  }`}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item} events ({events.filter((event) => event.category === item).length})
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <CalendarDays size={15} /> Ministry calendar active
            </span>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const registrationUrl = getRegistrationUrl(event.registrationUrl);
                return (
                  <article
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    key={event.id}
                  >
                    {event.flyerUrl ? (
                      <img
                        alt={`${event.title} event flyer`}
                        className="aspect-[16/8] w-full bg-slate-100 object-cover"
                        loading="lazy"
                        src={event.flyerUrl}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="grid aspect-[16/8] place-items-center bg-gradient-to-br from-[#0b2037] to-[#1a4b8c] text-white/80"
                      >
                        <CalendarDays size={42} />
                      </div>
                    )}
                    <div className="p-5 sm:p-7">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest text-brand-green">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} /> {event.date}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1.5">
                            <Clock3 size={14} /> {event.time}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                        {event.title}
                      </h2>
                      <p className="mt-2 whitespace-pre-line text-xs leading-6 text-slate-600">
                        {event.description}
                      </p>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
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

                      <div className="mt-5">
                        {registrationUrl ? (
                          <a
                            className="inline-flex min-h-11 items-center rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white transition hover:bg-[#143a6d]"
                            href={registrationUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Register for this event
                          </a>
                        ) : (
                          <ArrowLink to="/contact">Contact about event</ArrowLink>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center lg:col-span-2">
                <Clock3 className="mx-auto mb-3 text-slate-400" size={32} />
                <h3 className="text-base font-bold text-ink">No {filter.toLowerCase()} gatherings listed</h3>
                <p className="mt-1 text-xs text-slate-500">
                  New announcements and conferences added in the Admin panel will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
