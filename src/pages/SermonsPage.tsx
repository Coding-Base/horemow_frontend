import { useMemo, useState } from "react";
import PageIntro from "../components/common/PageIntro";
import SearchField from "../components/common/SearchField";
import EmptyState from "../components/common/EmptyState";
import SermonCard from "../components/sermons/SermonCard";
import { sermonCategories, type SermonCategory } from "../data/content";
import { useSermonsContent } from "../lib/contentStore";
import { Search } from "lucide-react";

export default function SermonsPage() {
  const sermons = useSermonsContent();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SermonCategory | "All">("All");

  const filteredSermons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sermons.filter((sermon) => {
      const matchesCategory = category === "All" || sermon.category === category;
      const matchesQuery =
        !normalizedQuery ||
        `${sermon.title} ${sermon.speaker} ${sermon.category} ${sermon.summary}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query, sermons]);

  return (
    <>
      <PageIntro
        description="Listen to and explore messages on holiness, faith, family and Christian life."
        eyebrow="Messages & teaching"
        title="The message archive."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <SearchField
              label="Search sermons"
              onChange={setQuery}
              placeholder="Search title, speaker or topic"
              value={query}
            />
            <span className="text-xs font-semibold text-slate-500">
              {filteredSermons.length} {filteredSermons.length === 1 ? "message" : "messages"}
            </span>
          </div>
          <div aria-label="Filter sermons by topic" className="my-5 flex flex-wrap gap-2">
            {(["All", ...sermonCategories] as const).map((item) => (
              <button
                aria-pressed={category === item}
                className={`min-h-9 border px-3 text-[11px] font-semibold ${
                  category === item
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-slate-300 text-slate-600 hover:border-brand-blue hover:text-brand-blue"
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item === "All" ? "All topics" : item}
              </button>
            ))}
          </div>
          {filteredSermons.length ? (
            <div className="border-t border-slate-200">
              {filteredSermons.map((sermon, index) => (
                <SermonCard index={index} key={sermon.id} sermon={sermon} />
              ))}
            </div>
          ) : (
            <EmptyState
              action={
                <button
                  className="text-xs font-bold text-brand-blue"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                  type="button"
                >
                  Clear filters
                </button>
              }
              description="Try a different title, speaker or topic."
              icon={Search}
              title="No messages match that search."
            />
          )}
          <p className="mt-6 text-[11px] leading-5 text-slate-500">
            Archive synchronized with HOREMOW message database. New sermons added in Admin appear here immediately.
          </p>
        </div>
      </section>
    </>
  );
}
