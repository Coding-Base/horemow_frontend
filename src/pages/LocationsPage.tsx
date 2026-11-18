import { Filter, Globe2, Mail, MapPin, AudioLines } from "lucide-react";
import { MenuItem, Select } from "@mui/material";
import { useState } from "react";
import EmptyState from "../components/common/EmptyState";
import PageIntro from "../components/common/PageIntro";
import SearchField from "../components/common/SearchField";
import { useLocationsContent } from "../lib/contentStore";

export default function LocationsPage() {
  const locations = useLocationsContent();
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState("All continents");

  const filteredLocations = locations.filter((loc) => {
    const matchesContinent = continent === "All continents" || loc.continent === continent;
    const matchesQuery =
      !query.trim() ||
      `${loc.name} ${loc.address} ${loc.country} ${loc.stateOrArea}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    return matchesContinent && matchesQuery;
  });

  return (
    <>
      <PageIntro
        description="Find HOREMOW’s international headquarters and explore the global fellowship directory across Africa, Europe, Asia, and the Americas."
        eyebrow="Find fellowship"
        title="A place to gather."
      />
      <section className="py-10">
        <div className="mx-auto w-[min(1200px,calc(100%-2.25rem))]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchField
              label="Search locations"
              onChange={setQuery}
              placeholder="Search by city, country or branch name"
              value={query}
            />
            <label className="flex min-h-12 items-center gap-1 border border-slate-300 bg-white pl-3 text-slate-500">
              <Filter size={15} />
              <span className="sr-only">Filter by continent</span>
              <Select
                aria-label="Filter by continent"
                onChange={(event) => setContinent(event.target.value)}
                size="small"
                value={continent}
                variant="standard"
              >
                <MenuItem value="All continents">All continents</MenuItem>
                <MenuItem value="Africa">Africa</MenuItem>
                <MenuItem value="Asia">Asia</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="North America">North America</MenuItem>
              </Select>
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Fellowship Branches ({filteredLocations.length})
            </span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => (
                <article
                  className={`rounded-xl border p-6 shadow-sm transition hover:shadow-md ${
                    loc.isHeadquarters ? "border-brand-blue/40 bg-gradient-to-br from-white to-[#f0f4f9]" : "border-slate-200 bg-white"
                  }`}
                  key={loc.id}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
                      {loc.continent} · {loc.country} {loc.stateOrArea ? `(${loc.stateOrArea})` : ""}
                    </span>
                    <span className="grid size-9 place-items-center rounded-full bg-soft-blue text-brand-blue">
                      <MapPin size={17} />
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold leading-tight tracking-tight text-ink">
                    {loc.name} {loc.isHeadquarters && <span className="text-xs font-semibold text-brand-blue">★ Headquarters</span>}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{loc.address}</p>

                  {/* Overseer Card Details */}
                  {loc.overseerName && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                      {loc.overseerPhotoUrl ? (
                        <img
                          alt={loc.overseerName}
                          className="size-11 rounded-full object-cover border border-slate-200 shrink-0"
                          src={loc.overseerPhotoUrl}
                        />
                      ) : (
                        <div className="grid size-11 place-items-center rounded-full bg-soft-blue text-brand-blue font-bold text-xs shrink-0">
                          {loc.overseerName[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">{loc.overseerName}</div>
                        <div className="text-[11px] font-semibold text-brand-green truncate">
                          {loc.overseerTitle || "State Overseer"}
                        </div>
                        {loc.overseerPhone && (
                          <div className="text-[10px] text-slate-400 truncate">{loc.overseerPhone}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-2 border-t border-slate-200/70 pt-4 text-xs font-semibold text-brand-blue">
                    {loc.email && (
                      <a className="flex items-center gap-2 hover:underline" href={`mailto:${loc.email}`}>
                        <Mail size={14} /> {loc.email}
                      </a>
                    )}
                    {loc.phone && (
                      <a className="flex items-center gap-2 hover:underline" href={`tel:${loc.phone.replaceAll(" ", "")}`}>
                        <AudioLines size={14} /> {loc.phone}
                      </a>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-2">
                <EmptyState
                  description="No fellowship centres found matching your search. Add more branches in the Admin panel."
                  icon={Globe2}
                  title="No matching fellowship locations"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
