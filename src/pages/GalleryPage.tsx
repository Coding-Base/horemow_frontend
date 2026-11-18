import { Image } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import GalleryCard from "../components/gallery/GalleryCard";
import PageIntro from "../components/common/PageIntro";
import { useGalleryContent } from "../lib/contentStore";
import type { GalleryItem } from "../data/gallery";

const categories = ["All", "Conferences", "Crusades", "Worship", "Ministers"];

export default function GalleryPage() {
  const images = useGalleryContent();
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = images.map((img) => ({
    id: img.id,
    title: img.title,
    category: img.category,
    description: img.description,
    image: img.url,
    alt: `HOREMOW - ${img.title} (${img.category})`,
  }));

  const visibleItems = galleryItems.filter(
    (item) => category === "All" || item.category === category,
  );

  return (
    <>
      <PageIntro
        description="A visual window into sacred worship, conferences, miracle crusades, and global fellowship across the HOREMOW movement."
        eyebrow="Moments from the movement"
        title="The HOREMOW gallery."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div aria-label="Filter gallery by category" className="mb-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                aria-pressed={category === item}
                className={`min-h-9 rounded-md border px-4 text-xs font-bold transition ${
                  category === item
                    ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-700 hover:border-brand-blue"
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <GalleryCard item={item} key={item.id} onSelect={setSelected} />
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
            <Image size={15} /> {visibleItems.length} photograph{visibleItems.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setSelected(null)}
        open={Boolean(selected)}
      >
        {selected && (
          <div className="bg-white">
            <DialogTitle className="flex items-center justify-between font-bold">
              <span>{selected.title}</span>
              <span className="rounded bg-brand-blue/10 px-2.5 py-0.5 text-xs font-bold text-brand-blue">
                {selected.category}
              </span>
            </DialogTitle>
            <DialogContent>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-black">
                <img
                  alt={selected.alt}
                  className="size-full object-contain"
                  src={selected.image}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{selected.description}</p>
            </DialogContent>
          </div>
        )}
      </Dialog>
    </>
  );
}
