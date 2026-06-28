# Travel Info — Istanbul for Australians

Static GitHub Pages-ready website for travellers flying from Australia to Istanbul.

## Features

- Live currency guide for AUD, EUR, and Turkish lira.
- Currency converter for AUD/EUR/TRY.
- Current Istanbul weather and 5-day forecast.
- Static Vite build suitable for GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build
```

Publish the generated `dist/` directory through GitHub Pages or a GitHub Actions Pages workflow.

## Data sources

- Currency: `https://open.er-api.com/v6/latest/{base}`
- Weather: `https://api.open-meteo.com/v1/forecast`

Both are loaded client-side in the browser. If a live API is unavailable, the currency widget falls back to guide rates and labels the result clearly.
