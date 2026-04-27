# People Also Ask Miner

A lightweight, zero-dependency Node.js tool that extracts "People Also Ask" (PAA) questions from Google search results via the [SerpApi](https://serpapi.com) API. Useful for content research, FAQ generation, and SEO analysis.

## Features

- Enter any search keyphrase and retrieve up to 10 related PAA questions
- Clean web UI with one-click copy for all results
- Zero npm dependencies — pure Node.js
- Windows batch launcher for one-command startup

## Requirements

- [Node.js](https://nodejs.org) v14 or higher
- A free [SerpApi](https://serpapi.com) API key

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/josefresco/people-also-ask.git
   cd people-also-ask
   ```

2. **Add your SerpApi key**

   Open `paa-server.js` and replace the placeholder with your actual key:

   ```js
   const SERPAPI_KEY = 'your-serpapi-key-here';
   ```

## Usage

### Option 1 — Windows (batch launcher)

Double-click `paa-miner.bat` or run it from a terminal:

```bat
paa-miner.bat
```

This starts the server and opens `http://localhost:3131` in your default browser automatically.

### Option 2 — Cross-platform (Node.js)

```bash
node paa-server.js
```

Then open `http://localhost:3131` in your browser.

### Option 3 — Proxy mode (advanced)

Use `paa-proxy.js` as a CORS proxy alongside the standalone HTML file. This lets you run the UI without embedding an API key in the server — you enter it directly in the browser.

```bash
node paa-proxy.js
```

Then open `paa-miner.html` in your browser and enter your SerpApi key when prompted.

## How It Works

1. You enter a search keyphrase in the UI and click **Mine**.
2. The server sends requests to SerpApi using query variants (base query, `… guide`, `… tips`, `… faq`) to maximize PAA coverage.
3. Results are deduplicated and up to 10 unique questions are returned and displayed.
4. Use the **Copy All** button to copy the full list to your clipboard.

## Project Structure

```
people-also-ask/
├── paa-server.js     # Main server (port 3131) — serves UI and proxies SerpApi
├── paa-proxy.js      # Standalone CORS proxy for use with paa-miner.html
├── paa-miner.html    # Frontend UI (works with proxy mode)
└── paa-miner.bat     # Windows launcher script
```

## Configuration

| Setting | Location | Default |
|---|---|---|
| SerpApi API key | `paa-server.js` → `SERPAPI_KEY` | `'INSERT-KEY-HERE'` |
| Server port | `paa-server.js` → `PORT` | `3131` |

## API Endpoint

The server exposes a single search endpoint:

```
GET /search?q=<keyphrase>
```

Returns a JSON array of PAA question strings.

```json
["What is SEO?", "How does SEO work?", "..."]
```

## License

MIT
