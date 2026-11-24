import { useEffect, useRef } from "react";
import { Globe2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FellowshipLocation } from "../../lib/locationTypes";

interface FellowshipMapProps {
  locations: FellowshipLocation[];
  selectedLocationId?: string | null;
  userCoords?: { latitude: number; longitude: number } | null;
  onSelectLocation?: (location: FellowshipLocation) => void;
  height?: string;
  className?: string;
  interactive?: boolean;
}

/**
 * Returns a region color matching HOREMOW brand identity
 */
function getPinColor(loc: FellowshipLocation): { bg: string; border: string; text: string } {
  if (loc.isHeadquarters) {
    return { bg: "#D97706", border: "#F59E0B", text: "#FFFFFF" }; // Gold / Amber for HQ
  }
  switch (loc.continent) {
    case "Africa":
      return loc.country === "Nigeria"
        ? { bg: "#1A4B8C", border: "#143A6D", text: "#FFFFFF" } // Brand Blue for Nigeria
        : { bg: "#1E7B34", border: "#165E27", text: "#FFFFFF" }; // Brand Green for rest of Africa
    case "Europe":
      return { bg: "#0284C7", border: "#0369A1", text: "#FFFFFF" }; // Sky Blue for Europe
    case "North America":
      return { bg: "#7C3AED", border: "#6D28D9", text: "#FFFFFF" }; // Purple for North America
    case "Asia":
      return { bg: "#EA580C", border: "#C2410C", text: "#FFFFFF" }; // Orange for Asia
    default:
      return { bg: "#1A4B8C", border: "#143A6D", text: "#FFFFFF" };
  }
}

/**
 * Generates an SVG pin marker using Leaflet divIcon
 */
function createSvgMarkerIcon(loc: FellowshipLocation, isSelected = false): L.DivIcon {
  const { bg, border } = getPinColor(loc);
  const size = isSelected ? 42 : loc.isHeadquarters ? 38 : 30;
  const star = loc.isHeadquarters
    ? `<path fill="#FFFFFF" d="M12 2l2.4 5.2 5.6.8-4 4 1 5.6L12 15l-5 2.6 1-5.6-4-4 5.6-.8z" transform="scale(0.85) translate(2, 2)"/>`
    : `<circle cx="12" cy="10" r="4.5" fill="#FFFFFF"/>`;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25)); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.5C12 21.5 20 14.5 20 9.5C20 5.08172 16.4183 1.5 12 1.5C7.58172 1.5 4 5.08172 4 9.5C4 14.5 12 21.5 12 21.5Z" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
        ${star}
      </svg>
      ${isSelected ? `<span style="position: absolute; top: -6px; right: -6px; width: 12px; height: 12px; background: #22c55e; border-radius: 9999px; border: 2px solid #ffffff; box-shadow: 0 0 8px #22c55e;"></span>` : ""}
    </div>
  `;

  return L.divIcon({
    html,
    className: "horemow-custom-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

/**
 * Creates User Location Pulse marker
 */
function createUserPulseIcon(): L.DivIcon {
  const html = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: rgba(59, 130, 246, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 14px; height: 14px; border-radius: 9999px; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "horemow-user-pin",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function FellowshipMap({
  locations,
  selectedLocationId,
  userCoords,
  onSelectLocation,
  height = "460px",
  className = "",
  interactive = true,
}: FellowshipMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center at Abuja, Nigeria (HQ)
    const map = L.map(mapContainerRef.current, {
      center: [9.0579, 7.4951],
      zoom: 5,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive ? "center" : false,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: false,
    });

    // Clean OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    // Subtle attribution in bottom right
    L.control
      .attribution({
        prefix: '<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a> · &copy; <a href="https://openstreetmap.org" target="_blank" rel="noopener">OpenStreetMap</a>',
        position: "bottomright",
      })
      .addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [interactive]);

  // Update Markers when locations or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markersMapRef.current.clear();

    const bounds: L.LatLngTuple[] = [];

    locations.forEach((loc) => {
      if (typeof loc.latitude !== "number" || typeof loc.longitude !== "number") return;

      const isSelected = loc.id === selectedLocationId;
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: createSvgMarkerIcon(loc, isSelected),
        zIndexOffset: isSelected ? 1000 : loc.isHeadquarters ? 500 : 0,
      });

      // Custom styled HTML popup conforming to HOREMOW Design System
      const cleanPhone = (loc.overseerPhone || loc.phone || "").replace(/[^0-9+]/g, "");
      const initials = (loc.overseerName || loc.name)
        .split(" ")
        .filter((w) => w.length > 0 && !["Pastor", "Brother", "Sister", "Evangelist", "Rev", "Dr"].includes(w))
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "H";

      const popupHtml = `
        <div style="font-family: Inter, 'Segoe UI', Arial, sans-serif; min-width: 240px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #eaf0f6; color: #1a4b8c;">
              ${loc.continent} · ${loc.country}
            </span>
            ${
              loc.isHeadquarters
                ? `<span style="display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 2px 6px; border-radius: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> HQ</span>`
                : ""
            }
          </div>

          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #111820; line-height: 1.3;">
            ${loc.name}
          </h3>

          <p style="margin: 0 0 8px 0; font-size: 11px; color: #65717a; line-height: 1.4;">
            ${loc.address}
          </p>

          ${
            loc.overseerName
              ? `
            <div style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px;">
              ${
                loc.overseerPhotoUrl
                  ? `<img src="${loc.overseerPhotoUrl}" alt="${loc.overseerName}" style="width: 32px; height: 32px; border-radius: 9999px; object-fit: cover; flex-shrink: 0; border: 1px solid #cbd5e1;"/>`
                  : `<div style="width: 32px; height: 32px; border-radius: 9999px; background: #1a4b8c; color: #ffffff; display: grid; place-items: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">${initials}</div>`
              }
              <div style="min-width: 0; flex: 1;">
                <div style="font-size: 11px; font-weight: 700; color: #111820; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${loc.overseerName}
                </div>
                <div style="font-size: 10px; font-weight: 600; color: #1e7b34; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${loc.overseerTitle || "State Coordinator"}
                </div>
              </div>
            </div>
            `
              : ""
          }

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            ${
              cleanPhone
                ? `
              <a href="tel:${cleanPhone}" style="display: flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 8px; border-radius: 6px; background: #1a4b8c; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <span>Call</span>
              </a>
              `
                : ""
            }
            <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 5px; padding: 6px 8px; border-radius: 6px; background: #f1f5f9; color: #1a4b8c; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center; border: 1px solid #cbd5e1;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              <span>Directions</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: "horemow-leaflet-popup",
      });

      marker.on("click", () => {
        if (onSelectLocation) {
          onSelectLocation(loc);
        }
      });

      marker.addTo(layer);
      markersMapRef.current.set(loc.id, marker);
      bounds.push([loc.latitude, loc.longitude]);
    });

    // Fit bounds if no specific location is selected
    if (!selectedLocationId && bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 6,
      });
    }
  }, [locations, selectedLocationId, onSelectLocation]);

  // Focus and open popup when selectedLocationId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedLocationId) return;

    const targetLoc = locations.find((l) => l.id === selectedLocationId);
    const marker = markersMapRef.current.get(selectedLocationId);

    if (targetLoc && typeof targetLoc.latitude === "number" && typeof targetLoc.longitude === "number") {
      map.flyTo([targetLoc.latitude, targetLoc.longitude], 11, {
        animate: true,
        duration: 1.2,
      });
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 600);
      }
    }
  }, [selectedLocationId, locations]);

  // Update user location pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], {
          icon: createUserPulseIcon(),
          zIndexOffset: 2000,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userCoords.latitude, userCoords.longitude]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const coords = locations
      .filter((l) => typeof l.latitude === "number" && typeof l.longitude === "number")
      .map((l) => [l.latitude!, l.longitude!] as L.LatLngTuple);
    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [30, 30], maxZoom: 6 });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      {/* Map Container */}
      <div className="size-full z-0" ref={mapContainerRef} style={{ height }} />

      {/* Floating Map Controls & Badges */}
      {interactive && (
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md backdrop-blur-xs transition hover:bg-white hover:text-brand-blue"
            onClick={handleResetView}
            title="Reset map view to show all chapters worldwide"
            type="button"
          >
            <Globe2 size={13} className="text-brand-blue shrink-0" />
            <span>View All ({locations.length})</span>
          </button>
        </div>
      )}

      {/* Legend Bar */}
      <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-2 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Map Legend:</span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span> HQ (Abuja)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-[#1A4B8C]"></span> Nigeria States
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-[#1E7B34]"></span> African Chapters
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-[#0284C7]"></span> Europe
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-[#7C3AED]"></span> North America
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-[#EA580C]"></span> Asia & Middle East
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Click any pin for coordinator details & direct calling
        </div>
      </div>
    </div>
  );
}
