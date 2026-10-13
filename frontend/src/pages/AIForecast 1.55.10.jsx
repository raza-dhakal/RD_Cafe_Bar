import { useState, useEffect, useMemo } from 'react';

// ════════════════════════════════════════════════════════════════
//  RD CAFE AI — Demand Forecast Engine
//  Live weather (Open-Meteo, free, no key) → menu demand + stock plan
// ════════════════════════════════════════════════════════════════

const C = {
  dark: '#0E0B08', panel: '#1A1510', panel2: '#241E15',
  gold: '#C9A84C', cream: '#F5EDD8', muted: 'rgba(245,237,216,0.5)',
  border: 'rgba(201,168,76,0.18)', up: '#6FBF73', down: '#D9805F',
};

const CITIES = [
  { key: 'sunwal',  name: 'Sunwal',     country: 'Nepal', lat: 27.61, lng: 83.66 },
  { key: 'ktm',     name: 'Kathmandu',  country: 'Nepal', lat: 27.7172, lng: 85.3240 },
  { key: 'tokyo',   name: 'Tokyo',      country: 'Japan', lat: 35.6762, lng: 139.6503 },
];

// WMO weather codes → label + icon
function wx(code) {
  if (code === 0) return { label: 'Clear sky', icon: '☀️', rain: false };
  if (code <= 3)  return { label: 'Partly cloudy', icon: '⛅', rain: false };
  if (code <= 48) return { label: 'Foggy', icon: '🌫️', rain: false };
  if (code <= 67) return { label: 'Rainy', icon: '🌧️', rain: true };
  if (code <= 77) return { label: 'Snowy', icon: '❄️', rain: false, cold: true };
  if (code <= 82) return { label: 'Rain showers', icon: '🌦️', rain: true };
  return { label: 'Thunderstorm', icon: '⛈️', rain: true };
}

// Menu categories (matches RD Café menu) with normal-day share of items
const CATS = [
  { key: 'hot',     label: 'Hot Coffee',  share: 0.28 },
  { key: 'cold',    label: 'Cold Coffee', share: 0.20 },
  { key: 'tea',     label: 'Tea',         share: 0.14 },
  { key: 'soft',    label: 'Soft Drinks', share: 0.10 },
  { key: 'food',    label: 'Food & Grill',share: 0.18 },
  { key: 'dessert', label: 'Desserts',    share: 0.10 },
];

// The demand model — transparent rules over live weather
function forecast(day) {
  const t = day.tempMax;
  const info = wx(day.code);
  const rain = info.rain || day.rainProb >= 60;
  const hot = t >= 28, cold = t <= 16 || info.cold;
  const dow = new Date(day.date).getDay();
  const weekend = dow === 0 || dow === 6;

  // category multipliers vs a normal day
  let m = { hot: 1, cold: 1, tea: 1, soft: 1, food: 1, dessert: 1 };
  if (hot)  m = { hot: 0.65, cold: 1.70, tea: 0.90, soft: 1.40, food: 0.95, dessert: 1.25 };
  if (cold) m = { hot: 1.55, cold: 0.50, tea: 1.40, soft: 0.80, food: 1.30, dessert: 1.10 };
  if (rain) { m.hot *= 1.15; m.tea *= 1.20; m.food *= 1.15; m.cold *= 0.85; m.dessert *= 1.05; }

  const customers = Math.round(
    320 * (weekend ? 1.18 : 1) * (hot ? 1.05 : cold ? 0.95 : 1) * (rain ? 0.92 : 1)
  );
  const itemsPer = 1.5;

  const cats = CATS.map(c => {
    const units = Math.round(customers * c.share * itemsPer * m[c.key]);
    const delta = Math.round((m[c.key] - 1) * 100);
    return { ...c, units, delta };
  }).sort((a, b) => b.units - a.units);

  // stock plan from ingredient exposure
  const pct = v => Math.round((v - 1) * 100);
  const milk = (m.hot + m.cold + m.tea) / 3;
  const beans = (m.hot + m.cold) / 2;
  const stockRaw = [
    { name: 'Milk',            pct: pct(milk),    reason: 'coffee & tea volume' },
    { name: 'Coffee beans',    pct: pct(beans),   reason: 'espresso-based drinks' },
    { name: 'Ice',             pct: pct(m.cold),  reason: 'cold drink demand' },
    { name: 'Kitchen / food prep', pct: pct(m.food), reason: 'food orders' },
    { name: 'Dessert stock',   pct: pct(m.dessert), reason: 'sweet cravings' },
  ];
  if (rain) stockRaw.push({ name: 'Delivery packaging', pct: 40, reason: 'rain → delivery surge' });
  const stock = stockRaw.filter(s => Math.abs(s.pct) >= 10).sort((a, b) => b.pct - a.pct);

  const dinein = rain ? 50 : weekend ? 65 : 70;
  const delivery = 100 - dinein;

  // narrative insight
  const top = cats[0].label;
  let insight = `${info.label}, ${Math.round(t)}°C. Expect about ${customers} guests`;
  insight += weekend ? ' (weekend rush). ' : '. ';
  if (rain) insight += `Rain pushes orders to delivery — prep packaging and riders. `;
  if (hot) insight += `Heat drives cold drinks; ease off hot-coffee prep. `;
  if (cold) insight += `Cold day favours hot coffee and warm food. `;
  insight += `${top} will lead the day.`;

  return { ...day, info, rain, hot, cold, weekend, customers, cats, stock, dinein, delivery, insight, maxUnits: Math.max(...cats.map(c => c.units)) };
}

export default function AIForecast() {
  const [cityKey, setCityKey] = useState('sunwal');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModel, setShowModel] = useState(false);
  const city = CITIES.find(c => c.key === cityKey);

  // load brand fonts (harmless if already present)
  useEffect(() => {
    if (!document.getElementById('rd-fonts')) {
      const l = document.createElement('link');
      l.id = 'rd-fonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@400;500&display=swap';
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    setLoading(true); setError(null);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=4`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('weather'); return r.json(); })
      .then(j => {
        if (cancel) return;
        const days = j.daily.time.map((date, i) => ({
          date,
          tempMax: j.daily.temperature_2m_max[i],
          tempMin: j.daily.temperature_2m_min[i],
          code: j.daily.weather_code[i],
          rainProb: j.daily.precipitation_probability_max[i] ?? 0,
        }));
        setData({ current: j.current, days });
        setLoading(false);
      })
      .catch(() => { if (!cancel) { setError(true); setLoading(false); } });
    return () => { cancel = true; };
  }, [cityKey]);

  const tomorrow = useMemo(() => data ? forecast(data.days[1]) : null, [data]);
  const outlook  = useMemo(() => data ? data.days.slice(1, 4).map(forecast) : [], [data]);

  const fmtDay = d => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ background: C.dark, minHeight: '100vh', padding: '2rem 1.25rem 4rem', fontFamily: '"DM Sans", sans-serif', color: C.cream }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.6rem' }}>
            RD Café AI · Demand Engine
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.05, margin: 0 }}>
            Tomorrow's demand, <em style={{ fontStyle: 'italic', color: C.gold }}>today</em>
          </h1>
          <p style={{ color: C.muted, fontSize: '0.9rem', marginTop: '0.6rem', maxWidth: 560 }}>
            Live weather drives a forecast of guests, the menu mix, and exactly what to stock — so nothing runs out and nothing gets wasted.
          </p>
        </div>

        {/* City pills */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {CITIES.map(c => (
            <button key={c.key} onClick={() => setCityKey(c.key)}
              style={{
                padding: '0.5rem 1rem', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                border: `1px solid ${cityKey === c.key ? C.gold : C.border}`,
                background: cityKey === c.key ? C.gold : 'transparent',
                color: cityKey === c.key ? C.dark : C.cream, cursor: 'pointer',
                fontFamily: '"DM Sans", sans-serif', fontWeight: cityKey === c.key ? 500 : 400, transition: 'all .2s',
              }}>
              {c.name} · {c.country}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '5rem 1rem', textAlign: 'center', color: C.muted }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.8rem', animation: 'pulse 1.4s ease-in-out infinite' }}>🌦️</div>
            Reading live weather for {city.name}…
            <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', border: `1px solid ${C.border}`, background: C.panel }}>
            <p style={{ margin: '0 0 1rem' }}>Couldn't reach the weather service.</p>
            <button onClick={() => setCityKey(k => k)} style={{ padding: '0.6rem 1.4rem', background: C.gold, color: C.dark, border: 'none', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem' }}>Retry</button>
          </div>
        )}

        {tomorrow && !loading && (
          <>
            {/* Hero row: weather + guests */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Weather */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '1.6rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.muted, marginBottom: '1rem' }}>
                  Tomorrow · {fmtDay(tomorrow.date)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '3.4rem', lineHeight: 1 }}>{tomorrow.info.icon}</div>
                  <div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.6rem', lineHeight: 1, color: C.gold }}>
                      {Math.round(tomorrow.tempMax)}°<span style={{ fontSize: '1.1rem', color: C.muted }}>/{Math.round(tomorrow.tempMin)}°</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>{tomorrow.info.label}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.2rem', fontSize: '0.78rem', color: C.muted }}>
                  <span>💧 Rain {tomorrow.rainProb}%</span>
                  {tomorrow.weekend && <span style={{ color: C.gold }}>★ Weekend</span>}
                </div>
              </div>

              {/* Guests */}
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '1.6rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.muted, marginBottom: '1rem' }}>
                  Predicted guests
                </div>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '3.4rem', lineHeight: 1, color: C.cream }}>
                  {tomorrow.customers}
                </div>
                <div style={{ marginTop: '1.2rem' }}>
                  <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: C.panel2 }}>
                    <div style={{ width: `${tomorrow.dinein}%`, background: C.gold }} />
                    <div style={{ width: `${tomorrow.delivery}%`, background: 'rgba(201,168,76,0.35)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.muted, marginTop: '0.5rem' }}>
                    <span>Dine-in {tomorrow.dinein}%</span>
                    <span>Delivery {tomorrow.delivery}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu demand shift */}
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '1.6rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.muted, marginBottom: '1.2rem' }}>
                Menu demand shift vs a normal day
              </div>
              {tomorrow.cats.map(c => (
                <div key={c.key} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{c.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.78rem', color: C.muted }}>~{c.units} items</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 500, color: c.delta > 0 ? C.up : c.delta < 0 ? C.down : C.muted, minWidth: 42, textAlign: 'right' }}>
                        {c.delta > 0 ? '▲' : c.delta < 0 ? '▼' : '–'} {Math.abs(c.delta)}%
                      </span>
                    </span>
                  </div>
                  <div style={{ height: 6, background: C.panel2, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(6, (c.units / tomorrow.maxUnits) * 100)}%`, height: '100%', background: c.delta >= 0 ? C.gold : 'rgba(217,128,95,0.7)', transition: 'width .5s' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stock plan + AI insight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '1.6rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.muted, marginBottom: '1.2rem' }}>
                  Stock up for tomorrow
                </div>
                {tomorrow.stock.map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid rgba(201,168,76,0.07)' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.68rem', color: C.muted }}>{s.reason}</div>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: s.pct > 0 ? C.up : C.down }}>
                      {s.pct > 0 ? '+' : ''}{s.pct}%
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.03))', border: `1px solid ${C.border}`, padding: '1.6rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: C.gold, marginBottom: '1rem' }}>
                  🤖 AI insight
                </div>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.35rem', lineHeight: 1.5, margin: 0, color: C.cream }}>
                  {tomorrow.insight}
                </p>
              </div>
            </div>

            {/* 3-day outlook */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {outlook.map((d, i) => (
                <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, padding: '1.1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.66rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>{i === 0 ? 'Tomorrow' : fmtDay(d.date)}</div>
                  <div style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{d.info.icon}</div>
                  <div style={{ fontSize: '0.95rem', color: C.gold }}>{Math.round(d.tempMax)}°/{Math.round(d.tempMin)}°</div>
                  <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.4rem' }}>~{d.customers} guests</div>
                </div>
              ))}
            </div>

            {/* Model transparency */}
            <button onClick={() => setShowModel(s => !s)}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, padding: '0.6rem 1.1rem', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
              {showModel ? '− Hide' : '+ How this works'}
            </button>
            {showModel && (
              <div style={{ marginTop: '1rem', background: C.panel, border: `1px solid ${C.border}`, padding: '1.4rem', fontSize: '0.82rem', color: C.muted, lineHeight: 1.7 }}>
                The engine reads <strong style={{ color: C.cream }}>live weather</strong> (temperature, rain probability) and the <strong style={{ color: C.cream }}>day of week</strong>, then applies demand rules learned from café sales patterns: heat lifts cold drinks, cold lifts hot coffee and food, rain shifts orders to delivery, weekends raise footfall. As real order history grows, these rules are replaced by a trained model for each individual café.
                <div style={{ marginTop: '0.8rem', fontSize: '0.72rem' }}>Weather data: Open-Meteo · live, free, no key required.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
