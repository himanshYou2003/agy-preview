/**
 * Visual Decision Arena Client Application
 */

class ArenaApp {
  constructor() {
    this.session = null;
    this.socket = null;
    this.selectedVariantId = null;
    this.activeTheme = 'dark';
    this.activeViewport = 'desktop';

    this.dom = {
      promptText: document.getElementById('prompt-text'),
      variantsGrid: document.getElementById('variants-grid'),
      themeToggle: document.getElementById('theme-toggle'),
      moonIcon: document.getElementById('moon-icon'),
      sunIcon: document.getElementById('sun-icon'),
      cancelBtn: document.getElementById('cancel-btn'),
      critiqueModal: document.getElementById('critique-modal'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      modalCancelBtn: document.getElementById('modal-cancel-btn'),
      modalSubmitBtn: document.getElementById('modal-submit-btn'),
      modalVariantTitle: document.getElementById('modal-variant-title'),
      modalArchetypeBadge: document.getElementById('modal-archetype-badge'),
      critiqueInput: document.getElementById('critique-input'),
      modalTokensCode: document.getElementById('modal-tokens-code'),
      resolvedToast: document.getElementById('resolved-toast'),
      toastWinnerTitle: document.getElementById('toast-winner-title')
    };

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadInitialConfig();
    this.connectWebSocket();
  }

  bindEvents() {
    // 1. Theme toggle
    this.dom.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // 2. Cancel button
    this.dom.cancelBtn?.addEventListener('click', () => this.cancelDecision('user_clicked_cancel'));

    // 3. Modal events
    this.dom.modalCloseBtn?.addEventListener('click', () => this.closeModal());
    this.dom.modalCancelBtn?.addEventListener('click', () => this.closeModal());
    this.dom.modalSubmitBtn?.addEventListener('click', () => this.submitModalCritique());

    // 4. Resize listener to auto-scale card previews
    window.addEventListener('resize', () => {
      this.rescaleAllCards();
    });

    // 5. Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept when typing in textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          this.submitModalCritique();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (!this.dom.critiqueModal.classList.contains('hidden')) {
          this.closeModal();
        } else {
          this.cancelDecision('user_pressed_escape');
        }
      } else if (e.key === '1' && this.session?.variants[0]) {
        this.selectVariant(this.session.variants[0].id);
      } else if (e.key === '2' && this.session?.variants[1]) {
        this.selectVariant(this.session.variants[1].id);
      } else if (e.key === '3' && this.session?.variants[2]) {
        this.selectVariant(this.session.variants[2].id);
      } else if (e.key === '4' && this.session?.variants[3]) {
        this.selectVariant(this.session.variants[3].id);
      } else if (e.key.toLowerCase() === 'l') {
        this.toggleTheme();
      }
    });

    // 6. Notify server if tab closed
    window.addEventListener('beforeunload', () => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'CANCEL', reason: 'tab_closed' }));
      }
    });
  }

  async loadInitialConfig() {
    try {
      const res = await fetch('/api/session.json');
      if (res.ok) {
        const config = await res.json();
        this.renderSession(config);
      }
    } catch (err) {
      console.warn('[VDP] Waiting for WebSocket broadcast...');
    }
  }

  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SESSION_READY' && msg.data) {
          this.renderSession(msg.data);
        } else if (msg.type === 'SESSION_RESOLVED') {
          this.showResolvedBanner(msg.selectedId);
        }
      } catch (err) {
        console.error('[VDP] Error processing socket message', err);
      }
    };

    this.socket.onclose = () => {
      console.warn('[VDP] WebSocket closed. Reconnecting in 2s...');
      setTimeout(() => this.connectWebSocket(), 2000);
    };
  }

  renderSession(session) {
    this.session = session;
    this.dom.promptText.textContent = session.prompt || 'Design Decision Session';
    this.dom.variantsGrid.innerHTML = '';

    if (!session.variants || session.variants.length === 0) {
      this.dom.variantsGrid.innerHTML = `
        <div class="empty-state">
          <p>No design variants loaded in this session.</p>
        </div>
      `;
      return;
    }

    session.variants.forEach((variant, index) => {
      const card = this.createVariantCard(variant, index);
      this.dom.variantsGrid.appendChild(card);
    });

    // Auto-scale all card iframe previews to desktop virtual resolution
    requestAnimationFrame(() => {
      this.rescaleAllCards();
    });
  }

  rescaleAllCards() {
    if (!this.session?.variants) return;
    this.session.variants.forEach(variant => {
      const card = document.getElementById(`card-${variant.id}`);
      if (card) this.adjustCardScale(card, variant.id);
    });
  }

  adjustCardScale(card, variantId) {
    const cardBody = card.querySelector('.card-body');
    const iframe = card.querySelector(`#iframe-${variantId}`);
    if (!cardBody || !iframe) return;

    const targetWidth = 1200;
    const bodyWidth = cardBody.clientWidth || 360;
    const scale = Math.max(0.24, Math.min(0.40, bodyWidth / targetWidth));
    iframe.style.width = `${targetWidth}px`;
    iframe.style.height = `${Math.round(cardBody.clientHeight / scale)}px`;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
  }

  createVariantCard(variant, index) {
    const card = document.createElement('div');
    card.className = `variant-card ${index === 0 ? 'recommended' : ''}`;
    card.id = `card-${variant.id}`;

    const archetypeClass = (variant.archetype || 'custom').toLowerCase();

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title-group">
          <span class="variant-number-badge">${index + 1}</span>
          <span class="variant-name">${this.escapeHtml(variant.name)}</span>
          <span class="badge ${archetypeClass}">${variant.archetype}</span>
        </div>
        <div class="card-header-actions">
          <div class="state-tabs" data-variant-id="${variant.id}">
            <button class="state-tab active" data-state="default">Default</button>
            <button class="state-tab" data-state="loading">Loading</button>
            <button class="state-tab" data-state="empty">Empty</button>
          </div>
          <button class="btn-header-open" data-id="${variant.id}" title="Open full-screen in separate tab">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="card-body" title="Click Open Preview for full-screen interactive inspection">
        <div class="desktop-viewport-wrapper">
          <iframe class="preview-iframe" id="iframe-${variant.id}"></iframe>
        </div>
        <div class="code-inspector" id="code-${variant.id}">
          <pre><code>${this.escapeHtml(variant.html)}\n\n<style>\n${this.escapeHtml(variant.css)}\n</style></code></pre>
        </div>
      </div>

      <div class="card-footer">
        <div class="footer-primary-actions">
          <button class="btn-select" data-id="${variant.id}">
            <span>Select Design</span>
            <span class="kbd-shortcut">${index + 1}</span>
          </button>
          <button class="btn-open" data-id="${variant.id}" title="Open this design in a separate window or tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Open Preview</span>
          </button>
        </div>
        <div class="footer-secondary-actions">
          <button class="btn-tweak" data-id="${variant.id}" title="Pick with adjustments">
            <span>Tweak Notes</span>
          </button>
          <button class="btn-code" data-id="${variant.id}" title="Toggle raw code">
            <span>&lt;/&gt; Code</span>
          </button>
        </div>
      </div>
    `;

    // Wire Card Event Listeners
    const iframe = card.querySelector(`#iframe-${variant.id}`);
    this.renderIframeContent(iframe, variant.html, variant.css);

    // State tabs switcher
    const stateTabs = card.querySelectorAll('.state-tab');
    stateTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        stateTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        const stateKey = e.target.dataset.state;
        this.switchVariantState(variant, iframe, stateKey);
      });
    });

    // Open in separate tab
    const openSeparateTab = () => {
      const activeState = card.querySelector('.state-tab.active')?.dataset.state || 'default';
      const previewUrl = `/preview/${encodeURIComponent(variant.id)}?theme=${encodeURIComponent(this.activeTheme)}&state=${encodeURIComponent(activeState)}`;
      window.open(previewUrl, '_blank');
    };
    card.querySelector('.btn-open')?.addEventListener('click', openSeparateTab);
    card.querySelector('.btn-header-open')?.addEventListener('click', openSeparateTab);

    // Select button
    card.querySelector('.btn-select').addEventListener('click', () => {
      this.selectVariant(variant.id);
    });

    // Tweak button
    card.querySelector('.btn-tweak').addEventListener('click', () => {
      this.openCritiqueModal(variant);
    });

    // Code flip button
    const codeInspector = card.querySelector(`#code-${variant.id}`);
    card.querySelector('.btn-code').addEventListener('click', (e) => {
      const isVisible = codeInspector.classList.toggle('active');
      e.currentTarget.style.color = isVisible ? 'var(--accent-primary)' : '';
    });

    return card;
  }

  renderIframeContent(iframe, html, css) {
    const isLight = this.activeTheme === 'light';
    const themeBg = isLight ? '#ffffff' : '#09090b';
    const themeFg = isLight ? '#09090b' : '#f4f4f5';

    iframe.sandbox = 'allow-scripts'; // Strictly NO allow-same-origin
    iframe.srcdoc = `
      <!DOCTYPE html>
      <html class="${isLight ? 'theme-light' : 'theme-dark'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com; img-src 'self' data: https:; script-src 'unsafe-inline'; connect-src 'none';">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: ${themeBg};
              color: ${themeFg};
              min-height: 100vh;
              width: 100%;
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              transition: background-color 200ms ease, color 200ms ease;
            }
            ::-webkit-scrollbar { width: 0px; height: 0px; display: none; }
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  switchVariantState(variant, iframe, stateKey) {
    let htmlToRender = variant.html;

    if (stateKey === 'loading' && variant.states?.loading) {
      htmlToRender = variant.states.loading;
    } else if (stateKey === 'empty' && variant.states?.empty) {
      htmlToRender = variant.states.empty;
    } else if (stateKey === 'error' && variant.states?.error) {
      htmlToRender = variant.states.error;
    }

    this.renderIframeContent(iframe, htmlToRender, variant.css);
  }



  toggleTheme() {
    this.activeTheme = this.activeTheme === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${this.activeTheme}`;

    this.dom.moonIcon.classList.toggle('hidden', this.activeTheme === 'dark');
    this.dom.sunIcon.classList.toggle('hidden', this.activeTheme === 'light');

    // Re-render iframes with theme styles
    if (this.session?.variants) {
      this.session.variants.forEach(variant => {
        const iframe = document.getElementById(`iframe-${variant.id}`);
        if (iframe) {
          this.renderIframeContent(iframe, variant.html, variant.css);
        }
      });
    }
  }

  selectVariant(variantId, feedback = '') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'SELECT',
        selectedId: variantId,
        feedback: feedback || undefined
      }));
    }

    // Also send HTTP fallback
    fetch('/api/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedId: variantId, feedback })
    }).catch(() => {});

    this.showResolvedBanner(variantId);
  }

  cancelDecision(reason) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'CANCEL',
        reason
      }));
    }
    this.dom.variantsGrid.innerHTML = `
      <div class="empty-state">
        <p>Review cancelled. You can return to your terminal or IDE.</p>
      </div>
    `;
  }

  openCritiqueModal(variant) {
    this.selectedVariantId = variant.id;
    this.dom.modalVariantTitle.textContent = `Refine: ${variant.name}`;
    this.dom.modalArchetypeBadge.textContent = variant.archetype;
    this.dom.modalArchetypeBadge.className = `badge ${variant.archetype.toLowerCase()}`;
    this.dom.critiqueInput.value = '';

    // Quick token summary
    const cssVars = (variant.css.match(/--[a-zA-Z0-9_-]+\s*:[^;]+;/g) || []).slice(0, 5);
    this.dom.modalTokensCode.textContent = cssVars.length > 0
      ? cssVars.join('\n')
      : '/* Standalone CSS declarations */';

    this.dom.critiqueModal.classList.remove('hidden');
    this.dom.critiqueInput.focus();
  }

  closeModal() {
    this.dom.critiqueModal.classList.add('hidden');
    this.selectedVariantId = null;
  }

  submitModalCritique() {
    if (!this.selectedVariantId) return;
    const critiqueText = this.dom.critiqueInput.value.trim();
    this.selectVariant(this.selectedVariantId, critiqueText);
    this.closeModal();
  }

  showResolvedBanner(selectedId) {
    const winner = this.session?.variants.find(v => v.id === selectedId);
    this.dom.toastWinnerTitle.textContent = winner ? `Selected: ${winner.name}` : 'Selection Submitted';
    this.dom.resolvedToast.classList.remove('hidden');

    // Highlight card
    document.querySelectorAll('.variant-card').forEach(card => {
      card.style.opacity = '0.5';
    });
    const winnerCard = document.getElementById(`card-${selectedId}`);
    if (winnerCard) {
      winnerCard.style.opacity = '1';
      winnerCard.classList.add('recommended');
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Start application
window.addEventListener('DOMContentLoaded', () => {
  new ArenaApp();
});
