const http = require('http');
const https = require('https');

const SERPAPI_KEY = 'INSERT-KEY-HERE';
const PORT = 3131;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PAA Question Miner</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f3; color: #1a1a1a; min-height: 100vh; padding: 2rem; }
  .container { max-width: 720px; margin: 0 auto; }
  h1 { font-size: 1.25rem; font-weight: 500; margin-bottom: 1.5rem; }
  .inputs { display: flex; gap: 8px; margin-bottom: 10px; }
  input[type="text"] {
    border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px;
    font-size: 14px; outline: none; background: #fff; transition: border-color 0.15s;
  }
  input:focus { border-color: #888; }
  #keyphrase { flex: 1; }
  .controls { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; }
  button {
    border: 1px solid #ccc; border-radius: 6px; padding: 8px 16px;
    font-size: 13px; background: #fff; cursor: pointer; color: #1a1a1a;
    transition: background 0.1s, border-color 0.1s;
  }
  button:hover { background: #f0f0ee; border-color: #bbb; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  #copyBtn { display: none; }
  #status { font-size: 13px; color: #666; }
  .results { display: flex; flex-direction: column; gap: 5px; }
  .result-row {
    display: flex; align-items: baseline; gap: 10px;
    padding: 10px 14px; background: #fff;
    border: 1px solid #e8e8e6; border-radius: 6px;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
  .num { font-size: 11px; color: #aaa; min-width: 18px; font-family: monospace; }
  .question { font-size: 14px; line-height: 1.5; }
</style>
</head>
<body>
<div class="container">
  <h1>PAA Question Miner</h1>
  <div class="inputs">
    <input type="text" id="keyphrase" placeholder="e.g. cape cod motel" />
  </div>
  <div class="controls">
    <button id="runBtn" onclick="runSearch()">Mine questions</button>
    <button id="copyBtn" onclick="copyResults()">Copy all</button>
    <span id="status"></span>
  </div>
  <div class="results" id="results"></div>
</div>
<script>
let allQuestions = [];

async function fetchPAA(query) {
  const params = new URLSearchParams({ q: query });
  const res = await fetch('/search?' + params);
  if (!res.ok) throw new Error('Server error ' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return (data.related_questions || []).map(q => q.question).filter(Boolean);
}

async function runSearch() {
  const query = document.getElementById('keyphrase').value.trim();
  const statusEl = document.getElementById('status');
  const resultsEl = document.getElementById('results');
  const copyBtn = document.getElementById('copyBtn');
  const runBtn = document.getElementById('runBtn');

  if (!query) { statusEl.textContent = 'Enter a keyphrase.'; return; }

  allQuestions = [];
  resultsEl.innerHTML = '';
  copyBtn.style.display = 'none';
  runBtn.disabled = true;
  statusEl.textContent = 'Fetching...';

  try {
    const seen = new Set();
    const variants = [query, query + ' guide', query + ' tips', query + ' faq'];
    for (const v of variants) {
      if (allQuestions.length >= 10) break;
      const qs = await fetchPAA(v);
      qs.forEach(q => { if (!seen.has(q)) { seen.add(q); allQuestions.push(q); } });
      statusEl.textContent = 'Found ' + allQuestions.length + '...';
    }
    if (allQuestions.length === 0) { statusEl.textContent = 'No PAA questions found.'; return; }
    renderResults();
    statusEl.textContent = allQuestions.length + ' questions found';
    copyBtn.style.display = 'inline-block';
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
  } finally {
    runBtn.disabled = false;
  }
}

function renderResults() {
  const el = document.getElementById('results');
  el.innerHTML = '';
  allQuestions.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    row.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="question">' + q + '</span>';
    el.appendChild(row);
  });
}

function copyResults() {
  const text = allQuestions.map((q, i) => (i + 1) + '. ' + q).join('\\n');
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = 'Copy all'; }, 2000);
  });
}

document.getElementById('keyphrase').addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
</script>
</body>
</html>`;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  if (req.url.startsWith('/search')) {
    const query = new URL(req.url, 'http://localhost').searchParams.get('q') || '';
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${SERPAPI_KEY}&num=10`;
    https.get(serpUrl, (r) => {
      let body = '';
      r.on('data', chunk => body += chunk);
      r.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
      });
    }).on('error', (e) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => {
  console.log('PAA Miner running at http://localhost:' + PORT);
});
