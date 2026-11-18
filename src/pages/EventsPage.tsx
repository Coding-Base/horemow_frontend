import { CalendarDays, Clock3 } from "lucide-react";
import { useState } from "react";
import ArrowLink from "../components/common/ArrowLink";
import PageIntro from "../components/common/PageIntro";
import SectionHeading from "../components/common/SectionHeading";
import { useEventsContent } from "../lib/contentStore";

type EventFilter = "Upcoming" | "Past";

export default function EventsPage() {
  const events = useEventsContent();
  const [filter, setFilter] = useState<EventFilter>("Upcoming");
  const filteredEvents = events.filter((ev) => ev.category === filter);

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
                  {item} events ({events.filter((e) => e.category === item).length})
                </button>
              ))}
            </div>
            <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <CalendarDays size={15} /> Ministry calendar active
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((ev) => (
                <article
                  className="grid items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[56px_1fr_auto] sm:gap-6 sm:p-8"
                  key={ev.id}
                >
                  <span className="grid size-14 place-items-center rounded-xl bg-soft-blue text-brand-blue">
                    <CalendarDays size={26} />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                      {ev.date} · {ev.time}
                    </span>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                      {ev.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">{ev.location}</p>
                    <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-600">
                      {ev.description}
                    </p>
                  </div>
                  <ArrowLink to="/contact">Contact about event</ArrowLink>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
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

      <section className="bg-[#eeefeb] py-16">
        <div className="mx-auto w-[min(1100px,calc(100%-2.25rem))]">
          <SectionHeading
            description="The Abuja headquarters campground hosts these regular gatherings every week. All are warmly invited."
            eyebrow="Regular gatherings · WAT"
            title="A rhythm of fellowship."
          />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Sunday", "Worship service", "8:00 AM – 11:30 AM"],
              ["Tuesday", "Bible study", "5:30 PM – 7:30 PM"],
              ["Friday", "Holiness prayers", "5:30 PM – 7:30 PM"],
            ].map(([day, event, time]) => (
              <article className="rounded-xl border border-slate-200 bg-white p-5" key={day}>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue">
                  {day}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">{event}</h3>
                <p className="mt-5 flex items-center gap-2 text-[11px] text-slate-600">
                  <Clock3 size={14} /> {time} WAT
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
