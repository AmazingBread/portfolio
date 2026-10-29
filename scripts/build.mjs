import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd(),
  dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const entry of ['index.html', 'src', 'vendor', 'assets', '.nojekyll'])
  fs.cpSync(path.join(root, entry), path.join(dist, entry), { recursive: true });
console.log('Static build ready: dist/');
