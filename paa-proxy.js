const http = require('http');
const https = require('https');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url.slice(1), 'https://serpapi.com');
  https.get(url.toString(), (r) => {
    res.writeHead(r.statusCode, { 'Content-Type': 'application/json' });
    r.pipe(res);
  }).on('error', (e) => { res.writeHead(500); res.end(e.message); });
}).listen(3131, () => console.log('PAA proxy running on http://localhost:3131'));