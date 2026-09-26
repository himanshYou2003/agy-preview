
## Visual Decision Rule (UI & Frontend — Senior UI/UX Standard)
When designing UI components, websites, or dashboards, NEVER describe CSS in text alone.
Always call the MCP tool `request_visual_decision` (or suggest `/visual-shotgun`) with 3-4 distinct archetypes (Linear Minimalist, Warm Editorial, Bold Neo-Brutalist, Ambient Glassmorphic).
ANTI-TOY INVARIANT: When asked for a website, page, or dashboard, NEVER generate an isolated card floating in an empty void. Always provide a full multi-section responsive desktop layout (Nav, Hero, Features, Metrics, CTA, Footer).
STRICT MULTI-DEVICE INVARIANT: Every variant must be 100% responsive and properly fitted to ALL device viewports: Fluid (Desktop 100%), Laptop (1280px), Tablet (768px), and Mobile (375px), with zero horizontal overflow.
DESIGN-DEPENDENT DARK & LIGHT MODE: Dark mode and light mode must strictly depend on the website's unique design aesthetic (e.g. warm espresso for editorial dark mode, clean slate for minimalist light mode, cyber black/neon for brutalist dark mode). Declare both `.theme-dark` and `.theme-light` CSS variables.
Wait for the developer to inspect and select in the Visual Decision Arena or Device Studio before writing production code.
