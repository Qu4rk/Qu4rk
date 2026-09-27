const fs = require('node:fs');
const path = require('node:path');
const opentype = require('opentype.js');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/readme');
fs.mkdirSync(out, { recursive: true });
const fontBuffer = fs.readFileSync(path.join(root, 'assets/fonts/Chillax-Medium.ttf'));
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
const c = { ink: '#171816', paper: '#F2F0E9', orange: '#FF6337', muted: '#A5AAA1', line: '#D4D5CB' };
const esc = str => str.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
function type(str, x, y, size, fill = c.ink, extra = '') {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" ${extra}>${esc(str)}</text>`;
}
function display(str, x, y, size, fill = c.ink) {
  // Serialize explicitly: opentype 2's optimized serializer can emit NaN
  // for repeated translated quadratic curves despite finite source points.
  const keys = { M: ['x', 'y'], L: ['x', 'y'], Q: ['x1', 'y1', 'x', 'y'], C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'], Z: [] };
  const d = font.getPath(str, x, y, size).commands.map(command => {
    const values = keys[command.type].map(key => {
      if (!Number.isFinite(command[key])) throw new Error(`Invalid glyph coordinate in ${str}`);
      return Number(command[key].toFixed(2));
    });
    return command.type + values.join(' ');
  }).join(' ');
  return `<path d="${d}" fill="${fill}"/>`;
}
function svg(name, height, title, desc, body) {
  fs.writeFileSync(path.join(out, name), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="title desc">\n<title id="title">${esc(title)}</title>\n<desc id="desc">${esc(desc)}</desc>\n${body}\n</svg>\n`);
}
function tracks(x, y, scale, color) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">
  <path d="M-130 45 C-72 43 -86 -87 4 -79 C106 -72 96 73 15 67 C-48 62 -49 -22 6 -31 C49 -37 64 14 26 27 C9 33 -13 24 -7 5"/>
  <path d="M-133 54 C-55 52 -72 -99 16 -86 C119 -71 107 87 19 79 C-59 70 -55 -38 13 -44 C65 -48 83 25 36 43 C2 55 -28 29 -19 2"/>
  <path d="M-136 64 C-39 60 -59 -112 29 -92 C137 -69 121 102 23 92 C-72 82 -65 -51 19 -57 C81 -61 102 38 42 58 C-5 74 -45 34 -31 -3"/>
  <path d="M-139 75 C-22 66 -44 -124 43 -96 C154 -60 134 118 27 105 C-87 93 -75 -66 25 -70 C98 -73 122 53 48 74 C-14 95 -62 38 -43 -9"/>
  </g>`;
}

// Identity: display text is converted to paths so GitHub needs no custom font.
const wordSize = 323;
const wordWidth = font.getAdvanceWidth('Qu4rk', wordSize);
svg('hero.svg', 592, 'Qu4rk — Elias Liasides', 'Full-stack developer and AI systems engineer in Limassol, Cyprus. AI systems, expressive interfaces, and the engineering between them.', `
<rect width="1200" height="592" fill="${c.paper}"/>
${type('Elias Liasides', 52, 55, 25)}
${type('Limassol, Cyprus', 1148, 55, 23, c.ink, 'text-anchor="end"')}
<path d="M52 83H1148" stroke="${c.ink}" stroke-width="1"/>
<g transform="translate(${(1200-wordWidth)/2} 0)">${display('Qu4rk', 0, 356, wordSize)}</g>
<circle cx="1121" cy="121" r="24" fill="${c.orange}"/>
<path d="M1111 121h20M1121 111v20" stroke="${c.ink}" stroke-width="2"/>
<rect y="413" width="1200" height="179" fill="${c.orange}"/>
${display('AI systems. Expressive interfaces.', 52, 480, 47)}
${display('The engineering between them.', 52, 543, 47)}
${tracks(1062, 507, .55, c.ink)}
`);

// Conceptual mechanism, deliberately without simulated performance numbers.
let rows = '';
for (let i = 0; i < 3; i++) {
 const y = 123 + i * 55;
 rows += type(`Turn ${i+1}`, 628, y+21, 19, c.muted);
 for (let j = 0; j < 5; j++) rows += `<rect x="${705+j*48}" y="${y}" width="40" height="28" rx="3" fill="${c.orange}"/>`;
 rows += `<rect x="${945}" y="${y}" width="${44+i*42}" height="28" rx="3" fill="${c.paper}"/>`;
}
svg('cachesnipe.svg', 350, 'CacheSnipe — keep the prefix, reuse the work', 'Conceptual diagram: repeated prompt-prefix blocks stay stable while new content grows across turns. An OpenCode plugin for DeepSeek prompt caching, with cache telemetry.', `
<rect width="1200" height="350" fill="${c.ink}"/>
${type('Developer tooling', 52, 53, 22, c.muted)}
${display('CacheSnipe',52,132,72,c.paper)}
${type('Keep the prefix.', 52, 197, 33, c.paper)}
${type('Reuse the work.',52, 240,33,c.paper)}
${type('OpenCode / DeepSeek / TypeScript',52,302,20,c.muted)}
<path d="M586 52V299" stroke="#4B4D47"/>
${type('One stable prefix. Every turn.',628,76,25,c.paper)}
${rows}
<rect x="705" y="301" width="12" height="12" fill="${c.orange}"/>
${type('Repeated prefix',727,313,18,c.muted)}
<rect x="921" y="301" width="12" height="12" fill="${c.paper}"/>
${type('New content',943,313,18,c.muted)}
`);

svg('signoff.svg', 176, 'Have something worth building? Let’s talk.', 'Contact Elias Liasides at liasides.elias@gmail.com.', `
<rect width="1200" height="176" fill="${c.paper}"/>
${display('Have something worth building?',52,72,48)}
${type('Let’s talk.  liasides.elias@gmail.com',52,129,28)}
<circle cx="1080" cy="88" r="45" fill="${c.orange}"/>
<path d="M1060 108l39-39M1061 69h38v38" fill="none" stroke="${c.ink}" stroke-width="3"/>
`);
console.log('Built hero.svg, cachesnipe.svg, and signoff.svg.');
