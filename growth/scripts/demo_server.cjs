const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4321;
const DEMO_DIR = path.resolve(__dirname, '../../public/demo');
const LESSONS_DIR = path.resolve(DEMO_DIR, 'lessons');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/' || urlPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHtmlPage());
    return;
  }

  const filePath = path.join(DEMO_DIR, urlPath.replace(/^\/+/, ''));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  const total = stat.size;
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.json': 'application/json',
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  const range = req.headers.range;
  if (range && ext === '.mp4') {
    const parts = range.replace(/bytes=/, '').split('-');
    const partialStart = parts[0];
    const partialEnd = parts[1];

    const start = parseInt(partialStart, 10);
    const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Video Demo Server running at http://localhost:${PORT}/`);
});

function getHtmlPage() {
  const showcasePath = path.join(__dirname, 'demo_showcase.html');
  if (fs.existsSync(showcasePath)) {
    return fs.readFileSync(showcasePath, 'utf8');
  }
  return '<h1>Demo Showcase HTML not found</h1>';
}

