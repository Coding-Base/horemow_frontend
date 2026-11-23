import type { FellowshipLocation } from "./locationTypes";

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (in kilometers).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Finds the nearest fellowship location to the given user coordinates.
 */
export function findNearestFellowship(
  userLat: number,
  userLng: number,
  locations: FellowshipLocation[]
): { location: FellowshipLocation; distanceKm: number } | null {
  const withCoords = locations.filter(
    (loc) => typeof loc.latitude === "number" && typeof loc.longitude === "number"
  );

  if (withCoords.length === 0) return null;

  let nearest = withCoords[0];
  let minDistance = calculateDistance(
    userLat,
    userLng,
    nearest.latitude!,
    nearest.longitude!
  );

  for (let i = 1; i < withCoords.length; i++) {
    const loc = withCoords[i];
    const dist = calculateDistance(userLat, userLng, loc.latitude!, loc.longitude!);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return { location: nearest, distanceKm: minDistance };
}

/**
 * Formats distance in km or miles.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) return "Within walking distance (< 1 km)";
  if (distanceKm === 1) return "1 km away";
  return `${distanceKm.toLocaleString()} km away`;
}
