#!/usr/bin/env node
import { VdpMcpServer } from '../dist/server/mcp-server.js';

console.log('='.repeat(70));
console.log('  🚀 LAUNCHING VISUAL DECISION PLANE (VDP) MANUAL TEST ARENA');
console.log('='.repeat(70));
console.log('\n[1] Starting local server & WebSocket gateway...');
console.log('[2] Opening your default browser automatically...');
console.log('[3] Waiting for you to test & select a design archetype in the Arena...\n');

const mcpServer = new VdpMcpServer();

const sampleRequest = {
  prompt: 'Design a High-Converting Desktop & Multi-Device Responsive Landing Page for an Autonomous Developer Platform',
  context: 'Antigravity AI Agent Full Website & UI Architecture Phase',
  variants: [
    {
      id: 'variant-a',
      name: 'Linear Dark Minimalist',
      archetype: 'minimalist',
      description: 'Ultra-clean monochrome precision, subtle 1px zinc borders, JetBrains Mono & Inter typography with tailored Dark & Clean Slate Light themes.',
      html: `
        <div class="site-wrapper">
          <!-- Global Navigation -->
          <header class="navbar">
            <div class="nav-container">
              <div class="brand">
                <span class="brand-icon">⚡</span>
                <span class="brand-name">SYNAPSE</span>
                <span class="status-pill">ENGINE v2.4</span>
              </div>
              <nav class="nav-links">
                <a href="#architecture">Architecture</a>
                <a href="#benchmarks">Benchmarks</a>
                <a href="#ecosystem">Ecosystem</a>
                <a href="#docs">Docs</a>
              </nav>
              <div class="nav-actions">
                <span class="github-badge">★ 14.8k</span>
                <button class="nav-cta-btn">Deploy Fleet</button>
              </div>
            </div>
          </header>

          <!-- Hero Section -->
          <section class="hero-section">
            <div class="hero-container">
              <div class="hero-eyebrow">
                <span class="pulse-dot"></span>
                <span>AUTONOMOUS AGENT RUNTIME · ZERO AI SLOP</span>
              </div>
              <h1 class="hero-title">Autonomous Engineering at <span class="gradient-text">Silicon Velocity</span></h1>
              <p class="hero-subtitle">
                Deploy intelligent AI agent fleets that write production-grade code, enforce strict 100% test coverage, and execute live visual decisions directly in your browser.
              </p>
              <div class="hero-cta-group">
                <button class="primary-cta-btn">Deploy Autonomous Stack</button>
                <button class="secondary-cta-btn">Explore Live Benchmarks ➔</button>
              </div>

              <!-- Interactive Simulated Terminal Showcase -->
              <div class="terminal-showcase">
                <div class="terminal-header">
                  <div class="terminal-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                  </div>
                  <div class="terminal-title">synapse-agent-daemon // live-ast-stream</div>
                  <div class="terminal-latency">⚡ Latency: 4.2ms</div>
                </div>
                <div class="terminal-body">
                  <div class="term-line"><span class="term-dim">01</span> <span class="term-kw">import</span> { VdpMcpServer } <span class="term-kw">from</span> <span class="term-str">'@synapse/visual-plane'</span>;</div>
                  <div class="term-line"><span class="term-dim">02</span> <span class="term-kw">const</span> runtime = <span class="term-kw">await</span> Synapse.bootstrapFleet({ coverage: <span class="term-num">1.00</span> });</div>
                  <div class="term-line"><span class="term-dim">03</span> <span class="term-comment">// Visual Decision Stream connected to localhost:4200</span></div>
                  <div class="term-line term-success"><span class="term-dim">04</span> ✓ 56/56 Tests Passing (100% Statements, 100% Branches, 100% Functions)</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Telemetry Metrics Bar -->
          <section class="metrics-section">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">4.2×</div>
                <div class="metric-label">Faster Production Ships</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">99.999%</div>
                <div class="metric-label">WebSocket Gateway Uptime</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">0%</div>
                <div class="metric-label">AI Slop · 100% Strict Coverage</div>
              </div>
            </div>
          </section>

          <!-- Core Capability Grid -->
          <section class="features-section">
            <div class="section-header">
              <div class="section-tag">CAPABILITIES</div>
              <h2 class="section-title">Engineered for Sovereign Developers</h2>
            </div>
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3 class="feature-heading">Sub-millisecond AST Engine</h3>
                <p class="feature-desc">Extract CSS tokens, type trees, and responsive media queries directly into your codebase instantly.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🖥️</div>
                <h3 class="feature-heading">Visual Decision Arena</h3>
                <p class="feature-desc">Compare 4 distinct design archetypes side-by-side with full desktop fidelity and real-device frames.</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🛡️</div>
                <h3 class="feature-heading">Ironclad Guardrails</h3>
                <p class="feature-desc">Zero hallucinated imports. Parameterized SQL queries, boundary validation, and isolated git freeze barriers.</p>
              </div>
            </div>
          </section>

          <!-- Global Footer -->
          <footer class="footer">
            <div class="footer-container">
              <div class="footer-brand">
                <span class="brand-icon">⚡</span>
                <span class="brand-name">SYNAPSE SYSTEMS</span>
                <span class="footer-copy">© 2026 Synapse Engineering Corp. All rights reserved.</span>
              </div>
              <div class="footer-status">
                <span class="pulse-dot"></span>
                <span>All Global Nodes Operational</span>
              </div>
            </div>
          </footer>
        </div>
      `,
      css: `
        :root, .theme-dark {
          --color-bg: #09090b;
          --color-surface: #121215;
          --color-surface-hover: #18181c;
          --color-primary: #3b82f6;
          --color-primary-hover: #2563eb;
          --color-text: #fafafa;
          --color-text-muted: #a1a1aa;
          --color-border: #27272a;
          --color-border-glow: rgba(59, 130, 246, 0.3);
          --nav-bg: rgba(9, 9, 11, 0.85);
          --metrics-bg: rgba(18, 18, 21, 0.4);
          --footer-bg: #0c0c0e;
          --font-sans: 'Inter', -apple-system, system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        }
        .theme-light {
          --color-bg: #f8fafc;
          --color-surface: #ffffff;
          --color-surface-hover: #f1f5f9;
          --color-primary: #2563eb;
          --color-primary-hover: #1d4ed8;
          --color-text: #0f172a;
          --color-text-muted: #64748b;
          --color-border: #e2e8f0;
          --color-border-glow: rgba(37, 99, 235, 0.2);
          --nav-bg: rgba(248, 250, 252, 0.88);
          --metrics-bg: rgba(241, 245, 249, 0.7);
          --footer-bg: #f1f5f9;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--font-sans);
          background-color: var(--color-bg);
          color: var(--color-text);
          min-height: 100vh;
          width: 100%;
          line-height: 1.6;
          overflow-x: hidden;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .site-wrapper { width: 100%; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
        
        /* Navbar */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--nav-bg);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
          width: 100%;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .nav-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; }
        .brand-icon { color: var(--color-primary); font-size: 16px; }
        .status-pill { font-size: 10px; font-family: var(--font-mono); background: rgba(59, 130, 246, 0.1); color: var(--color-primary); border: 1px solid rgba(59, 130, 246, 0.25); padding: 2px 7px; border-radius: 999px; }
        .nav-links { display: flex; gap: 24px; }
        .nav-links a { color: var(--color-text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.15s; }
        .nav-links a:hover { color: var(--color-text); }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .github-badge { font-size: 12px; color: var(--color-text-muted); background: var(--color-surface); border: 1px solid var(--color-border); padding: 4px 10px; border-radius: 6px; }
        .nav-cta-btn { background: var(--color-primary); color: #fff; font-size: 13px; font-weight: 600; padding: 7px 15px; border-radius: 6px; border: none; cursor: pointer; transition: background 0.15s; }
        .nav-cta-btn:hover { background: var(--color-primary-hover); }

        /* Hero */
        .hero-section { padding: 70px 24px 40px; width: 100%; display: flex; justify-content: center; }
        .hero-container { max-width: 960px; width: 100%; text-align: center; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-family: var(--font-mono); color: var(--color-primary); background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); padding: 4px 12px; border-radius: 999px; margin-bottom: 24px; }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
        .hero-title { font-size: 48px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 20px; }
        .gradient-text { background: linear-gradient(135deg, #60a5fa, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 17px; color: var(--color-text-muted); max-width: 680px; margin: 0 auto 32px; line-height: 1.6; }
        .hero-cta-group { display: flex; justify-content: center; gap: 14px; margin-bottom: 48px; }
        .primary-cta-btn { background: var(--color-primary); color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35); }
        .primary-cta-btn:hover { background: var(--color-primary-hover); transform: translateY(-1px); }
        .secondary-cta-btn { background: var(--color-surface); color: var(--color-text); font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; border: 1px solid var(--color-border); cursor: pointer; transition: all 0.15s ease; }
        .secondary-cta-btn:hover { background: var(--color-surface-hover); border-color: #94a3b8; }

        /* Terminal Showcase */
        .terminal-showcase { background: #0c0c0e; border: 1px solid var(--color-border); border-radius: 12px; text-align: left; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.4); max-width: 820px; margin: 0 auto; }
        .terminal-header { background: #141418; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; }
        .terminal-dots { display: flex; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ef4444; } .dot.yellow { background: #eab308; } .dot.green { background: #22c55e; }
        .terminal-title { font-family: var(--font-mono); font-size: 11px; color: #a1a1aa; }
        .terminal-latency { font-family: var(--font-mono); font-size: 11px; color: #10b981; }
        .terminal-body { padding: 20px; font-family: var(--font-mono); font-size: 13px; line-height: 1.7; overflow-x: auto; color: #fafafa; }
        .term-line { display: flex; gap: 12px; white-space: nowrap; }
        .term-dim { color: #52525b; user-select: none; }
        .term-kw { color: #60a5fa; }
        .term-str { color: #34d399; }
        .term-num { color: #f472b6; }
        .term-comment { color: #71717a; font-style: italic; }
        .term-success { color: #10b981; font-weight: 600; }

        /* Metrics */
        .metrics-section { padding: 30px 24px; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); background: var(--metrics-bg); transition: background-color 0.2s ease; }
        .metrics-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: center; }
        .metric-value { font-size: 38px; font-weight: 800; color: var(--color-text); letter-spacing: -0.02em; }
        .metric-label { font-size: 13px; color: var(--color-text-muted); font-weight: 500; margin-top: 4px; }

        /* Features */
        .features-section { padding: 70px 24px; max-width: 1200px; margin: 0 auto; width: 100%; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-tag { font-family: var(--font-mono); font-size: 11px; color: var(--color-primary); letter-spacing: 0.1em; font-weight: 700; margin-bottom: 10px; }
        .section-title { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 28px; transition: all 0.2s ease; }
        .feature-card:hover { transform: translateY(-3px); border-color: var(--color-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .feature-icon { font-size: 24px; margin-bottom: 16px; }
        .feature-heading { font-size: 17px; font-weight: 600; margin-bottom: 10px; }
        .feature-desc { font-size: 14px; color: var(--color-text-muted); line-height: 1.6; }

        /* Footer */
        .footer { margin-top: auto; border-top: 1px solid var(--color-border); padding: 24px; background: var(--footer-bg); transition: background-color 0.2s ease; }
        .footer-container { max-width: 1240px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-brand { display: flex; align-items: center; gap: 12px; font-size: 13px; }
        .footer-copy { color: var(--color-text-muted); font-size: 12px; margin-left: 12px; }
        .footer-status { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); }

        /* Strict Multi-Device Viewport Fit */
        @media (max-width: 1280px) {
          .nav-container, .hero-container, .features-section, .footer-container { max-width: 1140px; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hero-section { padding: 48px 20px 32px; }
          .hero-title { font-size: 34px; }
          .hero-subtitle { font-size: 15px; }
          .metrics-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
          .features-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .nav-container { padding: 12px 16px; }
          .github-badge { display: none; }
          .nav-cta-btn { padding: 6px 12px; font-size: 12px; }
          .hero-section { padding: 36px 16px 24px; }
          .hero-title { font-size: 26px; line-height: 1.2; }
          .hero-subtitle { font-size: 14px; margin-bottom: 24px; }
          .hero-cta-group { flex-direction: column; width: 100%; gap: 10px; margin-bottom: 32px; }
          .primary-cta-btn, .secondary-cta-btn { width: 100%; padding: 12px; font-size: 13px; }
          .terminal-showcase { border-radius: 8px; }
          .terminal-body { font-size: 11px; padding: 14px 10px; }
          .metrics-grid { grid-template-columns: 1fr; gap: 14px; }
          .metric-value { font-size: 30px; }
          .features-section { padding: 40px 16px; }
          .section-title { font-size: 24px; }
          .footer-container { flex-direction: column; gap: 12px; text-align: center; }
          .footer-brand { flex-direction: column; gap: 6px; }
          .footer-copy { margin-left: 0; }
        }
      `
    },
    {
      id: 'variant-b',
      name: 'Warm Editorial Journal',
      archetype: 'editorial',
      description: 'Refined serif headlines, warm cream parchment tone with tailored Warm Light & Midnight Reading Room Dark themes.',
      html: `
        <div class="editorial-site">
          <!-- Archival Masthead -->
          <header class="masthead">
            <div class="masthead-issue-bar">
              <span>VOL. IV · NO. 1</span>
              <span class="masthead-center-note">AN INTERNATIONAL REVIEW OF SOFTWARE ARTISTRY</span>
              <span>OCTOBER 2026</span>
            </div>
            <div class="masthead-main">
              <h1 class="publication-title">The Autonomous Atelier</h1>
              <p class="publication-tagline">A Timeless Environment for Thoughtful Software Artisans</p>
            </div>
            <nav class="masthead-nav">
              <a href="#monographs">Monographs</a>
              <a href="#essays">Critical Essays</a>
              <a href="#manifesto">The Atelier Manifesto</a>
              <a href="#patronage">Patronage</a>
              <a href="#reading-room" class="nav-highlight">Enter Reading Room ➔</a>
            </nav>
          </header>

          <!-- Featured Lead Article -->
          <main class="main-content">
            <article class="lead-monograph">
              <div class="lead-eyebrow">ESSAY IN EMPIRICAL ARCHITECTURE</div>
              <h2 class="lead-title">The Death of Boilerplate: How Autonomous Synthesis Restores the Human Craft</h2>
              <div class="lead-meta">
                <span class="author">By Jonathan Vance, Master Artisan</span>
                <span class="separator">·</span>
                <span class="read-time">14 minute reading</span>
              </div>
              <blockquote class="lead-pullquote">
                "Craftsmanship in software is not the stubborn resistance to mechanical acceleration. It is the uncompromising devotion to beauty, precision, and architectural truth once the mundane is dissolved."
              </blockquote>
              <div class="lead-columns">
                <p>
                  For three decades, the digital artisan spent eighty percent of creative energy wrestling with repetitive scaffold, mundane syntax transformations, and trivial build orchestration. The modern AI synthesis engine has permanently inverted this equation.
                </p>
                <p>
                  In the Autonomous Atelier, code is treated not as disposable ephemeral script, but as permanent civic architecture. Every design token is cataloged with archival rigor; every interface archetype is tested across responsive chambers before entering the permanent record.
                </p>
              </div>
              <div class="monograph-cta-bar">
                <button class="atelier-btn-primary">Read The Complete Monograph</button>
                <button class="atelier-btn-ghost">Add to Archival Binder</button>
              </div>
            </article>

            <!-- Curated Three-Column Collection -->
            <section class="monograph-collection">
              <div class="collection-header">
                <h3>CURATED EDITIONS & MONOGRAPHS</h3>
                <div class="header-line"></div>
              </div>
              <div class="collection-grid">
                <div class="article-card">
                  <div class="card-num">I</div>
                  <h4 class="card-title">Warm Geometry & Human Touch</h4>
                  <p class="card-excerpt">Why tactile, high-contrast typography and parchment hues outlive the transient neon trends of consumer software.</p>
                  <a href="#read" class="card-link">Inspect Folio ➔</a>
                </div>
                <div class="article-card">
                  <div class="card-num">II</div>
                  <h4 class="card-title">The Hundred-Year Codebase</h4>
                  <p class="card-excerpt">Architectural patterns designed to endure operating system churn, runtime shifts, and paradigm transitions.</p>
                  <a href="#read" class="card-link">Inspect Folio ➔</a>
                </div>
                <div class="article-card">
                  <div class="card-num">III</div>
                  <h4 class="card-title">Visual Shotgun Methodology</h4>
                  <p class="card-excerpt">Generating parallel design archetypes simultaneously to expose latent product possibilities before locking tokens.</p>
                  <a href="#read" class="card-link">Inspect Folio ➔</a>
                </div>
              </div>
            </section>

            <!-- Patronage Tiers -->
            <section class="patronage-section">
              <div class="patronage-box">
                <div class="patronage-header">
                  <h3>Sustain The Guild</h3>
                  <p>Support independent architectural criticism and autonomous tool development.</p>
                </div>
                <div class="patronage-grid">
                  <div class="tier-card">
                    <div class="tier-name">The Artisan Fellow</div>
                    <div class="tier-price">$28<span> / month</span></div>
                    <ul class="tier-perks">
                      <li>✓ Complete archival library access</li>
                      <li>✓ Printed quarterly monograph folio</li>
                      <li>✓ Private guild symposiums</li>
                    </ul>
                    <button class="tier-btn">Subscribe as Fellow</button>
                  </div>
                  <div class="tier-card featured">
                    <div class="tier-name">The Master Patron</div>
                    <div class="tier-price">$64<span> / month</span></div>
                    <ul class="tier-perks">
                      <li>✓ Everything in Fellow tier</li>
                      <li>✓ Direct design critique from editors</li>
                      <li>✓ Exclusive token AST toolchains</li>
                    </ul>
                    <button class="tier-btn primary">Enroll as Master Patron</button>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <!-- Colophon Footer -->
          <footer class="colophon">
            <div class="colophon-inner">
              <div class="colophon-text">
                <strong>THE AUTONOMOUS ATELIER</strong> — Published monthly from Cambridge & San Francisco. Typeset in Playfair Display & Georgia.
              </div>
              <div class="colophon-links">
                <a href="#privacy">Archive Rights</a>
                <a href="#ethics">Architectural Ethics</a>
                <a href="#contact">Dispatch</a>
              </div>
            </div>
          </footer>
        </div>
      `,
      css: `
        :root, .theme-light {
          --color-bg: #fcfbf7;
          --color-surface: #ffffff;
          --color-primary: #854d0e;
          --color-primary-dark: #713f12;
          --color-text: #1c1917;
          --color-text-muted: #78716c;
          --color-border: #e7e5e4;
          --quote-bg: #fafaf9;
          --patronage-bg: #f5f5f4;
          --masthead-bg: #ffffff;
          --colophon-bg: #ffffff;
          --font-serif: 'Playfair Display', Georgia, serif;
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .theme-dark {
          --color-bg: #181716;
          --color-surface: #22201e;
          --color-primary: #d97706;
          --color-primary-dark: #b45309;
          --color-text: #f5f5f4;
          --color-text-muted: #a8a29e;
          --color-border: #383533;
          --quote-bg: #292725;
          --patronage-bg: #22201e;
          --masthead-bg: #181716;
          --colophon-bg: #181716;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--font-sans);
          background-color: var(--color-bg);
          color: var(--color-text);
          min-height: 100vh;
          width: 100%;
          line-height: 1.65;
          overflow-x: hidden;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .editorial-site { width: 100%; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }

        /* Masthead */
        .masthead { border-bottom: 2px solid var(--color-text); padding: 18px 32px; background: var(--masthead-bg); transition: background-color 0.2s ease, border-color 0.2s ease; }
        .masthead-issue-bar { display: flex; justify-content: space-between; font-size: 11px; letter-spacing: 0.15em; font-weight: 600; color: var(--color-text-muted); border-bottom: 1px solid var(--color-border); padding-bottom: 10px; margin-bottom: 20px; }
        .masthead-main { text-align: center; margin-bottom: 20px; }
        .publication-title { font-family: var(--font-serif); font-size: 46px; font-weight: 700; letter-spacing: -0.01em; color: var(--color-text); }
        .publication-tagline { font-family: var(--font-serif); font-style: italic; font-size: 15px; color: var(--color-text-muted); margin-top: 4px; }
        .masthead-nav { display: flex; justify-content: center; gap: 32px; border-top: 1px solid var(--color-border); padding-top: 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; }
        .masthead-nav a { color: var(--color-text); text-decoration: none; transition: color 0.15s; }
        .masthead-nav a:hover { color: var(--color-primary); }
        .masthead-nav a.nav-highlight { color: var(--color-primary); }

        /* Lead Article */
        .main-content { max-width: 1140px; margin: 0 auto; padding: 48px 24px; width: 100%; }
        .lead-monograph { background: var(--color-surface); border: 1px solid var(--color-border); padding: 48px 56px; margin-bottom: 56px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); transition: background-color 0.2s ease, border-color 0.2s ease; }
        .lead-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: var(--color-primary); margin-bottom: 14px; }
        .lead-title { font-family: var(--font-serif); font-size: 38px; line-height: 1.25; margin-bottom: 16px; font-weight: 600; }
        .lead-meta { font-size: 13px; color: var(--color-text-muted); margin-bottom: 28px; font-style: italic; }
        .lead-meta .separator { margin: 0 8px; }
        .lead-pullquote { font-family: var(--font-serif); font-size: 20px; font-style: italic; color: var(--color-text); border-left: 3px solid var(--color-primary); padding: 8px 24px; margin-bottom: 32px; line-height: 1.5; background: var(--quote-bg); }
        .lead-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; font-size: 15px; line-height: 1.8; color: var(--color-text); margin-bottom: 36px; }
        .monograph-cta-bar { display: flex; gap: 16px; }
        .atelier-btn-primary { background: var(--color-text); color: var(--color-bg); padding: 12px 24px; border: none; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; cursor: pointer; border-radius: 2px; }
        .atelier-btn-primary:hover { background: var(--color-primary); color: #fff; }
        .atelier-btn-ghost { background: transparent; color: var(--color-text); border: 1px solid var(--color-border); padding: 12px 24px; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 2px; }
        .atelier-btn-ghost:hover { background: var(--quote-bg); }

        /* Collection Grid */
        .monograph-collection { margin-bottom: 56px; }
        .collection-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
        .collection-header h3 { font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: var(--color-text-muted); white-space: nowrap; }
        .header-line { width: 100%; height: 1px; background: var(--color-border); }
        .collection-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .article-card { background: var(--color-surface); border: 1px solid var(--color-border); padding: 32px 24px; position: relative; transition: background-color 0.2s ease, border-color 0.2s ease; }
        .card-num { font-family: var(--font-serif); font-size: 20px; color: var(--color-primary); margin-bottom: 12px; font-weight: bold; }
        .card-title { font-family: var(--font-serif); font-size: 20px; line-height: 1.35; margin-bottom: 12px; }
        .card-excerpt { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; margin-bottom: 20px; }
        .card-link { font-size: 12px; font-weight: 700; color: var(--color-primary); text-decoration: none; letter-spacing: 0.05em; }

        /* Patronage */
        .patronage-box { background: var(--patronage-bg); border: 1px solid var(--color-border); padding: 40px; border-radius: 4px; text-align: center; }
        .patronage-header h3 { font-family: var(--font-serif); font-size: 28px; margin-bottom: 8px; }
        .patronage-header p { font-size: 14px; color: var(--color-text-muted); margin-bottom: 32px; }
        .patronage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; max-width: 820px; margin: 0 auto; text-align: left; }
        .tier-card { background: var(--color-surface); border: 1px solid var(--color-border); padding: 32px; border-radius: 4px; }
        .tier-card.featured { border-color: var(--color-primary); box-shadow: 0 4px 20px rgba(217, 119, 6, 0.15); }
        .tier-name { font-size: 16px; font-weight: 700; margin-bottom: 8px; font-family: var(--font-serif); }
        .tier-price { font-size: 32px; font-weight: 400; font-family: var(--font-serif); margin-bottom: 16px; }
        .tier-price span { font-size: 14px; color: var(--color-text-muted); }
        .tier-perks { list-style: none; margin-bottom: 24px; font-size: 13px; color: var(--color-text-muted); line-height: 2; }
        .tier-btn { width: 100%; padding: 12px; border: 1px solid var(--color-text); background: transparent; color: var(--color-text); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; }
        .tier-btn.primary { background: var(--color-text); color: var(--color-bg); }
        .tier-btn.primary:hover { background: var(--color-primary); color: #fff; }

        /* Colophon */
        .colophon { margin-top: auto; border-top: 1px solid var(--color-border); padding: 28px 32px; background: var(--colophon-bg); }
        .colophon-inner { max-width: 1140px; margin: 0 auto; display: flex; justify-content: space-between; font-size: 12px; color: var(--color-text-muted); }
        .colophon-links { display: flex; gap: 20px; }
        .colophon-links a { color: inherit; text-decoration: none; }

        /* Strict Multi-Device Viewport Fit */
        @media (max-width: 1280px) {
          .main-content, .colophon-inner { max-width: 1080px; }
        }
        @media (max-width: 768px) {
          .masthead { padding: 16px 20px; }
          .publication-title { font-size: 36px; }
          .masthead-nav { gap: 16px; font-size: 12px; flex-wrap: wrap; }
          .main-content { padding: 32px 16px; }
          .lead-monograph { padding: 32px 24px; }
          .lead-title { font-size: 28px; }
          .lead-columns { grid-template-columns: 1fr; gap: 20px; }
          .collection-grid { grid-template-columns: 1fr; }
          .patronage-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .masthead { padding: 12px 14px; }
          .masthead-issue-bar { flex-direction: column; gap: 4px; text-align: center; font-size: 10px; }
          .masthead-center-note { display: none; }
          .publication-title { font-size: 24px; }
          .publication-tagline { font-size: 12px; }
          .masthead-nav { display: none; }
          .main-content { padding: 20px 12px; }
          .lead-monograph { padding: 20px 14px; margin-bottom: 28px; }
          .lead-title { font-size: 22px; line-height: 1.3; }
          .lead-pullquote { font-size: 14px; padding: 8px 12px; }
          .monograph-cta-bar { flex-direction: column; width: 100%; gap: 10px; }
          .atelier-btn-primary, .atelier-btn-ghost { width: 100%; text-align: center; }
          .patronage-box { padding: 20px 14px; }
          .tier-card { padding: 20px 14px; }
          .tier-price { font-size: 26px; }
          .colophon { padding: 20px 14px; }
          .colophon-inner { flex-direction: column; gap: 12px; text-align: center; }
          .colophon-links { justify-content: center; }
        }
      `
    },
    {
      id: 'variant-c',
      name: 'Bold Neo-Brutalist',
      archetype: 'brutalist',
      description: 'High-contrast 3px borders, offset hard drop shadows with Canary Yellow Light & Cyber Brutalist Dark themes.',
      html: `
        <div class="brutalist-site">
          <!-- Marquee Ticker -->
          <div class="top-marquee">
            <span>🔥 ZERO FLUFF · ⚡ 100% COVERAGE · 🚀 SHIP TODAY · 🎯 NO AI HALLUCINATION · 🛡️ IRONCLAD REPOS</span>
          </div>

          <!-- Bold Nav -->
          <header class="neo-header">
            <div class="neo-nav-inner">
              <div class="neo-logo">TURBO//STACK ⚡</div>
              <nav class="neo-links">
                <a href="#arsenal">ARSENAL</a>
                <a href="#proof">WALL OF PROOF</a>
                <a href="#manifesto">MANIFESTO</a>
                <a href="#pricing">PRICING</a>
              </nav>
              <button class="neo-cta-btn">GET TURBO ➔</button>
            </div>
          </header>

          <!-- Hero Section -->
          <main class="neo-main">
            <section class="neo-hero">
              <div class="sticker-badge">⚡ THE BRUTAL TRUTH ABOUT AI CODE</div>
              <h1 class="neo-headline">BUILD FAST. BREAK RULES. SHIP TO PROD.</h1>
              <p class="neo-subhead">
                Most AI coding tools give you buggy spaghetti code with zero tests. TurboStack generates strict 100% coverage, AST-verified architectures in 30 seconds.
              </p>
              <div class="neo-actions">
                <button class="neo-btn-giant">CLAIM ACCESS NOW ➔</button>
                <button class="neo-btn-secondary">READ BENCHMARKS ⚡</button>
              </div>
            </section>

            <!-- 4-Card Sticker Feature Grid -->
            <section class="neo-features">
              <div class="grid-card lime">
                <div class="card-icon">⚡</div>
                <h3>Instant WebSocket Sync</h3>
                <p>Sub-millisecond protocol synchronization between AI agent reasoning and your live browser DOM.</p>
              </div>
              <div class="grid-card yellow">
                <div class="card-icon">🛡️</div>
                <h3>100% Test Invariant</h3>
                <p>Strict line, branch, statement, and function verification before code ever touches production git.</p>
              </div>
              <div class="grid-card cyan">
                <div class="card-icon">🎯</div>
                <h3>Visual Decision Plane</h3>
                <p>Multi-variant shotgun previews directly in your browser. Pick the winner with a single keystroke.</p>
              </div>
              <div class="grid-card pink">
                <div class="card-icon">🤖</div>
                <h3>Autonomous Agent Fleets</h3>
                <p>Parallelized Claude, Codex, and Antigravity workers solving your backlog overnight.</p>
              </div>
            </section>

            <!-- Combat Pricing Matrix -->
            <section class="neo-pricing">
              <div class="pricing-card">
                <div class="price-tag">SOLO HUSTLER</div>
                <div class="price-val">$29<span>/mo</span></div>
                <ul class="price-list">
                  <li>⚡ 100 Visual Shotguns/mo</li>
                  <li>⚡ Single-Developer Seat</li>
                  <li>⚡ Standard MCP Gateway</li>
                </ul>
                <button class="price-btn">GRAB SOLO PASS</button>
              </div>
              <div class="pricing-card featured">
                <div class="badge-featured">MOST BRUTAL</div>
                <div class="price-tag">UNLIMITED FLEET</div>
                <div class="price-val">$89<span>/mo</span></div>
                <ul class="price-list">
                  <li>⚡ Unlimited Parallel Agent Fleets</li>
                  <li>⚡ Team-wide Token Extraction</li>
                  <li>⚡ Dedicated Private MCP Relay</li>
                </ul>
                <button class="price-btn active">DEPLOY UNLIMITED FLEET ➔</button>
              </div>
            </section>
          </main>

          <!-- Banner Footer -->
          <footer class="neo-footer">
            <div>⚡ TURBO//STACK — ENGINEERED FOR SAVAGE VELOCITY. NO COPYRIGHT RESERVED. SHIP EVERYTHING.</div>
          </footer>
        </div>
      `,
      css: `
        :root, .theme-light {
          --color-bg: #fef08a;
          --color-surface: #ffffff;
          --color-lime: #a3e635;
          --color-cyan: #67e8f9;
          --color-pink: #f472b6;
          --color-border: #000000;
          --color-text: #000000;
          --shadow-color: #000000;
          --header-bg: #ffffff;
          --hero-bg: #ffffff;
          --footer-bg: #000000;
          --footer-text: #ffffff;
          --font-display: Impact, -apple-system, sans-serif;
          --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .theme-dark {
          --color-bg: #09090b;
          --color-surface: #18181b;
          --color-lime: #a3e635;
          --color-cyan: #67e8f9;
          --color-pink: #f472b6;
          --color-border: #a3e635;
          --color-text: #ffffff;
          --shadow-color: #a3e635;
          --header-bg: #18181b;
          --hero-bg: #18181b;
          --footer-bg: #18181b;
          --footer-text: #a3e635;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--font-body);
          background-color: var(--color-bg);
          color: var(--color-text);
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .brutalist-site { width: 100%; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }

        /* Top Marquee */
        .top-marquee { background: #000; color: #fff; padding: 6px 12px; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-align: center; border-bottom: 3px solid var(--color-border); overflow: hidden; white-space: nowrap; }

        /* Nav */
        .neo-header { background: var(--header-bg); border-bottom: 3px solid var(--color-border); padding: 14px 24px; transition: background-color 0.2s ease; }
        .neo-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .neo-logo { font-family: var(--font-display); font-size: 26px; letter-spacing: 0.05em; color: var(--color-text); }
        .neo-links { display: flex; gap: 24px; font-weight: 900; font-size: 13px; }
        .neo-links a { color: var(--color-text); text-decoration: none; }
        .neo-cta-btn { background: var(--color-lime); color: #000; border: 3px solid var(--color-border); padding: 8px 18px; font-size: 13px; font-weight: 900; box-shadow: 3px 3px 0 var(--shadow-color); cursor: pointer; }
        .neo-cta-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--shadow-color); }

        /* Hero */
        .neo-main { max-width: 1140px; margin: 0 auto; padding: 48px 24px; width: 100%; }
        .neo-hero { background: var(--hero-bg); border: 3px solid var(--color-border); padding: 56px 40px; box-shadow: 7px 7px 0 var(--shadow-color); margin-bottom: 48px; text-align: center; }
        .sticker-badge { display: inline-block; background: var(--color-lime); color: #000; border: 2px solid var(--color-border); padding: 4px 12px; font-size: 12px; font-weight: 900; box-shadow: 3px 3px 0 var(--shadow-color); margin-bottom: 20px; }
        .neo-headline { font-family: var(--font-display); font-size: 52px; line-height: 1.05; letter-spacing: 0.03em; margin-bottom: 20px; color: var(--color-text); }
        .neo-subhead { font-size: 16px; font-weight: 700; max-width: 720px; margin: 0 auto 32px; line-height: 1.5; color: var(--color-text); }
        .neo-actions { display: flex; justify-content: center; gap: 16px; }
        .neo-btn-giant { background: #facc15; color: #000; border: 3px solid var(--color-border); padding: 14px 28px; font-size: 15px; font-weight: 900; box-shadow: 5px 5px 0 var(--shadow-color); cursor: pointer; }
        .neo-btn-giant:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--shadow-color); }
        .neo-btn-secondary { background: var(--color-surface); color: var(--color-text); border: 3px solid var(--color-border); padding: 14px 28px; font-size: 15px; font-weight: 900; box-shadow: 5px 5px 0 var(--shadow-color); cursor: pointer; }

        /* 4-Card Grid */
        .neo-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px; }
        .grid-card { border: 3px solid var(--color-border); padding: 24px; box-shadow: 5px 5px 0 var(--shadow-color); }
        .grid-card.lime { background: var(--color-lime); color: #000; }
        .grid-card.yellow { background: var(--color-surface); color: var(--color-text); }
        .grid-card.cyan { background: var(--color-cyan); color: #000; }
        .grid-card.pink { background: var(--color-pink); color: #000; }
        .card-icon { font-size: 28px; margin-bottom: 12px; }
        .grid-card h3 { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.05em; margin-bottom: 8px; }
        .grid-card p { font-size: 13px; font-weight: 700; line-height: 1.4; }

        /* Pricing */
        .neo-pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 48px; }
        .pricing-card { background: var(--color-surface); color: var(--color-text); border: 3px solid var(--color-border); padding: 36px; box-shadow: 6px 6px 0 var(--shadow-color); position: relative; }
        .pricing-card.featured { background: #fed7aa; color: #000; }
        .badge-featured { position: absolute; top: -14px; right: 24px; background: #ef4444; color: #fff; border: 2px solid var(--color-border); font-size: 11px; font-weight: 900; padding: 4px 10px; box-shadow: 3px 3px 0 var(--shadow-color); }
        .price-tag { font-family: var(--font-display); font-size: 24px; letter-spacing: 0.05em; margin-bottom: 12px; }
        .price-val { font-size: 42px; font-weight: 900; margin-bottom: 20px; }
        .price-val span { font-size: 16px; }
        .price-list { list-style: none; margin-bottom: 28px; font-size: 14px; font-weight: 700; line-height: 2.2; }
        .price-btn { width: 100%; border: 3px solid var(--color-border); padding: 14px; font-size: 14px; font-weight: 900; background: #fff; color: #000; box-shadow: 4px 4px 0 var(--shadow-color); cursor: pointer; }
        .price-btn.active { background: #22c55e; color: #000; }

        /* Footer */
        .neo-footer { margin-top: auto; background: var(--footer-bg); color: var(--footer-text); border-top: 3px solid var(--color-border); padding: 20px; text-align: center; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; }

        /* Strict Multi-Device Viewport Fit */
        @media (max-width: 1280px) {
          .neo-nav-inner, .neo-main { max-width: 1100px; }
        }
        @media (max-width: 768px) {
          .neo-links { display: none; }
          .neo-headline { font-size: 38px; }
          .neo-hero { padding: 36px 24px; }
          .neo-features { grid-template-columns: 1fr 1fr; gap: 16px; }
          .neo-pricing { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 480px) {
          .top-marquee { font-size: 9px; padding: 4px 8px; }
          .neo-header { padding: 12px 14px; }
          .neo-logo { font-size: 20px; }
          .neo-cta-btn { padding: 6px 12px; font-size: 11px; }
          .neo-main { padding: 20px 12px; }
          .neo-hero { padding: 28px 14px; margin-bottom: 24px; box-shadow: 4px 4px 0 var(--shadow-color); }
          .sticker-badge { font-size: 10px; padding: 3px 8px; }
          .neo-headline { font-size: 26px; }
          .neo-subhead { font-size: 13px; margin-bottom: 20px; }
          .neo-actions { flex-direction: column; width: 100%; gap: 10px; }
          .neo-btn-giant, .neo-btn-secondary { width: 100%; padding: 12px; font-size: 13px; }
          .neo-features { grid-template-columns: 1fr; gap: 14px; margin-bottom: 28px; }
          .grid-card { padding: 18px 14px; box-shadow: 3px 3px 0 var(--shadow-color); }
          .pricing-card { padding: 24px 14px; box-shadow: 4px 4px 0 var(--shadow-color); }
          .price-val { font-size: 30px; }
          .neo-footer { font-size: 10px; padding: 14px 10px; }
        }
      `
    }
  ]
};

async function run() {
  try {
    const result = await mcpServer.handleDecisionRequest(sampleRequest);
    console.log('\n' + '='.repeat(70));
    console.log('  🎯 USER DECISION RECEIVED IN TERMINAL');
    console.log('='.repeat(70));
    console.log(`\nDecision Status: ${result.status.toUpperCase()}`);
    if (result.selectedId) {
      console.log(`Selected Variant: ${result.selectedId}`);
      console.log(`Developer Feedback: "${result.feedback || '(no comment provided)'}"`);
      console.log('\nExtracted Design Tokens (:root):');
      console.log(result.tokens?.cssVariables || 'None');
    }
    console.log('\n[VDP] Test complete! Shutting down server cleanly.');
    await mcpServer.close();
    process.exit(0);
  } catch (err) {
    console.error('[VDP] Error during test:', err);
    await mcpServer.close();
    process.exit(1);
  }
}

run();
