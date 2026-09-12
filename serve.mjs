import http from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, createReadStream, statSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = resolve(__dirname);

const server = http.createServer((req, res) => {
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  // Default to index.html for root
  if (pathname === '/') pathname = '/index.html';

  // Construct file path
  const filePath = join(PUBLIC_DIR, pathname);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  // Check if file exists
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  // Get file stats
  const stats = statSync(filePath);

  // Determine content type
  const ext = pathname.split('.').pop().toLowerCase();
  const contentTypeMap = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'webp': 'image/webp'
  };
  const contentType = contentTypeMap[ext] || 'application/octet-stream';

  // Serve file
  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stats.size,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  const fileStream = createReadStream(filePath);
  fileStream.pipe(res);
});

const PORT = 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop any existing servers.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
