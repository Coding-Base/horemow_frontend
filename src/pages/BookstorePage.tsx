import { ArrowUpRight, BookMarked, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageIntro from "../components/common/PageIntro";
import SearchField from "../components/common/SearchField";
import { usePublicationsContent, useContactContent } from "../lib/contentStore";

export default function BookstorePage() {
  const publications = usePublicationsContent();
  const contact = useContactContent();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(publications.map((book) => book.category))];

  const filtered = useMemo(
    () =>
      publications.filter((book) => {
        const matchesText = `${book.title} ${book.category} ${book.description}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesText && (category === "All" || category === book.category);
      }),
    [category, query, publications],
  );

  return (
    <>
      <PageIntro
        description="Explore HOREMOW publications, books on biblical holiness, marriage, and end-time readiness."
        eyebrow="Literature & teaching"
        title="The HOREMOW bookstore."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div className="grid gap-4 rounded-2xl bg-[#e9e3d8] p-5 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:p-7">
            <span className="grid size-12 place-items-center rounded-xl border border-brand-blue/25 bg-white text-brand-blue">
              <BookMarked size={25} />
            </span>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-blue">
                Read · reflect · grow
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
                Resources for the Christian walk.
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Books by Pastor Paul Rika and HOREMOW publications. Ask about bulk copies and languages.
              </p>
            </div>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-400 bg-white px-4 text-xs font-bold hover:border-brand-blue hover:text-brand-blue"
              href={`mailto:${contact.email}?subject=HOREMOW%20publication%20enquiry`}
            >
              Enquire <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="my-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              label="Search publications"
              onChange={setQuery}
              placeholder="Search publication titles or keywords"
              value={query}
            />
            <span className="text-xs font-semibold text-slate-500">
              {filtered.length} publications available
            </span>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                aria-pressed={category === item}
                className={`min-h-9 rounded-md border px-3 text-[10px] font-semibold transition ${
                  category === item
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:border-brand-blue"
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((book) => (
              <article
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg flex flex-col justify-between"
                key={book.id || book.title}
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <img
                      alt={book.title}
                      className="size-full object-cover opacity-90 transition duration-300 hover:scale-105"
                      src={
                        book.coverUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951665/FB_IMG_1794950325051_s2ryt4.jpg"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brand-blue shadow-sm">
                      {book.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] font-bold text-brand-green">
                      by {book.author || "Pastor Paul Rika"}
                    </div>

                    <h2 className="font-serif text-base sm:text-lg font-bold leading-snug text-ink line-clamp-2">
                      {book.title}
                    </h2>

                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {book.description}
                    </p>

                    <div className="pt-2 text-[10px] text-slate-400 flex flex-wrap gap-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {book.language}
                      </span>
                      {book.format && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                          {book.format}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {book.fileUrl && (
                    <a
                      className="font-bold text-brand-blue hover:underline flex items-center gap-1"
                      href={book.fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <BookOpen size={13} /> Free PDF Download
                    </a>
                  )}
                  {book.telegramUrl && (
                    <a
                      className="font-bold text-sky-600 hover:underline flex items-center gap-1 ml-auto"
                      href={book.telegramUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Telegram Book Link <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="grid justify-items-center rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Search size={25} />
              <h2 className="mt-4 font-bold text-ink">No publications found</h2>
              <p className="mt-2 text-sm text-slate-600">Try another title or category.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
