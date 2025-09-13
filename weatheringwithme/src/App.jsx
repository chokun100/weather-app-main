import React, { useState, useRef, useEffect } from 'react'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tempUnit, setTempUnit] = useState('c') // 'c' | 'f'
  const [windUnit, setWindUnit] = useState('kmh') // 'kmh' | 'mph'
  const [precipUnit, setPrecipUnit] = useState('mm') // 'mm' | 'in'
  const menuRef = useRef(null)
  const dayRef = useRef(null)
  const [dayOpen, setDayOpen] = useState(false)
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const [selectedDay, setSelectedDay] = useState('Tuesday')
  // Sample base data in metric (SI)
  const tempC = 20
  const feelsC = 18
  const windKmh = 14
  const precipMm = 0
  const dailyC = [21,21,21,21,21,21,21]
  const dailyLoC = [15,15,15,15,15,15,15]
  const hourlyC = Array.from({length:10},()=>20)

  const toF = (c) => Math.round(c * 9/5 + 32)
  const toMph = (kmh) => Math.round(kmh * 0.621371)
  const toIn = (mm) => (mm/25.4).toFixed(1)
  const fmtTemp = (c) => tempUnit === 'c' ? `${c}°` : `${toF(c)}°`
  const fmtWind = (kmh) => windUnit === 'kmh' ? `${kmh} km/h` : `${toMph(kmh)} mph`
  const fmtPrecip = (mm) => precipUnit === 'mm' ? `${mm} mm` : `${toIn(mm)} in`

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target)) return
      setMenuOpen(false)
      if (dayRef.current && !dayRef.current.contains(e.target)) setDayOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
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
              <input id="city" className="search__input search__input--lg" placeholder="Search for a place..." />
            </div>
            <button className="btn btn--primary btn--search">Search</button>
          </div>
        </div>
        <div className="col col--left">
          <section className="hero">
            <div className="hero__content">
              <div className="hero__place">Berlin, Germany</div>
              <div className="hero__date">Tuesday, Aug 8, 2025</div>
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
            <div className="days">
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
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="hour">
                  <span className="hour__time">{i + 3} PM</span>
                  <img src="/assets/images/icon-partly-cloudy.webp" alt="" />
                  <span className="hour__temp">{fmtTemp(hourlyC[i])}</span>
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

