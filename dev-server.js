const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const PROJECT_ROOT = __dirname;

// Track file hashes for live-reload
const getFileHash = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.getTime().toString();
  } catch {
    return 'error';
  }
};

const injectLiveReload = (html) => {
  const liveReloadScript = `<script>
(function() {
  let lastCheck = Date.now();
  let lastHash = '${getFileHash(path.join(PROJECT_ROOT, 'index.html'))}';

  setInterval(async () => {
    try {
      const res = await fetch('/__live-reload-check');
      const data = await res.json();
      if (data.hash !== lastHash) {
        lastHash = data.hash;
        location.reload();
      }
    } catch(e) {}
  }, 1000);
})();
</script>`;
  return html.replace('</body>', liveReloadScript + '</body>');
};

const server = http.createServer((req, res) => {
  // Live-reload check endpoint
  if (req.url === '/__live-reload-check') {
    const htmlPath = path.join(PROJECT_ROOT, 'index.html');
    const hash = getFileHash(htmlPath);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hash }));
    return;
  }

  // Route requests
  let filePath = path.join(PROJECT_ROOT, req.url === '/' ? 'index.html' : req.url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PROJECT_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // For HTML files, inject live-reload script
    if (filePath.endsWith('.html')) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
          return;
        }
        const withReload = injectLiveReload(data);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(withReload);
      });
    } else {
      // Serve other files as-is
      const mimeTypes = {
        '.json': 'application/json',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n📍 Dev server running at http://localhost:${PORT}`);
  console.log(`🔄 Live-reload enabled — changes to HTML/CSS/JS will auto-refresh`);
  console.log(`📱 For phone testing, run in another terminal:`);
  console.log(`   cloudflared tunnel --url http://localhost:${PORT}\n`);
});
