import React from 'react'

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <img src="/assets/images/logo.svg" alt="Weather App logo" width={28} height={28} />
          <span className="brand__name">Weather Now</span>
        </div>
        <div className="units">
          <button className="btn btn--units" type="button" aria-label="Switch units">
            <img src="/assets/images/icon-units.svg" alt="Switch units icon" />
            <span>Units</span>
            <img className="chev" src="/assets/images/icon-dropdown.svg" alt="" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="layout">
        <h1 className="page-title">How's the sky looking today?</h1>
        <div className="search search--center">
          <div className="search__row search__row--center">
            <span className="search__icon" aria-hidden="true">
              <img src="/assets/images/icon-search.svg" alt="" />
            </span>
            <input id="city" className="search__input search__input--lg" placeholder="Search for a place..." />
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
              <div className="hero__temp">20°</div>
            </div>
          </section>

          <section className="current">
            <h2 className="section__title">Temperature</h2>
            <div className="current__metrics">
              <div className="metric"><div className="metric__label">Feels Like</div><div className="metric__value">18°</div></div>
              <div className="metric"><div className="metric__label">Humidity</div><div className="metric__value">46%</div></div>
              <div className="metric"><div className="metric__label">Wind</div><div className="metric__value">14 km/h</div></div>
              <div className="metric"><div className="metric__label">Precipitation</div><div className="metric__value">0 mm</div></div>
            </div>
          </section>

          <section className="forecast">
            <h2 className="section__title">Daily forecast</h2>
            <div className="days">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="day card">
                  <div className="day__label">{['Tue','Wed','Thu','Fri','Sat','Sun','Mon'][i]}</div>
                  <img src="/assets/images/icon-partly-cloudy.webp" alt="" />
                  <div className="day__temps"><span className="hi">21°</span><span className="lo">15°</span></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="col col--right">
          <div className="panel">
            <div className="panel__header">
              <h2>Hourly forecast</h2>
              <select className="select">
                <option>Tuesday</option>
                <option>Wednesday</option>
              </select>
            </div>
            <div className="hours">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="hour">
                  <span className="hour__time">{i + 3} PM</span>
                  <img src="/assets/images/icon-partly-cloudy.webp" alt="" />
                  <span className="hour__temp">20°</span>
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

