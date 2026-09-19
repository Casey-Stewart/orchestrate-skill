import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname, sep } from 'node:path';

const root = await realpath(process.argv[2]);
const port = Number(process.argv[3] || 8765);
const mime = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.py': 'text/plain; charset=utf-8', '.ps1': 'text/plain; charset=utf-8', '.cjs': 'text/plain; charset=utf-8', '.mjs': 'text/plain; charset=utf-8', '.png': 'image/png', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
const inside = path => { const rel = relative(root, path); return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    const target = resolve(root, '.' + pathname);
    if (!inside(target)) { res.writeHead(403); res.end(); return; }
    const actual = await realpath(target);
    if (!inside(actual) || !(await stat(actual)).isFile()) { res.writeHead(404); res.end(); return; }
    const body = await readFile(actual);
    res.writeHead(200, { 'Content-Type': mime[extname(actual)] || 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Checkpoint files: http://127.0.0.1:${port}/smoke-C1.html`));
