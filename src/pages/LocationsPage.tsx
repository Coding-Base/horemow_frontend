import {
  Filter,
  Globe2,
  Mail,
  MapPin,
  AudioLines,
  Compass,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Star,
} from "lucide-react";
import { MenuItem, Select } from "@mui/material";
import { useState, useRef } from "react";
import EmptyState from "../components/common/EmptyState";
import PageIntro from "../components/common/PageIntro";
import SearchField from "../components/common/SearchField";
import FellowshipMap from "../components/common/FellowshipMap";
import { useLocationsContent } from "../lib/contentStore";
import type { FellowshipLocation } from "../lib/locationTypes";
import { findNearestFellowship, formatDistance } from "../lib/geoUtils";

export default function LocationsPage() {
  const locations = useLocationsContent();
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState("All continents");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
    nearest?: FellowshipLocation;
    distance?: number;
  } | null>(null);

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter((loc) => {
    const matchesContinent = continent === "All continents" || loc.continent === continent;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      `${loc.name} ${loc.address} ${loc.country} ${loc.stateOrArea} ${loc.overseerName || ""}`
        .toLowerCase()
        .includes(q);
    return matchesContinent && matchesQuery;
  });

  // Handle Browser GPS Geolocation
  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "error",
        message: "Geolocation is not supported by your browser. Please search manually by city or state.",
      });
      return;
    }

    setIsLocating(true);
    setLocationStatus({
      type: "info",
      message: "Detecting your device location to find the closest HOREMOW fellowship chapter...",
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);

        const result = findNearestFellowship(coords.latitude, coords.longitude, locations);
        if (result) {
          setSelectedLocationId(result.location.id);
          setLocationStatus({
            type: "success",
            message: `Found closest chapter: ${result.location.name} (${formatDistance(result.distanceKm)})`,
            nearest: result.location,
            distance: result.distanceKm,
          });

          // Scroll map into view so user sees their nearest pin and popup description
          mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          setLocationStatus({
            type: "error",
            message: "No fellowship location with coordinates found in the directory.",
          });
        }
      },
      (err) => {
        setIsLocating(false);
        let errorMsg = "Unable to retrieve your location.";
        if (err.code === 1) {
          errorMsg = "Location permission was denied. You can search your city or state in the search box below.";
        } else if (err.code === 2) {
          errorMsg = "Location information is currently unavailable. Please search manually.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again or type your city/state.";
        }
        setLocationStatus({
          type: "error",
          message: errorMsg,
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleSelectFromMap = (loc: FellowshipLocation) => {
    setSelectedLocationId(loc.id);
  };

  const handleViewOnMap = (loc: FellowshipLocation) => {
    setSelectedLocationId(loc.id);
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <PageIntro
        description="Find HOREMOW’s international headquarters and explore the global fellowship directory across Africa, Europe, Asia, and the Americas."
        eyebrow="Find fellowship"
        title="A place to gather."
      />

      <section className="py-8 bg-page">
        <div className="mx-auto w-[min(1240px,calc(100%-2.25rem))] space-y-6">
          {/* Nearest Location Finder & GPS Control Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    <Compass size={18} />
                  </span>
                  <h2 className="text-base font-bold text-ink">Find Nearest Fellowship Chapter</h2>
                </div>
                <p className="text-xs text-muted max-w-xl">
                  Use your device location to instantly locate the HOREMOW chapter closest to you, along with
                  coordinator contact information to call for proper directions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#143a6d] active:scale-[0.98] disabled:opacity-60"
                  disabled={isLocating}
                  onClick={handleFindNearest}
                  type="button"
                >
                  <Navigation className={isLocating ? "animate-spin" : ""} size={15} />
                  {isLocating ? "Detecting Location..." : "Locate Closest to Me"}
                </button>
              </div>
            </div>

            {/* Nearest Result Status Banner */}
            {locationStatus && (
              <div
                className={`mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 text-xs border transition ${
                  locationStatus.type === "success"
                    ? "border-green-200 bg-green-50/80 text-green-900"
                    : locationStatus.type === "error"
                    ? "border-red-200 bg-red-50/80 text-red-900"
                    : "border-blue-200 bg-blue-50/80 text-blue-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {locationStatus.type === "success" && <CheckCircle2 className="text-green-600 shrink-0" size={17} />}
                  {locationStatus.type === "error" && <AlertCircle className="text-red-500 shrink-0" size={17} />}
                  {locationStatus.type === "info" && <Navigation className="animate-spin text-brand-blue shrink-0" size={17} />}
                  <div>
                    <span className="font-bold">{locationStatus.message}</span>
                    {locationStatus.nearest && (
                      <span className="block text-[11px] text-slate-600 mt-0.5">
                        Coordinator:{" "}
                        <strong className="text-ink">
                          {locationStatus.nearest.overseerName || "State Coordinator"}
                        </strong>{" "}
                        · Contact:{" "}
                        <a
                          className="font-bold text-brand-blue underline"
                          href={`tel:${(locationStatus.nearest.overseerPhone || locationStatus.nearest.phone).replace(/[^0-9+]/g, "")}`}
                        >
                          {locationStatus.nearest.overseerPhone || locationStatus.nearest.phone}
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                {locationStatus.nearest && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="rounded-lg bg-brand-blue text-white px-3 py-1 font-bold text-[11px] hover:bg-[#143a6d]"
                      onClick={() => handleViewOnMap(locationStatus.nearest!)}
                      type="button"
                    >
                      View on Map
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive World Map Component */}
          <div ref={mapSectionRef}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-brand-blue text-white">
                  <MapPin size={13} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Interactive Chapter Map ({filteredLocations.length} Locations)
                </span>
              </div>
              <span className="text-xs text-muted">Click any pin to inspect contact details</span>
            </div>

            <FellowshipMap
              height="480px"
              interactive={true}
              locations={filteredLocations}
              onSelectLocation={handleSelectFromMap}
              selectedLocationId={selectedLocationId}
              userCoords={userCoords}
            />
          </div>

          {/* Search Field & Continent Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <SearchField
              label="Search locations"
              onChange={setQuery}
              placeholder="Search by city, state, country, or overseer name..."
              value={query}
            />
            <label className="flex min-h-12 items-center gap-1 border border-slate-300 bg-white pl-3 text-slate-500 rounded-lg">
              <Filter size={15} />
              <span className="sr-only">Filter by continent</span>
              <Select
                aria-label="Filter by continent"
                onChange={(event) => setContinent(event.target.value)}
                size="small"
                value={continent}
                variant="standard"
              >
                <MenuItem value="All continents">All continents ({locations.length})</MenuItem>
                <MenuItem value="Africa">Africa</MenuItem>
                <MenuItem value="Asia">Asia</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="North America">North America</MenuItem>
              </Select>
            </label>
          </div>

          {/* Active Fellowship Branches List */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Fellowship Branches ({filteredLocations.length})
            </span>
            {selectedLocationId && (
              <button
                className="text-xs font-bold text-brand-blue hover:underline"
                onClick={() => setSelectedLocationId(null)}
                type="button"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid gap-5 md:grid-cols-2" ref={cardsContainerRef}>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = loc.id === selectedLocationId;
                const initials = (loc.overseerName || loc.name)
                  .split(" ")
                  .filter((w) => w.length > 0 && !["Pastor", "Brother", "Sister", "Evangelist", "Rev", "Dr"].includes(w))
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "H";

                const cleanPhone = (loc.overseerPhone || loc.phone || "").replace(/[^0-9+]/g, "");

                return (
                  <article
                    className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 relative ${
                      isSelected
                        ? "border-brand-blue ring-2 ring-brand-blue/30 bg-blue-50/20 shadow-md"
                        : loc.isHeadquarters
                        ? "border-amber-300/80 bg-gradient-to-br from-white to-amber-50/30"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                    id={`card-${loc.id}`}
                    key={loc.id}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-brand-green/10 px-2.5 py-0.5 text-[10px] font-bold text-brand-green">
                        {loc.continent} · {loc.country} {loc.stateOrArea ? `(${loc.stateOrArea})` : ""}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="grid size-8 place-items-center rounded-full bg-soft-blue text-brand-blue hover:bg-brand-blue hover:text-white transition"
                          onClick={() => handleViewOnMap(loc)}
                          title="Center this location on the map"
                          type="button"
                        >
                          <MapPin size={15} />
                        </button>
                      </div>
                    </div>

                    <h2 className="mt-4 text-xl font-bold leading-tight tracking-tight text-ink">
                      {loc.name}{" "}
                      {loc.isHeadquarters && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full ml-1.5">
                          <Star size={11} className="fill-amber-600 text-amber-600 shrink-0" />
                          International Headquarters
                        </span>
                      )}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{loc.address}</p>

                    {/* Overseer Card Details */}
                    {loc.overseerName && (
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                        {loc.overseerPhotoUrl ? (
                          <img
                            alt={loc.overseerName}
                            className="size-11 rounded-full object-cover border border-slate-200 shrink-0"
                            src={loc.overseerPhotoUrl}
                          />
                        ) : (
                          <div className="grid size-11 place-items-center rounded-full bg-brand-blue text-white font-bold text-xs shrink-0 shadow-inner">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-ink truncate">{loc.overseerName}</div>
                          <div className="text-[11px] font-semibold text-brand-green truncate">
                            {loc.overseerTitle || "State Coordinator"}
                          </div>
                          {loc.overseerPhone && (
                            <div className="text-[10px] text-slate-400 truncate">{loc.overseerPhone}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Bar with Tap-to-Call & Directions */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-xs font-semibold text-brand-blue">
                      <div className="flex flex-wrap items-center gap-4">
                        {loc.email && (
                          <a className="flex items-center gap-1.5 hover:underline" href={`mailto:${loc.email}`}>
                            <Mail size={14} /> {loc.email}
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            className="flex items-center gap-1.5 text-brand-blue hover:underline bg-soft-blue px-2.5 py-1 rounded-md"
                            href={`tel:${cleanPhone}`}
                            title="Call coordinator for directions"
                          >
                            <AudioLines size={14} /> {loc.overseerPhone || loc.phone}
                          </a>
                        )}
                      </div>

                      {typeof loc.latitude === "number" && typeof loc.longitude === "number" && (
                        <a
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-brand-blue"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Directions <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })
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
