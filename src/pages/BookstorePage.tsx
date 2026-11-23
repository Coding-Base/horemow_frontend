import { ArrowUpRight, BookMarked, BookOpen, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageIntro from "../components/common/PageIntro";
import SearchField from "../components/common/SearchField";
import { usePublicationsContent } from "../lib/contentStore";
import BookReaderModal from "../components/books/BookReaderModal";
import type { Publication } from "../data/content";

export default function BookstorePage() {
  const publications = usePublicationsContent();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [readingBook, setReadingBook] = useState<Publication | null>(null);

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
          <div className="grid gap-4 rounded-2xl bg-[#e9e3d8] p-5 sm:grid-cols-[52px_1fr] sm:items-center sm:p-7">
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
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-1.5 font-bold text-white hover:bg-brand-blue/90 shadow-xs transition"
                    onClick={() => setReadingBook(book)}
                    type="button"
                  >
                    <BookOpen size={13} /> Read Online
                  </button>

                  <div className="flex items-center gap-3 ml-auto">
                    {book.fileUrl && (
                      <a
                        className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-100 flex items-center gap-1.5 transition text-xs shadow-xs"
                        download={`${book.title}.pdf`}
                        href={book.fileUrl}
                        rel="noreferrer"
                        target="_blank"
                        title="Download official publication PDF"
                      >
                        <Download size={13} /> Download PDF
                      </a>
                    )}
                    {book.telegramUrl && (
                      <a
                        className="font-bold text-sky-600 hover:underline flex items-center gap-1"
                        href={book.telegramUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Telegram <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
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

      <BookReaderModal
        book={readingBook}
        isOpen={Boolean(readingBook)}
        onClose={() => setReadingBook(null)}
      />
    </>
  );
}
