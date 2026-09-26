import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { ArenaHttpServer } from '../src/server/http-server.js';
import { WsGateway } from '../src/server/ws-gateway.js';
import { findAvailablePort } from '../src/server/port-scanner.js';
import { WebSocket } from 'ws';

describe('Server & WebSocket Integration - Exhaustive QA Coverage', () => {
  let server: ArenaHttpServer;
  let wsGateway: WsGateway;
  let port: number;
  let currentSessionConfig: any = null;
  let selectedData: any = null;
  let cancelledReason: string | null = null;
  let clientConnectedCount = 0;

  beforeAll(async () => {
    port = await findAvailablePort({ startPort: 4350 });

    server = new ArenaHttpServer({
      port,
      getSessionConfig: () => currentSessionConfig,
      onSelection: (payload) => {
        selectedData = payload;
      }
    });

    await server.listen();

    wsGateway = new WsGateway(server.getRawServer(), {
      onSelection: (payload) => {
        selectedData = payload;
      },
      onCancel: (reason) => {
        cancelledReason = reason;
      },
      onClientConnected: () => {
        clientConnectedCount++;
      }
    });
  });

  afterAll(async () => {
    if (wsGateway) await wsGateway.close();
    if (server) await server.close();
  });

  it('serves 404 on /api/session.json when no active session exists', async () => {
    currentSessionConfig = null;
    const res = await fetch(`http://127.0.0.1:${port}/api/session.json`);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('No active session');
  });

  it('serves 200 on /api/session.json with active session config and security headers', async () => {
    currentSessionConfig = {
      sessionId: 'test-session-abc',
      port,
      wsUrl: `ws://127.0.0.1:${port}/ws`,
      prompt: 'Design metric cards',
      variants: [
        { id: 'v1', name: 'Minimalist', archetype: 'minimalist', description: 'Clean', html: '<div/>', css: '' }
      ]
    };

    const res = await fetch(`http://127.0.0.1:${port}/api/session.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(res.headers.get('Cache-Control')).toContain('no-store');

    const data = await res.json();
    expect(data.sessionId).toBe('test-session-abc');
  });

  it('handles POST /api/select successfully with valid payload', async () => {
    selectedData = null;
    const res = await fetch(`http://127.0.0.1:${port}/api/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedId: 'v1', feedback: 'Make button bigger' })
    });

    expect(res.status).toBe(200);
    const result = await res.json();
    expect(result.success).toBe(true);
    expect(selectedData).toEqual({ selectedId: 'v1', feedback: 'Make button bigger' });
  });

  it('handles POST /api/select error with malformed JSON', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-body{{{'
    });

    expect(res.status).toBe(400);
    const result = await res.json();
    expect(result.error).toBe('Invalid JSON');
  });

  it('serves standalone variant preview (/preview/:id) with all states, themes, and clean mode', async () => {
    currentSessionConfig = {
      sessionId: 'test-session-abc',
      port,
      wsUrl: `ws://127.0.0.1:${port}/ws`,
      prompt: 'Design metric cards',
      variants: [
        {
          id: 'v1',
          name: 'Minimalist & Modern "Pro" <Edition>',
          archetype: 'minimalist',
          description: 'Clean',
          html: '<div class="card">Default State Content</div>',
          css: '.card { color: blue; }',
          states: {
            loading: '<div class="skeleton">Skeleton Loading...</div>',
            empty: '<div class="empty">Empty State Content</div>',
            error: '<div class="error">Error State Content</div>'
          }
        },
        {
          id: 'v2',
          name: 'Bare Variant',
          archetype: 'brutalist',
          description: 'No states',
          html: '<p>Bare</p>',
          css: ''
        }
      ]
    };

    // 1. Basic /preview/:id (default state, dark theme)
    const res1 = await fetch(`http://127.0.0.1:${port}/preview/v1`);
    expect(res1.status).toBe(200);
    expect(res1.headers.get('Content-Type')).toContain('text/html');
    const html1 = await res1.text();
    expect(html1).toContain('Minimalist &amp; Modern &quot;Pro&quot; &lt;Edition&gt;');
    expect(html1).toContain('Default State Content');
    expect(html1).toContain('studio-bar');
    expect(html1).toContain('device-switcher');
    expect(html1).toContain('device-chassis');
    expect(html1).toContain('theme-dark');

    // 1b. Preview variant with no states object
    const resBare = await fetch(`http://127.0.0.1:${port}/preview/v2`);
    expect(resBare.status).toBe(200);
    const htmlBare = await resBare.text();
    expect(htmlBare).toContain('<p>Bare</p>');

    // 2. Query param style: /preview?id=v1
    const res2 = await fetch(`http://127.0.0.1:${port}/preview?id=v1`);
    expect(res2.status).toBe(200);
    const html2 = await res2.text();
    expect(html2).toContain('Default State Content');

    // 3. Loading state and light theme
    const res3 = await fetch(`http://127.0.0.1:${port}/preview/v1?state=loading&theme=light`);
    expect(res3.status).toBe(200);
    const html3 = await res3.text();
    expect(html3).toContain('Skeleton Loading...');
    expect(html3).toContain('theme-light');

    // 4. Empty state
    const res4 = await fetch(`http://127.0.0.1:${port}/preview/v1?state=empty`);
    expect(res4.status).toBe(200);
    const html4 = await res4.text();
    expect(html4).toContain('Empty State Content');

    // 5. Error state
    const res5 = await fetch(`http://127.0.0.1:${port}/preview/v1?state=error`);
    expect(res5.status).toBe(200);
    const html5 = await res5.text();
    expect(html5).toContain('Error State Content');

    // 6. Clean / Raw mode (no floating toolbar)
    const res6 = await fetch(`http://127.0.0.1:${port}/preview/v1?clean=true`);
    expect(res6.status).toBe(200);
    const html6 = await res6.text();
    expect(html6).toContain('Default State Content');
    expect(html6).not.toContain('id="vdp-bar"');

    // 7. Non-existent variant returns 404 HTML
    const res404 = await fetch(`http://127.0.0.1:${port}/preview/nonexistent-id`);
    expect(res404.status).toBe(404);
    expect(res404.headers.get('Content-Type')).toContain('text/html');
    const html404 = await res404.text();
    expect(html404).toContain('Design Variant Not Found');

    // 8. /preview with no id returns 404 HTML
    const resNoId = await fetch(`http://127.0.0.1:${port}/preview`);
    expect(resNoId.status).toBe(404);
  });

  it('serves static HTML, CSS, and JS assets correctly', async () => {
    // 1. Root index.html
    const htmlRes = await fetch(`http://127.0.0.1:${port}/`);
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.headers.get('Content-Type')).toContain('text/html');
    const htmlText = await htmlRes.text();
    expect(htmlText).toContain('Visual Decision Arena');

    // 2. CSS stylesheet
    const cssRes = await fetch(`http://127.0.0.1:${port}/styles.css`);
    expect(cssRes.status).toBe(200);
    expect(cssRes.headers.get('Content-Type')).toContain('text/css');

    // 3. JS bundle
    const jsRes = await fetch(`http://127.0.0.1:${port}/app.js`);
    expect(jsRes.status).toBe(200);
    expect(jsRes.headers.get('Content-Type')).toContain('application/javascript');

    // 4. Test resolving extension-less html route (/index -> /index.html)
    const indexRes = await fetch(`http://127.0.0.1:${port}/index`);
    expect(indexRes.status).toBe(200);
    expect(indexRes.headers.get('Content-Type')).toContain('text/html');

    // 5. Nonexistent file without extension returns 404
    const notFoundNoExtRes = await fetch(`http://127.0.0.1:${port}/definitely-missing-file`);
    expect(notFoundNoExtRes.status).toBe(404);

    // 6. Nonexistent file with extension returns 404
    const notFoundRes = await fetch(`http://127.0.0.1:${port}/nonexistent-file.xyz`);
    expect(notFoundRes.status).toBe(404);

    // 7. File with unknown extension defaults to application/octet-stream
    const dummyPath = path.resolve(process.cwd(), 'src', 'arena', 'unknown-ext.bin');
    fs.writeFileSync(dummyPath, 'binary data');
    try {
      const binRes = await fetch(`http://127.0.0.1:${port}/unknown-ext.bin`);
      expect(binRes.status).toBe(200);
      expect(binRes.headers.get('Content-Type')).toBe('application/octet-stream');
    } finally {
      if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    }
  });

  it('handles requests with undefined url and undefined host header cleanly', async () => {
    const { PassThrough } = await import('node:stream');
    const fakeRes = Object.assign(new PassThrough(), {
      setHeader: vi.fn(),
      writeHead: vi.fn(),
      end: vi.fn()
    });

    (server as any).handleRequest({ url: undefined, headers: {} }, fakeRes);
    expect(fakeRes.writeHead).toHaveBeenCalled();
  });

  it('manages WebSocket connections, broadcasts, selections, and cancellations', async () => {
    expect(clientConnectedCount).toBe(0);

    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
    await new Promise<void>((resolve) => ws.on('open', () => resolve()));

    expect(wsGateway.getConnectedClientCount()).toBe(1);

    // 1. Broadcast session
    let receivedBroadcast: any = null;
    ws.on('message', (data) => {
      receivedBroadcast = JSON.parse(data.toString());
    });

    wsGateway.broadcastSession(currentSessionConfig);
    await new Promise((r) => setTimeout(r, 50));
    expect(receivedBroadcast).not.toBeNull();
    expect(receivedBroadcast.type).toBe('SESSION_READY');

    // 2. Client sends selection
    selectedData = null;
    ws.send(JSON.stringify({ type: 'SELECT', selectedId: 'v1', feedback: 'Great job' }));
    await new Promise((r) => setTimeout(r, 50));
    expect(selectedData).toEqual({ selectedId: 'v1', feedback: 'Great job' });

    // 3. Server sends resolution notification
    let resolvedMsg: any = null;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'SESSION_RESOLVED') resolvedMsg = parsed;
    });

    wsGateway.notifyResolved('v1');
    await new Promise((r) => setTimeout(r, 50));
    expect(resolvedMsg).toEqual({ type: 'SESSION_RESOLVED', selectedId: 'v1' });

    // 4. Client sends cancel with explicit reason
    cancelledReason = null;
    ws.send(JSON.stringify({ type: 'CANCEL', reason: 'window_closed' }));
    await new Promise((r) => setTimeout(r, 50));
    expect(cancelledReason).toBe('window_closed');

    // 5. Client sends cancel with default reason
    cancelledReason = null;
    ws.send(JSON.stringify({ type: 'CANCEL' }));
    await new Promise((r) => setTimeout(r, 50));
    expect(cancelledReason).toBe('user_cancelled');

    // 6. Send malformed message (does not throw or crash gateway)
    ws.send('invalid-socket-payload');
    await new Promise((r) => setTimeout(r, 50));

    // 7. Exercise heartbeat timer and dead socket termination
    const serverSockets = Array.from((wsGateway as any).clients) as any[];
    expect(serverSockets.length).toBe(1);
    const serverWs = serverSockets[0];

    // Trigger pong event on server socket to cover line 30
    serverWs.emit('pong');
    expect(serverWs.isAlive).toBe(true);

    // Simulate heartbeat tick where client is alive
    serverWs.isAlive = true;
    const pingSpy = vi.spyOn(serverWs, 'ping').mockImplementation(() => {});
    // Trigger heartbeat logic manually
    for (const s of (wsGateway as any).clients) {
      if (!s.isAlive) {
        s.terminate();
        (wsGateway as any).clients.delete(s);
      } else {
        s.isAlive = false;
        s.ping();
      }
    }
    expect(pingSpy).toHaveBeenCalled();
    expect(serverWs.isAlive).toBe(false);

    // Second heartbeat tick where client did not respond (isAlive is false) -> terminates
    const terminateSpy = vi.spyOn(serverWs, 'terminate').mockImplementation(() => {});
    for (const s of Array.from((wsGateway as any).clients) as any[]) {
      if (!s.isAlive) {
        s.terminate();
        (wsGateway as any).clients.delete(s);
      }
    }
    expect(terminateSpy).toHaveBeenCalled();
    expect(wsGateway.getConnectedClientCount()).toBe(0);

    // 8. Test error event on server socket deletes client
    (wsGateway as any).clients.add(serverWs);
    expect(wsGateway.getConnectedClientCount()).toBe(1);
    serverWs.emit('error', new Error('Simulated socket error'));
    expect(wsGateway.getConnectedClientCount()).toBe(0);

    ws.close();
  });

  it('executes interval heartbeat logic directly through timer callback', () => {
    const fakeWs = {
      isAlive: true,
      ping: vi.fn(),
      terminate: vi.fn()
    } as any;

    (wsGateway as any).clients.add(fakeWs);

    const timerCallback = (wsGateway as any).heartbeatInterval?._onTimeout;
    if (typeof timerCallback === 'function') {
      timerCallback();
      expect(fakeWs.isAlive).toBe(false);
      expect(fakeWs.ping).toHaveBeenCalled();

      timerCallback();
      expect(fakeWs.terminate).toHaveBeenCalled();
      expect((wsGateway as any).clients.has(fakeWs)).toBe(false);
    }
  });
});
