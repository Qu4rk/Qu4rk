---
name: Qu4rk
description: Elias Liasides’s GitHub developer notebook
colors:
  notebook-purple: "#8957e5"
typography:
  display:
    fontFamily: "Satoshi"
    fontWeight: 400
    fontSize: "68px"
components:
  nameplate:
    textColor: "{colors.notebook-purple}"
    typography: "{typography.display}"
    width: "480px"
    height: "88px"
---

## Overview

**Creative North Star: "Developer notebook"**

Elias introduces himself in the first person and lets readers inspect what he builds. A purple signature opens the page. The rest reads like a GitHub README, with project names, implementation details and links to the code.

**Key Characteristics:**
- Purple lettering on a transparent background.
- Native Markdown headings, paragraphs, lists and links.
- A real classroom dashboard with a caption identifying its fictional data.

## Colors

Reserve notebook purple for Elias’s name. GitHub supplies the page background, text, link colors and focus indicators for the reader’s theme. Preserve the application colors inside screenshots.

## Typography

The nameplate uses outlined Satoshi Regular. Its display size is measured in the SVG’s native coordinate space and scales with the image. Use GitHub’s body type for prose, level-two headings for sections and linked level-three headings for featured projects.

## Layout

Follow one left-aligned column. The introduction and contact links sit directly under the nameplate. Featured projects get their own paragraphs. Other work fits into a bulleted list. Let links wrap on narrow screens and scale images within the reading column.

## Components

- **Nameplate.** Place the transparent SVG inside the top-level heading. Use “Elias Liasides” as the image alternative.
- **Project entry.** Link the project name to its repository. Describe what the software does before listing its tools. CacheSnipe uses a text link to its code and setup instructions.
- **Application screenshot.** Talli’s full-column image links to its repository. The caption identifies the fictional student data and links to the full-size image.

## Do's and Don'ts

- Do keep project descriptions specific enough for a developer to understand the implementation.
- Do give screenshots descriptive alternatives and record their sources.
- Don't turn native links into image badges.
