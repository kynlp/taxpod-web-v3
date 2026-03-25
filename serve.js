const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const SRC  = path.join(__dirname, 'src');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function processIncludes(html) {
  return html.replace(/<!--\s*#include\s+"([^"]+)"\s*-->/g, function(match, filePath) {
    const absPath = path.join(ROOT, filePath);
    try {
      return fs.readFileSync(absPath, 'utf8');
    } catch (err) {
      return '<!-- SSI ERROR: ' + filePath + ' not found -->';
    }
  });
}

// Read API key from .env file if present
function getApiKey() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) return key;
  try {
    const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const match = env.match(/ANTHROPIC_API_KEY=([^\r\n]+)/);
    if (match) return match[1].trim();
  } catch (e) {}
  return null;
}

// Proxy POST /api/chat → Anthropic Messages API
function handleChatApi(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload;
    try { payload = JSON.parse(body); } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Add it to a .env file in the project root.' }));
      return;
    }

    const requestBody = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: payload.system || '',
      messages: payload.messages || []
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const apiReq = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });

    apiReq.on('error', err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });

    apiReq.write(requestBody);
    apiReq.end();
  });
}

http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  // Chat API endpoint
  if (req.method === 'POST' && req.url === '/api/chat') {
    handleChatApi(req, res);
    return;
  }

  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const ext = path.extname(url);

  const baseDir = ext === '.html' ? SRC : ROOT;
  const filePath = path.join(baseDir, url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    let content = data;
    if (ext === '.html') {
      content = processIncludes(data.toString('utf8'));
    }

    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}).listen(PORT, () => {
  console.log(`taxPOD Web server running at http://localhost:${PORT}`);
  console.log(`Source HTML: src/   |   Assets: root`);
  const apiKey = getApiKey();
  console.log(`Anthropic API: ${apiKey ? '✓ key found' : '✗ no key — add ANTHROPIC_API_KEY to .env'}`);
});
