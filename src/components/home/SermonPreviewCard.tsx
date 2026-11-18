import { Clock3, Play } from "lucide-react";
import type { Sermon } from "../../data/content";
import { Link } from "react-router-dom";

const tones = [
  "from-[#8b2926] via-[#cf6c40] to-[#e2a35f]",
  "from-[#243e5e] via-[#69859a] to-[#bed0d0]",
  "from-[#394a33] via-[#8d774d] to-[#c39e63]",
];

export default function SermonPreviewCard({
  sermon,
  index,
}: {
  sermon: Sermon;
  index: number;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <Link
        aria-label={`View ${sermon.title}`}
        className={`relative flex min-h-48 flex-col items-start justify-between overflow-hidden bg-gradient-to-br p-5 text-white ${tones[index % tones.length]}`}
        to="/sermons"
      >
        <span className="z-10 rounded-full border border-white/40 bg-black/20 px-3 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm">
          {sermon.category}
        </span>
        <span className="z-10 ml-auto grid size-12 place-items-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play fill="currentColor" size={18} />
        </span>
      </Link>
      <div className="p-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5be64]">
          {sermon.speaker}
        </span>
        <h3 className="my-2 line-clamp-2 min-h-12 text-lg font-bold leading-snug tracking-tight text-ink">
          {sermon.title}
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 size={14} /> {sermon.duration}
        </span>
      </div>
    </article>
  );
}
