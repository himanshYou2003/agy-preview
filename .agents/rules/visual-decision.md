# Visual Decision Rule for UI & Frontend Development (Senior UI/UX Standard)

Whenever you are tasked with designing or implementing new UI components, pages, forms, cards, dashboards, or websites:
1. NEVER output pure text descriptions asking the user to visualize aesthetics (e.g. "I suggest 12px radius with blue accent").
2. ALWAYS invoke the `request_visual_decision` MCP tool or recommend `/visual-shotgun` to render an interactive side-by-side preview first.
3. FULL WEBSITE STANDARD: When designing a page, landing page, or dashboard, NEVER generate a lone isolated card in an empty viewport. Always generate a complete, responsive multi-section page (Header/Nav, Hero, Feature Showcase, Telemetry/Metrics, Offerings/CTA, Footer).
4. STRICT MULTI-DEVICE RESPONSIVENESS INVARIANT: Every design MUST be strictly responsive and properly fitted to ALL device viewports:
   - Fluid (100% Desktop / >1440px)
   - Laptop (1280px)
   - Tablet (768px)
   - Mobile (375px)
   Ensure dedicated media queries (@media (max-width: 1280px), @media (max-width: 768px), @media (max-width: 480px)) so switching devices in the VDP Device Studio provides flawless, zero-horizontal-overflow fit.
5. STRICT DESIGN-DEPENDENT DARK & LIGHT MODE: Dark mode and light mode must strictly depend on the unique design aesthetic and archetype of the website. Never use generic inverted colors. For instance, an editorial journal in dark mode must be a warm espresso/sepia "Midnight Reading Room", while a minimalist developer tool uses deep zinc in dark mode and clean slate in light mode. Every variant must declare both `.theme-dark` and `.theme-light` CSS variables.
6. Wait for the user to inspect and select their preferred archetype in the Visual Decision Arena or Device Studio before creating production frontend files.
7. Use the extracted design tokens (:root CSS variables) returned by the tool to enforce repo-wide visual consistency.
