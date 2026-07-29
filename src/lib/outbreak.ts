// Village watch has no real backend yet — there is no multi-tenant database
// of other farms' scans to aggregate (this app is device-local by design;
// see the "stored on this device only" promise everywhere else in the UI).
// Everything geometric here (distance, bearing, GPS rounding, centroid
// displacement, map projection) is real, reusable math that would work
// unchanged against a real synced dataset. The FARMS array below is the one
// deliberately-fabricated piece — illustrative seed data, clearly disclosed
// in the UI — standing in for scans that would otherwise come from a real
// sync service. "You" is always real: it's derived from this device's own
// profile + history.

export type OutbreakStatus = "confirmed" | "suspected" | "clear";

export interface SeedFarm {
  name: string;
  distanceKm: number;
  bearingDeg: number; // 0 = north, clockwise
  status: OutbreakStatus;
  crop: string;
  daysAgo: number;
}

export interface ProjectedFarm extends SeedFarm {
  bearingLabel: string;
  x: number; // 0-100, position on the map panel
  y: number;
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export function bearingLabel(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 45) % 8];
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearingDegBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Destination point given a start coordinate, a bearing and a distance — real spherical-geometry projection. */
export function destinationPoint(lat: number, lon: number, bearingDeg: number, distanceKm: number): { lat: number; lon: number } {
  const angularDist = distanceKm / EARTH_RADIUS_KM;
  const brng = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lon1 = toRad(lon);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDist) + Math.cos(lat1) * Math.sin(angularDist) * Math.cos(brng));
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: toDeg(lat2), lon: ((toDeg(lon2) + 540) % 360) - 180 };
}

/** Rounds a coordinate to the nearest 500 m grid cell so no farm's exact location ever leaves the device. */
export function roundCoordTo500m(lat: number, lon: number): { lat: number; lon: number } {
  const metersPerDegLat = 111_320;
  const metersPerDegLon = 111_320 * Math.cos(toRad(lat));
  const snap = (value: number, metersPerDeg: number) => {
    const meters = value * metersPerDeg;
    return (Math.round(meters / 500) * 500) / metersPerDeg;
  };
  return { lat: snap(lat, metersPerDegLat), lon: snap(lon, metersPerDegLon) };
}

/**
 * Suppresses any farm that doesn't have at least `minSize - 1` other farms
 * within `clusterRadiusKm` of it, so a sparse area never singles out one
 * farm. Uses real mutual distance (union-find over haversine distance)
 * rather than a fixed grid — an axis-aligned grid can split two farms a
 * street apart into separate cells if they straddle a cell boundary, which
 * would wrongly suppress a genuinely clustered group.
 */
export function suppressSmallCells<T extends { lat: number; lon: number }>(
  points: T[],
  minSize = 3,
  clusterRadiusKm = 1
): T[] {
  const parent = points.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (haversineKm(points[i].lat, points[i].lon, points[j].lat, points[j].lon) <= clusterRadiusKm) {
        union(i, j);
      }
    }
  }

  const counts = new Map<number, number>();
  for (let i = 0; i < points.length; i++) {
    const root = find(i);
    counts.set(root, (counts.get(root) ?? 0) + 1);
  }
  return points.filter((_, i) => (counts.get(find(i)) ?? 0) >= minSize);
}

// Illustrative seed data standing in for a real cross-farm sync — see the
// module comment above. Distances/bearings/statuses drafted for the demo.
export const SEED_FARMS: (SeedFarm & { name: string })[] = [
  { name: "Danjuma Sule", distanceKm: 0.8, bearingDeg: 45, status: "confirmed", crop: "Maize · 1.2 ha", daysAgo: 1 },
  { name: "Hauwa Ibrahim", distanceKm: 2.1, bearingDeg: 45, status: "confirmed", crop: "Maize · 2.0 ha", daysAgo: 3 },
  { name: "Garba Yusuf", distanceKm: 3.4, bearingDeg: 45, status: "confirmed", crop: "Maize · 0.9 ha", daysAgo: 5 },
  { name: "Ladi Bala", distanceKm: 1.4, bearingDeg: 225, status: "suspected", crop: "Maize · 1.5 ha", daysAgo: 0 },
  { name: "Sani Mohammed", distanceKm: 2.6, bearingDeg: 270, status: "suspected", crop: "Sorghum · 3.0 ha", daysAgo: 2 },
  { name: "Rakiya Adamu", distanceKm: 1.9, bearingDeg: 135, status: "clear", crop: "Cowpea · 0.7 ha", daysAgo: 1 },
  { name: "Musa Tanko", distanceKm: 3.8, bearingDeg: 225, status: "clear", crop: "Maize · 1.1 ha", daysAgo: 4 },
  { name: "Fatima Aliyu", distanceKm: 4.2, bearingDeg: 90, status: "clear", crop: "Rice · 2.4 ha", daysAgo: 6 },
];

const MAP_RADIUS_KM = 5; // matches the panel's outer dashed ring

/** Projects a real distance/bearing onto the map panel's 0-100 coordinate space, centred on "you". */
export function projectToMap(distanceKm: number, bearingDeg: number, centerX = 47, centerY = 52, spanPct = 33): { x: number; y: number } {
  const scale = spanPct / MAP_RADIUS_KM;
  const rad = toRad(bearingDeg);
  return {
    x: centerX + Math.sin(rad) * distanceKm * scale,
    y: centerY - Math.cos(rad) * distanceKm * scale,
  };
}

export interface SpreadEstimate {
  kmPerDay: number;
  bearingDeg: number;
  bearingLabel: string;
}

/** Real centroid-displacement math: splits confirmed cases into an older and newer half by report age and measures how far the centroid moved. */
export function estimateSpread(confirmed: { distanceKm: number; bearingDeg: number; daysAgo: number }[]): SpreadEstimate | null {
  if (confirmed.length < 2) return null;
  const sorted = [...confirmed].sort((a, b) => b.daysAgo - a.daysAgo); // oldest first
  const mid = Math.ceil(sorted.length / 2);
  const older = sorted.slice(0, mid);
  const newer = sorted.slice(mid);
  if (newer.length === 0) return null;

  const centroid = (group: typeof sorted) => {
    let x = 0;
    let y = 0;
    for (const f of group) {
      const rad = toRad(f.bearingDeg);
      x += Math.sin(rad) * f.distanceKm;
      y += Math.cos(rad) * f.distanceKm;
    }
    return { x: x / group.length, y: y / group.length, avgDaysAgo: group.reduce((s, f) => s + f.daysAgo, 0) / group.length };
  };

  const a = centroid(older);
  const b = centroid(newer);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distanceMoved = Math.sqrt(dx * dx + dy * dy);
  const timeSpanDays = Math.max(0.5, a.avgDaysAgo - b.avgDaysAgo);
  const bearingDeg = (toDeg(Math.atan2(dx, dy)) + 360) % 360;

  return {
    kmPerDay: Math.round((distanceMoved / timeSpanDays) * 10) / 10,
    bearingDeg,
    bearingLabel: bearingLabel(bearingDeg),
  };
}
