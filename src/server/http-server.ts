import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ArenaSessionConfig } from '../protocol/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface HttpServerOptions {
  port: number;
  host?: string;
  getSessionConfig: () => ArenaSessionConfig | null;
  onSelection?: (payload: { selectedId: string; feedback?: string }) => void;
}

export class ArenaHttpServer {
  private server: http.Server;
  private options: HttpServerOptions;

  constructor(options: HttpServerOptions) {
    this.options = options;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  public getRawServer(): http.Server {
    return this.server;
  }

  public listen(): Promise<number> {
    const host = this.options.host ?? '127.0.0.1';
    return new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.options.port, host, () => {
        resolve(this.options.port);
      });
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Security headers on all responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    // 1. Session Config API
    if (pathname === '/api/session.json' && req.method === 'GET') {
      const config = this.options.getSessionConfig();
      if (!config) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No active session' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
      return;
    }

    // 2. HTTP Selection Fallback API
    if (pathname === '/api/select' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (this.options.onSelection && parsed.selectedId) {
            this.options.onSelection({
              selectedId: parsed.selectedId,
              feedback: parsed.feedback
            });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (e: any) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // 3. Standalone Variant Preview Route (Separate Tab View)
    if ((pathname.startsWith('/preview/') || pathname === '/preview') && req.method === 'GET') {
      const variantId = pathname.startsWith('/preview/')
        ? decodeURIComponent(pathname.slice('/preview/'.length))
        : (url.searchParams.get('id') || '');
      this.serveVariantPreview(variantId, url, res);
      return;
    }

    // 4. Static Assets serving from arena directory
    this.serveStaticFile(pathname, res);
  }

  private escapeHtml(str?: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private serveVariantPreview(variantId: string, url: URL, res: http.ServerResponse): void {
    const config = this.options.getSessionConfig();
    const variant = config?.variants.find(v => v.id === variantId);

    if (!variant) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Design Variant Not Found — VDP</title>
  <style>
    body { font-family: Inter, system-ui, -apple-system, sans-serif; background: #09090b; color: #f4f4f5; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
    h1 { font-size: 22px; margin-bottom: 8px; font-weight: 600; }
    p { color: #a1a1aa; margin-bottom: 24px; font-size: 14px; max-width: 440px; }
    a { color: #3b82f6; text-decoration: none; border: 1px solid #27272a; background: #18181b; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s; }
    a:hover { background: #27272a; color: #ffffff; }
  </style>
</head>
<body>
  <h1>Design Variant Not Found</h1>
  <p>The variant "${this.escapeHtml(variantId)}" was not found in the active session, or the session may have concluded.</p>
  <a href="/">← Return to Decision Arena</a>
</body>
</html>`);
      return;
    }

    const state = url.searchParams.get('state') || 'default';
    const theme = url.searchParams.get('theme') || 'dark';
    const isClean = url.searchParams.get('clean') === 'true' || url.searchParams.get('raw') === 'true';

    let initialHtml = variant.html;
    if (state === 'loading' && variant.states?.loading) {
      initialHtml = variant.states.loading;
    } else if (state === 'empty' && variant.states?.empty) {
      initialHtml = variant.states.empty;
    } else if (state === 'error' && variant.states?.error) {
      initialHtml = variant.states.error;
    }

    const html = `<!DOCTYPE html>
<html lang="en" class="theme-${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${this.escapeHtml(variant.name)} — VDP Device Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --studio-bg-dark: #09090b;
      --studio-bg-light: #f4f4f5;
      --studio-canvas-dark: #0f0f13;
      --studio-canvas-light: #e4e4e7;
      --studio-bar-bg-dark: rgba(18, 18, 24, 0.90);
      --studio-bar-bg-light: rgba(255, 255, 255, 0.92);
      --studio-border-dark: rgba(255, 255, 255, 0.12);
      --studio-border-light: rgba(0, 0, 0, 0.12);
      --studio-text-dark: #f4f4f5;
      --studio-text-light: #18181b;
      --studio-muted-dark: #a1a1aa;
      --studio-muted-light: #71717a;
      --studio-accent: #3b82f6;
      --studio-accent-hover: #2563eb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body.theme-dark {
      background-color: var(--studio-canvas-dark);
      color: var(--studio-text-dark);
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    body.theme-light {
      background-color: var(--studio-canvas-light);
      color: var(--studio-text-light);
      background-image: radial-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    /* Top Studio Command Bar */
    .studio-bar {
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px;
      border-radius: 9999px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      max-width: 96vw;
    }
    .theme-dark .studio-bar {
      background: var(--studio-bar-bg-dark);
      border: 1px solid var(--studio-border-dark);
      color: var(--studio-text-dark);
    }
    .theme-light .studio-bar {
      background: var(--studio-bar-bg-light);
      border: 1px solid var(--studio-border-light);
      color: var(--studio-text-light);
    }
    .studio-bar.minimized {
      transform: translateX(-50%) translateY(-90px);
      opacity: 0;
      pointer-events: none;
    }

    .studio-back-btn {
      color: inherit;
      text-decoration: none;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      opacity: 0.8;
      transition: opacity 0.15s;
    }
    .studio-back-btn:hover { opacity: 1; }

    .studio-divider {
      width: 1px;
      height: 18px;
      background: rgba(125, 125, 125, 0.25);
    }

    .studio-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
    .studio-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: 9999px;
      background: rgba(125, 125, 125, 0.15);
      border: 1px solid rgba(125, 125, 125, 0.25);
    }
    .studio-name {
      font-weight: 600;
      font-size: 13px;
    }

    /* Device Switcher Segmented Control */
    .device-switcher {
      display: flex;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(125, 125, 125, 0.2);
      border-radius: 9999px;
      padding: 2px;
      gap: 2px;
    }
    .theme-light .device-switcher {
      background: rgba(0, 0, 0, 0.06);
    }
    .dev-btn {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.65;
      font-size: 11px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 9999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
    }
    .dev-btn:hover { opacity: 1; }
    .dev-btn.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .theme-light .dev-btn.active {
      background: #ffffff;
      color: #09090b;
    }

    /* State Switcher Tabs */
    .state-switcher {
      display: flex;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(125, 125, 125, 0.2);
      border-radius: 9999px;
      padding: 2px;
      gap: 2px;
    }
    .theme-light .state-switcher {
      background: rgba(0, 0, 0, 0.06);
    }
    .st-btn {
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.65;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 9999px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .st-btn:hover { opacity: 1; }
    .st-btn.active {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
    }
    .theme-light .st-btn.active {
      background: #ffffff;
      color: #09090b;
    }

    .icon-action-btn {
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 50%;
      opacity: 0.75;
      transition: all 0.15s ease;
    }
    .icon-action-btn:hover {
      opacity: 1;
      background: rgba(125, 125, 125, 0.15);
    }

    .select-cta-btn {
      background: var(--studio-accent);
      color: #ffffff;
      border: none;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 9999px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .select-cta-btn:hover {
      background: var(--studio-accent-hover);
      transform: translateY(-1px);
    }

    /* Floating Expand/Restore Button */
    .studio-expand-btn {
      position: fixed;
      top: 14px;
      right: 16px;
      z-index: 999998;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(0,0,0,0.4);
      transition: transform 0.2s;
    }
    .theme-dark .studio-expand-btn {
      background: var(--studio-bar-bg-dark);
      border: 1px solid var(--studio-border-dark);
      color: var(--studio-text-dark);
    }
    .theme-light .studio-expand-btn {
      background: var(--studio-bar-bg-light);
      border: 1px solid var(--studio-border-light);
      color: var(--studio-text-light);
    }
    .studio-expand-btn.visible { display: flex; }
    .studio-expand-btn:hover { transform: scale(1.08); }

    /* Studio Main Canvas Area */
    .studio-viewport-stage {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ${isClean ? '0' : '70px 20px 24px 20px'};
      overflow: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .mode-desktop .studio-viewport-stage {
      padding: 0;
    }

    /* Device Chassis & Frame Simulator */
    .device-chassis {
      position: relative;
      background: #09090b;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  border-radius 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Desktop Fluid Mode */
    .mode-desktop .device-chassis {
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      border: none;
    }

    /* Laptop 1280px Mode */
    .mode-laptop .device-chassis {
      width: 1280px;
      max-width: 95vw;
      height: 820px;
      max-height: 88vh;
      border-radius: 12px;
      box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    /* Tablet 768px Mode */
    .mode-tablet .device-chassis {
      width: 768px;
      max-width: 92vw;
      height: 1024px;
      max-height: 86vh;
      border-radius: 28px;
      box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 12px #1c1c21, 0 0 0 13px rgba(255, 255, 255, 0.12);
    }

    /* Mobile 375px Mode */
    .mode-mobile .device-chassis {
      width: 375px;
      height: 812px;
      max-height: 86vh;
      border-radius: 36px;
      box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 10px #1c1c21, 0 0 0 11px rgba(255, 255, 255, 0.12);
    }

    /* Notch Indicator (Only in Mobile Mode) */
    .device-notch {
      display: none;
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 96px;
      height: 24px;
      background: #000000;
      border-radius: 20px;
      z-index: 50;
      box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    .mode-mobile .device-notch {
      display: block;
    }

    .studio-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: transparent;
    }

    /* Toast Notification */
    .studio-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 22px;
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: none;
      z-index: 999999;
      animation: toastFadeIn 0.3s ease;
    }
    @keyframes toastFadeIn {
      from { opacity: 0; transform: translate(-50%, 10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  </style>
</head>
<body class="theme-${theme} mode-desktop" id="studio-body">
  ${isClean ? '' : `
  <!-- Studio Floating Command Bar -->
  <header class="studio-bar" id="vdp-bar">
    <a href="/" class="studio-back-btn" title="Back to Arena (Esc)">
      ← Arena
    </a>
    <div class="studio-divider"></div>

    <div class="studio-title-group">
      <span class="studio-badge">${this.escapeHtml(variant.archetype)}</span>
      <span class="studio-name">${this.escapeHtml(variant.name)}</span>
    </div>
    <div class="studio-divider"></div>

    <!-- Responsive Viewport Switcher -->
    <div class="device-switcher" role="group" aria-label="Device Viewport Switcher">
      <button class="dev-btn active" data-device="desktop" title="Desktop Fluid 100% [Press D]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        <span>Fluid</span>
      </button>
      <button class="dev-btn" data-device="laptop" title="Laptop 1280px [Press L]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
        <span>1280px</span>
      </button>
      <button class="dev-btn" data-device="tablet" title="Tablet 768px [Press T]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        <span>768px</span>
      </button>
      <button class="dev-btn" data-device="mobile" title="Mobile 375px [Press M]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        <span>375px</span>
      </button>
    </div>
    <div class="studio-divider"></div>

    <!-- State Matrix Switcher -->
    <div class="state-switcher">
      <button class="st-btn ${state === 'default' ? 'active' : ''}" data-state="default">Default</button>
      <button class="st-btn ${state === 'loading' ? 'active' : ''}" data-state="loading">Loading</button>
      <button class="st-btn ${state === 'empty' ? 'active' : ''}" data-state="empty">Empty</button>
    </div>
    <div class="studio-divider"></div>

    <!-- Theme Switcher -->
    <button class="icon-action-btn" id="theme-btn" title="Toggle Dark/Light Mode (Press S)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    </button>

    <!-- Select Design CTA -->
    <button class="select-cta-btn" id="select-btn">
      <span>✓ Select This Design</span>
    </button>

    <!-- Hide Toolbar -->
    <button class="icon-action-btn" id="hide-btn" title="Hide Toolbar (Press H)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  </header>

  <!-- Re-expand Button -->
  <button class="studio-expand-btn" id="expand-btn" title="Show Toolbar (Press H)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  </button>
  `}

  <!-- Viewport Stage -->
  <div class="studio-viewport-stage" id="stage">
    <div class="device-chassis" id="device-chassis">
      <div class="device-notch"></div>
      <iframe class="studio-iframe" id="sim-iframe" sandbox="allow-scripts"></iframe>
    </div>
  </div>

  <div class="studio-toast" id="toast">
    ✓ Design selected! You can return to your IDE or terminal.
  </div>

  <script>
    (function() {
      const variantId = ${JSON.stringify(variant.id)};
      const variantCss = ${JSON.stringify(variant.css)};
      const states = {
        default: ${JSON.stringify(variant.html)},
        loading: ${JSON.stringify(variant.states?.loading || variant.html)},
        empty: ${JSON.stringify(variant.states?.empty || variant.html)},
        error: ${JSON.stringify(variant.states?.error || variant.html)}
      };

      let activeState = ${JSON.stringify(state)};
      let activeTheme = ${JSON.stringify(theme)};
      let activeDevice = 'desktop';

      const iframe = document.getElementById('sim-iframe');
      const body = document.getElementById('studio-body');
      const bar = document.getElementById('vdp-bar');
      const expandBtn = document.getElementById('expand-btn');
      const selectBtn = document.getElementById('select-btn');
      const themeBtn = document.getElementById('theme-btn');
      const hideBtn = document.getElementById('hide-btn');
      const toast = document.getElementById('toast');

      function updateIframe() {
        const isLight = activeTheme === 'light';
        const bg = isLight ? '#ffffff' : '#09090b';
        const fg = isLight ? '#09090b' : '#f4f4f5';
        const content = states[activeState] || states.default;

        iframe.srcdoc = '<!DOCTYPE html>' +
          '<html class="' + (isLight ? 'theme-light' : 'theme-dark') + '">' +
            '<head>' +
              '<meta charset="utf-8">' +
              '<meta name="viewport" content="width=device-width, initial-scale=1">' +
              '<link rel="preconnect" href="https://fonts.googleapis.com">' +
              '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
              '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">' +
              '<style>' +
                '* { box-sizing: border-box; margin: 0; padding: 0; }' +
                'html, body {' +
                  'font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;' +
                  'background-color: ' + bg + ';' +
                  'color: ' + fg + ';' +
                  'min-height: 100vh;' +
                  'width: 100%;' +
                  'margin: 0;' +
                  'padding: 0;' +
                  'transition: background-color 200ms ease, color 200ms ease;' +
                '}' +
                variantCss +
              '</style>' +
            '</head>' +
            '<body>' + content + '</body>' +
          '</html>';
      }

      updateIframe();

      // Device switching
      document.querySelectorAll('.dev-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeDevice = btn.dataset.device;
          body.className = 'theme-' + activeTheme + ' mode-' + activeDevice;
        });
      });

      // State switching
      document.querySelectorAll('.st-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.st-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeState = btn.dataset.state;
          updateIframe();
        });
      });

      // Theme toggle
      function toggleTheme() {
        activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
        body.className = 'theme-' + activeTheme + ' mode-' + activeDevice;
        updateIframe();
      }
      themeBtn?.addEventListener('click', toggleTheme);

      // Select Design CTA
      selectBtn?.addEventListener('click', async () => {
        selectBtn.disabled = true;
        selectBtn.textContent = 'Selecting...';
        try {
          await fetch('/api/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedId: variantId })
          });
          selectBtn.textContent = '✓ Selected!';
          selectBtn.style.background = '#10b981';
          if (toast) toast.style.display = 'block';
        } catch (err) {
          selectBtn.textContent = 'Failed to select';
          selectBtn.disabled = false;
        }
      });

      // Hide / Expand Toolbar
      function toggleBar() {
        if (!bar) return;
        const isMin = bar.classList.toggle('minimized');
        expandBtn?.classList.toggle('visible', isMin);
      }
      hideBtn?.addEventListener('click', toggleBar);
      expandBtn?.addEventListener('click', toggleBar);

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k === 'h') toggleBar();
        else if (k === 's') toggleTheme();
        else if (k === 'd') document.querySelector('.dev-btn[data-device="desktop"]')?.click();
        else if (k === 'l') document.querySelector('.dev-btn[data-device="laptop"]')?.click();
        else if (k === 't') document.querySelector('.dev-btn[data-device="tablet"]')?.click();
        else if (k === 'm') document.querySelector('.dev-btn[data-device="mobile"]')?.click();
      });
    })();
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  private serveStaticFile(pathname: string, res: http.ServerResponse): void {
    let filePath = pathname === '/' ? '/index.html' : pathname;

    // Search in src/arena (dev) or dist/arena (built)
    const candidates = [
      path.resolve(process.cwd(), 'src', 'arena', filePath.slice(1)),
      path.resolve(__dirname, '..', 'arena', filePath.slice(1)),
      path.resolve(__dirname, 'arena', filePath.slice(1))
    ];

    let resolvedPath = candidates.find(p => fs.existsSync(p) && fs.statSync(p).isFile());

    if (!resolvedPath && pathname !== '/' && !path.extname(pathname)) {
      // Try appending .html
      resolvedPath = candidates.map(p => p + '.html').find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    }

    if (!resolvedPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  }
}
