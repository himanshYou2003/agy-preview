#!/usr/bin/env node
import { VdpMcpServer } from './server/mcp-server.js';

export * from './protocol/types.js';
export * from './protocol/validator.js';
export * from './server/mcp-server.js';
export * from './tokens/token-extractor.js';

async function main() {
  const mcpServer = new VdpMcpServer();
  await mcpServer.start();
}

if (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('cli.js') || process.argv[1].endsWith('index.ts'))) {
  main().catch((err) => {
    console.error('Fatal MCP Server Error:', err);
    process.exit(1);
  });
}
