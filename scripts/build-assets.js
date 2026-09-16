const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const rootDir = path.resolve(__dirname, '..');
const fontPath = path.join(rootDir, 'assets', 'fonts', 'Chillax-Medium.ttf');
const fontWoff2Path = path.join(rootDir, 'assets', 'fonts', 'Chillax-Medium.woff2');
const assetsDir = path.join(rootDir, 'assets');

// Load font
const fontBuffer = fs.readFileSync(fontPath);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

// Base64 woff2 for font-face embedding
const woff2Base64 = fs.readFileSync(fontWoff2Path).toString('base64');

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function fmt(n) {
  if (Math.abs(n) < 0.0001) return '0';
  return Number(n.toFixed(2)).toString();
}

function commandsToPathData(commands) {
  let d = '';
  for (const cmd of commands) {
    if (cmd.type === 'M') {
      d += `M${fmt(cmd.x)} ${fmt(cmd.y)}`;
    } else if (cmd.type === 'L') {
      d += `L${fmt(cmd.x)} ${fmt(cmd.y)}`;
    } else if (cmd.type === 'Q') {
      d += `Q${fmt(cmd.x1)} ${fmt(cmd.y1)} ${fmt(cmd.x)} ${fmt(cmd.y)}`;
    } else if (cmd.type === 'C') {
      d += `C${fmt(cmd.x1)} ${fmt(cmd.y1)} ${fmt(cmd.x2)} ${fmt(cmd.y2)} ${fmt(cmd.x)} ${fmt(cmd.y)}`;
    } else if (cmd.type === 'Z') {
      d += 'Z';
    }
  }
  return d;
}

// Render Chillax text as robust, exact SVG path data
function chillaxPath(text, x, y, size, fill = '#F8FAFC', letterSpacing = 0, opacity = 1) {
  let curX = x;
  let paths = [];
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(curX, y, size);
    if (glyphPath.commands && glyphPath.commands.length > 0) {
      paths.push(commandsToPathData(glyphPath.commands));
    }
    curX += (glyph.advanceWidth / font.unitsPerEm) * size + letterSpacing;
  }
  return `<path d="${paths.join(' ')}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

// Measure text width with Chillax
function measureChillax(text, size, letterSpacing = 0) {
  let width = 0;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    width += (glyph.advanceWidth / font.unitsPerEm) * size + letterSpacing;
  }
  return width;
}

// Cyber chamfered polygon path
function chamferBox(x, y, w, h, c = 12) {
  return `M ${x + c} ${y} ` +
         `L ${x + w - c} ${y} ` +
         `L ${x + w} ${y + c} ` +
         `L ${x + w} ${y + h - c} ` +
         `L ${x + w - c} ${y + h} ` +
         `L ${x + c} ${y + h} ` +
         `L ${x} ${y + h - c} ` +
         `L ${x} ${y + c} Z`;
}

// Cyber corner brackets and reticles
function cornerReticles(x, y, w, h, size = 10, color = '#00F0FF', strokeWidth = 1.5) {
  return `
    <g stroke="${color}" stroke-width="${strokeWidth}" fill="none" opacity="0.75">
      <!-- Top-Left -->
      <path d="M ${x} ${y + size} L ${x} ${y} L ${x + size} ${y}"/>
      <!-- Top-Right -->
      <path d="M ${x + w - size} ${y} L ${x + w} ${y} L ${x + w} ${y + size}"/>
      <!-- Bottom-Left -->
      <path d="M ${x} ${y + h - size} L ${x} ${y + h} L ${x + size} ${y + h}"/>
      <!-- Bottom-Right -->
      <path d="M ${x + w - size} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y + h - size}"/>
    </g>
  `;
}

// Cyber crosshairs
function crosshair(cx, cy, size = 5, color = '#00F0FF', opacity = 0.5) {
  return `
    <g stroke="${color}" stroke-width="1" opacity="${opacity}">
      <line x1="${cx - size}" y1="${cy}" x2="${cx + size}" y2="${cy}"/>
      <line x1="${cx}" y1="${cy - size}" x2="${cx}" y2="${cy + size}"/>
    </g>
  `;
}

// Common SVG Defs
function commonDefs(extraGradients = '') {
  return `
  <defs>
    <style>
      @font-face {
        font-family: 'Chillax';
        src: url('data:font/woff2;base64,${woff2Base64}') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }
      .mono-text {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      }
      .chillax-fallback {
        font-family: 'Chillax', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        font-weight: 500;
      }
    </style>

    <!-- Cyber Grid Pattern -->
    <pattern id="cyber-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.04"/>
      <circle cx="24" cy="24" r="0.75" fill="#00F0FF" opacity="0.12"/>
    </pattern>

    <!-- Background Void Gradient -->
    <linearGradient id="cyber-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D15"/>
      <stop offset="60%" stop-color="#06090E"/>
      <stop offset="100%" stop-color="#04060A"/>
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E1524" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#090E18" stop-opacity="0.95"/>
    </linearGradient>

    <!-- Cyan Glow Line Gradient -->
    <linearGradient id="cyan-glow-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0"/>
      <stop offset="20%" stop-color="#00F0FF" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#38BDF8" stop-opacity="1"/>
      <stop offset="80%" stop-color="#00F0FF" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0"/>
    </linearGradient>

    <!-- Scanning Laser Gradient -->
    <linearGradient id="scan-laser" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00F0FF" stop-opacity="0"/>
      <stop offset="50%" stop-color="#00FFA3" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#00F0FF" stop-opacity="0"/>
    </linearGradient>

    ${extraGradients}
  </defs>
  `;
}

// -------------------------------------------------------------
// 1. HERO BANNER SVG
// -------------------------------------------------------------
function buildHeroBanner() {
  const w = 1200;
  const h = 370;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="hero-title hero-desc">
  <title id="hero-title">Qu4rk — Full-Stack Developer &amp; AI Systems Engineer</title>
  <desc id="hero-desc">Cybercore Developer Identity Card for Qu4rk, based in Limassol, Cyprus, engineering real-time speech AI, luxury web experiences, and agent harnesses.</desc>

  ${commonDefs()}

  <!-- Master Canvas Background -->
  <path d="${chamferBox(0, 0, w, h, 16)}" fill="url(#cyber-bg)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cyber-grid)" clip-path="url(#hero-clip)"/>
  
  <clipPath id="hero-clip">
    <path d="${chamferBox(0, 0, w, h, 16)}"/>
  </clipPath>

  <!-- Outer Cyber Border -->
  <path d="${chamferBox(1, 1, w - 2, h - 2, 16)}" fill="none" stroke="#1E293B" stroke-width="1.5"/>
  <path d="${chamferBox(3, 3, w - 6, h - 6, 14)}" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.25"/>

  <!-- Corner Reticles & Technical Accents -->
  ${cornerReticles(8, 8, w - 16, h - 16, 14, '#00F0FF', 1.5)}
  ${crosshair(48, 48, 4, '#00F0FF', 0.6)}
  ${crosshair(w - 48, 48, 4, '#00F0FF', 0.6)}
  ${crosshair(48, h - 48, 4, '#00F0FF', 0.6)}
  ${crosshair(w - 48, h - 48, 4, '#00F0FF', 0.6)}

  <!-- Top Telemetry Bar -->
  <g transform="translate(64, 38)">
    <rect x="0" y="0" width="1072" height="28" fill="#0A0F1A" stroke="#1E293B" stroke-width="1" rx="4"/>
    
    <!-- System ID tag -->
    <rect x="0" y="0" width="4" height="28" fill="#00F0FF" rx="2"/>
    <text x="16" y="18" class="mono-text" font-size="12" fill="#00F0FF" letter-spacing="1.5">[ SYS.ID // QU4RK-01 ]</text>
    
    <text x="210" y="18" class="mono-text" font-size="12" fill="#38BDF8" letter-spacing="1">// ARCHITECTURE: PRODUCTION</text>

    <!-- Location Coordinates -->
    <circle cx="820" cy="14" r="3.5" fill="#00FFA3"/>
    <text x="832" y="18" class="mono-text" font-size="12" fill="#94A3B8" letter-spacing="1">LOC // 34.7071° N, 33.0226° E</text>
    <text x="1040" y="18" class="mono-text" font-size="11" fill="#64748B">[CY]</text>
  </g>

  <!-- Developer Category -->
  <g transform="translate(64, 98)">
    <text x="0" y="0" class="mono-text" font-size="13" fill="#00FFA3" letter-spacing="2.5">// DEVELOPER IDENTITY MATRIX</text>
  </g>

  <!-- Name: Qu4rk in Chillax Medium -->
  <g transform="translate(64, 172)">
    <!-- Cyan Back-Glow / Silhouette -->
    ${chillaxPath('Qu4rk', 0, 0, 72, '#00F0FF', 1.5, 0.15)}
    <!-- Main Lettering -->
    ${chillaxPath('Qu4rk', 0, 0, 72, '#F8FAFC', 1.5, 1)}
  </g>

  <!-- Verified Badge & Status Next to Name -->
  <g transform="translate(350, 130)">
    <rect x="0" y="0" width="136" height="26" rx="4" fill="#0D1626" stroke="#00FFA3" stroke-width="1"/>
    <!-- Minimal Animation: Pulsing Radar Ring -->
    <circle cx="16" cy="13" r="4" fill="#00FFA3"/>
    <circle cx="16" cy="13" r="4" fill="none" stroke="#00FFA3" stroke-width="1.5" opacity="0.8">
      <animate attributeName="r" values="4;9;4" dur="2.8s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;0;0.8" dur="2.8s" repeatCount="indefinite"/>
    </circle>
    <text x="28" y="17" class="mono-text" font-size="11" font-weight="700" fill="#00FFA3" letter-spacing="1.5">SYS // ONLINE</text>
  </g>

  <!-- Subtitle: Chillax Medium -->
  <g transform="translate(64, 216)">
    ${chillaxPath('FULL-STACK DEVELOPER & AI SYSTEMS ENGINEER', 0, 0, 20, '#00F0FF', 0.8, 0.95)}
    <!-- Blinking Cursor Accent -->
    <rect x="586" y="-18" width="3" height="22" fill="#00FFA3">
      <animate attributeName="opacity" values="1;1;0;0;1" dur="1.2s" repeatCount="indefinite"/>
    </rect>
  </g>

  <!-- Mission Statement in Supporting Type -->
  <g transform="translate(64, 254)">
    <text x="0" y="0" class="chillax-fallback" font-size="15" fill="#94A3B8" letter-spacing="0.2">
      Engineering ambient speech intelligence, luxury cinematic web systems, and autonomous agent harnesses.
    </text>
  </g>

  <!-- Bottom HUD Status Telemetry Bar -->
  <g transform="translate(64, 298)">
    <rect x="0" y="0" width="1072" height="38" fill="#080E1A" stroke="#1E293B" stroke-width="1" rx="6"/>
    
    <!-- Left: Status Indicator -->
    <g transform="translate(16, 12)">
      <circle cx="7" cy="7" r="4" fill="#00FFA3"/>
      <circle cx="7" cy="7" r="4" fill="none" stroke="#00FFA3" stroke-width="1.5" opacity="0.7">
        <animate attributeName="r" values="4;8;4" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <text x="20" y="11" class="mono-text" font-size="12" fill="#E2E8F0" letter-spacing="1">STATUS: READY FOR ARCHITECTURE &amp; COLLABORATION</text>
    </g>

    <!-- Divider -->
    <line x1="490" y1="8" x2="490" y2="30" stroke="#1E293B" stroke-width="1"/>

    <!-- Metrics Chips -->
    <g transform="translate(510, 13)">
      <text x="0" y="10" class="mono-text" font-size="12" fill="#00F0FF">09 REPOS</text>
      <text x="90" y="10" class="mono-text" font-size="12" fill="#64748B">//</text>
      <text x="115" y="10" class="mono-text" font-size="12" fill="#A855F7">50x-120x CACHE GAIN</text>
      <text x="290" y="10" class="mono-text" font-size="12" fill="#64748B">//</text>
      <text x="315" y="10" class="mono-text" font-size="12" fill="#38BDF8">REAL-TIME AI &amp; WEB</text>
    </g>

    <!-- Right Side HUD Bracket -->
    <text x="1054" y="24" class="mono-text" font-size="12" fill="#00F0FF" text-anchor="end">[OK]</text>
  </g>

  <!-- Glowing Scanning Laser Line at bottom -->
  <g transform="translate(64, 354)">
    <line x1="0" y1="0" x2="1072" y2="0" stroke="#1E293B" stroke-width="1"/>
    <!-- Minimal Animation: Cyber Scan Accent Bar -->
    <rect x="0" y="-1" width="180" height="2" fill="url(#scan-laser)">
      <animate attributeName="x" values="-200;1080" dur="4.5s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>
  `;

  fs.writeFileSync(path.join(assetsDir, 'hero-banner.svg'), svg.trim(), 'utf8');
  console.log('✓ Created assets/hero-banner.svg');
}

// -------------------------------------------------------------
// 2. TECH STACK SVG
// -------------------------------------------------------------
function buildTechStack() {
  const w = 1200;
  const h = 280;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="tech-title tech-desc">
  <title id="tech-title">Cybernetic Capabilities &amp; Tech Matrix</title>
  <desc id="tech-desc">Technology stack and runtime competencies for Qu4rk: TypeScript, Python, Dart, C#, Next.js, React, Flutter, Tailwind, GSAP, Deepgram, Silero, Kubernetes.</desc>

  ${commonDefs()}

  <!-- Master Canvas Background -->
  <path d="${chamferBox(0, 0, w, h, 14)}" fill="url(#cyber-bg)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cyber-grid)" clip-path="url(#tech-clip)"/>

  <clipPath id="tech-clip">
    <path d="${chamferBox(0, 0, w, h, 14)}"/>
  </clipPath>

  <!-- Outer Frame -->
  <path d="${chamferBox(1, 1, w - 2, h - 2, 14)}" fill="none" stroke="#1E293B" stroke-width="1.5"/>
  <path d="${chamferBox(3, 3, w - 6, h - 6, 12)}" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.25"/>

  ${cornerReticles(8, 8, w - 16, h - 16, 12, '#00F0FF', 1.5)}

  <!-- Section Header -->
  <g transform="translate(64, 34)">
    <text x="0" y="0" class="mono-text" font-size="12" fill="#00FFA3" letter-spacing="2">// CAPABILITIES MATRIX</text>
    <g transform="translate(0, 22)">
      ${chillaxPath('CYBERNETIC TECH STACK & RUNTIME SYSTEMS', 0, 0, 16, '#00F0FF', 0.8)}
    </g>
    <text x="1072" y="14" class="mono-text" font-size="12" fill="#64748B" text-anchor="end">[ 12 ACTIVE RUNTIMES ]</text>
  </g>

  <!-- 3 Cybercore Capability Zones -->
  <!-- ZONE 01: Core Languages (translate 64, 88) -->
  <g transform="translate(64, 88)">
    <!-- Zone Box -->
    <path d="${chamferBox(0, 0, 340, 155, 8)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
    <!-- Zone Tag -->
    <rect x="0" y="0" width="3" height="155" fill="#00F0FF" rx="1.5"/>
    <text x="16" y="24" class="mono-text" font-size="11" fill="#00F0FF" letter-spacing="1.5">ZONE 01 // LANGUAGES</text>
    
    <!-- Pills -->
    <g transform="translate(16, 42)">
      <!-- TypeScript -->
      <rect x="0" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#25334A" stroke-width="1"/>
      <circle cx="14" cy="20" r="3" fill="#00F0FF"/>
      <g transform="translate(26, 26)">
        ${chillaxPath('TypeScript', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- Python -->
      <rect x="156" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#25334A" stroke-width="1"/>
      <circle cx="170" cy="20" r="3" fill="#00F0FF"/>
      <g transform="translate(182, 26)">
        ${chillaxPath('Python', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- Dart -->
      <rect x="0" y="52" width="94" height="40" rx="6" fill="#0A0F1A" stroke="#25334A" stroke-width="1"/>
      <circle cx="14" cy="72" r="3" fill="#00F0FF"/>
      <g transform="translate(26, 78)">
        ${chillaxPath('Dart', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- C# -->
      <rect x="106" y="52" width="88" height="40" rx="6" fill="#0A0F1A" stroke="#25334A" stroke-width="1"/>
      <circle cx="120" cy="72" r="3" fill="#00F0FF"/>
      <g transform="translate(132, 78)">
        ${chillaxPath('C#', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- SQL -->
      <rect x="206" y="52" width="94" height="40" rx="6" fill="#0A0F1A" stroke="#25334A" stroke-width="1"/>
      <circle cx="220" cy="72" r="3" fill="#00F0FF"/>
      <g transform="translate(232, 78)">
        ${chillaxPath('SQL', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>
    </g>
  </g>

  <!-- ZONE 02: Frameworks & UI (translate 430, 88) -->
  <g transform="translate(430, 88)">
    <!-- Zone Box -->
    <path d="${chamferBox(0, 0, 340, 155, 8)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
    <!-- Zone Tag -->
    <rect x="0" y="0" width="3" height="155" fill="#A855F7" rx="1.5"/>
    <text x="16" y="24" class="mono-text" font-size="11" fill="#A855F7" letter-spacing="1.5">ZONE 02 // INTERFACE &amp; WEB</text>
    
    <!-- Pills -->
    <g transform="translate(16, 42)">
      <!-- Next.js -->
      <rect x="0" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#372852" stroke-width="1"/>
      <circle cx="14" cy="20" r="3" fill="#A855F7"/>
      <g transform="translate(26, 26)">
        ${chillaxPath('Next.js 15', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- React -->
      <rect x="156" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#372852" stroke-width="1"/>
      <circle cx="170" cy="20" r="3" fill="#A855F7"/>
      <g transform="translate(182, 26)">
        ${chillaxPath('React 19', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- Flutter -->
      <rect x="0" y="52" width="100" height="40" rx="6" fill="#0A0F1A" stroke="#372852" stroke-width="1"/>
      <circle cx="14" cy="72" r="3" fill="#A855F7"/>
      <g transform="translate(26, 78)">
        ${chillaxPath('Flutter', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- GSAP Motion -->
      <rect x="112" y="52" width="92" height="40" rx="6" fill="#0A0F1A" stroke="#372852" stroke-width="1"/>
      <circle cx="126" cy="72" r="3" fill="#A855F7"/>
      <g transform="translate(138, 78)">
        ${chillaxPath('GSAP', 0, 0, 14, '#F8FAFC', 0.5)}
      </g>

      <!-- Tailwind -->
      <rect x="216" y="52" width="84" height="40" rx="6" fill="#0A0F1A" stroke="#372852" stroke-width="1"/>
      <circle cx="228" cy="72" r="3" fill="#A855F7"/>
      <g transform="translate(238, 78)">
        ${chillaxPath('Tailwind', 0, 0, 13, '#F8FAFC', 0.5)}
      </g>
    </g>
  </g>

  <!-- ZONE 03: AI, Audio & Infra (translate 796, 88) -->
  <g transform="translate(796, 88)">
    <!-- Zone Box -->
    <path d="${chamferBox(0, 0, 340, 155, 8)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
    <!-- Zone Tag -->
    <rect x="0" y="0" width="3" height="155" fill="#00FFA3" rx="1.5"/>
    <text x="16" y="24" class="mono-text" font-size="11" fill="#00FFA3" letter-spacing="1.5">ZONE 03 // AI, AUDIO &amp; CLOUD</text>
    
    <!-- Pills -->
    <g transform="translate(16, 42)">
      <!-- Deepgram STT -->
      <rect x="0" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#1C3D32" stroke-width="1"/>
      <circle cx="14" cy="20" r="3" fill="#00FFA3"/>
      <g transform="translate(26, 26)">
        ${chillaxPath('Deepgram STT', 0, 0, 13, '#F8FAFC', 0.5)}
      </g>

      <!-- Silero VAD -->
      <rect x="156" y="0" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#1C3D32" stroke-width="1"/>
      <circle cx="170" cy="20" r="3" fill="#00FFA3"/>
      <g transform="translate(182, 26)">
        ${chillaxPath('Silero VAD', 0, 0, 13, '#F8FAFC', 0.5)}
      </g>

      <!-- Kubernetes -->
      <rect x="0" y="52" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#1C3D32" stroke-width="1"/>
      <circle cx="14" cy="72" r="3" fill="#00FFA3"/>
      <g transform="translate(26, 78)">
        ${chillaxPath('Kubernetes', 0, 0, 13, '#F8FAFC', 0.5)}
      </g>

      <!-- OpenCode / LLMs -->
      <rect x="156" y="52" width="144" height="40" rx="6" fill="#0A0F1A" stroke="#1C3D32" stroke-width="1"/>
      <circle cx="170" cy="72" r="3" fill="#00FFA3"/>
      <g transform="translate(182, 78)">
        ${chillaxPath('AI Harnesses', 0, 0, 13, '#F8FAFC', 0.5)}
      </g>
    </g>
  </g>
</svg>
  `;

  fs.writeFileSync(path.join(assetsDir, 'tech-stack.svg'), svg.trim(), 'utf8');
  console.log('✓ Created assets/tech-stack.svg');
}

// -------------------------------------------------------------
// 3. PROJECTS SVG
// -------------------------------------------------------------
function buildProjects() {
  const w = 1200;
  const h = 740;

  const projects = [
    {
      num: '01',
      title: 'Talli',
      badge: 'LIVE // PRIMARY EDUCATION',
      badgeColor: '#00FFA3',
      isLive: true,
      desc: 'Real-time Greek ambient speech recognition &amp; AI point tracking for Cyprus Primary Education.',
      tags: ['Next.js 14', 'Deepgram STT', 'Silero VAD', 'TypeScript'],
      link: 'github.com/Qu4rk/Talli →'
    },
    {
      num: '02',
      title: 'CacheSnipe',
      badge: 'NEW // OPEN-SOURCE PLUGIN',
      badgeColor: '#00F0FF',
      isLive: false,
      desc: 'OpenCode plugin locking DeepSeek prompt prefix to hit 50x–120x cheaper cache-read pricing.',
      tags: ['TypeScript', 'DeepSeek API', 'Prefix Caching', 'OpenCode'],
      link: 'github.com/Qu4rk/CacheSnipe →'
    },
    {
      num: '03',
      title: 'LuminaLiving',
      badge: 'LIVE // LUXURY REAL ESTATE',
      badgeColor: '#00FFA3',
      isLive: true,
      desc: 'Luxury coastal residence microsite featuring cinematic GSAP animation &amp; parallax galleries.',
      tags: ['Next.js', 'React', 'GSAP Animation', 'TypeScript'],
      link: 'lumina-living-six.vercel.app →'
    },
    {
      num: '04',
      title: 'chronotomi-wealth',
      badge: 'LIVE // WEALTH PLATFORM',
      badgeColor: '#00FFA3',
      isLive: true,
      desc: 'Wealth management platform with luxury timepiece inventory, private advisory &amp; logistics.',
      tags: ['HTML5', 'Modern JavaScript', 'Vercel Edge'],
      link: 'chronotomi-wealth.vercel.app →'
    },
    {
      num: '05',
      title: 'build_effortless',
      badge: 'REPO // FLUTTER APP ★ 1',
      badgeColor: '#A855F7',
      isLive: false,
      desc: 'AI-powered Flutter application for planning, comparing, and saving optimized PC hardware builds.',
      tags: ['Flutter', 'Dart', 'SQLite', 'AI Optimization'],
      link: 'github.com/Qu4rk/build_effortless →'
    }
  ];

  let cardsSvg = '';
  let startY = 92;
  const cardHeight = 114;
  const cardSpacing = 12;

  projects.forEach((p, idx) => {
    const y = startY + idx * (cardHeight + cardSpacing);
    const tagsStr = p.tags.map((t, i) => `
      <rect x="${i * 125}" y="0" width="118" height="24" rx="4" fill="#0A0F1A" stroke="#1E293B" stroke-width="1"/>
      <text x="${i * 125 + 10}" y="16" class="mono-text" font-size="11" fill="#38BDF8">${escapeXml(t)}</text>
    `).join('');

    cardsSvg += `
    <!-- Project Card: ${p.title} -->
    <g transform="translate(64, ${y})">
      <!-- Card Container -->
      <path d="${chamferBox(0, 0, 1072, cardHeight, 10)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
      
      <!-- Number Index -->
      <rect x="0" y="0" width="3" height="${cardHeight}" fill="${p.badgeColor}" rx="1.5"/>
      <text x="20" y="34" class="mono-text" font-size="16" font-weight="700" fill="#475569">${p.num}</text>

      <!-- Project Name in Chillax Medium -->
      <g transform="translate(56, 35)">
        ${chillaxPath(p.title, 0, 0, 22, '#F8FAFC', 0.5)}
      </g>

      <!-- Status Badge -->
      <g transform="translate(${56 + measureChillax(p.title, 22, 0.5) + 18}, 16)">
        <rect x="0" y="0" width="${measureChillax(p.badge, 10, 1) + 32}" height="22" rx="4" fill="#0A0F1A" stroke="${p.badgeColor}" stroke-width="1"/>
        ${p.isLive ? `
          <circle cx="10" cy="11" r="3" fill="${p.badgeColor}"/>
          <circle cx="10" cy="11" r="3" fill="none" stroke="${p.badgeColor}" stroke-width="1" opacity="0.8">
            <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
        ` : `
          <circle cx="10" cy="11" r="3" fill="${p.badgeColor}"/>
        `}
        <text x="20" y="15" class="mono-text" font-size="10" font-weight="700" fill="${p.badgeColor}" letter-spacing="1">${escapeXml(p.badge)}</text>
      </g>

      <!-- Outbound Link (Right Side) -->
      <g transform="translate(1048, 32)">
        <text x="0" y="0" class="mono-text" font-size="12" fill="#00F0FF" text-anchor="end" opacity="0.85">${escapeXml(p.link)}</text>
      </g>

      <!-- Description Line -->
      <text x="56" y="64" class="chillax-fallback" font-size="14" fill="#94A3B8">${p.desc}</text>

      <!-- Tech Stack Badges Row -->
      <g transform="translate(56, 78)">
        ${tagsStr}
      </g>
    </g>
    `;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="proj-title proj-desc">
  <title id="proj-title">Active Systems &amp; Featured Production Modules</title>
  <desc id="proj-desc">Featured projects by Qu4rk: Talli, CacheSnipe, LuminaLiving, chronotomi-wealth, and build_effortless.</desc>

  ${commonDefs()}

  <!-- Master Canvas Background -->
  <path d="${chamferBox(0, 0, w, h, 16)}" fill="url(#cyber-bg)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cyber-grid)" clip-path="url(#proj-clip)"/>

  <clipPath id="proj-clip">
    <path d="${chamferBox(0, 0, w, h, 16)}"/>
  </clipPath>

  <!-- Outer Frame -->
  <path d="${chamferBox(1, 1, w - 2, h - 2, 16)}" fill="none" stroke="#1E293B" stroke-width="1.5"/>
  <path d="${chamferBox(3, 3, w - 6, h - 6, 14)}" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.25"/>

  ${cornerReticles(8, 8, w - 16, h - 16, 14, '#00F0FF', 1.5)}

  <!-- Section Header -->
  <g transform="translate(64, 38)">
    <text x="0" y="0" class="mono-text" font-size="12" fill="#00FFA3" letter-spacing="2">// DEPLOYED PRODUCTION</text>
    <g transform="translate(0, 22)">
      ${chillaxPath('FEATURED SYSTEMS & OPEN-SOURCE ARCHITECTURE', 0, 0, 16, '#00F0FF', 0.8)}
    </g>
    <text x="1072" y="14" class="mono-text" font-size="12" fill="#64748B" text-anchor="end">[ INDEX: 05 ACTIVE SYSTEMS ]</text>
  </g>

  ${cardsSvg}
</svg>
  `;

  fs.writeFileSync(path.join(assetsDir, 'projects.svg'), svg.trim(), 'utf8');
  console.log('✓ Created assets/projects.svg');
}

// -------------------------------------------------------------
// 4. STATS SVG
// -------------------------------------------------------------
function buildStats() {
  const w = 1200;
  const h = 240;

  const pods = [
    {
      label: 'PUBLIC ARCHIVES',
      value: '09',
      sub: 'REPOSITORIES ONLINE',
      color: '#00F0FF'
    },
    {
      label: 'CACHE GAIN',
      value: '120x',
      sub: 'DEEPSEEK EFFICIENCY',
      color: '#00FFA3'
    },
    {
      label: 'ANNUAL ACTIVITY',
      value: '15+',
      sub: 'COMMITS RECORDED',
      color: '#A855F7'
    },
    {
      label: 'PRODUCTION REACH',
      value: '03',
      sub: 'LIVE WEB DEPLOYMENTS',
      color: '#38BDF8'
    }
  ];

  let podsSvg = '';
  const podWidth = 250;
  const podSpacing = 24;

  pods.forEach((p, idx) => {
    const x = idx * (podWidth + podSpacing);
    podsSvg += `
    <g transform="translate(${x}, 0)">
      <!-- Pod Chamfer Container -->
      <path d="${chamferBox(0, 0, podWidth, 120, 8)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
      
      <!-- Top Accent Line -->
      <rect x="0" y="0" width="${podWidth}" height="3" fill="${p.color}" rx="1.5" opacity="0.85"/>

      <!-- Category Label -->
      <text x="18" y="26" class="mono-text" font-size="11" fill="#94A3B8" letter-spacing="1">${p.label}</text>

      <!-- Chillax Metric Value -->
      <g transform="translate(18, 72)">
        ${chillaxPath(p.value, 0, 0, 38, '#F8FAFC', 0.5)}
      </g>

      <!-- Micro Subtitle -->
      <text x="18" y="98" class="mono-text" font-size="10" fill="${p.color}" letter-spacing="0.8">${p.sub}</text>
      
      <!-- Corner Bracket Mark -->
      <path d="M ${podWidth - 14} ${110} L ${podWidth - 6} ${110} L ${podWidth - 6} ${102}" stroke="${p.color}" stroke-width="1" fill="none" opacity="0.5"/>
    </g>
    `;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="stats-title stats-desc">
  <title id="stats-title">GitHub Telemetry &amp; System Analytics</title>
  <desc id="stats-desc">Telemetry metrics for Qu4rk: public repositories, cache multiplier, annual commits, and live deployments.</desc>

  ${commonDefs()}

  <!-- Master Canvas Background -->
  <path d="${chamferBox(0, 0, w, h, 14)}" fill="url(#cyber-bg)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cyber-grid)" clip-path="url(#stats-clip)"/>

  <clipPath id="stats-clip">
    <path d="${chamferBox(0, 0, w, h, 14)}"/>
  </clipPath>

  <!-- Outer Frame -->
  <path d="${chamferBox(1, 1, w - 2, h - 2, 14)}" fill="none" stroke="#1E293B" stroke-width="1.5"/>
  <path d="${chamferBox(3, 3, w - 6, h - 6, 12)}" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.25"/>

  ${cornerReticles(8, 8, w - 16, h - 16, 12, '#00F0FF', 1.5)}

  <!-- Section Header -->
  <g transform="translate(64, 34)">
    <text x="0" y="0" class="mono-text" font-size="12" fill="#00FFA3" letter-spacing="2">// TELEMETRY &amp; METRICS</text>
    <g transform="translate(0, 22)">
      ${chillaxPath('SYSTEM TELEMETRY & GITHUB CORE ANALYTICS', 0, 0, 16, '#00F0FF', 0.8)}
    </g>
    <text x="1072" y="14" class="mono-text" font-size="12" fill="#64748B" text-anchor="end">[ TELEMETRY // REALTIME ]</text>
  </g>

  <!-- Metric Pods Grid -->
  <g transform="translate(64, 86)">
    ${podsSvg}
  </g>
</svg>
  `;

  fs.writeFileSync(path.join(assetsDir, 'stats.svg'), svg.trim(), 'utf8');
  console.log('✓ Created assets/stats.svg');
}

// -------------------------------------------------------------
// 5. CONNECT SVG
// -------------------------------------------------------------
function buildConnect() {
  const w = 1200;
  const h = 210;

  const channels = [
    {
      tag: 'DISPATCH // EMAIL',
      handle: 'liasides.elias@gmail.com',
      color: '#00F0FF'
    },
    {
      tag: 'GITHUB // CORE',
      handle: 'github.com/Qu4rk',
      color: '#38BDF8'
    },
    {
      tag: 'LUMINA LIVING // WEB',
      handle: 'lumina-living-six.vercel.app',
      color: '#00FFA3'
    },
    {
      tag: 'CHRONOTOMI // WEALTH',
      handle: 'chronotomi-wealth.vercel.app',
      color: '#A855F7'
    }
  ];

  let channelsSvg = '';
  const cWidth = 250;
  const cSpacing = 24;

  channels.forEach((c, idx) => {
    const x = idx * (cWidth + cSpacing);
    channelsSvg += `
    <g transform="translate(${x}, 0)">
      <!-- Channel Card -->
      <path d="${chamferBox(0, 0, cWidth, 80, 6)}" fill="url(#card-bg)" stroke="#1E293B" stroke-width="1"/>
      <rect x="0" y="0" width="3" height="80" fill="${c.color}" rx="1.5"/>

      <!-- Tag -->
      <text x="16" y="26" class="mono-text" font-size="10" fill="${c.color}" letter-spacing="1.2">${c.tag}</text>

      <!-- Value / Handle in Chillax Medium -->
      <g transform="translate(16, 54)">
        ${chillaxPath(c.handle, 0, 0, 13, '#F8FAFC', 0.2)}
      </g>
    </g>
    `;
  });

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="conn-title conn-desc">
  <title id="conn-title">Communications Uplink &amp; Social Terminal</title>
  <desc id="conn-desc">Contact channels for Qu4rk: direct email, GitHub profile, Lumina Living luxury platform, and Chronotomi Wealth platform.</desc>

  ${commonDefs()}

  <!-- Master Canvas Background -->
  <path d="${chamferBox(0, 0, w, h, 14)}" fill="url(#cyber-bg)"/>
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cyber-grid)" clip-path="url(#conn-clip)"/>

  <clipPath id="conn-clip">
    <path d="${chamferBox(0, 0, w, h, 14)}"/>
  </clipPath>

  <!-- Outer Frame -->
  <path d="${chamferBox(1, 1, w - 2, h - 2, 14)}" fill="none" stroke="#1E293B" stroke-width="1.5"/>
  <path d="${chamferBox(3, 3, w - 6, h - 6, 12)}" fill="none" stroke="#00F0FF" stroke-width="0.75" opacity="0.25"/>

  ${cornerReticles(8, 8, w - 16, h - 16, 12, '#00F0FF', 1.5)}

  <!-- Section Header -->
  <g transform="translate(64, 34)">
    <text x="0" y="0" class="mono-text" font-size="12" fill="#00FFA3" letter-spacing="2">// COMMUNICATIONS UPLINK</text>
    <g transform="translate(0, 22)">
      ${chillaxPath('DIRECT TRANSMISSION & NETWORK CHANNELS', 0, 0, 16, '#00F0FF', 0.8)}
    </g>
    <text x="1072" y="14" class="mono-text" font-size="12" fill="#64748B" text-anchor="end">[ SECURE CHANNELS: ACTIVE ]</text>
  </g>

  <!-- Channels Grid -->
  <g transform="translate(64, 86)">
    ${channelsSvg}
  </g>
</svg>
  `;

  fs.writeFileSync(path.join(assetsDir, 'connect.svg'), svg.trim(), 'utf8');
  console.log('✓ Created assets/connect.svg');
}

// Run all builders
console.log('Building Cybercore SVG assets with Chillax Medium typography...');
buildHeroBanner();
buildTechStack();
buildProjects();
buildStats();
buildConnect();
console.log('Done! All 5 assets built successfully.');
