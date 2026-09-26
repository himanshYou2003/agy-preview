import net from 'node:net';

export interface PortScanOptions {
  startPort?: number;
  maxTries?: number;
  host?: string;
}

export class PortExhaustionError extends Error {
  constructor(startPort: number, endPort: number) {
    super(`Unable to bind to any port in range ${startPort}-${endPort}. Please free a port.`);
    this.name = 'PortExhaustionError';
  }
}

/**
 * Checks if a specific port is available on the given host.
 */
export function isPortAvailable(port: number, host = '127.0.0.1'): Promise<boolean> {
  if (port < 0 || port >= 65536 || !Number.isInteger(port)) {
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

/**
 * Finds the first available port starting from startPort up to startPort + maxTries.
 */
export async function findAvailablePort(options: PortScanOptions = {}): Promise<number> {
  const startPort = options.startPort ?? 4200;
  const maxTries = options.maxTries ?? 10;
  const host = options.host ?? '127.0.0.1';

  for (let i = 0; i < maxTries; i++) {
    const candidatePort = startPort + i;
    const available = await isPortAvailable(candidatePort, host);
    if (available) {
      return candidatePort;
    }
  }

  throw new PortExhaustionError(startPort, startPort + maxTries - 1);
}
