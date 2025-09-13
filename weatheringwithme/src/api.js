/**
 * Open-Meteo integration (no API key required)
 * Docs: https://open-meteo.com/en/docs
 *
 * 1) Geocoding: resolve city → { latitude, longitude }
 *    https://geocoding-api.open-meteo.com/v1/search?name=Bangkok&count=1
 * 2) Forecast: current, hourly, daily using metric units
 *    https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,apparent_temperature,wind_speed_10m,precipitation&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto
 *
 * We return a normalized shape expected by the UI (metric base):
 * {
 *   location: { name, country, latitude, longitude, timezone },
 *   current: { temp_c, feelslike_c, wind_kph, precip_mm },
 *   daily: [{ max_c, min_c }, ...],
 *   hourly: [{ time, temp_c }, ...]
 * }
 */

// Fetch multiple location suggestions for autocomplete
export async function searchCities(name, count = 5) {
  if (!name || !name.trim()) return []
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', name)
  url.searchParams.set('count', String(count))
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString())
  if (!res.ok) return []
  const json = await res.json()
  const results = json?.results || []
  return results.map(r => ({
    id: `${r.id || ''}-${r.latitude},${r.longitude}`,
    name: r.name,
    country: r.country,
    admin1: r.admin1 || null,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }))
}

async function geocodeCity(name) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', name)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`)
  const json = await res.json()
  if (!json?.results?.length) throw new Error('City not found')
  const r = json.results[0]
  return {
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }
}

export async function getWeather(city /*, opts = {} */) {
  // 1) Geocode
  const place = await geocodeCity(city)

  // 2) Forecast in metric base
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(place.latitude))
  url.searchParams.set('longitude', String(place.longitude))
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,wind_speed_10m,precipitation')
  url.searchParams.set('hourly', 'temperature_2m,weathercode')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('temperature_unit', 'celsius')
  url.searchParams.set('wind_speed_unit', 'kmh')
  url.searchParams.set('precipitation_unit', 'mm')
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Forecast failed: ${res.status}`)
  const json = await res.json()

  // Normalize to our UI shape
  const current = json.current || {}
  const daily = (json.daily?.temperature_2m_max || []).map((max, i) => ({
    max_c: Math.round(max),
    min_c: Math.round(json.daily.temperature_2m_min?.[i] ?? max),
  }))
  const hourlyTemps = (json.hourly?.temperature_2m || [])
  const hourlyCodes = (json.hourly?.weathercode || [])
  const hourlyTimes = (json.hourly?.time || [])
  const hourly = hourlyTimes.map((t, i) => ({ time: t, temp_c: Math.round(hourlyTemps[i] ?? 0), code: hourlyCodes[i] }))

  return {
    location: {
      name: place.name,
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: json.timezone || place.timezone,
    },
    current: {
      temp_c: Math.round(current.temperature_2m ?? 0),
      feelslike_c: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 0),
      wind_kph: Math.round(current.wind_speed_10m ?? 0),
      precip_mm: Number(current.precipitation ?? 0),
    },
    daily,
    hourly,
  }
}
