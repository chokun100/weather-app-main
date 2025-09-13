import React, { useState, useRef, useEffect, useMemo } from 'react'
import { getWeather, searchCities } from './api.js'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tempUnit, setTempUnit] = useState('c') // 'c' | 'f'
  const [windUnit, setWindUnit] = useState('kmh') // 'kmh' | 'mph'
  const [precipUnit, setPrecipUnit] = useState('mm') // 'mm' | 'in'
  const menuRef = useRef(null)
  const suggestRef = useRef(null)
  const inputRef = useRef(null)
  const dayRef = useRef(null)
  const daysRef = useRef(null)
  const [dayOpen, setDayOpen] = useState(false)
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString(undefined, { weekday: 'long' }))
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const defaultCities = useMemo(() => [
    { id: 'bangkok', name: 'Bangkok', country: 'Thailand' },
    { id: 'london', name: 'London', country: 'United Kingdom' },
    { id: 'newyork', name: 'New York', country: 'United States' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'paris', name: 'Paris', country: 'France' },
  ], [])
  // Sample base data in metric (SI)
  const tempC = data?.current?.temp_c ?? data?.temperature_c ?? 20
  const feelsC = data?.current?.feelslike_c ?? data?.feels_like_c ?? 18
  const windKmh = data?.current?.wind_kph ? Math.round(data.current.wind_kph) : (data?.wind_kmh ?? 14)
  const precipMm = data?.current?.precip_mm ?? data?.precip_mm ?? 0
  const dailyC = data?.daily?.map(d => d.max_c) ?? [21,21,21,21,21,21,21]
  const dailyLoC = data?.daily?.map(d => d.min_c) ?? [15,15,15,15,15,15,15]
  const hourlyC = data?.hourly?.map(h => h.temp_c) ?? Array.from({length:10},()=>20)

  const toF = (c) => Math.round(c * 9/5 + 32)
  const toMph = (kmh) => Math.round(kmh * 0.621371)
  const toIn = (mm) => (mm/25.4).toFixed(1)
  const fmtTemp = (c) => tempUnit === 'c' ? `${c}°` : `${toF(c)}°`
  const fmtWind = (kmh) => windUnit === 'kmh' ? `${kmh} km/h` : `${toMph(kmh)} mph`
  const fmtPrecip = (mm) => precipUnit === 'mm' ? `${mm} mm` : `${toIn(mm)} in`

  const fmtHour = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    const hours = d.getHours()
    const h12 = ((hours + 11) % 12) + 1
    const ampm = hours < 12 ? 'AM' : 'PM'
    return `${h12} ${ampm}`
  }

  // Map Open-Meteo weather codes to icon paths (daytime simplified)
  const iconForCode = (code) => {
    switch (code) {
      case 0: return '/assets/images/icon-sunny.webp' // Clear sky
      case 1: return '/assets/images/icon-sunny.webp' // Mainly clear
      case 2: return '/assets/images/icon-partly-cloudy.webp' // Partly cloudy
      case 3: return '/assets/images/icon-overcast.webp' // Overcast
      case 45:
      case 48: return '/assets/images/icon-fog.webp' // Fog
      case 51:
      case 53:
      case 55:
      case 56:
      case 57: return '/assets/images/icon-drizzle.webp' // Drizzle
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
      case 80:
      case 81:
      case 82: return '/assets/images/icon-rain.webp' // Rain
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86: return '/assets/images/icon-snow.webp' // Snow
      case 95:
      case 96:
      case 99: return '/assets/images/icon-storm.webp' // Thunderstorm
      default: return '/assets/images/icon-partly-cloudy.webp'
    }
  }
  const currentDateStr = (() => {
    // Prefer current time from API if present to format a readable date
    const iso = data?.current?.time || null
    if (!iso) return 'Tuesday, Aug 8, 2025'
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  })()

  // Helper to get weekday name from ISO date string
  const weekdayOf = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { weekday: 'long' })
  }

  // Hours of the currently selected day from API
  const hoursForSelectedDay = useMemo(() => {
    if (!data?.hourly?.length) return []
    return data.hourly.filter(h => weekdayOf(h.time) === selectedDay)
  }, [data, selectedDay])

  const onSearch = async () => {
    if (!city.trim()) return
    setLoading(true)
    try {
      const res = await getWeather(city, { tempUnit, windUnit, precipUnit })
      setData(res)
      setShowSuggest(false)
      setHighlight(-1)
    } catch (e) {
      console.error(e)
      const msg = 'Failed to fetch weather. Check API.'
      window.alert(msg)
    } finally {
      setLoading(false)
    }
  }

  // Debounced fetch of city suggestions when typing
  useEffect(() => {
    let t
    async function run() {
      if (!showSuggest) return
      if (city.trim().length < 2) {
        setSuggestions(defaultCities)
        return
      }
      try {
        const list = await searchCities(city.trim(), 6)
        setSuggestions(list.length ? list : defaultCities)
      } catch {
        setSuggestions(defaultCities)
      }
    }
    t = setTimeout(run, 250)
    return () => clearTimeout(t)
  }, [city, showSuggest, defaultCities])

  const onFocusInput = () => {
    setShowSuggest(true)
    setHighlight(-1)
    if (city.trim().length < 2) setSuggestions(defaultCities)
  }

  const onSelectCity = (name) => {
    setCity(name)
    setShowSuggest(false)
    setHighlight(-1)
    onSearch()
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target)) return
      setMenuOpen(false)
      if (dayRef.current && !dayRef.current.contains(e.target)) setDayOpen(false)
      if (suggestRef.current && !suggestRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggest(false)
        setHighlight(-1)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Enable horizontal scroll with mouse wheel without needing to click first
  useEffect(() => {
    const el = daysRef.current
    if (!el) return
    const onWheel = (e) => {
      // Only handle vertical wheel deltas; allow shift+wheel native behavior
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const switchTo = (system) => {
    if (system === 'imperial') {
      setTempUnit('f'); setWindUnit('mph'); setPrecipUnit('in')
    } else {
      setTempUnit('c'); setWindUnit('kmh'); setPrecipUnit('mm')
    }
    setMenuOpen(false)
  }
  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <img src="/assets/images/logo.svg" alt="Weather Now" />
        </div>
        <div className="units" ref={menuRef}>
          <button className="btn btn--units" type="button" aria-label="Switch units" onClick={() => setMenuOpen((v) => !v)}>
            <img src="/assets/images/icon-units.svg" alt="Switch units icon" />
            <span>Units</span>
            <img className="chev" src="/assets/images/icon-dropdown.svg" alt="" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="units-menu" role="menu" aria-label="Units menu">
              <button className="units-menu__switch" onClick={() => switchTo(tempUnit === 'c' ? 'imperial' : 'metric')}>
                {tempUnit === 'c' ? 'Switch to Imperial' : 'Switch to Metric'}
              </button>
              <div className="units-menu__group">
                <div className="units-menu__label">Temperature</div>
                <button className={`units-menu__item ${tempUnit === 'c' ? 'is-active' : ''}`} onClick={() => setTempUnit('c')}>
                  Celsius (°C)
                  {tempUnit === 'c' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
                <button className={`units-menu__item ${tempUnit === 'f' ? 'is-active' : ''}`} onClick={() => setTempUnit('f')}>
                  Fahrenheit (°F)
                  {tempUnit === 'f' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
              </div>
              <div className="units-menu__divider" />
              <div className="units-menu__group">
                <div className="units-menu__label">Wind Speed</div>
                <button className={`units-menu__item ${windUnit === 'kmh' ? 'is-active' : ''}`} onClick={() => setWindUnit('kmh')}>
                  km/h
                  {windUnit === 'kmh' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
                <button className={`units-menu__item ${windUnit === 'mph' ? 'is-active' : ''}`} onClick={() => setWindUnit('mph')}>
                  mph
                  {windUnit === 'mph' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
              </div>
              <div className="units-menu__divider" />
              <div className="units-menu__group">
                <div className="units-menu__label">Precipitation</div>
                <button className={`units-menu__item ${precipUnit === 'mm' ? 'is-active' : ''}`} onClick={() => setPrecipUnit('mm')}>
                  Millimeters (mm)
                  {precipUnit === 'mm' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
                <button className={`units-menu__item ${precipUnit === 'in' ? 'is-active' : ''}`} onClick={() => setPrecipUnit('in')}>
                  Inches (in)
                  {precipUnit === 'in' && <img src="/assets/images/icon-checkmark.svg" alt="selected" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="layout">
        <h1 className="page-title">How's the sky looking today?</h1>
        <div className="search search--center">
          <div className="search__row search__row--center">
            <div className="search__input-wrap">
              <span className="search__icon" aria-hidden="true">
                <img src="/assets/images/icon-search.svg" alt="" />
              </span>
              <input
                id="city"
                ref={inputRef}
                className="search__input search__input--lg"
                placeholder="Search for a place..."
                value={city}
                onChange={(e)=>{ setCity(e.target.value); setShowSuggest(true) }}
                onFocus={onFocusInput}
                onKeyDown={(e)=>{
                  if(e.key==='Enter'){
                    if (showSuggest && highlight >= 0 && suggestions[highlight]) {
                      onSelectCity(suggestions[highlight].name)
                    } else {
                      onSearch()
                    }
                  } else if (e.key==='ArrowDown') {
                    e.preventDefault(); setShowSuggest(true); setHighlight(h=>Math.min((h<0?-1:h)+1, (suggestions.length-1)))
                  } else if (e.key==='ArrowUp') {
                    e.preventDefault(); setHighlight(h=>Math.max(h-1, -1))
                  } else if (e.key==='Escape') {
                    setShowSuggest(false); setHighlight(-1)
                  }
                }}
              />
              {showSuggest && (
                <div className="suggest-menu" ref={suggestRef} role="listbox" aria-label="City suggestions">
                  {(suggestions.length? suggestions : defaultCities).map((s, i) => (
                    <button
                      key={s.id || s.name+String(i)}
                      className={`suggest-menu__item ${i===highlight? 'is-active' : ''}`}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseLeave={() => setHighlight(-1)}
                      onClick={() => onSelectCity(s.name)}
                      role="option"
                      aria-selected={i===highlight}
                    >
                      <span>{s.name}</span>
                      <span className="suggest__muted">{s.admin1 ? `${s.admin1}, ` : ''}{s.country || ''}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn--primary btn--search" onClick={onSearch}>{loading ? 'Loading...' : 'Search'}</button>
          </div>
        </div>
        {/* Errors are shown via native alert() per request */}
        <div className="col col--left">
          <section className="hero">
            <div className="hero__content">
              <div className="hero__place">{data?.location?.name || 'Berlin, Germany'}</div>
              <div className="hero__date">{currentDateStr}</div>
            </div>
            <div className="hero__meta">
              <img className="hero__icon" src="/assets/images/icon-sunny.webp" alt="Sunny" />
              <div className="hero__temp">{fmtTemp(tempC)}</div>
            </div>
          </section>

          <section className="current">
            <h2 className="section__title">Temperature</h2>
            <div className="current__metrics">
              <div className="metric"><div className="metric__label">Feels Like</div><div className="metric__value">{fmtTemp(feelsC)}</div></div>
              <div className="metric"><div className="metric__label">Humidity</div><div className="metric__value">46%</div></div>
              <div className="metric"><div className="metric__label">Wind</div><div className="metric__value">{fmtWind(windKmh)}</div></div>
              <div className="metric"><div className="metric__label">Precipitation</div><div className="metric__value">{fmtPrecip(precipMm)}</div></div>
            </div>
          </section>

          <section className="forecast">
            <h2 className="section__title">Daily forecast</h2>
            <div className="days" ref={daysRef}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="day card">
                  <div className="day__label">{['Tue','Wed','Thu','Fri','Sat','Sun','Mon'][i]}</div>
                  <img src="/assets/images/icon-partly-cloudy.webp" alt="" />
                  <div className="day__temps"><span className="hi">{fmtTemp(dailyC[i])}</span><span className="lo">{fmtTemp(dailyLoC[i])}</span></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="col col--right">
          <div className="panel">
            <div className="panel__header" ref={dayRef}>
              <h2>Hourly forecast</h2>
              <button className="day-select" onClick={() => setDayOpen(v=>!v)} aria-haspopup="listbox" aria-expanded={dayOpen}>
                {selectedDay}
                <img className="chev" src="/assets/images/icon-dropdown.svg" alt="" aria-hidden="true" />
              </button>
              {dayOpen && (
                <ul className="day-menu" role="listbox" aria-label="Select day">
                  {days.map(d => (
                    <li key={d}>
                      <button className={`day-menu__item ${selectedDay===d?'is-active':''}`} onClick={()=>{setSelectedDay(d); setDayOpen(false)}} role="option" aria-selected={selectedDay===d}>
                        {d}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="hours">
              {(hoursForSelectedDay.length
                ? hoursForSelectedDay
                : Array.from({ length: 10 }).map((_, i) => ({ time: null, temp_c: hourlyC[i], code: 2 }))
              ).map((h, i) => (
                <div key={i} className="hour">
                  <span className="hour__time">{fmtHour(h.time) || `${i + 3} PM`}</span>
                  <img src={iconForCode(h.code)} alt="" />
                  <span className="hour__temp">{fmtTemp(h.temp_c)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="app__footer">
        <p>
          Challenge by{' '}
          <a href="https://www.frontendmentor.io?ref=challenge" target="_blank" rel="noreferrer">
            Frontend Mentor
          </a>. Coded by <a href="#">Your Name Here</a>.
        </p>
      </footer>
    </div>
  )
}

