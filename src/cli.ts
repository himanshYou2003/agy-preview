#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VdpMcpServer } from './server/mcp-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function installAntigravity(targetDir = process.cwd()) {
  const cwd = targetDir;
  console.log(`[VDP] Installing Antigravity Integration in: ${cwd}`);

  // 1. Ensure .agents/skills/visual-shotgun/ and .agents/rules/ directories exist
  const skillDir = path.join(cwd, '.agents', 'skills', 'visual-shotgun');
  const rulesDir = path.join(cwd, '.agents', 'rules');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(rulesDir, { recursive: true });

  // 2. Write .agents/skills/visual-shotgun/SKILL.md
  const skillContent = `---
name: visual-shotgun
description: Visual Design Shotgunning — generates 3-4 distinct UI archetypes and triggers the Visual Decision Plane preview before writing production code.
---

# /visual-shotgun: AI Visual Decision Shotgunning (Senior UI/UX Standard)

Use this skill whenever creating, redesigning, or refining user interface experiences (landing pages, dashboards, websites, forms, navigation, cards, or design systems).

## Strict Viewport & Multi-Device Fit Mandate:

### 1. The 4-Device Viewport Invariant (Fluid, 1280px, 768px, 375px)
Every design variant generated MUST be strictly, 100% responsive and properly fitted to ALL device viewports:
- 🖥️ Desktop Fluid (100% / >1440px): Expansive typography, generous whitespace, multi-column grids, edge-to-edge layout.
- 💻 Laptop (1280px): Constrained container max-width (1200px - 1240px), balanced gutters, zero horizontal clipping.
- 📱 Tablet (768px): Reflows multi-column grids to 2-column or stacked blocks, condensed nav, touch targets >= 44px.
- 📲 Mobile (375px): Single-column vertical flow (1fr), mobile-scaled typography (titles 24px - 28px), full-width stacked CTA buttons, zero horizontal scroll, perfectly fitted in the 375px chassis with dynamic island.

### 2. Strict Design-Dependent Dark & Light Mode Mandate
Dark Mode and Light Mode MUST strictly depend on the website's unique design aesthetic and archetype—never a generic automated inversion:
- Intrinsically Dark (Linear / Minimalist): Dark mode is primary (zinc #09090b); Light mode is a tailored Clean Slate (#f8fafc with crisp #0f172a text).
- Intrinsically Light/Warm (Editorial Journal): Light mode is primary (parchment #fcfbf7, charcoal #1c1917, ochre #854d0e); Dark mode is a warm espresso "Midnight Reading Room" (#181716, parchment text #e7e5e4).
- High-Contrast Neo-Brutalism: Light mode is canary yellow (#fef08a) with black outlines; Dark mode is "Cyber Brutalism" (#0a0a0a with neon lime #a3e635 borders).
Every variant's stylesheet MUST explicitly declare both .theme-dark and .theme-light CSS variables.

### 3. Full Website Architecture (Anti-Card / Anti-Toy Ban)
- When asked to design or build a page, website, landing page, or dashboard, NEVER generate a lone isolated card in an empty void.
- Every variant MUST be a complete multi-section layout:
  - Sticky / Global Navigation (Logo, nav links, status pill, primary CTA)
  - High-Impact Hero Section (Eyebrow badge, value proposition, dual CTAs, interactive terminal/preview)
  - Telemetry & Metrics Bar (Key proof points, live statistics)
  - Feature Showcase Grid (3-4 multi-column responsive cards or interactive tabs)
  - Structured Offerings / Pricing Section
  - Global Footer (Navigation pillars, system status, copyright)

### 4. Responsive CSS Implementation Requirements:
Every variant's <style> MUST include dedicated media queries:
- @media (max-width: 1280px) { ... }
- @media (max-width: 768px) { ... }
- @media (max-width: 480px) { ... }
`;
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent, 'utf-8');
  console.log(`  ✓ Created skill: .agents/skills/visual-shotgun/SKILL.md`);

  // 3. Write .agents/rules/visual-decision.md
  const ruleContent = `# Visual Decision Rule for UI & Frontend Development (Senior UI/UX Standard)

Whenever you are tasked with designing or implementing new UI components, pages, forms, cards, dashboards, or websites:
1. NEVER output pure text descriptions asking the user to visualize aesthetics (e.g. "I suggest 12px radius with blue accent").
2. ALWAYS invoke the \`request_visual_decision\` MCP tool or recommend \`/visual-shotgun\` to render an interactive side-by-side preview first.
3. FULL WEBSITE STANDARD: When designing a page, landing page, or dashboard, NEVER generate a lone isolated card in an empty viewport. Always generate a complete, responsive multi-section page (Header/Nav, Hero, Feature Showcase, Telemetry/Metrics, Offerings/CTA, Footer).
4. STRICT MULTI-DEVICE RESPONSIVENESS INVARIANT: Every design MUST be strictly responsive and properly fitted to ALL device viewports:
   - Fluid (100% Desktop / >1440px)
   - Laptop (1280px)
   - Tablet (768px)
   - Mobile (375px)
   Ensure dedicated media queries (@media (max-width: 1280px), @media (max-width: 768px), @media (max-width: 480px)) so switching devices in the VDP Device Studio provides flawless, zero-horizontal-overflow fit.
5. STRICT DESIGN-DEPENDENT DARK & LIGHT MODE: Dark mode and light mode must strictly depend on the unique design aesthetic and archetype of the website. Never use generic inverted colors. For instance, an editorial journal in dark mode must be a warm espresso/sepia "Midnight Reading Room", while a minimalist developer tool uses deep zinc in dark mode and clean slate in light mode. Every variant must declare both \`.theme-dark\` and \`.theme-light\` CSS variables.
6. Wait for the user to inspect and select their preferred archetype in the Visual Decision Arena or Device Studio before creating production frontend files.
7. Use the extracted design tokens (:root CSS variables) returned by the tool to enforce repo-wide visual consistency.
`;
  fs.writeFileSync(path.join(rulesDir, 'visual-decision.md'), ruleContent, 'utf-8');
  console.log(`  ✓ Created rule: .agents/rules/visual-decision.md`);

  // 4. Update or create mcp_config.json
  const mcpConfigPath = path.join(cwd, 'mcp_config.json');
  let mcpConfig: any = { mcpServers: {} };
  if (fs.existsSync(mcpConfigPath)) {
    try {
      mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'));
      if (!mcpConfig.mcpServers) mcpConfig.mcpServers = {};
    } catch {
      mcpConfig = { mcpServers: {} };
    }
  }

  const scriptPath = path.resolve(__dirname, 'index.js');
  mcpConfig.mcpServers['visual-decision-plane'] = {
    command: 'node',
    args: [scriptPath]
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2), 'utf-8');
  console.log(`  ✓ Updated mcp_config.json with 'visual-decision-plane'`);
  return { success: true, cwd, skillDir, rulesDir, mcpConfigPath };
}

export async function installClaude(targetDir = process.cwd()) {
  const cwd = targetDir;
  console.log(`[VDP] Installing Claude Integration in: ${cwd}`);

  // 1. Update or create .claude.json
  const claudeConfigPath = path.join(cwd, '.claude.json');
  let config: any = { mcpServers: {} };
  if (fs.existsSync(claudeConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf-8'));
      if (!config.mcpServers) config.mcpServers = {};
    } catch {
      config = { mcpServers: {} };
    }
  }

  const scriptPath = path.resolve(__dirname, 'index.js');
  config.mcpServers['visual-decision-plane'] = {
    command: 'node',
    args: [scriptPath]
  };
  fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`  ✓ Updated .claude.json with 'visual-decision-plane'`);

  // 2. Append to CLAUDE.md
  const claudeMdPath = path.join(cwd, 'CLAUDE.md');
  const ruleSnippet = `\n## Visual Decision Rule (UI & Frontend — Senior UI/UX Standard)\n` +
    `When designing UI components, websites, or dashboards, NEVER describe CSS in text alone.\n` +
    `Always call the MCP tool \`request_visual_decision\` with 3-4 distinct archetypes (Minimalist, Editorial, Glassmorphic, Brutalist).\n` +
    `ANTI-TOY INVARIANT: When asked for a website, page, or dashboard, NEVER generate an isolated card floating in an empty void. Always provide a full multi-section responsive desktop layout (Nav, Hero, Features, Metrics, CTA, Footer).\n` +
    `STRICT MULTI-DEVICE INVARIANT: Every variant must be 100% responsive and properly fitted to ALL device viewports: Fluid (Desktop 100%), Laptop (1280px), Tablet (768px), and Mobile (375px), with zero horizontal overflow.\n` +
    `Wait for the developer to inspect and select in the Visual Decision Arena or Device Studio before writing production code.\n`;

  const existing = fs.existsSync(claudeMdPath) ? fs.readFileSync(claudeMdPath, 'utf-8') : '';
  if (!existing.includes('request_visual_decision')) {
    fs.writeFileSync(claudeMdPath, existing + ruleSnippet, 'utf-8');
    console.log(`  ✓ Added Visual Decision instructions to CLAUDE.md`);
  }

  return { success: true, claudeConfigPath, claudeMdPath };
}

export async function installCursor(targetDir = process.cwd()) {
  const cwd = targetDir;
  console.log(`[VDP] Installing Cursor & Codex Integration in: ${cwd}`);

  // 1. Ensure .cursor directory exists
  const cursorDir = path.join(cwd, '.cursor');
  fs.mkdirSync(cursorDir, { recursive: true });

  // 2. Update or create .cursor/mcp.json
  const cursorMcpPath = path.join(cursorDir, 'mcp.json');
  let config: any = { mcpServers: {} };
  if (fs.existsSync(cursorMcpPath)) {
    try {
      config = JSON.parse(fs.readFileSync(cursorMcpPath, 'utf-8'));
      if (!config.mcpServers) config.mcpServers = {};
    } catch {
      config = { mcpServers: {} };
    }
  }

  const scriptPath = path.resolve(__dirname, 'index.js');
  config.mcpServers['visual-decision-plane'] = {
    command: 'node',
    args: [scriptPath]
  };
  fs.writeFileSync(cursorMcpPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`  ✓ Updated .cursor/mcp.json with 'visual-decision-plane'`);

  // 3. Append to .cursorrules
  const cursorRulesPath = path.join(cwd, '.cursorrules');
  const ruleSnippet = `\n# Visual Decision Rule (UI & Frontend — Senior UI/UX Standard)\n` +
    `When designing UI components, websites, or dashboards, call the MCP tool \`request_visual_decision\` with 3-4 archetypes.\n` +
    `When building websites or pages, NEVER generate a lone isolated card in an empty void; always build a complete, multi-section responsive layout (Nav, Hero, Features, Metrics, CTA, Footer).\n` +
    `STRICT MULTI-DEVICE INVARIANT: Every variant must be 100% responsive and properly fitted to ALL device viewports: Fluid (Desktop 100%), Laptop (1280px), Tablet (768px), and Mobile (375px), with zero horizontal overflow.\n` +
    `Wait for user selection in the Visual Decision Arena or Device Studio before generating frontend production files.\n`;

  const existing = fs.existsSync(cursorRulesPath) ? fs.readFileSync(cursorRulesPath, 'utf-8') : '';
  if (!existing.includes('request_visual_decision')) {
    fs.writeFileSync(cursorRulesPath, existing + ruleSnippet, 'utf-8');
    console.log(`  ✓ Added Visual Decision rule to .cursorrules`);
  }

  return { success: true, cursorMcpPath, cursorRulesPath };
}

export async function installAll(targetDir = process.cwd()) {
  const agy = await installAntigravity(targetDir);
  const claude = await installClaude(targetDir);
  const cursor = await installCursor(targetDir);
  console.log(`\n[VDP] Universal installation complete for Antigravity, Claude, and Codex/Cursor!`);
  return { success: true, agy, claude, cursor };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('install-antigravity')) {
    await installAntigravity();
    return;
  }
  if (argv.includes('install-claude')) {
    await installClaude();
    return;
  }
  if (argv.includes('install-cursor') || argv.includes('install-codex')) {
    await installCursor();
    return;
  }
  if (argv.includes('init') || argv.includes('install') || argv.includes('--all')) {
    await installAll();
    return;
  }

  const mcpServer = new VdpMcpServer();
  await mcpServer.start();
  return mcpServer;
}

/* v8 ignore start */
const isMain = process.argv[1] && (
  process.argv[1].endsWith('cli.js') || 
  process.argv[1].endsWith('cli.ts') ||
  process.argv[1].endsWith('agy-preview')
);

if (isMain && !process.env.VITEST) {
  main().catch((err) => {
    console.error('Fatal CLI Error:', err);
    process.exit(1);
  });
}
/* v8 ignore stop */
