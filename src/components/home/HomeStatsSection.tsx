import { BookOpen, Calendar, Globe2, ShieldCheck } from "lucide-react";
import { useHomepageContent } from "../../lib/contentStore";
import type { HomepageStatCard } from "../../lib/contentStore";

const icons = {
  globe: Globe2,
  calendar: Calendar,
  shield: ShieldCheck,
  book: BookOpen,
} satisfies Record<HomepageStatCard["icon"], typeof Globe2>;

export default function HomeStatsSection() {
  const { stats } = useHomepageContent();

  return (
    <section
      aria-label="Ministry Impact Statistics"
      className="relative -mt-6 z-20 mx-auto w-[min(1200px,calc(100%-2.25rem))]"
      data-scroll-reveal
    >
      <div className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
        {stats.map((stat) => {
          const Icon = icons[stat.icon];

          return (
            <div
              className="group flex items-start gap-4 rounded-xl p-3 transition duration-300 hover:bg-slate-50"
              key={stat.id}
            >
              <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-soft-blue text-brand-blue shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white">
                {stat.image ? (
                  <img alt="" className="size-full object-cover" src={stat.image} />
                ) : (
                  <Icon size={22} />
                )}
              </span>
              <div className="min-w-0">
                <span className="font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  {stat.number}
                </span>
                <h3 className="text-xs font-bold text-slate-800">{stat.label}</h3>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
