/**
 * build.js — Assembles HTML source files into self-contained pages
 *
 * Usage:  node build.js
 *
 * Reads:  src/*.html  (source files with <!-- #include "..." --> directives)
 * Writes: *.html      (fully assembled — work on file:// and any static host)
 *
 * CSS files (templates/*.css) are already external and need no processing.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC  = path.join(__dirname, 'src');

const PAGES = ['index.html', 'popular-series.html', 'e-invoicing.html', 'webinars.html', 'webinar-detail.html', 'live-webinar-detail.html', 'clips.html'];

function processIncludes(html) {
  return html.replace(/<!--\s*#include\s+"([^"]+)"\s*-->/g, function(match, filePath) {
    const absPath = path.join(ROOT, filePath);
    try {
      return fs.readFileSync(absPath, 'utf8');
    } catch (err) {
      console.warn('  WARNING: include not found — ' + filePath);
      return '';
    }
  });
}

console.log('taxPOD Build\n');

PAGES.forEach(page => {
  const srcPath = path.join(SRC, page);
  const outPath = path.join(ROOT, page);

  if (!fs.existsSync(srcPath)) {
    console.warn('  SKIP: src/' + page + ' not found');
    return;
  }

  const html     = fs.readFileSync(srcPath, 'utf8');
  const assembled = processIncludes(html);

  fs.writeFileSync(outPath, assembled, 'utf8');
  console.log('  Built: ' + page);
});

console.log('\nDone — open index.html or popular-series.html directly in your browser.');
