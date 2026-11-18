import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { galleryItems } from "../../data/gallery";
import Eyebrow from "../common/Eyebrow";

export default function GalleryPreviewSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Moments from the movement</Eyebrow>
            <h2 className="text-3xl font-bold tracking-[-.06em] sm:text-5xl">
              A glimpse of fellowship.
            </h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline" to="/gallery">
            Visit the gallery <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {galleryItems.slice(0, 3).map((item) => (
            <Link className="group relative overflow-hidden" key={item.id} to="/gallery">
              <img
                alt={item.alt}
                className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
                src={item.image}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-12 text-white">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-white/80">{item.category}</span>
                <span className="mt-1 block text-lg font-bold">{item.title}</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-slate-500">
          Illustrations shown as placeholders until HOREMOW-approved photos are supplied.
        </p>
      </div>
    </section>
  );
}
