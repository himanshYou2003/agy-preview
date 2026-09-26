import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import crypto from 'node:crypto';
import { findAvailablePort } from './port-scanner.js';
import { ArenaHttpServer } from './http-server.js';
import { WsGateway } from './ws-gateway.js';
import { launchPreviewBrowser } from './browser-launcher.js';
import { validateDecisionRequest } from '../protocol/validator.js';
import { extractTokensFromCss } from '../tokens/token-extractor.js';
import {
  VisualDecisionRequest,
  VisualDecisionResponse,
  ArenaSessionConfig
} from '../protocol/types.js';

export class VdpMcpServer {
  private server: Server;
  private currentSession: ArenaSessionConfig | null = null;
  private httpServer: ArenaHttpServer | null = null;
  private wsGateway: WsGateway | null = null;
  private activePort: number | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'visual-decision-plane',
        version: '0.1.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 1. List Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tool: Tool = {
        name: 'request_visual_decision',
        description:
          'Presents an interactive side-by-side visual preview of multiple UI design variants (e.g. Minimalist, Editorial, Glassmorphic, Brutalist) to the developer in a local browser sandbox. Waits for the user to inspect, test responsive viewports, and select their preferred archetype or provide micro-critique before writing production code.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Description of the UI component, feature, or design task being decided.'
            },
            context: {
              type: 'string',
              description: 'Optional project background, framework (e.g. React/Tailwind/HTML), or layout constraints.'
            },
            variants: {
              type: 'array',
              description: 'List of 2 to 4 distinct design archetypes with standalone executable HTML and CSS.',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Unique slug for variant, e.g. "variant-a"' },
                  name: { type: 'string', description: 'Display name, e.g. "Warm Editorial"' },
                  archetype: {
                    type: 'string',
                    enum: ['minimalist', 'editorial', 'glassmorphism', 'brutalist', 'custom'],
                    description: 'Design archetype'
                  },
                  description: { type: 'string', description: 'Key stylistic characteristics and typography/spacing rationale' },
                  html: { type: 'string', description: 'Complete standalone HTML snippet of the component' },
                  css: { type: 'string', description: 'Complete accompanying CSS stylesheet' },
                  states: {
                    type: 'object',
                    properties: {
                      loading: { type: 'string', description: 'Optional HTML snippet for loading/skeleton state' },
                      empty: { type: 'string', description: 'Optional HTML snippet for empty data state' },
                      error: { type: 'string', description: 'Optional HTML snippet for error alert state' }
                    }
                  }
                },
                required: ['id', 'name', 'html', 'css']
              }
            },
            timeoutMs: {
              type: 'number',
              description: 'Safety timeout in milliseconds (defaults to 600,000 / 10 minutes).'
            }
          },
          required: ['prompt', 'variants']
        }
      };

      return { tools: [tool] };
    });

    // 2. Call Tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'request_visual_decision') {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const validated = validateDecisionRequest(request.params.arguments);
      const result = await this.handleDecisionRequest(validated);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    });
  }

  private async ensureServerRunning(): Promise<number> {
    if (this.httpServer && this.activePort) {
      return this.activePort;
    }

    const port = await findAvailablePort({ startPort: 4200, maxTries: 10 });
    this.activePort = port;

    this.httpServer = new ArenaHttpServer({
      port,
      getSessionConfig: () => this.currentSession,
      onSelection: (payload) => {
        if (this.decisionResolver) {
          this.decisionResolver(payload);
        }
      }
    });

    await this.httpServer.listen();

    this.wsGateway = new WsGateway(this.httpServer.getRawServer(), {
      onSelection: (payload) => {
        if (this.decisionResolver) {
          this.decisionResolver(payload);
        }
      },
      onCancel: (reason) => {
        if (this.decisionCanceller) {
          this.decisionCanceller(reason);
        }
      }
    });

    return port;
  }

  private decisionResolver: ((payload: { selectedId: string; feedback?: string }) => void) | null = null;
  private decisionCanceller: ((reason: string) => void) | null = null;

  public async handleDecisionRequest(req: VisualDecisionRequest): Promise<VisualDecisionResponse> {
    const port = await this.ensureServerRunning();
    const sessionId = crypto.randomUUID();
    const wsUrl = `ws://127.0.0.1:${port}/ws`;
    const arenaUrl = `http://127.0.0.1:${port}/?session=${sessionId}`;

    this.currentSession = {
      sessionId,
      port,
      wsUrl,
      prompt: req.prompt,
      context: req.context,
      variants: req.variants
    };

    // Broadcast session over WebSocket to any open clients
    if (this.wsGateway) {
      this.wsGateway.broadcastSession(this.currentSession);
    }

    // Auto-launch the preview window in browser
    await launchPreviewBrowser(arenaUrl);

    // Hold tool promise until user selects or cancels
    return new Promise<VisualDecisionResponse>((resolve) => {
      let timeoutTimer: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        this.decisionResolver = null;
        this.decisionCanceller = null;
      };

      // 10-minute fallback timer
      timeoutTimer = setTimeout(() => {
        cleanup();
        resolve({
          status: 'timeout'
        });
      }, req.timeoutMs ?? 600000);

      this.decisionResolver = ({ selectedId, feedback }) => {
        cleanup();
        const selectedVariant = req.variants.find(v => v.id === selectedId);
        const tokens = selectedVariant ? extractTokensFromCss(selectedVariant.css) : undefined;

        if (this.wsGateway) {
          this.wsGateway.notifyResolved(selectedId);
        }

        resolve({
          status: 'selected',
          selectedId,
          feedback,
          tokens,
          rawHtml: selectedVariant?.html,
          rawCss: selectedVariant?.css
        });
      };

      this.decisionCanceller = (reason) => {
        cleanup();
        resolve({
          status: 'cancelled',
          feedback: `User cancelled review (${reason})`
        });
      };
    });
  }

  public async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  public async close(): Promise<void> {
    if (this.wsGateway) await this.wsGateway.close();
    if (this.httpServer) await this.httpServer.close();
  }
}
