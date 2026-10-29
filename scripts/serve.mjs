import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd(),
  port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    const file = path.resolve(
      root,
      '.' + pathname + (pathname.endsWith('/') ? 'index.html' : '')
    );
    const rel = path.relative(root, file);
    if (
      rel.startsWith('..') ||
      path.isAbsolute(rel) ||
      rel.split(path.sep).some((part) => part.startsWith('.'))
    ) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => console.log('Local preview: http://127.0.0.1:' + port));
