import { ArrowUpRight } from "lucide-react";
import type { GalleryItem } from "../../data/gallery";

export default function GalleryCard({
  item,
  onSelect,
}: {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
}) {
  return (
    <button
      className="group overflow-hidden border border-slate-200 bg-white text-left"
      onClick={() => onSelect(item)}
      type="button"
    >
      <span className="relative block overflow-hidden">
        <img
          alt={item.alt}
          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          src={item.image}
        />
        <span className="absolute right-3 top-3 grid size-9 place-items-center bg-white text-brand-blue">
          <ArrowUpRight size={17} />
        </span>
      </span>
      <span className="block p-4">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blue">
          {item.category}
        </span>
        <span className="mt-1 block text-lg font-bold tracking-tight text-ink">
          {item.title}
        </span>
      </span>
    </button>
  );
}
