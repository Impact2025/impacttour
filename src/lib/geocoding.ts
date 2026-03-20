/**
 * Nominatim (OpenStreetMap) geocoder
 * Gratis, geen API key. Rate limit: 1 req/sec (ToS).
 */

const CITY_FALLBACKS: Record<string, { lat: number; lng: number }> = {
  amsterdam:     { lat: 52.3676, lng: 4.9041 },
  rotterdam:     { lat: 51.9225, lng: 4.4792 },
  'den haag':    { lat: 52.0705, lng: 4.3007 },
  utrecht:       { lat: 52.0907, lng: 5.1214 },
  eindhoven:     { lat: 51.4416, lng: 5.4697 },
  groningen:     { lat: 53.2194, lng: 6.5665 },
  tilburg:       { lat: 51.5555, lng: 5.0913 },
  almere:        { lat: 52.3508, lng: 5.2647 },
  breda:         { lat: 51.5719, lng: 4.7683 },
  nijmegen:      { lat: 51.8426, lng: 5.8546 },
  haarlem:       { lat: 52.3874, lng: 4.6462 },
  arnhem:        { lat: 51.9851, lng: 5.8987 },
  enschede:      { lat: 52.2215, lng: 6.8937 },
  apeldoorn:     { lat: 52.2112, lng: 5.9699 },
  'den bosch':   { lat: 51.6978, lng: 5.3037 },
  leiden:        { lat: 52.1601, lng: 4.4970 },
  maastricht:    { lat: 50.8514, lng: 5.6910 },
  dordrecht:     { lat: 51.8133, lng: 4.6901 },
  zoetermeer:    { lat: 52.0573, lng: 4.4941 },
  delft:         { lat: 52.0116, lng: 4.3571 },
  hilversum:     { lat: 52.2292, lng: 5.1797 },
  deventer:      { lat: 52.2559, lng: 6.1571 },
  alkmaar:       { lat: 52.6324, lng: 4.7534 },
  zwolle:        { lat: 52.5168, lng: 6.0830 },
  amersfoort:    { lat: 52.1561, lng: 5.3878 },
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function geocodeLocation(
  locationName: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  const queries = [
    `${locationName}, ${city}, Netherlands`,
    `${city}, Netherlands`,
  ]

  for (const q of queries) {
    try {
      await sleep(1100) // Nominatim ToS: max 1 req/sec
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=nl`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'IctusGo/1.0 (info@weareimpact.nl)' },
      })
      const data = await res.json()
      if (data?.[0]?.lat && data?.[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
    } catch {
      // probeer volgende query
    }
  }

  // Fallback: stadsnaam lookup in hardcoded tabel
  const cityKey = city.toLowerCase().trim()
  const fallback = CITY_FALLBACKS[cityKey]
  return fallback ?? null
}

/**
 * Geocodeer alle locaties sequentieel (Nominatim rate limit).
 * Geeft altijd een resultaat terug — mislukte lookups krijgen een offset van de stadcoördinaten.
 */
export async function geocodeAllMissions(
  missions: Array<{ location: string }>,
  city: string
): Promise<Array<{ lat: number; lng: number }>> {
  const cityKey = city.toLowerCase().trim()
  const cityCenter = CITY_FALLBACKS[cityKey] ?? { lat: 52.3676, lng: 4.9041 } // Amsterdam als ultieme fallback

  const results: Array<{ lat: number; lng: number }> = []

  for (let i = 0; i < missions.length; i++) {
    const coords = await geocodeLocation(missions[i].location, city)
    if (coords) {
      results.push(coords)
    } else {
      // Spreid checkpoints uit rond het stadscentrum (~90m tussenruimte)
      results.push({
        lat: cityCenter.lat + i * 0.0008,
        lng: cityCenter.lng + i * 0.0008,
      })
    }
  }

  return results
}
