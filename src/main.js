import './styles.css';

const ISTANBUL = { latitude: 41.0082, longitude: 28.9784, timezone: 'Europe/Istanbul' };
const fallbackRates = {
  AUD: { TRY: 21.4, EUR: 0.61, AUD: 1 },
  EUR: { TRY: 35.1, AUD: 1.64, EUR: 1 },
  TRY: { AUD: 0.047, EUR: 0.028, TRY: 1 },
};

const weatherCodes = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Rain showers',
  81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm',
};

const app = document.querySelector('#app');

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Istanbul travel info home">
      <span class="brand-mark"></span>
      <span>Travel info / Istanbul</span>
    </a>
    <nav aria-label="Page sections">
      <a href="#currency">Currency</a>
      <a href="#weather">Weather</a>
      <a href="#notes">Notes</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero section">
      <div class="inner hero-grid">
        <div>
          <p class="eyebrow">Australia to Türkiye</p>
          <h1>Istanbul travel info that stays useful.</h1>
          <p class="lead">Live Turkish lira conversions, Australian dollar and euro reference rates, and current Istanbul weather for travellers heading out of Australia.</p>
          <div class="hero-actions">
            <a class="button primary" href="#currency">Check rates</a>
            <a class="button ghost" href="#weather">View weather</a>
          </div>
        </div>
        <aside class="status-panel" aria-label="Quick status">
          <div class="panel-row"><span>Route</span><strong>Australia → Istanbul</strong></div>
          <div class="panel-row"><span>Currency</span><strong>AUD / EUR / TRY</strong></div>
          <div class="panel-row"><span>Weather</span><strong id="heroWeather">Loading</strong></div>
          <div class="panel-row"><span>Updated</span><strong id="updatedAt">Awaiting data</strong></div>
        </aside>
      </div>
    </section>

    <section id="currency" class="section alt">
      <div class="inner">
        <div class="section-head">
          <p class="eyebrow">Currency desk</p>
          <h2>Turkish lira, Australian dollar, and euro.</h2>
          <p>Use live rates as a practical guide. Card networks, exchanges, and ATMs may apply their own margins and fees.</p>
        </div>

        <div class="converter card">
          <div class="field">
            <label for="amount">Amount</label>
            <input id="amount" type="number" inputmode="decimal" min="0" value="100" />
          </div>
          <div class="field">
            <label for="fromCurrency">From</label>
            <select id="fromCurrency">
              <option value="AUD">Australian dollar</option>
              <option value="TRY">Turkish lira</option>
              <option value="EUR">Euro</option>
            </select>
          </div>
          <div class="conversion-results" aria-live="polite">
            <div><span>TRY</span><strong id="toTry">—</strong></div>
            <div><span>AUD</span><strong id="toAud">—</strong></div>
            <div><span>EUR</span><strong id="toEur">—</strong></div>
          </div>
        </div>

        <div class="rate-grid" id="rateGrid" aria-live="polite"></div>
        <p class="data-note" id="currencySource">Fetching live exchange rates.</p>
      </div>
    </section>

    <section id="weather" class="section">
      <div class="inner weather-layout">
        <div>
          <p class="eyebrow">Istanbul weather</p>
          <h2>Current conditions and the next few days.</h2>
          <p>Weather data is loaded from Open-Meteo for central Istanbul. Pack for wind from the Bosphorus, even when the forecast looks civilised.</p>
        </div>
        <div class="weather-card card" aria-live="polite">
          <span class="label">Now</span>
          <strong id="temperature">—</strong>
          <span id="condition">Loading current weather</span>
          <div class="weather-meta">
            <span id="wind">Wind —</span>
            <span id="humidity">Humidity —</span>
          </div>
        </div>
      </div>
      <div class="inner forecast-grid" id="forecastGrid" aria-live="polite"></div>
      <div class="inner"><p class="data-note" id="weatherSource">Fetching live forecast.</p></div>
    </section>

    <section id="notes" class="section alt">
      <div class="inner">
        <div class="section-head">
          <p class="eyebrow">Traveller notes</p>
          <h2>Useful reminders before landing.</h2>
        </div>
        <div class="notes-grid">
          <article class="card"><span class="label">Money</span><p>Keep a small amount of Turkish lira for taxis, tips, markets, and backup payments. Compare ATM fees before withdrawing.</p></article>
          <article class="card"><span class="label">Cards</span><p>Australian cards work widely in Istanbul, but dynamic currency conversion can be expensive. Pay in Turkish lira when prompted.</p></article>
          <article class="card"><span class="label">Weather</span><p>Summer is hot and bright. Winter can be wet and windy. Comfortable shoes matter year-round on hills and stone streets.</p></article>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="inner">Static GitHub Pages site. Live data loads in the browser from public APIs.</div>
  </footer>
`;

const amountInput = document.querySelector('#amount');
const fromSelect = document.querySelector('#fromCurrency');
const formatters = {
  AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
  EUR: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'EUR' }),
  TRY: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'TRY' }),
};

let rates = structuredClone(fallbackRates);

function formatCurrency(currency, value) {
  if (!Number.isFinite(value)) return '—';
  return formatters[currency].format(value);
}

function updateConversions() {
  const amount = Number(amountInput.value || 0);
  const from = fromSelect.value;
  document.querySelector('#toTry').textContent = formatCurrency('TRY', amount * rates[from].TRY);
  document.querySelector('#toAud').textContent = formatCurrency('AUD', amount * rates[from].AUD);
  document.querySelector('#toEur').textContent = formatCurrency('EUR', amount * rates[from].EUR);
}

function renderRateGrid() {
  const pairs = [
    ['1 AUD', `${formatCurrency('TRY', rates.AUD.TRY)} / ${formatCurrency('EUR', rates.AUD.EUR)}`],
    ['1 EUR', `${formatCurrency('TRY', rates.EUR.TRY)} / ${formatCurrency('AUD', rates.EUR.AUD)}`],
    ['100 TRY', `${formatCurrency('AUD', 100 * rates.TRY.AUD)} / ${formatCurrency('EUR', 100 * rates.TRY.EUR)}`],
  ];
  document.querySelector('#rateGrid').innerHTML = pairs.map(([label, value]) => `
    <article class="rate-card card"><span>${label}</span><strong>${value}</strong></article>
  `).join('');
}

async function fetchJson(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadCurrency() {
  try {
    const bases = await Promise.all(['AUD', 'EUR', 'TRY'].map((base) =>
      fetchJson(`https://open.er-api.com/v6/latest/${base}`)
    ));
    rates = Object.fromEntries(bases.map((data) => [data.base_code, {
      AUD: data.rates.AUD,
      EUR: data.rates.EUR,
      TRY: data.rates.TRY,
    }]));
    document.querySelector('#currencySource').textContent = 'Live exchange rates loaded from open.er-api.com. Rates are indicative.';
    document.querySelector('#updatedAt').textContent = new Date().toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (error) {
    console.warn('Currency API unavailable, using fallback rates.', error);
    document.querySelector('#currencySource').textContent = 'Live exchange rates are unavailable. Showing fallback guide rates.';
  } finally {
    renderRateGrid();
    updateConversions();
  }
}

async function loadWeather() {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: ISTANBUL.latitude,
    longitude: ISTANBUL.longitude,
    timezone: ISTANBUL.timezone,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
  }).toString();

  try {
    const data = await fetchJson(url.toString());
    const current = data.current;
    const condition = weatherCodes[current.weather_code] || 'Weather reported';
    document.querySelector('#temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.querySelector('#condition').textContent = condition;
    document.querySelector('#heroWeather').textContent = `${Math.round(current.temperature_2m)}°C / ${condition}`;
    document.querySelector('#wind').textContent = `Wind ${Math.round(current.wind_speed_10m)} km/h`;
    document.querySelector('#humidity').textContent = `Humidity ${current.relative_humidity_2m}%`;
    document.querySelector('#forecastGrid').innerHTML = data.daily.time.map((day, index) => `
      <article class="forecast-card card">
        <span>${new Date(`${day}T12:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        <strong>${Math.round(data.daily.temperature_2m_min[index])}–${Math.round(data.daily.temperature_2m_max[index])}°C</strong>
        <p>${weatherCodes[data.daily.weather_code[index]] || 'Forecast'}</p>
        <small>Rain ${data.daily.precipitation_probability_max[index] ?? 0}%</small>
      </article>
    `).join('');
    document.querySelector('#weatherSource').textContent = 'Live weather loaded from Open-Meteo for central Istanbul.';
  } catch (error) {
    console.warn('Weather API unavailable.', error);
    document.querySelector('#condition').textContent = 'Weather data unavailable';
    document.querySelector('#heroWeather').textContent = 'Unavailable';
    document.querySelector('#weatherSource').textContent = 'Live weather is unavailable. Try refreshing shortly.';
  }
}

amountInput.addEventListener('input', updateConversions);
fromSelect.addEventListener('change', updateConversions);
renderRateGrid();
updateConversions();
loadCurrency();
loadWeather();
