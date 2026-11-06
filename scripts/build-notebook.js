// Deterministic nameplate using the repository's existing Satoshi font.
const fs = require('node:fs');
const path = require('node:path');
const opentype = require('opentype.js');
const root = path.resolve(__dirname, '..');
const bytes = fs.readFileSync(path.join(root, 'assets/fonts/Satoshi-Regular.ttf'));
const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const lettering = font.getPath('Elias Liasides', 0, 66, 68).toPathData(2);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="88" viewBox="0 0 480 88" role="img" aria-labelledby="title desc">
  <title id="title">Elias Liasides</title>
  <desc id="desc">Elias Liasides, known on GitHub as Qu4rk.</desc>
  <path d="${lettering}" fill="#8957e5"/>
</svg>\n`;
fs.writeFileSync(path.join(root, 'assets/readme/nameplate.svg'), svg);
