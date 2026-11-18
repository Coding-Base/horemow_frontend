import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CONFERENCE_GALLERY_IMAGES } from "../../data/mediaAssets";
import { useBlogContent, useGalleryContent } from "../../lib/contentStore";
import Eyebrow from "../common/Eyebrow";

export default function BlogSpotlightSection() {
  const posts = useBlogContent().slice(0, 3);
  const galleryImages = useGalleryContent();

  if (posts.length === 0) return null;

  return (
    <section className="bg-white/95 py-16 backdrop-blur-sm sm:py-24" data-scroll-reveal>
      <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Eyebrow>Stories & reflections</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              From the HOREMOW journal.
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-600 sm:text-sm">
              Reflections and resources for spiritual growth, service and family life.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline"
            to="/blog"
          >
            Explore all stories <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {posts.map((post, index) => {
            const image =
              galleryImages.length > 0
                ? galleryImages[(index + 5) % galleryImages.length]
                : CONFERENCE_GALLERY_IMAGES[index % CONFERENCE_GALLERY_IMAGES.length];

            return (
              <article
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                key={post.title}
              >
                <Link aria-label={`Read ${post.title}`} className="block" to="/blog">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                    <img
                      alt={image.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      src={image.url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e2133]/65 to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#234a6c]">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-brand-blue">
                      {post.title}
                    </h3>
                    <p className="mt-2 min-h-14 text-xs leading-5 text-slate-600">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 block border-t border-slate-100 pt-3 text-[10px] text-slate-400">
                      {post.date}
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
