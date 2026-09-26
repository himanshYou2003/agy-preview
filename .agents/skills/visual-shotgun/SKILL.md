---
name: visual-shotgun
description: Visual Design Shotgunning — generates 3-4 distinct UI archetypes and triggers the Visual Decision Plane preview before writing production code.
---

# /visual-shotgun: AI Visual Decision Shotgunning (Senior UI/UX Standard)

Use this skill whenever creating, redesigning, or refining user interface experiences (landing pages, dashboards, websites, forms, navigation, cards, or design systems).

## Strict Core Invariants & Senior UI/UX Mandates:

### 1. The 4-Device Viewport Invariant (Fluid, 1280px, 768px, 375px)
Every design variant generated MUST be **strictly, 100% responsive and properly fitted to ALL device viewports**:
- **🖥️ Desktop Fluid (100% / >1440px)**:
  - Expansive typography hierarchy, generous whitespace, multi-column grids (3 to 4 columns).
  - Sticky / floating navigation with full links, brand badges, and action buttons.
  - Edge-to-edge layout filling the desktop viewport naturally.
- **💻 Laptop (1280px)**:
  - Constrained container max-width (`1200px - 1240px`) with balanced gutters.
  - Zero clipped elements or horizontal scrollbars.
  - High typographic density with proportional sizing.
- **📱 Tablet (768px)**:
  - Reflows multi-column grids into 2 columns or stacked modular blocks.
  - Condensed navigation, touch-friendly tap targets ($\ge 44\text{px}$).
  - Tablet padding ($16\text{px} - 24\text{px}$), balanced reading width.
- **📲 Mobile (375px)**:
  - Strictly single-column vertical flow (`grid-template-columns: 1fr`).
  - Mobile-scaled typography: titles scaled to `24px - 28px` to prevent unnatural multi-line breaks.
  - Full-width call-to-action buttons (`width: 100%`, stacked vertically).
  - Streamlined mobile header (compact logo + primary action), no horizontal overflow (`overflow-x: hidden`).
  - Perfectly fit within the 375px chassis and top dynamic island frame.

### 2. Strict Design-Dependent Dark & Light Mode Mandate
Dark Mode and Light Mode MUST strictly depend on the website's unique design aesthetic and archetype—**never a generic automated inversion**:
- **Intrinsically Dark Archetypes (e.g. Linear Minimalist, Cyber/Obsidian DevTools)**:
  - **Dark Mode**: Primary state (`#09090b` zinc, obsidian, subtle 1px border glows, vibrant electric blue/indigo accents).
  - **Light Mode**: Thoughtfully tailored Clean Slate palette (`#f8fafc` background, crisp `#0f172a` typography, refined `#e2e8f0` borders), maintaining developer-first precision without blinding glare.
- **Intrinsically Light/Warm Archetypes (e.g. Warm Editorial Journal, Publishing, Monograph)**:
  - **Light Mode**: Primary state (Warm cream parchment `#fcfbf7`, rich charcoal `#1c1917`, ochre/amber `#854d0e` accents).
  - **Dark Mode**: "Midnight Reading Room" theme (Warm espresso/charcoal `#181716`, soft parchment text `#e7e5e4`, warm amber `#d97706`), preserving typographic elegance rather than cold blue-grey.
- **High-Contrast Neo-Brutalist Archetypes**:
  - **Light Mode**: Electric canary yellow (`#fef08a`), heavy 3px solid black outlines, acid lime badges.
  - **Dark Mode**: "Cyber Brutalism" (`#0a0a0a` pitch black background, neon lime `#a3e635` borders, neon yellow text/accents, hard offset white/neon drop shadows).
- **CSS Token Implementation**:
  Every variant's stylesheet MUST explicitly declare both `.theme-dark` and `.theme-light` CSS custom properties in `:root` and `.theme-*` classes so switching the theme toggle in the Arena or Device Studio instantly transforms the design into its authentic, archetype-aligned counterpart.

### 3. Full-Page Website Architecture (Anti-Card / Anti-Toy Ban)
- **STRICT PROHIBITION**: NEVER generate a lone isolated `<div class="card">` centered in a blank void (`body { display: flex; align-items: center; justify-content: center; height: 100vh; }`) when asked for a website, page, or dashboard!
- Every variant MUST be a **complete, immersive, multi-section layout**:
  1. **Global / Sticky Navigation**: Brand logo, links, status badge, primary CTA.
  2. **High-Impact Hero Section**: Eyebrow badge, value proposition, description, dual action buttons, interactive terminal/preview showcase.
  3. **Telemetry & Metrics Bar**: Key proof points, live statistics, or social proof.
  4. **Feature Showcase Grid**: Multi-column responsive cards or interactive tabs demonstrating core capabilities.
  5. **Structured Offerings / Pricing Section**: Comprehensive comparative matrix with clear visual hierarchy.
  6. **Global Footer**: Navigation pillars, system status indicator, and copyright.
- When asked specifically for an **isolated component** (e.g. auth modal, datepicker, filter widget):
  - Place the component within a realistic application shell or ambient canvas background (e.g. subtle dot grid or ambient backdrop glow) so it feels situated in an actual digital product rather than an empty void.

### 4. Formulate 3 to 4 Distinct Design Archetypes:
- **Variant A (Linear / Minimalist Dark):** Ultra-clean monochrome precision, subtle 1px zinc borders (`#27272a`), high typographic density, JetBrains Mono & Inter, frosted glass sticky nav, code terminal preview.
- **Variant B (Warm Editorial Journal):** Refined serifs (Playfair Display / Georgia), warm cream parchment tone (`#fcfbf7`), deep charcoal text (`#1c1917`), ochre/amber accents (`#854d0e`), archival masthead, multi-column reading layout.
- **Variant C (Bold Neo-Brutalist):** High-contrast 3px solid black borders, hard offset drop shadows (`5px 5px 0px #000`), electric canary yellow (`#fef08a`) and acid lime (`#a3e635`), punchy sticker badges, heavyweight typography.
- **Variant D (Ambient Glassmorphic Cyber):** Deep obsidian background (`#030712`), frosted blur panels (`backdrop-filter: blur(16px)`), iridescent violet/cyan gradient glows, illuminated metrics counters.

### 5. Responsive CSS Implementation Requirements:
Every variant's `<style>` MUST include dedicated media queries:
```css
/* Laptop & Desktop adjustments */
@media (max-width: 1280px) { ... }

/* Tablet Reflow */
@media (max-width: 768px) { ... }

/* Mobile (375px) Single Column Fit */
@media (max-width: 480px) { ... }
```

### 6. Design Tokens & AST Extraction:
- Declare all colors, typography, spacing, and border-radii as CSS custom properties in `:root`.
- When the user selects their design in the arena or preview studio, use the extracted `:root` tokens returned by `request_visual_decision` to generate consistent production frontend code!

### 7. Execution Workflow:
1. Analyze user requirements and formulate 3-4 distinct archetypes.
2. Call the MCP tool `request_visual_decision` with standalone executable HTML and CSS for each variant with full multi-device media queries and design-dependent dark/light theme tokens.
3. Wait for the user to review in the browser (`localhost:4200` or `/preview/:id`) and test across Fluid, 1280px, 768px, and 375px frames, toggling Dark/Light mode.
4. Implement the production codebase matching the chosen archetype and extracted tokens.
