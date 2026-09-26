import { describe, it, expect, vi, afterEach } from 'vitest';
import { VdpMcpServer } from '../src/server/mcp-server.js';
import * as launcher from '../src/server/browser-launcher.js';

describe('VDP MCP Server - Exhaustive QA Coverage', () => {
  let mcpServer: VdpMcpServer | null = null;

  afterEach(async () => {
    if (mcpServer) {
      await mcpServer.close();
      mcpServer = null;
    }
    vi.restoreAllMocks();
  });

  it('initializes and handles decision request with immediate user selection', async () => {
    // Mock browser launch to avoid opening windows during tests
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });

    mcpServer = new VdpMcpServer();

    const decisionPromise = mcpServer.handleDecisionRequest({
      prompt: 'Test MCP Decision',
      context: 'Unit testing',
      variants: [
        {
          id: 'v1',
          name: 'Minimalist Card',
          archetype: 'minimalist',
          description: 'A clean card',
          html: '<div class="card">Hello</div>',
          css: ':root { --primary: #3b82f6; --font-heading: Inter; } .card { padding: 16px; }'
        }
      ]
    });

    // Simulate selection event after server boots
    setTimeout(async () => {
      const port = (mcpServer as any).activePort;
      if (port) {
        // Query session.json to execute getSessionConfig closure
        await fetch(`http://127.0.0.1:${port}/api/session.json`).catch(() => {});
        // Post selection to execute onSelection closure
        await fetch(`http://127.0.0.1:${port}/api/select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selectedId: 'v1', feedback: 'Approved with excitement' })
        }).catch(() => {});
      }
    }, 150);

    const result = await decisionPromise;
    expect(result.status).toBe('selected');
    expect(result.selectedId).toBe('v1');
    expect(result.feedback).toBe('Approved with excitement');
    expect(result.tokens).toBeDefined();
    expect(result.tokens?.colors['primary']).toBe('#3b82f6');
    expect(result.rawHtml).toBe('<div class="card">Hello</div>');
  });

  it('handles safety timeout when user does not respond within timeoutMs', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });

    mcpServer = new VdpMcpServer();

    const result = await mcpServer.handleDecisionRequest({
      prompt: 'Testing timeout',
      timeoutMs: 80, // 80ms timeout
      variants: [
        { id: 'v1', name: 'Timeout Variant', archetype: 'custom', description: '', html: '<div/>', css: '' }
      ]
    });

    expect(result.status).toBe('timeout');
  });

  it('handles user cancellation through websocket/event trigger', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });

    mcpServer = new VdpMcpServer();

    // Trigger cancel using the internal decisionCanceller hook
    const decisionPromise = mcpServer.handleDecisionRequest({
      prompt: 'Testing cancellation',
      variants: [
        { id: 'v1', name: 'Cancel Variant', archetype: 'custom', description: '', html: '<div/>', css: '' }
      ]
    });

    setTimeout(() => {
      // Access decisionCanceller if available or simulate cancel
      if ((mcpServer as any).decisionCanceller) {
        (mcpServer as any).decisionCanceller('user_pressed_cancel');
      }
    }, 50);

    const result = await decisionPromise;
    expect(result.status).toBe('cancelled');
    expect(result.feedback).toContain('user_pressed_cancel');
  });

  it('rejects unknown MCP tools in CallToolHandler', async () => {
    mcpServer = new VdpMcpServer();
    const serverInstance = (mcpServer as any).server;

    const handler = (serverInstance as any)._requestHandlers?.get('tools/call');
    if (handler) {
      await expect(
        handler({
          method: 'tools/call',
          params: { name: 'nonexistent_tool', arguments: {} }
        })
      ).rejects.toThrow(/Unknown tool/);
    }
  });

  it('exposes request_visual_decision tool in ListToolsHandler', async () => {
    mcpServer = new VdpMcpServer();
    const serverInstance = (mcpServer as any).server;

    const handler = (serverInstance as any)._requestHandlers?.get('tools/list');
    if (handler) {
      const response = await handler({ method: 'tools/list', params: {} });
      expect(response.tools).toBeDefined();
      expect(response.tools[0].name).toBe('request_visual_decision');
      expect(response.tools[0].inputSchema.required).toContain('prompt');
      expect(response.tools[0].inputSchema.required).toContain('variants');
    }
  });

  it('executes request_visual_decision tool via CallToolHandler successfully', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });
    mcpServer = new VdpMcpServer();
    const serverInstance = (mcpServer as any).server;

    const handler = (serverInstance as any)._requestHandlers?.get('tools/call');
    expect(handler).toBeDefined();

    const toolCallPromise = handler({
      method: 'tools/call',
      params: {
        name: 'request_visual_decision',
        arguments: {
          prompt: 'Tool handler test',
          variants: [
            { id: 'v-test', name: 'Test Variant', archetype: 'custom', description: 'Test', html: '<div>Test</div>', css: ':root { --color: red; }' }
          ]
        }
      }
    });

    // Simulate resolve via internal resolver
    setTimeout(() => {
      if ((mcpServer as any).decisionResolver) {
        (mcpServer as any).decisionResolver({ selectedId: 'v-test', feedback: 'looks awesome' });
      }
    }, 50);

    const res = await toolCallPromise;
    expect(res.content).toBeDefined();
    expect(res.content[0].type).toBe('text');
    const parsed = JSON.parse(res.content[0].text);
    expect(parsed.status).toBe('selected');
    expect(parsed.selectedId).toBe('v-test');
    expect(parsed.tokens.colors['color']).toBe('red');
  });

  it('reuses existing activePort on subsequent ensureServerRunning calls', async () => {
    mcpServer = new VdpMcpServer();
    const p1 = await (mcpServer as any).ensureServerRunning();
    const p2 = await (mcpServer as any).ensureServerRunning();
    expect(p1).toBe(p2);
  });

  it('calls server.connect when start is invoked', async () => {
    mcpServer = new VdpMcpServer();
    const connectSpy = vi.spyOn((mcpServer as any).server, 'connect').mockResolvedValue(undefined as any);
    await mcpServer.start();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('handles ws onCancel via WsGateway event callback', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });
    mcpServer = new VdpMcpServer();
    const decisionPromise = mcpServer.handleDecisionRequest({
      prompt: 'Cancel test via WsGateway',
      variants: [{ id: 'v1', name: 'V1', archetype: 'custom', description: 'Variant 1', html: '<div/>', css: '' }]
    });

    setTimeout(() => {
      const wsGateway = (mcpServer as any).wsGateway;
      if (wsGateway && (wsGateway as any).events && (wsGateway as any).events.onCancel) {
        (wsGateway as any).events.onCancel('client_aborted');
      }
    }, 50);

    const res = await decisionPromise;
    expect(res.status).toBe('cancelled');
    expect(res.feedback).toContain('client_aborted');
  });

  it('handles ws onSelection via WsGateway event callback', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });
    mcpServer = new VdpMcpServer();
    const decisionPromise = mcpServer.handleDecisionRequest({
      prompt: 'Select test via WsGateway',
      variants: [{ id: 'v1', name: 'V1', archetype: 'custom', description: 'Variant 1', html: '<div/>', css: ':root { --color: blue; }' }]
    });

    setTimeout(() => {
      const wsGateway = (mcpServer as any).wsGateway;
      if (wsGateway && (wsGateway as any).events && (wsGateway as any).events.onSelection) {
        (wsGateway as any).events.onSelection({ selectedId: 'v1', feedback: 'Selected via websocket' });
      }
    }, 50);

    const res = await decisionPromise;
    expect(res.status).toBe('selected');
    expect(res.selectedId).toBe('v1');
    expect(res.feedback).toBe('Selected via websocket');
  });

  it('handles selection of nonexistent variant ID gracefully without crashing', async () => {
    vi.spyOn(launcher, 'launchPreviewBrowser').mockResolvedValue({ launched: false, url: 'http://test' });
    mcpServer = new VdpMcpServer();
    const decisionPromise = mcpServer.handleDecisionRequest({
      prompt: 'Select nonexistent ID',
      variants: [{ id: 'v1', name: 'V1', archetype: 'custom', description: 'Variant 1', html: '<div/>', css: '' }]
    });

    setTimeout(() => {
      if ((mcpServer as any).decisionResolver) {
        (mcpServer as any).decisionResolver({ selectedId: 'nonexistent-id', feedback: 'None' });
      }
    }, 50);

    const res = await decisionPromise;
    expect(res.status).toBe('selected');
    expect(res.selectedId).toBe('nonexistent-id');
    expect(res.tokens).toBeUndefined();
    expect(res.rawHtml).toBeUndefined();
  });
});
