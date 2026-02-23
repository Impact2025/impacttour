/**
 * Geo utilities: Haversine afstandsberekening + geofence ray casting
 */

const EARTH_RADIUS_M = 6371000

/** Haversine formule: afstand in meters tussen twee GPS coördinaten */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_M * c
}

/** Controleer of team binnen unlock radius van checkpoint is */
export function isNearCheckpoint(
  teamLat: number,
  teamLon: number,
  checkpointLat: number,
  checkpointLon: number,
  radiusMeters: number = 50
): boolean {
  return (
    haversineDistance(teamLat, teamLon, checkpointLat, checkpointLon) <=
    radiusMeters
  )
}

export interface GeoPoint {
  lat: number
  lng: number
}

/**
 * Ray casting algoritme: controleer of punt binnen polygoon ligt.
 * Gebruikt voor JeugdTocht geofence check.
 */
export function isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  if (polygon.length < 3) return false

  let inside = false
  const { lat: py, lng: px } = point
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const { lat: iy, lng: ix } = polygon[i]
    const { lat: jy, lng: jx } = polygon[j]

    const intersect =
      iy > py !== jy > py && px < ((jx - ix) * (py - iy)) / (jy - iy) + ix

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Berekent het middelpunt van een polygoon (voor kaart centering)
 */
export function polygonCenter(polygon: GeoPoint[]): GeoPoint {
  if (polygon.length === 0) return { lat: 52.3676, lng: 4.9041 } // Amsterdam default
  const lat = polygon.reduce((sum, p) => sum + p.lat, 0) / polygon.length
  const lng = polygon.reduce((sum, p) => sum + p.lng, 0) / polygon.length
  return { lat, lng }
}
