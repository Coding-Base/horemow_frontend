import { BookOpen, Calendar, Globe2, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Globe2,
    number: "50+",
    label: "Nations Reached",
    sub: "Global mission outposts and crusades",
  },
  {
    icon: Calendar,
    number: "40+",
    label: "Years in Ministry",
    sub: "Proclaiming undiluted holiness",
  },
  {
    icon: ShieldCheck,
    number: "84+",
    label: "Fellowship Branches",
    sub: "Centres for holy living and prayer",
  },
  {
    icon: BookOpen,
    number: "Millions",
    label: "Free Books Distributed",
    sub: "Truth literature shared worldwide",
  },
];

export default function HomeStatsSection() {
  return (
    <section
      aria-label="Ministry Impact Statistics"
      className="relative -mt-6 z-20 mx-auto w-[min(1200px,calc(100%-2.25rem))]"
      data-scroll-reveal
    >
      <div className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
        {stats.map(({ icon: Icon, number, label, sub }) => (
          <div
            className="group flex items-start gap-4 rounded-xl p-3 transition duration-300 hover:bg-slate-50"
            key={label}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-soft-blue text-brand-blue shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white">
              <Icon size={22} />
            </span>
            <div>
              <span className="font-serif text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {number}
              </span>
              <h3 className="text-xs font-bold text-slate-800">{label}</h3>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
