import { Clock3, Play, User } from "lucide-react";
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
  const fallbackThumb = "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950314285_qsrsmp.jpg";
  const displayThumb = sermon.thumbnailUrl || fallbackThumb;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between">
      <Link
        aria-label={`View ${sermon.title}`}
        className="relative flex min-h-52 flex-col items-start justify-between overflow-hidden bg-slate-900 p-5 text-white"
        to="/sermons"
      >
        {/* Sermon Thumbnail Image */}
        <img
          alt={sermon.title}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90"
          loading="lazy"
          src={displayThumb}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 ${!sermon.thumbnailUrl ? tones[index % tones.length] : ""}`} />

        <span className="z-10 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm text-white">
          {sermon.category}
        </span>
        <span className="z-10 ml-auto grid size-12 place-items-center rounded-full bg-white text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play fill="currentColor" size={18} />
        </span>
      </Link>

      <div className="p-6">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-green">
          <User size={12} /> {sermon.speaker}
        </span>
        <h3 className="my-2 line-clamp-2 min-h-12 text-lg font-bold leading-snug tracking-tight text-ink font-serif">
          {sermon.title}
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock3 size={14} /> {sermon.duration}
        </span>
      </div>
    </article>
  );
}
