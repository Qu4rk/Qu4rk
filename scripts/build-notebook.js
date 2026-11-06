// Deterministic nameplate using the repository's existing Chillax Medium font.
const fs = require('node:fs');
const path = require('node:path');
const opentype = require('opentype.js');
const root = path.resolve(__dirname, '..');
const bytes = fs.readFileSync(path.join(root, 'assets/fonts/Chillax-Medium.ttf'));
const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
// Match build-assets.js: serialize directly to avoid opentype's curve optimizer bug.
const coordinates = { M: ['x', 'y'], L: ['x', 'y'], Q: ['x1', 'y1', 'x', 'y'], C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'], Z: [] };
const lettering = font.getPath('Elias Liasides', 0, 66, 68).commands.map(command => {
  const values = coordinates[command.type].map(key => {
    if (!Number.isFinite(command[key])) throw new Error('Invalid nameplate coordinate');
    return Number(command[key].toFixed(2));
  });
  return command.type + values.join(' ');
}).join(' ');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="88" viewBox="0 0 480 88" role="img" aria-labelledby="title desc">
  <title id="title">Elias Liasides</title>
  <desc id="desc">Elias Liasides, known on GitHub as Qu4rk.</desc>
  <path d="${lettering}" fill="#8957e5"/>
</svg>\n`;
fs.writeFileSync(path.join(root, 'assets/readme/nameplate.svg'), svg);
