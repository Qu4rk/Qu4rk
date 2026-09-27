# QuarkMade profile artwork

The README visual identity follows [QuarkMade](https://qu4rk.github.io/QuarkMade/): twilight imagery, a near-black violet background, gold and lavender accents, rounded panels, and Satoshi / Chillax typography.

Run `npm install` and `npm run build:assets` from the repository root. The generator produces the published `hero.webp`, a self-contained static `hero.svg` fallback, `cachesnipe.svg`, `signoff.svg`, and the editable composition `source/hero-layout.svg`. Sharp composites the original website artwork with outlined vector typography. The published assets do not require external fonts or remote images.

## Sources

- `source/hero-sunset.webp` and `source/quark-logo.webp`: existing QuarkMade website assets, copied from its public `assets/branding/` directory on 27 September 2026. These are original site assets, not newly generated images.
- `source/hero-layout.svg`: editable composition; its image references are relative to this source directory. Publish `hero.webp`, not this source file.
- `talli.webp`: cropped from the public Talli repository's `assets/readme/dashboard.png`, an actual application screenshot with fictional demo names and scores. [Original](https://github.com/Qu4rk/Talli/blob/main/assets/readme/dashboard.png).
- `lumina.webp`: actual Lumina Living website screenshot captured on 27 September 2026.
- `cachesnipe.svg`: conceptual prefix-reuse diagram, not measured telemetry or a cache-hit guarantee.

## Theme tokens

Background `#0B0A12`; white `#FFFFFF`; primary violet `#4442DB`; gold `#D4AF37`; lavender `#A594F9`. Colors come from the QuarkMade source and hero styling. Chillax Medium is the existing repository font. Satoshi Regular is the website's body and headline companion. Display lettering is outlined so the appearance is stable on GitHub. Long-form text and links remain native Markdown.
