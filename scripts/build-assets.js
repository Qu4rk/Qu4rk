const fs = require('node:fs');
const path = require('node:path');
const opentype = require('opentype.js');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/readme');
fs.mkdirSync(out, { recursive: true });
const fontBuffer = fs.readFileSync(path.join(root, 'assets/fonts/Chillax-Medium.ttf'));
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
const satoshiBuffer = fs.readFileSync(path.join(root, 'assets/fonts/Satoshi-Regular.ttf'));
const satoshi = opentype.parse(satoshiBuffer.buffer.slice(satoshiBuffer.byteOffset, satoshiBuffer.byteOffset + satoshiBuffer.byteLength));
const c = { ink: '#0B0A12', paper: '#FFFFFF', primary: '#4442DB', gold: '#D4AF37', lavender: '#A594F9', muted: '#B5B1C5', line: '#363044' };
const esc = str => str.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
function type(str, x, y, size, fill = c.ink, extra = '') {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" ${extra}>${esc(str)}</text>`;
}
function display(str, x, y, size, fill = c.paper, face = font) {
  // Serialize explicitly: opentype 2's optimized serializer can emit NaN
  // for repeated translated quadratic curves despite finite source points.
  const keys = { M: ['x', 'y'], L: ['x', 'y'], Q: ['x1', 'y1', 'x', 'y'], C: ['x1', 'y1', 'x2', 'y2', 'x', 'y'], Z: [] };
  const d = face.getPath(str, x, y, size).commands.map(command => {
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

function centered(str, y, size, fill = c.paper, face = font) {
 return display(str, (1200-face.getAdvanceWidth(str,size))/2, y,size,fill,face);
}
const defs = `<defs>
 <linearGradient id="shade" x2="0" y2="1"><stop stop-color="#0B0A12" stop-opacity=".42"/><stop offset=".5" stop-color="#2A1854" stop-opacity=".27"/><stop offset="1" stop-color="#0B0A12" stop-opacity=".94"/></linearGradient>
 <radialGradient id="bloom"><stop stop-color="#4442DB" stop-opacity=".24"/><stop offset="1" stop-color="#0B0A12" stop-opacity="0"/></radialGradient>
 <linearGradient id="gold"><stop stop-color="#D4AF37"/><stop offset=".5" stop-color="#F3E5AB"/><stop offset="1" stop-color="#D4AF37"/></linearGradient>
 </defs>`;
const heroOverlay = `${defs}
<rect width="1200" height="640" fill="url(#shade)"/>
${display('QUARK',482,77,27)}${display('MADE',594,77,27,c.lavender)}
${type('D I G I T A L   C R A F T',482,102,13,'#D7D3E5')}
<path d="M245 168Q600 121 955 168" fill="none" stroke="#FFFFFF" stroke-opacity=".2"/>
${centered('Qu4rk',340,176)}
${centered('Crafting digital experiences',416,49,'#F3E5AB')}
${centered('that command attention.',477,49,c.paper,satoshi)}
${centered('Elias Liasides  /  Full-stack & AI systems',544,25,'#E6E0ED',satoshi)}
${centered('Limassol, Cyprus',582,21,'#C5BED0',satoshi)}
`;
svg('hero.svg',640,'Qu4rk — Elias Liasides / QuarkMade','Crafting digital experiences that command attention. Full-stack developer and AI systems engineer in Limassol, Cyprus.',`<rect width="1200" height="640" rx="24" fill="${c.ink}"/>${heroOverlay}`);
fs.writeFileSync(path.join(out,'source/hero-layout.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640"><title>Qu4rk / QuarkMade hero composition</title><image href="hero-sunset.webp" width="1200" height="640" preserveAspectRatio="xMidYMid slice"/>${heroOverlay}<image href="quark-logo.webp" x="411" y="48" width="57" height="57"/></svg>`);

let rows = '';
for (let i=0;i<3;i++) {
 const y=130+i*54;
 rows += type(`Turn ${i+1}`,638,y+21,19,c.muted);
 for(let j=0;j<5;j++) rows+=`<rect x="${718+j*47}" y="${y}" width="39" height="27" rx="4" fill="${c.lavender}"/>`;
 rows+=`<rect x="953" y="${y}" width="${40+i*39}" height="27" rx="4" fill="${c.gold}"/>`;
}
svg('cachesnipe.svg',360,'CacheSnipe — keep the prefix, reuse the work','Conceptual diagram of stable repeated prompt blocks and growing new content across three turns. OpenCode tooling for DeepSeek prompt caching.',`${defs}
<rect x="1" y="1" width="1198" height="358" rx="24" fill="${c.ink}" stroke="${c.line}"/>
<ellipse cx="235" cy="120" rx="400" ry="300" fill="url(#bloom)"/>
${type('Developer tooling',52,55,22,c.lavender)}
${display('CacheSnipe',52,137,72)}
${display('Keep the prefix.',52,203,33,c.paper,satoshi)}
${display('Reuse the work.',52,246,33,c.paper,satoshi)}
${type('OpenCode / DeepSeek / TypeScript',52,310,20,c.muted)}
<path d="M595 53V306" stroke="${c.line}"/>
${display('One stable prefix. Every turn.',638,82,25,c.paper,satoshi)}
${rows}
<rect x="718" y="307" width="12" height="12" rx="2" fill="${c.lavender}"/>${type('Repeated prefix',740,319,18,c.muted)}
<rect x="948" y="307" width="12" height="12" rx="2" fill="${c.gold}"/>${type('New content',970,319,18,c.muted)}
`);
svg('signoff.svg',230,'Let’s build something exceptional.','Explore QuarkMade or contact Elias Liasides at liasides.elias@gmail.com.',`${defs}
<rect x="1" y="1" width="1198" height="228" rx="24" fill="${c.ink}" stroke="${c.line}"/>
<ellipse cx="970" cy="50" rx="460" ry="350" fill="url(#bloom)"/>
${display('Let’s build something exceptional.',52,91,47)}
${display('QuarkMade',52,157,30,c.lavender)}
${type('liasides.elias@gmail.com',52,195,23,c.muted)}
<rect x="987" y="65" width="145" height="94" rx="8" fill="url(#gold)"/>
<path d="M1040 133l39-39M1041 94h38v38" fill="none" stroke="${c.ink}" stroke-width="3"/>
`);
(async()=>{
 const overlay=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640">${heroOverlay}</svg>`);
 const logo=await sharp(path.join(out,'source/quark-logo.webp')).resize(57,57).png().toBuffer();
 const composed=await sharp(path.join(out,'source/hero-sunset.webp')).resize(1200,640,{fit:'cover'}).composite([{input:overlay},{input:logo,left:411,top:48}]).png().toBuffer();
 const rounded=Buffer.from('<svg width="1200" height="640"><rect width="1200" height="640" rx="24" fill="white"/></svg>');
 await sharp(composed).composite([{input:rounded,blend:'dest-in'}]).webp({quality:92}).toFile(path.join(out,'hero.webp'));
 console.log('Built QuarkMade-themed hero.webp, static SVG fallback, cache diagram, and contact panel.');
})().catch(error=>{console.error(error);process.exitCode=1;});
