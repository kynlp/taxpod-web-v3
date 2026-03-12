const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const SRC  = path.join(__dirname, 'src'); // HTML source files (with SSI directives)

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

// SSI: replace <!-- #include "path/to/file" --> with file contents
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

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/index.html';
  const ext = path.extname(url);

  // HTML files are served from src/ (with SSI); everything else from root
  const baseDir = ext === '.html' ? SRC : ROOT;
  const filePath = path.join(baseDir, url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not Found');
      return;
    }

    let content = data;
    if (ext === '.html') {
      content = processIncludes(data.toString('utf8'));
    }

    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(content);
  });
}).listen(PORT, () => {
  console.log(`taxPOD Web server running at http://localhost:${PORT}`);
  console.log(`Source HTML: src/   |   Assets: root`);
  console.log(`Run "node build.js" to generate file://-compatible HTML files.`);
});
